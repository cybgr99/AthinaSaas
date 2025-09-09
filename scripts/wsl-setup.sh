#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting Athina CRM setup on WSL Ubuntu...${NC}\n"

# Function to check if a command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${YELLOW}⚠ $1 failed. Please check the error above.${NC}"
        exit 1
    fi
}

# Update package list
echo "Updating package list..."
sudo apt update
check_status "Package list update"

# Install required packages
echo -e "\nInstalling required packages..."
sudo apt install -y curl git postgresql postgresql-contrib
check_status "Package installation"

# Install Node.js
echo -e "\nInstalling Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
check_status "Node.js installation"

# Verify installations
echo -e "\nVerifying installations..."
node --version
npm --version
check_status "Node.js verification"

# Start PostgreSQL
echo -e "\nStarting PostgreSQL service..."
sudo service postgresql start
check_status "PostgreSQL service start"

# Configure PostgreSQL
echo -e "\nConfiguring PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'athina123';"
sudo -u postgres createdb athina_crm
check_status "PostgreSQL configuration"

# Add PostgreSQL service start to .bashrc if not already added
if ! grep -q "service postgresql start" ~/.bashrc; then
    echo -e "\nAdding PostgreSQL service start to .bashrc..."
    echo "sudo service postgresql start" >> ~/.bashrc
    check_status "PostgreSQL autostart configuration"
fi

# Create project directories
echo -e "\nCreating project directories..."
mkdir -p backend/logs backend/uploads backend/backups
chmod -R 755 backend
check_status "Directory creation"

# Set up environment files
echo -e "\nSetting up environment files..."
cat > backend/.env << EOL
NODE_ENV=development
PORT=3000
DB_NAME=athina_crm
DB_USER=postgres
DB_PASSWORD=athina123
DB_HOST=localhost
JWT_SECRET=athina_dev_secret_change_in_production
EOL

cat > frontend/.env << EOL
VITE_API_URL=http://localhost:3000
EOL
check_status "Environment files setup"

# Install dependencies
echo -e "\nInstalling project dependencies..."
npm install
check_status "Dependencies installation"

# Initialize database and run migrations
echo -e "\nInitializing database..."
npm run init-db --workspace=backend
check_status "Database initialization"

echo -e "\nRunning migrations and seeding demo data..."
npm run seed --workspace=backend
check_status "Database setup"

# Generate types
echo -e "\nGenerating TypeScript types..."
npm run generate-types
check_status "Type generation"

echo -e "\n${GREEN}✨ Installation complete! Here's how to start the application:${NC}"
echo -e "\n1. Start the development servers:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo -e "\n2. Access the application:"
echo -e "   Frontend: http://localhost:5173"
echo -e "   Backend: http://localhost:3000"
echo -e "\n3. Login credentials:"
echo -e "   Username: admin"
echo -e "   Password: admin123"
echo -e "\n${YELLOW}Note: For production use, please change the JWT_SECRET and database password!${NC}"
