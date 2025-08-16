# 🚀 **Wikramasooriya Enterprises - Production Deployment Guide**

## 📋 **Table of Contents**
- [System Overview](#system-overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Security Configuration](#security-configuration)
- [QA Testing Checklist](#qa-testing-checklist)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ **System Overview**

### **Backend Architecture**
- **Framework**: Node.js + Express.js
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with refresh tokens
- **Security**: Helmet, CORS, Rate Limiting
- **Pattern**: Service Layer Architecture
- **Logging**: Structured logging with Winston

### **Frontend Architecture**
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: React hooks + Context
- **Routing**: React Router DOM v6
- **Build Tool**: Vite with production optimization

### **Key Features**
- ✅ User authentication & authorization
- ✅ Product catalog with search & filtering
- ✅ Shopping cart functionality
- ✅ Contact form with database storage
- ✅ Responsive design for all devices
- ✅ Real-time cart updates
- ✅ Secure API endpoints

---

## ✅ **Pre-Deployment Checklist**

### **Code Quality**
- [x] All console statements removed
- [x] Error handling production-ready
- [x] Environment variables configured
- [x] Security middleware enabled
- [x] Rate limiting configured
- [x] CORS properly set up
- [x] Input validation implemented
- [x] SQL injection prevention

### **Performance**
- [x] Database connection pooling
- [x] Frontend build optimization
- [x] API response optimization
- [x] Rate limiting optimized
- [x] Error logging optimized

### **Security**
- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] Input sanitization
- [x] CORS protection
- [x] Rate limiting
- [x] Helmet security headers

---

## ⚙️ **Environment Configuration**

### **Backend Environment Variables (.env)**

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
API_PREFIX=/api

# Database Configuration
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=wik_db
DB_USER=wikadmin
DB_PASSWORD=your-secure-password
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=5h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=500

# Logging
LOG_LEVEL=info

# CORS Origins (comma-separated for production)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Production Domain
PRODUCTION_DOMAIN=https://yourdomain.com
```

### **Frontend Environment Variables (.env)**

```bash
VITE_API_URL=https://yourdomain.com/api
```

---

## 🖥️ **Backend Deployment**

### **1. Server Requirements**
- **Node.js**: >= 18.0.0
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 10GB+ for logs and data
- **OS**: Linux (Ubuntu 20.04+ recommended)

### **2. Installation Steps**

```bash
# Clone repository
git clone <your-repo-url>
cd wikramasooriya_entraprices/backend

# Install dependencies
npm install --production

# Create environment file
cp env.example .env
# Edit .env with your production values

# Start the server
npm start
```

### **3. Process Management (PM2)**

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start src/server.js --name "wik-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### **4. Nginx Reverse Proxy Configuration**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🌐 **Frontend Deployment**

### **1. Build Process**

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# The dist/ folder contains your production build
```

### **2. Deployment Options**

#### **Option A: Static Hosting (Netlify/Vercel)**
```bash
# Deploy dist/ folder to your hosting platform
# Set environment variable: VITE_API_URL=https://yourdomain.com/api
```

#### **Option B: Traditional Web Server**
```bash
# Copy dist/ contents to your web server directory
# Configure web server to serve static files
# Set up proper routing for SPA
```

### **3. Web Server Configuration (Apache)**

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # SPA routing
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</VirtualHost>
```

---

## 🗄️ **Database Setup**

### **1. PostgreSQL Installation**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql postgresql-server postgresql-contrib
```

### **2. Database Creation**

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE wik_db;
CREATE USER wikadmin WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE wik_db TO wikadmin;
\q
```

### **3. Database Setup Scripts**

```bash
# Run database setup
cd backend
node setup-simple-db.js

# Seed the database
node seed-simple-db.js
```

### **4. Database Backup Strategy**

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U wikadmin -h localhost wik_db > backup_$DATE.sql

# Restore from backup
psql -U wikadmin -h localhost wik_db < backup_$DATE.sql
```

---

## 🔒 **Security Configuration**

### **1. SSL/TLS Setup**

```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **2. Firewall Configuration**

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# iptables (CentOS)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

### **3. Security Headers**

```javascript
// Already configured in server.js with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## 🧪 **QA Testing Checklist**

### **1. Functional Testing**

#### **Authentication Flow**
- [ ] User registration
- [ ] User login
- [ ] Password validation
- [ ] JWT token handling
- [ ] Logout functionality
- [ ] Password reset (if implemented)

#### **Product Management**
- [ ] Product listing
- [ ] Product search
- [ ] Category filtering
- [ ] Product sorting
- [ ] Product images display

#### **Shopping Cart**
- [ ] Add items to cart
- [ ] Update item quantities
- [ ] Remove items from cart
- [ ] Cart persistence
- [ ] Real-time cart updates

#### **Contact Form**
- [ ] Form submission
- [ ] Email validation
- [ ] Database storage
- [ ] Success/error handling

### **2. Performance Testing**

- [ ] API response times < 500ms
- [ ] Page load times < 3 seconds
- [ ] Database query performance
- [ ] Rate limiting effectiveness
- [ ] Memory usage monitoring

### **3. Security Testing**

- [ ] JWT token validation
- [ ] CORS configuration
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection

### **4. Cross-Browser Testing**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

---

## 🚀 **Production Deployment**

### **1. Final Checklist**

- [ ] All environment variables set
- [ ] Database configured and seeded
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Monitoring tools set up
- [ ] Backup strategy implemented
- [ ] Error tracking configured

### **2. Deployment Commands**

```bash
# Backend
cd backend
npm install --production
pm2 start src/server.js --name "wik-backend"

# Frontend
cd frontend
npm install
npm run build
# Deploy dist/ folder to web server
```

### **3. Health Check**

```bash
# Test API endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/api/products
curl https://yourdomain.com/api/auth/login
```

---

## 📊 **Monitoring & Maintenance**

### **1. Application Monitoring**

```bash
# PM2 monitoring
pm2 monit
pm2 logs wik-backend

# System monitoring
htop
df -h
free -h
```

### **2. Log Management**

```bash
# View application logs
tail -f /var/log/your-app/app.log

# Log rotation
sudo logrotate /etc/logrotate.d/your-app
```

### **3. Performance Monitoring**

- **Backend**: Response times, error rates, database performance
- **Frontend**: Page load times, user interactions, error tracking
- **Database**: Query performance, connection pool status
- **Infrastructure**: CPU, memory, disk usage, network

### **4. Regular Maintenance**

- [ ] Weekly security updates
- [ ] Monthly database optimization
- [ ] Quarterly dependency updates
- [ ] Annual SSL certificate renewal
- [ ] Regular backup verification

---

## 🆘 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U wikadmin -h localhost -d wik_db

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### **2. Backend Server Issues**
```bash
# Check PM2 status
pm2 status
pm2 logs wik-backend

# Check port usage
sudo netstat -tlnp | grep :5000

# Restart service
pm2 restart wik-backend
```

#### **3. Frontend Build Issues**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check build
npm run build

# Verify environment variables
echo $VITE_API_URL
```

#### **4. SSL/HTTPS Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📞 **Support & Contact**

### **Emergency Contacts**
- **System Administrator**: [Your Contact]
- **Database Administrator**: [Your Contact]
- **Development Team**: [Your Contact]

### **Documentation**
- **API Documentation**: `https://yourdomain.com/api`
- **System Health**: `https://yourdomain.com/health`
- **Error Logs**: Check application logs directory

### **Escalation Process**
1. **Level 1**: Check logs and restart services
2. **Level 2**: Contact development team
3. **Level 3**: Contact system administrator
4. **Level 4**: Emergency maintenance window

---

## 🎯 **Success Metrics**

### **Performance Targets**
- **API Response Time**: < 500ms (95th percentile)
- **Page Load Time**: < 3 seconds
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%

### **Business Metrics**
- **User Registration**: Track conversion rates
- **Cart Abandonment**: Monitor cart completion
- **Product Views**: Track popular products
- **Contact Form**: Monitor customer inquiries

---

## 📝 **Change Management**

### **Deployment Process**
1. **Development**: Feature development and testing
2. **Staging**: QA testing in staging environment
3. **Production**: Deploy to production with rollback plan
4. **Monitoring**: Post-deployment monitoring and validation

### **Rollback Plan**
```bash
# Database rollback
psql -U wikadmin -h localhost wik_db < backup_previous.sql

# Application rollback
pm2 restart wik-backend
# Deploy previous frontend build
```

---

## 🏁 **Conclusion**

This deployment guide provides comprehensive instructions for deploying the Wikramasooriya Enterprises e-commerce platform to production. Follow each section carefully to ensure a successful deployment.

**Remember**: Always test in a staging environment first, and have a rollback plan ready before going live.

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd")
**Version**: 1.0.0
**Author**: Development Team
**Status**: Production Ready ✅
