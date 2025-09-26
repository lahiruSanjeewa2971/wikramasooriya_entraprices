# PowerShell script to start Docker semantic search container
# This script is called by npm run dev:docker

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host "Starting Docker Semantic Search Container..." -ForegroundColor Cyan

# Check if Docker is available
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Docker is not available on this system" -ForegroundColor Yellow
        Write-Host "Semantic search will use fallback mode" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "SUCCESS: Docker is available: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Docker is not available on this system" -ForegroundColor Yellow
    Write-Host "Semantic search will use fallback mode" -ForegroundColor Yellow
    exit 1
}

# Check if container is already running
$containerStatus = docker ps --filter "name=wikramasooriya-postgres-pgvector" --format "{{.Names}}" 2>$null
if ($containerStatus -eq "wikramasooriya-postgres-pgvector") {
    Write-Host "SUCCESS: Docker semantic search container is already running" -ForegroundColor Green
    
    # Check container health
    $healthStatus = docker inspect --format "{{.State.Health.Status}}" wikramasooriya-postgres-pgvector 2>$null
    if ($healthStatus -eq "healthy") {
        Write-Host "SUCCESS: Container is healthy and ready for semantic search!" -ForegroundColor Green
        Write-Host "Container: wikramasooriya-postgres-pgvector" -ForegroundColor Cyan
        Write-Host "Semantic search functionality is available" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Container is running but not healthy (Status: $healthStatus)" -ForegroundColor Yellow
        Write-Host "TIP: Consider restarting: npm run docker:stop && npm run docker:start" -ForegroundColor Yellow
    }
    exit 0
}

# Start the container
Write-Host "Starting Docker container..." -ForegroundColor Cyan
try {
    docker-compose -f docker-compose.semantic.yml up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to start Docker container" -ForegroundColor Red
        Write-Host "Semantic search will use fallback mode" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "SUCCESS: Docker semantic search container started successfully" -ForegroundColor Green
    
    # Wait for container to be healthy
    Write-Host "Waiting for container to be healthy..." -ForegroundColor Cyan
    $maxAttempts = 15
    $attempt = 0
    
    do {
        Start-Sleep -Seconds 2
        $healthStatus = docker inspect --format "{{.State.Health.Status}}" wikramasooriya-postgres-pgvector 2>$null
        $attempt++
        
        if ($healthStatus -eq "healthy") {
            Write-Host "SUCCESS: Docker semantic search container is up and running!" -ForegroundColor Green
            Write-Host "Container: wikramasooriya-postgres-pgvector" -ForegroundColor Cyan
            Write-Host "Semantic search functionality is now available" -ForegroundColor Green
            exit 0
        } elseif ($healthStatus -eq "unhealthy") {
            Write-Host "ERROR: Container is unhealthy" -ForegroundColor Red
            Write-Host "Semantic search will use fallback mode" -ForegroundColor Yellow
            exit 1
        }
        
        if ($Verbose) {
            Write-Host "Container status: $healthStatus (attempt $attempt/$maxAttempts)" -ForegroundColor Gray
        }
        
    } while ($attempt -lt $maxAttempts)
    
    Write-Host "WARNING: Container health check timeout" -ForegroundColor Yellow
    Write-Host "Semantic search will use fallback mode" -ForegroundColor Yellow
    exit 1
    
} catch {
    Write-Host "ERROR: Error starting Docker container: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Semantic search will use fallback mode" -ForegroundColor Yellow
    exit 1
}