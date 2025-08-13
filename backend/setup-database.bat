@echo off
echo 🔧 Setting up PostgreSQL database for Wikramasooriya Enterprises...
echo.

REM Check if PostgreSQL is installed
if not exist "C:\Program Files\PostgreSQL\17\bin\psql.exe" (
    echo ❌ PostgreSQL not found at expected path
    echo Please install PostgreSQL or update the path in this script
    pause
    exit /b 1
)

echo ✅ PostgreSQL found
echo.

REM Check if PostgreSQL service is running
sc query postgresql-x64-17 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL service is not running
    echo Please start the PostgreSQL service first
    pause
    exit /b 1
)

echo ✅ PostgreSQL service is running
echo.

echo 🔐 Attempting to set up database and user...
echo.

REM Run the setup script
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -f "%~dp0db\init\setup.sql"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo 📊 Database: wik_db
    echo 👤 User: wikadmin
    echo 🔑 Password: SecretPass123
    echo 🌐 Host: localhost:5432
    echo.
    echo 🎯 You can now run: npm run dev
) else (
    echo.
    echo ❌ Database setup failed
    echo 💡 You may need to provide the postgres user password manually
    echo 💡 Or run this script as an administrator
)

echo.
pause
