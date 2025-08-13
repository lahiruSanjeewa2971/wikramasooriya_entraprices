# 🚀 Quick Start Guide - Backend After Device Restart

## 📋 Overview
This guide provides the complete steps to get your Wikramasooriya Enterprises backend running after restarting your device.

## 🔄 Complete Steps to Start Backend After Restart

### Step 1: Navigate to Your Project
```bash
cd D:\practice\react\wikramasooriya_entraprices\backend
```

### Step 2: Check if PostgreSQL Service is Running
```bash
Get-Service -Name "*postgres*"
```

**Expected Output:**
```
Status   Name               DisplayName
------   ----               -----------
Running  postgresql-x64-17  postgresql-x64-17 - PostgreSQL Serv...
```

**If PostgreSQL is NOT running**, start it:
```bash
Start-Service postgresql-x64-17
```

**If you get permission errors**, run PowerShell as Administrator and try again.

### Step 3: Verify Database Connection
Run the database setup to ensure everything is configured:
```bash
npm run db:setup
```

This will:
- ✅ Check if PostgreSQL is running
- ✅ Verify the database `wik_db` exists
- ✅ Confirm user `wikadmin` has proper permissions
- ✅ Set up any missing database components

**Expected Output:**
```
Setting up PostgreSQL database for Wikramasooriya Enterprises...
SUCCESS: PostgreSQL found at: C:\Program Files\PostgreSQL\17\bin\psql.exe
SUCCESS: PostgreSQL service is running
Attempting to connect as postgres superuser...
Running database setup script...
SUCCESS: Database setup completed successfully!
Database: wik_db
User: wikadmin
Password: SecretPass123
Host: localhost:5432
```

### Step 4: Start the Backend
```bash
npm run dev
```

## 🚨 If You Get Database Connection Errors

If you see the "password authentication failed" error again, it means the database setup needs to be re-run. In that case:

1. **Stop the backend** (Ctrl+C)
2. **Run the database setup again**:
   ```bash
   npm run db:setup
   ```
3. **Start the backend again**:
   ```bash
   npm run dev
   ```

## ✅ Expected Success Output

When everything is working, you should see:
```
✅ Database connection established successfully.
🚀 Server running on port 5000
📚 API Documentation available at http://localhost:5000/api
🏥 Health check: http://localhost:5000/health
```

## 📝 Summary of Commands

```bash
# Navigate to backend directory
cd D:\practice\react\wikramasooriya_entraprices\backend

# Check PostgreSQL service
Get-Service -Name "*postgres*"

# Start PostgreSQL if needed (as Administrator)
Start-Service postgresql-x64-17

# Setup database
npm run db:setup

# Start backend
npm run dev
```

## 🔧 Troubleshooting

### Common Issues After Restart:

1. **PostgreSQL Service Not Running**
   - Solution: `Start-Service postgresql-x64-17`
   - Run PowerShell as Administrator if needed

2. **Database Connection Failed**
   - Solution: Run `npm run db:setup` again
   - This recreates the database connection

3. **Permission Denied**
   - Solution: Run PowerShell as Administrator
   - Check Windows Services for PostgreSQL

4. **Port Already in Use**
   - Solution: Check if another instance is running
   - Kill the process or change port in `.env`

## 🎯 Quick Commands Reference

| Action | Command |
|--------|---------|
| Check PostgreSQL | `Get-Service -Name "*postgres*"` |
| Start PostgreSQL | `Start-Service postgresql-x64-17` |
| Setup Database | `npm run db:setup` |
| Start Backend | `npm run dev` |
| Stop Backend | `Ctrl + C` |

## 📁 Related Files

- `setup-database-simple.ps1` - Database setup script
- `setup-database.bat` - Alternative batch setup script
- `DATABASE_SETUP.md` - Detailed database setup guide
- `.env` - Environment configuration

## 🚀 Next Steps

Once your backend is running:
1. Your API will be available at `http://localhost:5000/api`
2. Frontend can connect to the backend
3. Database will be automatically synchronized
4. All endpoints will be functional

## 💡 Pro Tips

- **Bookmark this guide** for quick reference after restarts
- **Run as Administrator** if you encounter permission issues
- **Check the logs** in the terminal for detailed error information
- **Use `npm run db:setup`** whenever you're unsure about database status

---

*Last Updated: After Device Restart*
*Backend Version: wikramasooriya-backend@1.0.0*
