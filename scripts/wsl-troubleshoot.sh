#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Running WSL Environment Diagnostics...${NC}\n"

# Check Node.js
echo -e "Node.js Version:"
if command -v node &> /dev/null; then
    echo -e "${GREEN}$(node --version)${NC}"
else
    echo -e "${RED}Node.js not found${NC}"
fi

# Check npm
echo -e "\nNPM Version:"
if command -v npm &> /dev/null; then
    echo -e "${GREEN}$(npm --version)${NC}"
else
    echo -e "${RED}npm not found${NC}"
fi

# Check PostgreSQL
echo -e "\nPostgreSQL Status:"
if command -v psql &> /dev/null; then
    if sudo service postgresql status | grep -q "active (running)"; then
        echo -e "${GREEN}PostgreSQL is running$(psql --version)${NC}"
        
        # Test database connection
        echo -e "\nTesting Database Connection:"
        if PGPASSWORD=athina123 psql -h localhost -U postgres -d athina_crm -c '\l' &> /dev/null; then
            echo -e "${GREEN}Database connection successful${NC}"
        else
            echo -e "${RED}Cannot connect to database${NC}"
        fi
    else
        echo -e "${RED}PostgreSQL is installed but not running${NC}"
    fi
else
    echo -e "${RED}PostgreSQL not found${NC}"
fi

# Check ports
echo -e "\nChecking Required Ports:"
echo -e "Port 3000 (Backend):"
if netstat -tuln | grep -q ":3000 "; then
    echo -e "${RED}Port 3000 is in use${NC}"
else
    echo -e "${GREEN}Port 3000 is available${NC}"
fi

echo -e "Port 5173 (Frontend):"
if netstat -tuln | grep -q ":5173 "; then
    echo -e "${RED}Port 5173 is in use${NC}"
else
    echo -e "${GREEN}Port 5173 is available${NC}"
fi

# Check file permissions
echo -e "\nChecking File Permissions:"
if [ -d "backend/uploads" ] && [ -w "backend/uploads" ]; then
    echo -e "${GREEN}Upload directory is writable${NC}"
else
    echo -e "${RED}Upload directory is not writable${NC}"
fi

if [ -d "backend/logs" ] && [ -w "backend/logs" ]; then
    echo -e "${GREEN}Logs directory is writable${NC}"
else
    echo -e "${RED}Logs directory is not writable${NC}"
fi

# Check environment files
echo -e "\nChecking Environment Files:"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}Backend .env exists${NC}"
else
    echo -e "${RED}Backend .env missing${NC}"
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}Frontend .env exists${NC}"
else
    echo -e "${RED}Frontend .env missing${NC}"
fi

echo -e "\n${YELLOW}Common Solutions:${NC}"
echo -e "1. PostgreSQL not running:    ${GREEN}npm run wsl:db start${NC}"
echo -e "2. Permission issues:         ${GREEN}sudo chown -R \$USER:\$USER .${NC}"
echo -e "3. Port in use:              ${GREEN}sudo lsof -i :[port]${NC} to find process"
echo -e "4. Database connection:       ${GREEN}npm run wsl:db restart${NC}"
echo -e "5. Missing environment:       ${GREEN}npm run wsl:setup${NC} to reinitialize"
