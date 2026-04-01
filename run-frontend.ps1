#!/usr/bin/env pwsh
# LEARNX Development Server Launcher
# Fixes working directory issue and starts Next.js dev server

param(
    [switch]$Build,
    [switch]$Prod
)

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$webDir = Join-Path $rootDir "web"

if (-not (Test-Path $webDir)) {
    Write-Host "ERROR: web directory not found at $webDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$webDir\package.json")) {
    Write-Host "ERROR: package.json not found in $webDir" -ForegroundColor Red
    exit 1
}

Write-Host "LEARNX Frontend Developer Server" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Working directory: $webDir" -ForegroundColor Gray
Write-Host ""

if ($Build) {
    Write-Host "Building production bundle..." -ForegroundColor yellow
    & cmd /c "cd /d $webDir && npm run build"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host ""
    Write-Host "Build complete! Output in .next/" -ForegroundColor Green
    exit 0
}

if ($Prod) {
    Write-Host "Starting production server..." -ForegroundColor yellow
    & cmd /c "cd /d $webDir && npm start"
    exit $LASTEXITCODE
}

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

& cmd /c "cd /d $webDir && npm run dev"
exit $LASTEXITCODE
