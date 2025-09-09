# Athina CRM

A modern, lightweight CRM system designed for small Greek businesses. Built with React, Node.js, and PostgreSQL.

## Features

- 👥 Customer Management
  - Full CRUD operations
  - Real-time balance tracking
  - Import from CSV/Excel

- 📦 Product/Service Catalog
  - Category organization
  - SKU management
  - Bulk import support

- 🛍️ Order Management
  - Create and track orders
  - Payment processing
  - Refund handling

- 💰 Financial Tracking
  - Customer balances
  - Payment history
  - Transaction records

- 📊 Dashboard
  - Key business metrics
  - Outstanding balances
  - Order statistics

## Technology Stack

- Frontend:
  - React 18 with TypeScript
  - Material UI
  - React Query
  - i18next for localization
  - Auto-generated types from backend models

- Backend:
  - Node.js
  - Express
  - Sequelize ORM
  - PostgreSQL

## Prerequisites

- Node.js 18 or later
- PostgreSQL 15 or later
- Docker and Docker Compose (for production deployment)

## Development Setup

### Option 1: WSL Ubuntu (Automated Setup)

1. Install WSL Ubuntu:
   ```powershell
   # In Windows PowerShell (Admin)
   wsl --install -d Ubuntu
   ```

2. Clone and setup:
   ```bash
   git clone https://github.com/your-username/athina-crm.git
   cd athina-crm
   npm run wsl:setup
   ```

   The script will:
   - Install all required dependencies (Node.js, PostgreSQL)
   - Configure the database
   - Set up environment files
   - Initialize the project with demo data
   - Generate TypeScript types

3. Database Management:
   ```bash
   # Start PostgreSQL
   npm run wsl:db start

   # Check status
   npm run wsl:db status

   # Restart if needed
   npm run wsl:db restart
   ```

4. Start the application:
   ```bash
   npm run dev
   ```

   Access at:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - Login with: admin / admin123

5. Troubleshooting WSL:
   ```bash
   # Run diagnostics
   npm run wsl:check
   ```

   Common Issues:
   ```bash
   # PostgreSQL not running
   npm run wsl:db start

   # Permission issues
   sudo chown -R $USER:$USER .

   # Reset environment
   npm run wsl:setup
   ```

   The diagnostic tool checks:
   - Node.js and npm versions
   - PostgreSQL status and connection
   - Required ports availability
   - File permissions
   - Environment configuration

### Option 2: Manual Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/athina-crm.git
   cd athina-crm
   ```

2. Initialize the project:
   ```bash
   npm run init
   ```
   This will:
   - Install all dependencies
   - Create necessary directories
   - Set up environment files
   - Initialize the database
   - Run migrations
   - Generate TypeScript types

3. Create an admin user:
   ```bash
   # Option 1: Create a single admin user
   npm run create-admin --workspace=backend

   # Option 2: Load demo data (includes admin user)
   npm run seed --workspace=backend
   ```

   Default demo credentials:
   - Username: admin
   - Password: admin123

4. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Production Deployment

1. Configure environment variables:
   ```bash
   cp .env.production .env
   ```
   Update the values in `.env` with your production settings.

2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:3000

## Initial Setup

1. Initialize the database and create admin user:
   ```bash
   # Run migrations
   docker-compose exec backend npm run migrate

   # Create admin user (if not using demo data)
   docker-compose exec backend npm run create-admin
   ```

2. Log in with either:
   - The credentials displayed by the create-admin script, or
   - Default demo credentials:
     - Username: admin
     - Password: admin123

   **Important**: Change these credentials immediately after first login!

3. Optional: Load demo data
   ```bash
   docker-compose exec backend npm run seed
   ```

## System Management

### Database Management

Backup the database:
```bash
# Development
npm run backup

# Production
docker-compose exec backend npm run backup
```

Restore from backup:
```bash
# Development
npm run restore backups/backup-file.sql

# Production
docker-compose exec backend npm run restore /app/backups/backup-file.sql
```

### Database Migrations

Run migrations:
```bash
# Development
npm run migrate

# Force reset (development only)
npm run migrate:force

# Production
docker-compose exec backend npm run migrate
```

Load demo data (development only):
```bash
npm run seed
```

### System Maintenance

The system includes automated maintenance tasks for cleaning up temporary files, logs, and unused uploads:

```bash
# Development
npm run maintenance

# Production
docker-compose exec backend npm run maintenance
```

Maintenance tasks include:
- Removing temporary files older than 24 hours
- Cleaning up log files older than 30 days
- Removing unused uploaded files

It's recommended to set up a cron job to run maintenance regularly in production:

```bash
# Add to crontab to run daily at 2 AM
0 2 * * * docker-compose exec -T backend npm run maintenance
```

### System Monitoring

The system includes a health check utility that monitors various system metrics:

```bash
# Development
npm run health-check

# Production
docker-compose exec backend npm run health-check
```

The health check monitors:
- Disk space usage
- Memory utilization
- Database size and table statistics
- Upload directory size

Set up regular monitoring in production:

```bash
# Add to crontab to check every 5 minutes
*/5 * * * * docker-compose exec -T backend npm run health-check >> /var/log/athina/health.log 2>&1
```

Example monitoring setup with alert:
```bash
#!/bin/bash
docker-compose exec -T backend npm run health-check || \\n  curl -X POST https://your-alert-webhook.com -d "Health check failed!"
```

## Security and Maintenance

### Dependency Management

Regularly check for security vulnerabilities and outdated dependencies:

```bash
# Run security audit and dependency check
npm run audit-deps
```

This will:
- Run npm audit in all packages
- Check for outdated dependencies
- Generate a comprehensive security report
- Save results to security-report.txt

Set up regular audits in production:
```bash
# Add to crontab to run weekly
0 0 * * 0 cd /path/to/app && npm run audit-deps
```

## Development Tools

### Code Generation

```bash
# Generate TypeScript interfaces from backend models
npm run generate-types

# Run security audit and dependency check
npm run audit-deps
```

### Database Management

```bash
# Initialize database and extensions
npm run init-db

# Run migrations
npm run migrate

# Reset database (development only)
npm run migrate:force

# Load demo data
npm run seed
```

### Maintenance

```bash
# Create database backup
npm run backup

# Restore from backup
npm run restore backups/backup-file.sql

# Run system maintenance (cleanup temp files, logs)
npm run maintenance

# Check system health
npm run health-check
```

### Security Checklist

1. Initial Setup
   - [ ] Change all default passwords
   - [ ] Update JWT secret in environment variables
   - [ ] Enable HTTPS
   - [ ] Configure firewall rules

2. Regular Maintenance
   - [ ] Run dependency audits weekly
   - [ ] Update dependencies monthly
   - [ ] Review system logs
   - [ ] Test backup/restore procedures

3. Monitoring
   - [ ] Set up health checks (npm run health-check)
   - [ ] Monitor disk space and database size
   - [ ] Track API response times
   - [ ] Monitor error rates

4. Data Protection
   - [ ] Configure automated backups
   - [ ] Implement rate limiting
   - [ ] Set up request validation
   - [ ] Enable CORS protection

5. Access Control
   - [ ] Review user permissions regularly
   - [ ] Monitor failed login attempts
   - [ ] Implement session timeouts
   - [ ] Use secure password policies

## License

This project is licensed under the MIT License - see the LICENSE file for details.
