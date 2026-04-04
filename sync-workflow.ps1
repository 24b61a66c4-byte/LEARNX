param(
    [ValidateSet("start", "end", "status")]
    [string]$Mode = "status",
    [switch]$NoFetch
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
    param([string[]]$GitArgs)

    $output = & git @GitArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "git $($GitArgs -join ' ') failed: $output"
    }

    return ($output | Out-String).Trim()
}

function Get-GitOutput {
    param([string[]]$GitArgs)

    $output = & git @GitArgs 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $null
    }

    return ($output | Out-String).Trim()
}

function Write-Section {
    param([string]$Title)

    Write-Host ""
    Write-Host "=== $Title ==="
}

function Show-ShortStatus {
    $status = Get-GitOutput -GitArgs @("status", "--short")
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "Working tree: clean"
        return $true
    }

    Write-Host "Working tree has changes:"
    Write-Host $status
    return $false
}

function Show-AheadBehind {
    param([string]$Upstream)

    if ([string]::IsNullOrWhiteSpace($Upstream)) {
        Write-Host "Upstream: not configured"
        return
    }

    $counts = Invoke-Git -GitArgs @("rev-list", "--left-right", "--count", "$Upstream...HEAD")
    $parts = $counts -split "\s+"

    if ($parts.Length -ge 2) {
        Write-Host "Upstream: $Upstream"
        Write-Host "Behind commits: $($parts[0])"
        Write-Host "Ahead commits:  $($parts[1])"
    }
}

$scriptPath = $MyInvocation.MyCommand.Path
$scriptRoot = if ([string]::IsNullOrWhiteSpace($scriptPath)) { (Get-Location).Path } else { Split-Path -Parent $scriptPath }

$repoRoot = $null
if (Test-Path (Join-Path $scriptRoot ".git")) {
    $repoRoot = $scriptRoot
}
else {
    $repoRoot = Get-GitOutput -GitArgs @("rev-parse", "--show-toplevel")
}

if ([string]::IsNullOrWhiteSpace($repoRoot)) {
    throw "Could not find a git repository. Run this script from the repo root or keep it in the repository root."
}

Set-Location $repoRoot

$currentBranch = Invoke-Git -GitArgs @("rev-parse", "--abbrev-ref", "HEAD")
$upstream = Get-GitOutput -GitArgs @("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}")

Write-Host "Repo: $repoRoot"
Write-Host "Branch: $currentBranch"

switch ($Mode) {
    "status" {
        Write-Section "Status"
        Show-ShortStatus | Out-Null
        Show-AheadBehind -Upstream $upstream
    }

    "start" {
        Write-Section "Start Session Sync"

        if (-not $NoFetch) {
            Write-Host "Fetching latest refs..."
            Invoke-Git -GitArgs @("fetch", "--prune") | Out-Null
        }

        if ([string]::IsNullOrWhiteSpace($upstream)) {
            Write-Host "No upstream configured for this branch; skipping pull."
            Write-Host "Tip: push once with --set-upstream to track origin/$currentBranch."
        }
        else {
            Write-Host "Pulling latest changes with rebase and autostash..."
            Invoke-Git -GitArgs @("pull", "--rebase", "--autostash") | Out-Null
        }

        Show-ShortStatus | Out-Null
        Show-AheadBehind -Upstream $upstream
    }

    "end" {
        Write-Section "End Session Sync"

        $isClean = Show-ShortStatus
        if (-not $isClean) {
            throw "Commit or stash your local changes before running end sync."
        }

        if ([string]::IsNullOrWhiteSpace($upstream)) {
            Write-Host "No upstream configured; setting upstream and pushing..."
            Invoke-Git -GitArgs @("push", "--set-upstream", "origin", $currentBranch) | Out-Null
        }
        else {
            Write-Host "Pushing current branch to upstream..."
            Invoke-Git -GitArgs @("push") | Out-Null
        }

        Show-AheadBehind -Upstream $upstream
        Write-Host "Sync complete."
    }
}
