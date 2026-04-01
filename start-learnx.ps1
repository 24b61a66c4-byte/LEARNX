#!/usr/bin/env pwsh
# LEARNX Quick Start Script for Laptop
# Starts the entire LEARNX application locally

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LEARNX Local Development - Laptop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "web\package.json")) {
    Write-Host "ERROR: Not in LEARNX root directory" -ForegroundColor Red
    Write-Host "Please run from: c:\Users\ranad\OneDrive\Desktop\LEARNX" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
}
catch {
    Write-Host "✗ ERROR: Node.js not installed" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npmVersion = & npm --version 2>&1
    Write-Host "✓ npm $npmVersion found" -ForegroundColor Green
}
catch {
    Write-Host "✗ ERROR: npm not installed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Maven
try {
    $mvnVersion = & mvn --version 2>&1 | Select-Object -First 1
    Write-Host "✓ Maven found ($mvnVersion)" -ForegroundColor Green
}
catch {
    Write-Host "⚠ WARNING: Maven not installed (needed for backend only)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Available Start Options" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1] Start Frontend Only" -ForegroundColor White
Write-Host "    Uses production API: https://learnx-production-3bf1.up.railway.app/api/v1" -ForegroundColor Gray
Write-Host "    Command: npm run dev" -ForegroundColor Gray
Write-Host "    URL: http://localhost:3000" -ForegroundColor Gray
Write-Host ""
Write-Host "[2] Instructions for Backend + Frontend" -ForegroundColor White
Write-Host "    Requires: Java 17+, Maven 3.9+" -ForegroundColor Gray
Write-Host "    Terminal 1: mvn spring-boot:run" -ForegroundColor Gray
Write-Host "    Terminal 2: npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "[3] Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select option [1-3]"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting Next.js frontend..." -ForegroundColor Cyan
        Write-Host "Connecting to: https://learnx-production-3bf1.up.railway.app/api/v1" -ForegroundColor Gray
        Write-Host ""
        Push-Location web
        try {
            & npm run dev
        }
        finally {
            Pop-Location
        }
    }
    "2" {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Backend + Frontend Setup" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Terminal 1 - Start Backend:" -ForegroundColor Yellow
        Write-Host "  cd c:\Users\ranad\OneDrive\Desktop\LEARNX" -ForegroundColor White
        Write-Host "  mvn spring-boot:run" -ForegroundColor White
        Write-Host ""
        Write-Host "Terminal 2 - Start Frontend:" -ForegroundColor Yellow
        Write-Host "  cd c:\Users\ranad\OneDrive\Desktop\LEARNX\web" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "Then open in browser: http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Press Enter when ready to close"
    }
    "3" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid option" -ForegroundColor Red
        exit 1
    }
}
