# 🐳 **Docker Production Deployment Guide - Wikramasooriya Enterprises**

## 📋 **Table of Contents**
- [Project Overview](#project-overview)
- [Pre-Deployment Analysis](#pre-deployment-analysis)
- [Docker Architecture](#docker-architecture)
- [Required Changes](#required-changes)
- [Dockerfile Configurations](#dockerfile-configurations)
- [Docker Compose Setup](#docker-compose-setup)
- [Environment Configuration](#environment-configuration)
- [Database Migration Strategy](#database-migration-strategy)
- [Deployment Steps](#deployment-steps)
- [Production Checklist](#production-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Rollback Plan](#rollback-plan)

---

## 🏗️ **Project Overview**

### **Current System**
- **Backend**: Node.js + Express.js API
- **Frontend**: React + Vite SPA
- **Database**: PostgreSQL
- **Authentication**: JWT with refresh tokens
- **Current Branch**: `production---V1.1`

### **Deployment Target**
- **Containerization**: Docker + Docker Compose
- **Environment**: Production-ready containers
- **Scalability**: Multi-container architecture
- **Persistence**: Volume-based data storage

---

## 🔍 **Pre-Deployment Analysis**

### **Current State Assessment**
- ✅ **Backend**: Production-ready, console statements removed
- ✅ **Frontend**: Build optimized, production-ready
- ✅ **Database**: Connection pooling, validation scripts
- ✅ **Security**: JWT, CORS, rate limiting, Helmet
- ✅ **Error Handling**: Production error handling implemented

### **Docker Requirements**
- **Backend Container**: Node.js 18+ runtime
- **Frontend Container**: Nginx for static file serving
- **Database Container**: PostgreSQL 15+ with persistence
- **Network**: Inter-container communication
- **Volumes**: Data persistence across deployments

---

## 🐳 **Docker Architecture**

### **Container Structure**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Nginx)       │    │   (Node.js)     │    │ (PostgreSQL)    │
│   Port: 80      │    │   Port: 5000    │    │  Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Docker Network │
                    │  (wik-network)  │
                    └─────────────────┘
```

### **Service Dependencies**
- **Frontend** → **Backend** (API calls)
- **Backend** → **Database** (data persistence)
- **All containers** → **Shared network**

---

## 🔧 **Required Changes**

### **1. Backend Changes**

#### **Dockerfile Creation**
- Create `backend/Dockerfile`
- Optimize for production builds
- Multi-stage build for smaller image size

#### **Environment Configuration**
- Update `.env` for production
- Remove development-specific settings
- Add Docker-specific configurations

#### **Health Check Endpoint**
- Ensure `/health` endpoint is working
- Add database connectivity check
- Return container status information

### **2. Frontend Changes**

#### **Build Optimization**
- Update Vite config for production
- Optimize bundle size
- Configure environment variables

#### **Nginx Configuration**
- Create custom nginx.conf
- Configure SPA routing
- Add compression and caching

#### **Dockerfile Creation**
- Create `frontend/Dockerfile`
- Multi-stage build with nginx
- Optimize static file serving

### **3. Database Changes**

#### **PostgreSQL Configuration**
- Create `database/init.sql`
- Configure production settings
- Set up proper user permissions

#### **Data Persistence**
- Configure Docker volumes
- Backup strategy implementation
- Migration scripts preparation

---

## 📁 **Dockerfile Configurations**

### **Backend Dockerfile**
```dockerfile
# Multi-stage build for backend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY src ./src

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "src/server.js"]
```

### **Frontend Dockerfile**
```dockerfile
# Multi-stage build for frontend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### **Database Dockerfile**
```dockerfile
FROM postgres:15-alpine

# Environment variables
ENV POSTGRES_DB=wik_db
ENV POSTGRES_USER=wikadmin
ENV POSTGRES_PASSWORD=#L0722596133h

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/
COPY setup-simple-db.js /docker-entrypoint-initdb.d/
COPY seed-simple-db.js /docker-entrypoint-initdb.d/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD pg_isready -U wikadmin -d wik_db

EXPOSE 5432
```

---

## 🚀 **Docker Compose Setup**

### **docker-compose.yml**
```yaml
version: '3.8'

services:
  # Database Service
  database:
    build: ./database
    container_name: wik-database
    restart: unless-stopped
    environment:
      POSTGRES_DB: wik_db
      POSTGRES_USER: wikadmin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/backups:/backups
    ports:
      - "5432:5432"
    networks:
      - wik-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wikadmin -d wik_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend Service
  backend:
    build: ./backend
    container_name: wik-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: wik_db
      DB_USER: wikadmin
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGINS: ${CORS_ORIGINS}
    ports:
      - "5000:5000"
    depends_on:
      database:
        condition: service_healthy
    networks:
      - wik-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Service
  frontend:
    build: ./frontend
    container_name: wik-frontend
    restart: unless-stopped
    environment:
      VITE_API_URL: ${VITE_API_URL}
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - wik-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    container_name: wik-nginx
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - wik-network

volumes:
  postgres_data:
    driver: local

networks:
  wik-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## ⚙️ **Environment Configuration**

### **Production .env File**
```bash
# Production Environment Variables
NODE_ENV=production
PORT=5000
API_PREFIX=/api

# Database Configuration
DB_HOST=database
DB_PORT=5432
DB_NAME=wik_db
DB_USER=wikadmin
DB_PASSWORD=your-super-secure-production-password
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-production
JWT_ACCESS_EXPIRES_IN=5h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=500

# CORS Origins
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend Configuration
VITE_API_URL=https://yourdomain.com/api

# Production Domain
PRODUCTION_DOMAIN=https://yourdomain.com
```

---

## 🗄️ **Database Migration Strategy**

### **1. Data Backup**
```bash
# Create backup before migration
pg_dump -U wikadmin -h localhost wik_db > backup_before_docker.sql

# Export current data
psql -U wikadmin -h localhost wik_db -c "COPY products TO '/tmp/products.csv' CSV HEADER;"
psql -U wikadmin -h localhost wik_db -c "COPY users TO '/tmp/users.csv' CSV HEADER;"
```

### **2. Migration Scripts**
```bash
# Database initialization
docker exec -it wik-database psql -U wikadmin -d wik_db -f /docker-entrypoint-initdb.d/init.sql

# Data restoration
docker exec -it wik-database psql -U wikadmin -d wik_db -c "\COPY products FROM '/tmp/products.csv' CSV HEADER;"
```

### **3. Verification**
```bash
# Check data integrity
docker exec -it wik-database psql -U wikadmin -d wik_db -c "SELECT COUNT(*) FROM products;"
docker exec -it wik-database psql -U wikadmin -d wik_db -c "SELECT COUNT(*) FROM users;"
```

---

## 🚀 **Deployment Steps**

### **Phase 1: Preparation (Day 1)**

#### **1.1 Environment Setup**
```bash
# Install Docker and Docker Compose
# Windows: Docker Desktop
# Linux: Docker Engine + Docker Compose

# Verify installation
docker --version
docker-compose --version
```

#### **1.2 Project Preparation**
```bash
# Switch to production branch
git checkout production---V1.1

# Create Docker directories
mkdir -p backend frontend database nginx
mkdir -p database/backups
mkdir -p nginx/ssl
```

#### **1.3 Configuration Files**
```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit production values
# Update database passwords, JWT secrets, domains
```

### **Phase 2: Dockerfile Creation (Day 2)**

#### **2.1 Backend Dockerfile**
```bash
# Create backend/Dockerfile
# Create backend/.dockerignore
# Test backend build locally
docker build -t wik-backend-test ./backend
```

#### **2.2 Frontend Dockerfile**
```bash
# Create frontend/Dockerfile
# Create frontend/nginx.conf
# Create frontend/.dockerignore
# Test frontend build locally
docker build -t wik-frontend-test ./frontend
```

#### **2.3 Database Setup**
```bash
# Create database/Dockerfile
# Create database/init.sql
# Test database container locally
docker build -t wik-database-test ./database
```

### **Phase 3: Docker Compose (Day 3)**

#### **3.1 Compose File**
```bash
# Create docker-compose.yml
# Create docker-compose.prod.yml (production overrides)
# Test local deployment
docker-compose up -d
```

#### **3.2 Health Checks**
```bash
# Verify all services are healthy
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost/health
curl http://localhost:5000/health
```

### **Phase 4: Production Deployment (Day 4)**

#### **4.1 Server Preparation**
```bash
# Install Docker on production server
# Configure firewall rules
# Set up SSL certificates
# Configure domain DNS
```

#### **4.2 Data Migration**
```bash
# Backup current database
# Transfer backup to production server
# Initialize production database
# Restore data
# Verify data integrity
```

#### **4.3 Service Deployment**
```bash
# Deploy to production server
docker-compose -f docker-compose.prod.yml up -d

# Monitor deployment
docker-compose -f docker-compose.prod.yml logs -f

# Verify production endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/api/products
```

---

## ✅ **Production Checklist**

### **Pre-Deployment**
- [ ] Docker and Docker Compose installed
- [ ] Production branch checked out
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Database backup created
- [ ] All Dockerfiles created and tested

### **Deployment**
- [ ] Containers built successfully
- [ ] Services started without errors
- [ ] Health checks passing
- [ ] Database connection established
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] SSL certificates working

### **Post-Deployment**
- [ ] All functionality tested
- [ ] Performance metrics collected
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team trained on new deployment

---

## 📊 **Monitoring & Maintenance**

### **Container Monitoring**
```bash
# Resource usage
docker stats

# Log monitoring
docker-compose logs -f

# Health status
docker-compose ps
```

### **Application Monitoring**
```bash
# API health
curl https://yourdomain.com/health

# Database connectivity
docker exec -it wik-database pg_isready -U wikadmin

# Performance metrics
docker exec -it wik-backend node -e "console.log(process.memoryUsage())"
```

### **Backup Strategy**
```bash
# Daily database backup
docker exec -it wik-database pg_dump -U wikadmin wik_db > /backups/backup_$(date +%Y%m%d).sql

# Weekly full backup
docker-compose down
tar -czf backup_$(date +%Y%m%d).tar.gz ./volumes
docker-compose up -d
```

---

## 🔄 **Rollback Plan**

### **Quick Rollback**
```bash
# Stop Docker services
docker-compose down

# Restore previous version
git checkout previous-production-branch
docker-compose up -d

# Verify rollback
curl https://yourdomain.com/health
```

### **Data Recovery**
```bash
# Restore database from backup
docker exec -it wik-database psql -U wikadmin -d wik_db < backup_file.sql

# Verify data integrity
docker exec -it wik-database psql -U wikadmin -d wik_db -c "SELECT COUNT(*) FROM products;"
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Container Won't Start**
```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker system df

# Restart service
docker-compose restart service-name
```

#### **Database Connection Issues**
```bash
# Check database status
docker exec -it wik-database pg_isready

# Check network connectivity
docker network inspect wik-network

# Restart database
docker-compose restart database
```

#### **Frontend Not Loading**
```bash
# Check nginx logs
docker exec -it wik-frontend tail -f /var/log/nginx/error.log

# Verify build
docker exec -it wik-frontend ls -la /usr/share/nginx/html

# Restart frontend
docker-compose restart frontend
```

---

## 📝 **Post-Deployment Tasks**

### **1. Performance Optimization**
- [ ] Monitor container resource usage
- [ ] Optimize database queries
- [ ] Configure CDN for static assets
- [ ] Implement caching strategies

### **2. Security Hardening**
- [ ] Regular security updates
- [ ] SSL certificate renewal
- [ ] Access control review
- [ ] Security audit

### **3. Monitoring Setup**
- [ ] Application performance monitoring
- [ ] Error tracking and alerting
- [ ] Uptime monitoring
- [ ] Performance metrics dashboard

---

## 🏁 **Conclusion**

This Docker deployment guide provides a comprehensive roadmap for containerizing and deploying your Wikramasooriya Enterprises e-commerce platform to production.

### **Key Benefits of Docker Deployment**
- ✅ **Consistency**: Same environment across development and production
- ✅ **Scalability**: Easy to scale individual services
- ✅ **Isolation**: Services run independently
- ✅ **Portability**: Deploy anywhere Docker runs
- ✅ **Versioning**: Easy rollback and updates

### **Next Steps**
1. **Review the guide** and identify any questions
2. **Prepare your production environment**
3. **Create the necessary Docker files**
4. **Test locally** before production deployment
5. **Execute the deployment** step by step

### **Remember**
- **Always backup** before making changes
- **Test thoroughly** in staging environment
- **Monitor closely** after deployment
- **Have a rollback plan** ready

---

**Ready to proceed with Docker deployment? Let me know when you want to start implementing these changes!** 🚀

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd")
**Version**: 1.0.0
**Author**: Development Team
**Status**: Ready for Implementation ✅
