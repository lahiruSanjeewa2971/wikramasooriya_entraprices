# Database Setup Guide - Complete Database Schema with New Fields

## 🚀 Overview
This guide covers setting up the complete database schema for Wikramasooriya Enterprises, including the new **mobile** and **location** fields for enhanced user registration.

## ✨ New Features Added
- **Mobile Number Field**: Stores user phone numbers with validation
- **Location Field**: Stores user locations/addresses
- **Complete Schema**: All necessary tables for the application
- **Enhanced Validation**: Database-level constraints and checks

## 🔧 Solution Options

### Option 1: Complete Database Setup (Recommended)
Run the complete database setup script that creates all tables with new fields:

```bash
# Using PowerShell
.\setup-complete-database.ps1

# Or manually run the SQL files
```

### Option 2: Step-by-Step Setup
Follow these steps to set up the database from scratch:

#### Step 1: Ensure PostgreSQL is Running
```powershell
# Check if PostgreSQL service is running
Get-Service -Name "*postgres*"

# If not running, start it
Start-Service postgresql-x64-17
```

#### Step 2: Create Database and User
Connect to PostgreSQL as the superuser:

```bash
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\17\bin"

# Connect as postgres user
psql.exe -U postgres
```

When prompted for password, enter your postgres user password.

#### Step 3: Run Initial Setup SQL
```sql
-- Create the database
CREATE DATABASE wik_db;

-- Create the user
CREATE USER wikadmin WITH PASSWORD 'SecretPass123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wik_db TO wikadmin;

-- Connect to the new database
\c wik_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO wikadmin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wikadmin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wikadmin;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wikadmin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO wikadmin;

-- Exit
\q
```

#### Step 4: Create Complete Database Schema
Now create all the tables with the new fields:

```bash
# Connect to the database as wikadmin
psql.exe -U wikadmin -d wik_db

# Execute the complete schema script
\i db\init\create-tables.sql
```

## 🗄️ Database Schema Created

### **Tables Created:**
1. **`users`** - User accounts with new mobile & location fields
2. **`categories`** - Product categories
3. **`products`** - Product catalog
4. **`carts`** - Shopping carts
5. **`cart_items`** - Cart contents
6. **`contacts`** - Contact form submissions

### **Users Table Structure:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 2),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    mobile VARCHAR(20) NOT NULL CHECK (LENGTH(mobile) >= 10),        -- NEW FIELD
    location VARCHAR(255) NOT NULL CHECK (LENGTH(location) >= 3),    -- NEW FIELD
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **New Fields Details:**
- **`mobile`**: VARCHAR(20) - Stores phone numbers (10-20 characters)
- **`location`**: VARCHAR(255) - Stores user locations (3-255 characters)
- **Validation**: Database-level constraints ensure data integrity
- **Indexes**: Performance optimized for queries

## 🖥️ Connecting with Azure Data Studio

Azure Data Studio is a modern database management tool that provides an excellent interface for managing your PostgreSQL database.

### **Prerequisites:**
1. **Install Azure Data Studio** from [Microsoft's official site](https://docs.microsoft.com/en-us/sql/azure-data-studio/download)
2. **Install PostgreSQL Extension** for Azure Data Studio
3. **Ensure PostgreSQL is running** on your system

### **Connection Details:**

#### **Connection Parameters:**
```
Connection Type: PostgreSQL
Server: localhost
Port: 5432
Database: wik_db
Username: wikadmin
Password: SecretPass123
```

#### **Step-by-Step Connection:**

1. **Open Azure Data Studio**
2. **Click "New Connection"** or press `Ctrl+Shift+D`
3. **Select "PostgreSQL"** as the connection type
4. **Enter connection details:**
   - **Server**: `localhost`
   - **Port**: `5432`
   - **Database**: `wik_db`
   - **Username**: `wikadmin`
   - **Password**: `SecretPass123`
5. **Click "Connect"**

#### **Alternative Connection String:**
```
postgresql://wikadmin:SecretPass123@localhost:5432/wik_db
```

### **PostgreSQL Extension Setup:**

1. **Open Extensions** (`Ctrl+Shift+X`)
2. **Search for "PostgreSQL"**
3. **Install "PostgreSQL" extension** by Microsoft
4. **Restart Azure Data Studio** if prompted

### **Verifying Connection:**

After connecting, you should see:
- **Database Explorer** with `wik_db` database
- **Tables folder** containing all 6 tables
- **Users table** with the new `mobile` and `location` columns

### **Exploring the New Schema:**

1. **Expand `wik_db` → `Tables`**
2. **Right-click on `users` table → "Select Top 1000"**
3. **View table structure** to see new fields
4. **Run queries** to explore the data

### **Sample Queries to Test:**

```sql
-- View all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verify new fields exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('mobile', 'location');

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'carts', COUNT(*) FROM carts
UNION ALL
SELECT 'cart_items', COUNT(*) FROM cart_items
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts;
```

### **Benefits of Using Azure Data Studio:**

- **Modern Interface**: Clean, VS Code-like experience
- **IntelliSense**: Smart SQL completion and suggestions
- **Query Results**: Tabular data display with export options
- **Extensions**: Rich ecosystem of database tools
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Free**: No licensing costs

## 🚀 Quick Setup Commands

### **Complete Setup in One Go:**
```powershell
# 1. Drop existing database (if any)
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "DROP DATABASE IF EXISTS wik_db;"

# 2. Create database and user
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -f "db\init\setup.sql"

# 3. Create complete schema with new fields
$env:PGPASSWORD = "Abcd@1234"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U wikadmin -d wik_db -f "db\init\create-tables.sql"
```

### **Using the PowerShell Script:**
```powershell
# Run the complete setup script
.\setup-complete-database.ps1
```

## ✅ Verification
After setup, verify the database structure:

```bash
# Connect to database
psql.exe -U wikadmin -d wik_db

# List all tables
\dt

# Show users table structure
\d users

# Check new fields exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('mobile', 'location');
```

You should see:
```
✅ Database connection established successfully.
🚀 Server running on port 5000
📊 All tables created with new fields
```

## 🔒 Security Notes
- The default password `SecretPass123` is for development only
- Change the password in production
- Consider using environment variables for sensitive data
- New fields include proper validation constraints

## 🐛 Troubleshooting

### Common Issues:

1. **PostgreSQL not running**
   - Start the PostgreSQL service
   - Check Windows Services

2. **Permission denied**
   - Run setup scripts as Administrator
   - Check PostgreSQL configuration files

3. **Port already in use**
   - Check if another PostgreSQL instance is running
   - Change port in `.env` file if needed

4. **User already exists**
   - Drop and recreate the user: `DROP USER IF EXISTS wikadmin;`

5. **Tables already exist**
   - Drop database and recreate: `DROP DATABASE IF EXISTS wik_db;`

### **Azure Data Studio Issues:**

1. **Connection failed**
   - Verify PostgreSQL service is running
   - Check firewall settings
   - Confirm port 5432 is accessible

2. **Extension not working**
   - Restart Azure Data Studio after installation
   - Check extension compatibility

3. **Authentication error**
   - Verify username and password
   - Check user permissions in PostgreSQL

## 📁 Files Created
- `db/init/setup.sql` - Initial database and user setup
- `db/init/create-tables.sql` - Complete table schema with new fields
- `setup-complete-database.ps1` - PowerShell setup script
- `setup-database.bat` - Batch setup script
- `DATABASE_SETUP.md` - This updated guide

## 🎯 Next Steps
Once the database is set up:
1. Run `npm run dev` to start the backend
2. The database will be automatically synchronized
3. Your API will be available at `http://localhost:5000/api`
4. Test the new registration fields (mobile & location)
5. Frontend is ready to collect enhanced user data
6. **Connect with Azure Data Studio** for database management

## 🔄 Migration from Old Schema
If you have an existing database with the old schema:

1. **Backup your data** (if any)
2. **Drop the old database** completely
3. **Run the new setup** to create fresh schema
4. **Restore data** if needed (adjust for new fields)

## 📊 Benefits of New Schema
- **Enhanced User Data**: Mobile numbers and locations
- **Better Validation**: Database-level constraints
- **Performance**: Optimized indexes
- **Scalability**: Proper relationships and constraints
- **Professional**: Industry-standard registration fields
- **Easy Management**: Azure Data Studio integration
