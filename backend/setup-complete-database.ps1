# Complete Database Setup Script for Wikramasooriya Enterprises
# This script sets up the complete database schema with new mobile and location fields

Write-Host "🚀 Setting up complete database schema..." -ForegroundColor Green

# Database connection details
$DB_USER = "wikadmin"
$DB_NAME = "wik_db"
$SQL_FILE = "db\init\create-tables.sql"

Write-Host "📋 Creating complete database schema..." -ForegroundColor Yellow

# Run the complete schema creation script
try {
    # Use psql to execute the SQL file
    $env:PGPASSWORD = "SecretPass123"
    
    Write-Host "🔧 Creating tables and schema..." -ForegroundColor Cyan
    
    # Execute the SQL file
    & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U $DB_USER -d $DB_NAME -f $SQL_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema created successfully!" -ForegroundColor Green
        Write-Host "📊 Tables created:" -ForegroundColor Yellow
        Write-Host "   - users (with mobile & location fields)" -ForegroundColor White
        Write-Host "   - categories" -ForegroundColor White
        Write-Host "   - products" -ForegroundColor White
        Write-Host "   - carts" -ForegroundColor White
        Write-Host "   - cart_items" -ForegroundColor White
        Write-Host "   - contacts" -ForegroundColor White
        
        Write-Host "🔍 Verifying table structure..." -ForegroundColor Cyan
        
        # Verify the users table structure
        & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U $DB_USER -d $DB_NAME -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"
        
    } else {
        Write-Host "❌ Error creating database schema" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear the password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host "💡 You can now start your backend server" -ForegroundColor Cyan
