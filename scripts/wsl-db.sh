#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

case "$1" in
  "start")
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    sudo service postgresql start
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}PostgreSQL is running${NC}"
    else
      echo -e "${RED}Failed to start PostgreSQL${NC}"
    fi
    ;;
    
  "stop")
    echo -e "${YELLOW}Stopping PostgreSQL...${NC}"
    sudo service postgresql stop
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}PostgreSQL stopped${NC}"
    else
      echo -e "${RED}Failed to stop PostgreSQL${NC}"
    fi
    ;;
    
  "restart")
    echo -e "${YELLOW}Restarting PostgreSQL...${NC}"
    sudo service postgresql restart
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}PostgreSQL restarted${NC}"
    else
      echo -e "${RED}Failed to restart PostgreSQL${NC}"
    fi
    ;;
    
  "status")
    echo -e "${YELLOW}Checking PostgreSQL status...${NC}"
    if sudo service postgresql status | grep -q "active (running)"; then
      echo -e "${GREEN}PostgreSQL is running${NC}"
    else
      echo -e "${RED}PostgreSQL is not running${NC}"
    fi
    ;;
    
  *)
    echo -e "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac
