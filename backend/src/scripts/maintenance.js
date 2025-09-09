import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

const TEMP_DIR = path.join(process.cwd(), 'temp');
const LOG_DIR = path.join(process.cwd(), 'logs');
const MAX_LOG_AGE_DAYS = 30;
const MAX_TEMP_AGE_HOURS = 24;

const cleanupDirectory = async (dir, maxAge, description) => {
  if (!fs.existsSync(dir)) {
    console.log(`${description} directory does not exist: ${dir}`);
    return;
  }

  try {
    const files = await readdir(dir);
    let deletedCount = 0;
    let totalSize = 0;

    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileStat = await stat(filePath);

      if (fileStat.isFile()) {
        const fileAge = (Date.now() - fileStat.mtime.getTime());
        const shouldDelete = maxAge === 0 || fileAge > maxAge;

        if (shouldDelete) {
          totalSize += fileStat.size;
          await unlink(filePath);
          deletedCount++;
        }
      }
    }

    console.log(`Cleaned up ${deletedCount} ${description} files (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
  } catch (error) {
    console.error(`Error cleaning up ${description}:`, error);
  }
};

const vacuum = async () => {
  try {
    // Clean up temporary files
    await cleanupDirectory(
      TEMP_DIR,
      MAX_TEMP_AGE_HOURS * 60 * 60 * 1000,
      'temporary'
    );

    // Clean up old logs
    await cleanupDirectory(
      LOG_DIR,
      MAX_LOG_AGE_DAYS * 24 * 60 * 60 * 1000,
      'log'
    );

    // Clean up uploaded files that are no longer needed
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await cleanupDirectory(uploadsDir, 0, 'unused upload');

    console.log('Maintenance completed successfully');
  } catch (error) {
    console.error('Maintenance failed:', error);
    process.exit(1);
  }
};

// Run maintenance if called directly
if (require.main === module) {
  vacuum();
}
