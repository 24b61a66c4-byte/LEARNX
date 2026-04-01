@echo off
REM LEARNX Quick Start Script for Laptop
REM This script starts the entire LEARNX application locally

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   LEARNX Local Development - Laptop
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "web\package.json" (
    echo ERROR: Not in LEARNX root directory
    echo Please run from: c:\Users\ranad\OneDrive\Desktop\LEARNX
    pause
    exit /b 1
)

echo Checking prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js !NODE_VERSION! found
)

REM Check Maven
mvn --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Maven not installed (needed for backend)
    echo Download from: https://maven.apache.org/
    echo Skipping backend checks...
) else (
    echo ✓ Maven found
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not installed
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✓ npm !NPM_VERSION! found
)

echo.
echo ========================================
echo   Available Start Options
echo ========================================
echo.
echo [1] Frontend Only (uses production API)
echo     Command: npm run dev
echo     URL: http://localhost:3000
echo.
echo [2] Backend + Frontend (local development)
echo     Requires: Java, Maven installed
echo     Terminal 1: mvn spring-boot:run
echo     Terminal 2: npm run dev
echo.
echo [3] Exit
echo.

set /p choice="Select option [1-3]: "

if "%choice%"=="1" (
    echo.
    echo Starting Next.js frontend...
    echo Connecting to: https://learnx-production-3bf1.up.railway.app/api/v1
    echo.
    cd web
    call npm run dev
) else if "%choice%"=="2" (
    echo.
    echo To run backend + frontend:
    echo.
    echo Terminal 1 (Backend):
    echo   cd c:\Users\ranad\OneDrive\Desktop\LEARNX
    echo   mvn spring-boot:run
    echo.
    echo Terminal 2 (Frontend):
    echo   cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web
    echo   npm run dev
    echo.
    echo Then open: http://localhost:3000
    echo.
    pause
) else (
    exit /b 0
)
