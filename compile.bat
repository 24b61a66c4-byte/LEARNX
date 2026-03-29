@echo off
REM Compile Script for AI Chat Board - Windows
REM This script compiles all Java source files and places compiled classes in bin/ directory

REM Check if bin directory exists, if not create it
if not exist bin mkdir bin

REM Check if lib directory exists
if not exist lib (
    echo ✗ Error: lib directory not found!
    echo Please download mysql-connector-java-8.0.33.jar and place it in lib/ folder
    pause
    exit /b 1
)

REM Check if MySQL JDBC JAR exists
if not exist "lib\mysql-connector-java-8.0.33.jar" (
    echo ✗ Error: mysql-connector-java-8.0.33.jar not found in lib/ directory!
    echo Please download the MySQL JDBC driver from:
    echo https://dev.mysql.com/downloads/connector/j/
    echo.
    pause
    exit /b 1
)

echo.
echo ╔═══════════════════════════════════════╗
echo ║   Compiling AI Chat Board Project    ║
echo ║         (Windows Batch Script)        ║
echo ╚═══════════════════════════════════════╝
echo.

echo [1/3] Compiling Database Connection classes...
javac -cp "lib\mysql-connector-java-8.0.33.jar" -d bin src\com\aichatboard\db\*.java
if errorlevel 1 (
    echo ✗ Failed to compile db classes
    pause
    exit /b 1
)
echo ✓ Database classes compiled successfully

echo.
echo [2/3] Compiling Data Access Object classes...
javac -cp "bin;lib\mysql-connector-java-8.0.33.jar" -d bin src\com\aichatboard\dao\*.java
if errorlevel 1 (
    echo ✗ Failed to compile DAO classes
    pause
    exit /b 1
)
echo ✓ DAO classes compiled successfully

echo.
echo [3/3] Compiling Main Application classes...
javac -cp "bin;lib\mysql-connector-java-8.0.33.jar" -d bin src\com\aichatboard\*.java
if errorlevel 1 (
    echo ✗ Failed to compile main application
    pause
    exit /b 1
)
echo ✓ Main application compiled successfully

echo.
echo ╔═══════════════════════════════════════╗
echo ║     ✓ Compilation Successful!        ║
echo ╚═══════════════════════════════════════╝
echo.
echo All classes compiled to: bin/
echo.
echo Next Steps:
echo 1. Make sure MySQL server is running
echo 2. Run the application using: run.bat
echo.
pause
