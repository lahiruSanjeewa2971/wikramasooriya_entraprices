# Database Setup Script for Wikramasooriya Enterprises
# This script sets up the PostgreSQL database and user automatically

Write-Host "🔧 Setting up PostgreSQL database for Wikramasooriya Enterprises..." -ForegroundColor Green

# PostgreSQL installation path
$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

# Check if PostgreSQL is installed
if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ PostgreSQL not found at expected path: $psqlPath" -ForegroundColor Red
    Write-Host "Please install PostgreSQL or update the path in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL found at: $psqlPath" -ForegroundColor Green

# Check if PostgreSQL service is running
$postgresService = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue
if ($postgresService -and $postgresService.Status -eq "Running") {
    Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL service is not running. Please start it first." -ForegroundColor Red
    exit 1
}

# Try to connect as postgres user (superuser)
Write-Host "🔐 Attempting to connect as postgres superuser..." -ForegroundColor Yellow

try {
    # First, try to create the database and user using psql
    $setupScript = Join-Path $PSScriptRoot "db\init\setup.sql"
    
    Write-Host "📝 Running database setup script..." -ForegroundColor Yellow
    
    # Run the setup script
    & $psqlPath -U postgres -f $setupScript
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
        Write-Host "📊 Database: wik_db" -ForegroundColor Cyan
        Write-Host "👤 User: wikadmin" -ForegroundColor Cyan
        Write-Host "🔑 Password: SecretPass123" -ForegroundColor Cyan
        Write-Host "🌐 Host: localhost:5432" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Database setup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error during database setup: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 You may need to provide the postgres user password manually." -ForegroundColor Yellow
    Write-Host "💡 Or run this script as an administrator." -ForegroundColor Yellow
}

Write-Host "`n🎯 Next steps:" -ForegroundColor Green
Write-Host "1. If setup was successful, you can now run: npm run dev" -ForegroundColor White
Write-Host "2. If setup failed, check the error messages above" -ForegroundColor White
Write-Host "3. You may need to manually create the database and user" -ForegroundColor White
