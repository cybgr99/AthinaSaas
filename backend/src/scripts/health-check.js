import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import dotenv from 'dotenv';
import sequelize from '../config/database.js';

dotenv.config();
const execAsync = promisify(exec);

const checkDiskSpace = async () => {
  try {
    const { stdout } = await execAsync('df -h /');
    const lines = stdout.split('\n');
    const [, usage] = lines[1].split(/\s+/);
    const usedPercent = parseInt(usage.replace('%', ''));
    
    return {
      status: usedPercent < 90 ? 'healthy' : 'warning',
      message: `Disk usage: ${usage}`,
      details: stdout
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Unable to check disk space',
      error: error.message
    };
  }
};

const checkMemory = () => {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const usedPercent = Math.round((used / total) * 100);

  return {
    status: usedPercent < 90 ? 'healthy' : 'warning',
    message: `Memory usage: ${usedPercent}%`,
    details: {
      total: Math.round(total / 1024 / 1024) + ' MB',
      used: Math.round(used / 1024 / 1024) + ' MB',
      free: Math.round(free / 1024 / 1024) + ' MB'
    }
  };
};

const checkDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();

    // Get database size
    const [result] = await sequelize.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size,
             pg_database_size(current_database()) as bytes
    `);
    const dbSize = result[0];

    // Get table sizes
    const [tables] = await sequelize.query(`
      SELECT 
        relname as table,
        pg_size_pretty(pg_total_relation_size(C.oid)) as size,
        pg_total_relation_size(C.oid) as bytes
      FROM pg_class C
      LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
      WHERE nspname NOT IN ('pg_catalog', 'information_schema')
        AND C.relkind <> 'i'
        AND nspname !~ '^pg_toast'
      ORDER BY pg_total_relation_size(C.oid) DESC
      LIMIT 5
    `);

    return {
      status: 'healthy',
      message: `Database size: ${dbSize.size}`,
      details: {
        totalSize: dbSize,
        largestTables: tables
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Database health check failed',
      error: error.message
    };
  }
};

const checkUploads = async () => {
  try {
    const { stdout } = await execAsync('du -sh uploads/');
    return {
      status: 'healthy',
      message: `Uploads directory size: ${stdout.split('\t')[0]}`,
      details: stdout
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Unable to check uploads directory',
      error: error.message
    };
  }
};

const runHealthCheck = async () => {
  try {
    const [disk, database, uploads] = await Promise.all([
      checkDiskSpace(),
      checkDatabase(),
      checkUploads()
    ]);

    const memory = checkMemory();
    const timestamp = new Date().toISOString();

    const report = {
      timestamp,
      status: [disk, memory, database, uploads].every(check => check.status === 'healthy')
        ? 'healthy'
        : 'warning',
      checks: {
        disk,
        memory,
        database,
        uploads
      }
    };

    console.log(JSON.stringify(report, null, 2));

    // Exit with error if any check failed
    if (report.status !== 'healthy') {
      process.exit(1);
    }
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Run health check if called directly
if (require.main === module) {
  runHealthCheck();
}

export default runHealthCheck;
