@echo off
REM Run Script for AI Chat Board - Windows
REM This script runs the AI Chat Board application

REM Check if bin directory exists
if not exist bin (
    echo ✗ Error: bin directory not found!
    echo Please compile the project first using: compile.bat
    pause
    exit /b 1
)

REM Check if MySQL JDBC JAR exists
if not exist "lib\mysql-connector-java-8.0.33.jar" (
    echo ✗ Error: mysql-connector-java-8.0.33.jar not found in lib/ directory!
    echo Please download the MySQL JDBC driver from:
    echo https://dev.mysql.com/downloads/connector/j/
    pause
    exit /b 1
)

echo.
echo ╔═══════════════════════════════════════╗
echo ║   Starting AI Chat Board Application ║
echo ╚═══════════════════════════════════════╝
echo.

REM Run the main application
java -cp "bin;lib\mysql-connector-java-8.0.33.jar" com.aichatboard.MainApp

REM Check if application ran successfully
if errorlevel 1 (
    echo.
    echo ✗ Error running application!
    echo Please ensure:
    echo - MySQL server is running
    echo - Database 'aichatboard' is created
    echo - Database credentials in DBConnection.java are correct
    pause
    exit /b 1
)
