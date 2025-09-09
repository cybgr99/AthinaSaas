import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const runAudit = async (directory) => {
  try {
    console.log(`\nRunning audit in ${directory}...`);
    
    // Run npm audit
    const { stdout: auditOutput, stderr: auditError } = await execAsync('npm audit', {
      cwd: directory
    });
    
    if (auditError) {
      console.error(`Audit errors in ${directory}:`, auditError);
    }
    
    console.log(auditOutput);

    // Check for outdated dependencies
    console.log(`\nChecking outdated dependencies in ${directory}...`);
    const { stdout: outdatedOutput } = await execAsync('npm outdated', {
      cwd: directory
    });
    
    console.log(outdatedOutput || 'All dependencies are up to date!');

  } catch (error) {
    if (error.stdout) {
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.error(error.stderr);
    }
  }
};

const generateReport = async () => {
  const rootDir = process.cwd();
  const reportFile = path.join(rootDir, 'security-report.txt');
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  // Redirect console output to file
  const logStream = fs.createWriteStream(reportFile);
  console.log = (...args) => {
    logStream.write(args.join(' ') + '\n');
    originalConsoleLog.apply(console, args);
  };
  console.error = (...args) => {
    logStream.write('ERROR: ' + args.join(' ') + '\n');
    originalConsoleError.apply(console, args);
  };

  try {
    console.log('Security Audit Report');
    console.log('===================');
    console.log(`Generated: ${new Date().toISOString()}`);
    console.log('-------------------\n');

    // Run audit in root directory
    await runAudit(rootDir);

    // Run audit in frontend directory
    await runAudit(path.join(rootDir, 'frontend'));

    // Run audit in backend directory
    await runAudit(path.join(rootDir, 'backend'));

    console.log('\nAudit complete! Report saved to security-report.txt');
  } catch (error) {
    console.error('Failed to generate report:', error);
  } finally {
    // Restore console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    logStream.end();
  }
};

// Run report if called directly
if (require.main === module) {
  generateReport();
}

export default generateReport;
