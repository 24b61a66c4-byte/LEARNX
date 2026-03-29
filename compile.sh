#!/bin/bash
# Compile Script for AI Chat Board - Linux/macOS
# This script compiles all Java source files and places compiled classes in bin/ directory

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if bin directory exists, if not create it
if [ ! -d "bin" ]; then
    mkdir -p bin
fi

# Check if lib directory exists
if [ ! -d "lib" ]; then
    echo -e "${RED}✗ Error: lib directory not found!${NC}"
    echo "Please download mysql-connector-java-8.0.33.jar and place it in lib/ folder"
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
echo "║   Compiling AI Chat Board Project    ║"
echo "║       (Linux/macOS Bash Script)       ║"
echo "╚═══════════════════════════════════════╝"
echo

echo "[1/3] Compiling Database Connection classes..."
javac -cp "lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/db/*.java
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to compile db classes${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database classes compiled successfully${NC}"

echo
echo "[2/3] Compiling Data Access Object classes..."
javac -cp "bin:lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/dao/*.java
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to compile DAO classes${NC}"
    exit 1
fi
echo -e "${GREEN}✓ DAO classes compiled successfully${NC}"

echo
echo "[3/3] Compiling Main Application classes..."
javac -cp "bin:lib/mysql-connector-java-8.0.33.jar" -d bin src/com/aichatboard/*.java
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to compile main application${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Main application compiled successfully${NC}"

echo
echo "╔═══════════════════════════════════════╗"
echo "║     ✓ Compilation Successful!        ║"
echo "╚═══════════════════════════════════════╝"
echo
echo "All classes compiled to: bin/"
echo
echo "Next Steps:"
echo "1. Make sure MySQL server is running"
echo "2. Run the application using: ./run.sh"
echo
