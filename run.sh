#!/bin/bash
# Run Script for AI Chat Board - Linux/macOS
# This script runs the AI Chat Board application

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check if bin directory exists
if [ ! -d "bin" ]; then
    echo -e "${RED}✗ Error: bin directory not found!${NC}"
    echo "Please compile the project first using: ./compile.sh"
    exit 1
fi

# Check if MySQL JDBC JAR exists
if [ ! -f "lib/mysql-connector-java-8.0.33.jar" ]; then
    echo -e "${RED}✗ Error: mysql-connector-java-8.0.33.jar not found in lib/ directory!${NC}"
    echo "Please download the MySQL JDBC driver from:"
    echo "https://dev.mysql.com/downloads/connector/j/"
    exit 1
fi

echo
echo "╔═══════════════════════════════════════╗"
echo "║   Starting AI Chat Board Application ║"
echo "╚═══════════════════════════════════════╝"
echo

# Run the main application
java -cp "bin:lib/mysql-connector-java-8.0.33.jar" com.aichatboard.MainApp

# Check if application ran successfully
if [ $? -ne 0 ]; then
    echo
    echo -e "${RED}✗ Error running application!${NC}"
    echo "Please ensure:"
    echo "- MySQL server is running"
    echo "- Database 'aichatboard' is created"
    echo "- Database credentials in DBConnection.java are correct"
    exit 1
fi
