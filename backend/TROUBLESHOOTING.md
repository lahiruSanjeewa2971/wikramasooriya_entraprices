# 🔧 **Troubleshooting Guide - Wikramasooriya Backend**

## 🚨 **Common Issues & Solutions**

### **1. Database Connection Errors**

#### **Error: "password authentication failed for user"**
**Problem**: Database user credentials are incorrect or user doesn't exist.

**Solutions**:
1. **Check PostgreSQL User**:
   ```bash
   # Connect to PostgreSQL as superuser
   psql -U postgres -h localhost
   
   # List users
   \du
   
   # Create user if needed
   CREATE USER wikadmin WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE wik_db TO wikadmin;
   ```

2. **Verify Environment Variables**:
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Verify database credentials
   cat .env | grep DB_
   ```

3. **Use Default PostgreSQL User**:
   ```bash
   # In .env file, use:
   DB_USER=postgres
   DB_PASSWORD=Abcd@1234
   ```

#### **Error: "database does not exist"**
**Problem**: The database `wik_db` hasn't been created.

**Solutions**:
1. **Create Database**:
   ```bash
   psql -U postgres -h localhost
   CREATE DATABASE wik_db;
   \q
   ```

2. **Run Setup Scripts**:
   ```bash
   npm run db:setup
   npm run db:seed
   ```

#### **Error: "connection refused"**
**Problem**: PostgreSQL service is not running.

**Solutions**:
1. **Check PostgreSQL Status**:
   ```bash
   # Windows
   net start postgresql-x64-15
   
   # Linux/Mac
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Verify Port**:
   ```bash
   netstat -an | findstr :5432
   ```

### **2. API Authentication Errors**

#### **Error: "Access token required"**
**Problem**: API endpoint requires authentication but no token provided.

**Solutions**:
1. **Login First**:
   ```bash
   # Get authentication token
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@wikramasooriya.com","password":"Admin123!"}'
   ```

2. **Use Token in Headers**:
   ```bash
   # Include token in subsequent requests
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/cart
   ```

### **3. Server Startup Issues**

#### **Error: "Port already in use"**
**Problem**: Another process is using port 5000.

**Solutions**:
1. **Find Process Using Port**:
   ```bash
   netstat -ano | findstr :5000
   ```

2. **Kill Process**:
   ```bash
   taskkill /PID <PID> /F
   ```

3. **Change Port**:
   ```bash
   # In .env file
   PORT=5001
   ```

## 🔍 **Diagnostic Commands**

### **Database Health Check**
```bash
# Validate database connection
npm run db:validate

# Test connection manually
node -e "
import('./src/db/simple-connection.js').then(async (db) => {
  try {
    const result = await db.query('SELECT current_database(), current_user');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
})
"
```

### **Server Health Check**
```bash
# Check if server is running
netstat -an | findstr :5000

# Test health endpoint
curl http://localhost:5000/health

# Test API endpoints
curl http://localhost:5000/api/products
```

### **Environment Check**
```bash
# Check environment variables
echo $NODE_ENV
echo $DB_HOST
echo $DB_PORT
echo $DB_NAME
echo $DB_USER
echo $DB_PASSWORD

# Windows PowerShell
Get-ChildItem Env: | Where-Object {$_.Name -like "DB_*"}
```

## 🛠️ **Prevention Strategies**

### **1. Use Validation Scripts**
```bash
# Always validate before starting
npm run start:validate

# Or validate separately
npm run db:validate
```

### **2. Environment File Management**
```bash
# Copy example file
cp env.example .env

# Edit with correct values
# DB_USER=postgres
# DB_PASSWORD=Abcd@1234
# DB_NAME=wik_db
```

### **3. Database Setup Checklist**
- [ ] PostgreSQL installed and running
- [ ] Database `wik_db` created
- [ ] User has proper permissions
- [ ] Tables created (`npm run db:setup`)
- [ ] Sample data seeded (`npm run db:seed`)

### **4. Startup Sequence**
1. **Validate Database**: `npm run db:validate`
2. **Start Server**: `npm run start:validate`
3. **Test Health**: `curl http://localhost:5000/health`
4. **Test APIs**: Test login and products endpoints

## 📋 **Quick Fix Commands**

### **Reset Everything**
```bash
# Stop server
Ctrl+C

# Drop and recreate database
psql -U postgres -h localhost
DROP DATABASE IF EXISTS wik_db;
CREATE DATABASE wik_db;
\q

# Setup tables and seed data
npm run db:setup
npm run db:seed

# Start with validation
npm run start:validate
```

### **Check Database Status**
```bash
# Quick database check
npm run db:validate

# Manual connection test
node validate-db-connection.js
```

### **Restart Services**
```bash
# Restart PostgreSQL (Windows)
net stop postgresql-x64-15
net start postgresql-x64-15

# Restart PostgreSQL (Linux/Mac)
sudo systemctl restart postgresql

# Restart Backend
npm run start:validate
```

## 🚀 **Production Deployment Checks**

### **Pre-Deployment Validation**
```bash
# 1. Database connection
npm run db:validate

# 2. Environment variables
node -e "console.log('NODE_ENV:', process.env.NODE_ENV)"
node -e "console.log('DB_HOST:', process.env.DB_HOST)"

# 3. Security check
node -e "console.log('JWT_SECRET set:', !!process.env.JWT_SECRET)"

# 4. Start server
npm run start:validate
```

### **Health Monitoring**
```bash
# Monitor server logs
npm run dev

# Check API responses
curl -s http://localhost:5000/health | jq .

# Monitor database connections
psql -U postgres -h localhost -d wik_db -c "SELECT count(*) FROM pg_stat_activity;"
```

## 📞 **Getting Help**

### **When to Contact Support**
- Database connection fails after following all steps
- Server starts but APIs return unexpected errors
- Performance issues or timeouts
- Security concerns

### **Information to Provide**
- Error message and stack trace
- Environment (Windows/Linux/Mac)
- PostgreSQL version
- Node.js version
- Output of `npm run db:validate`

---

**Remember**: Always run `npm run db:validate` before starting the server to prevent connection issues!
