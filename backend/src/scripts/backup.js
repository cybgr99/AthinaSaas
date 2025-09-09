import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const execAsync = promisify(exec);

const backupDir = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

const createBackup = async () => {
  try {
    console.log('Creating database backup...');
    
    const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST } = process.env;
    
    const command = `PGPASSWORD=${DB_PASSWORD} pg_dump -h ${DB_HOST} -U ${DB_USER} -F p ${DB_NAME} > "${backupFile}"`;
    
    await execAsync(command);
    
    console.log(`Backup created successfully: ${backupFile}`);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
};

const restoreBackup = async (file) => {
  try {
    if (!file) {
      console.error('Please specify a backup file to restore');
      process.exit(1);
    }

    const backupPath = path.resolve(file);
    if (!fs.existsSync(backupPath)) {
      console.error(`Backup file not found: ${backupPath}`);
      process.exit(1);
    }

    console.log(`Restoring database from backup: ${backupPath}`);
    
    const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST } = process.env;
    
    const command = `PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST} -U ${DB_USER} ${DB_NAME} < "${backupPath}"`;
    
    await execAsync(command);
    
    console.log('Database restored successfully');
  } catch (error) {
    console.error('Restore failed:', error);
    process.exit(1);
  }
};

const action = process.argv[2];
const file = process.argv[3];

if (action === 'backup') {
  createBackup();
} else if (action === 'restore') {
  restoreBackup(file);
} else {
  console.log('Usage:');
  console.log('  npm run backup         - Create a new backup');
  console.log('  npm run restore [file] - Restore from backup file');
  process.exit(1);
}
