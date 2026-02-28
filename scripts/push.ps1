Param(
  [string]$RepoUrl = "https://github.com/mraitsam123-rgb/car-vampire.git",
  [string]$Branch = "main"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Git {
  $git = Get-Command git -ErrorAction SilentlyContinue
  if (-not $git) {
    Write-Host "Git not found. Installing via winget..." -ForegroundColor Yellow
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
      winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    } else {
      Write-Host "winget not available. Please install Git for Windows from https://git-scm.com/download/win and re-run this script." -ForegroundColor Red
      exit 1
    }
    $git = Get-Command git -ErrorAction SilentlyContinue
    if (-not $git) {
      Write-Host "Git installation did not complete. Reopen your terminal and run this script again." -ForegroundColor Red
      exit 1
    }
  }
}

function Ensure-GitConfig {
  $name = git config --global user.name 2>$null
  $email = git config --global user.email 2>$null
  if (-not $name) {
    git config --global user.name "Your Name"
  }
  if (-not $email) {
    git config --global user.email "you@example.com"
  }
  git config --global credential.helper manager-core
}

function Init-And-Push {
  if (-not (Test-Path ".git")) {
    git init
  }
  git branch -M $Branch
  git add -A
  git commit -m "initial import" | Out-Null
  $hasOrigin = (git remote | Select-String -Pattern "^origin$" -Quiet)
  if ($hasOrigin) {
    git remote remove origin
  }
  git remote add origin $RepoUrl
  try {
    git push -u origin $Branch
  } catch {
    Write-Host "First push failed, attempting to pull and retry..." -ForegroundColor Yellow
    git pull origin $Branch --allow-unrelated-histories
    git push -u origin $Branch
  }
}

Write-Host "Ensuring Git is installed..." -ForegroundColor Cyan
Ensure-Git

Write-Host "Configuring Git identity..." -ForegroundColor Cyan
Ensure-GitConfig

Write-Host "Pushing repository to $RepoUrl ($Branch)..." -ForegroundColor Cyan
Init-And-Push

Write-Host "Done. Repository pushed." -ForegroundColor Green

