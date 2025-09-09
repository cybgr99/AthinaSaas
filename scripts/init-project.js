import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const copyEnvFiles = () => {
  console.log('Setting up environment files...');
  
  // Copy backend .env
  if (!fs.existsSync(path.join(rootDir, 'backend', '.env'))) {
    fs.copyFileSync(
      path.join(rootDir, 'backend', '.env.example'),
      path.join(rootDir, 'backend', '.env')
    );
  }

  // Copy frontend .env
  if (!fs.existsSync(path.join(rootDir, 'frontend', '.env'))) {
    fs.copyFileSync(
      path.join(rootDir, 'frontend', '.env.example'),
      path.join(rootDir, 'frontend', '.env')
    );
  }
};

const createDirectories = () => {
  console.log('Creating required directories...');
  
  const dirs = [
    path.join(rootDir, 'backend', 'logs'),
    path.join(rootDir, 'backend', 'uploads'),
    path.join(rootDir, 'backend', 'backups')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

const runCommand = async (command, cwd = rootDir) => {
  console.log(`Running: ${command}`);
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error) {
    console.error(`Error running ${command}:`, error);
    throw error;
  }
};

const initProject = async () => {
  try {
    console.log('Initializing Athina CRM project...\n');

    // Create necessary directories
    createDirectories();

    // Copy environment files
    copyEnvFiles();

    // Install dependencies
    console.log('\nInstalling dependencies...');
    await runCommand('npm install');

    // Initialize database
    console.log('\nInitializing database...');
    await runCommand('npm run init-db --workspace=backend');

    // Run migrations
    console.log('\nRunning migrations...');
    await runCommand('npm run migrate --workspace=backend');

    // Generate types
    console.log('\nGenerating TypeScript types...');
    await runCommand('npm run generate-types');

    console.log('\n✅ Project initialized successfully!');
    console.log('\nNext steps:');
    console.log('1. Update environment variables in:');
    console.log('   - backend/.env');
    console.log('   - frontend/.env');
    console.log('2. Create an admin user:');
    console.log('   npm run create-admin --workspace=backend');
    console.log('3. Start development servers:');
    console.log('   npm run dev');

  } catch (error) {
    console.error('\n❌ Project initialization failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initProject();
}

export default initProject;
