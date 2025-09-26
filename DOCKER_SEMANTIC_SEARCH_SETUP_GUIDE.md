# 🐳 Docker Semantic Search Setup Guide
## Wikramasooriya Enterprises - pgvector with PostgreSQL 17

### 📋 Overview
This guide provides step-by-step instructions for setting up semantic search using Docker with pgvector extension, while keeping your local PostgreSQL installation intact.

---

## 🎯 Prerequisites

### **Required Software:**
- ✅ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- ✅ **Docker Compose** - Included with Docker Desktop
- ✅ **Existing Local PostgreSQL** - Will remain untouched on port 5432

### **System Requirements:**
- **RAM**: Minimum 4GB available for Docker
- **Disk Space**: ~2GB for PostgreSQL image and data
- **Ports**: 5433 (Docker PostgreSQL), 5432 (Local PostgreSQL - unchanged)

---

## 🚀 Step-by-Step Setup

### **Step 1: Start Docker Desktop**

```bash
# Start Docker Desktop (if not running)
# Option 1: Start from Start Menu
# Search for "Docker Desktop" and click to start

# Option 2: Start from command line
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for Docker Desktop to start (may take 1-2 minutes)
# Look for Docker whale icon in system tray

# Verify Docker is running
docker --version
docker-compose --version

# Expected output:
# Docker version 28.x.x
# Docker Compose version v2.x.x
```

### **Step 2: Start Docker PostgreSQL with pgvector**

```bash
# Navigate to backend directory
cd "D:\practice\react\wikramasooriya entraprices\wikramasooriya_entraprices\backend"

# Start the semantic search database
docker-compose -f docker-compose.semantic.yml up -d

# Check container status
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE                     COMMAND                  CREATED         STATUS         PORTS                    NAMES
abc123def456   pgvector/pgvector:pg17   "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:5433->5432/tcp   wikramasooriya-postgres-pgvector
```

### **Step 3: Verify pgvector Installation**

```bash
# Connect to Docker PostgreSQL
docker exec -it wikramasooriya-postgres-pgvector psql -U postgres -d wik_db

# Check pgvector extension
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

# Test vector operations
SELECT '[1,2,3]'::vector as test_vector;
SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector as cosine_distance;

# Exit psql
\q
```

**Expected Output:**
```
 extname | extversion 
---------+------------
 vector  | 0.5.1

 test_vector 
-------------
 [1,2,3]

 cosine_distance 
----------------
 1.4142135623730951
```

### **Step 4: Migrate Data from Local PostgreSQL**

```bash
# Export data from local PostgreSQL (port 5432)
pg_dump -h localhost -p 5432 -U postgres -d wik_db > ../local_db_backup.sql

# Import data to Docker PostgreSQL (port 5433)
docker exec -i wikramasooriya-postgres-pgvector psql -U postgres -d wik_db < ../local_db_backup.sql

# Verify data migration
docker exec -it wikramasooriya-postgres-pgvector psql -U postgres -d wik_db -c "SELECT COUNT(*) FROM products;"
```

### **Step 5: Update Backend Configuration**

**Update `.env` file:**
```bash
# Change database connection to Docker PostgreSQL
DB_HOST=localhost
DB_PORT=5433  # Changed from 5432
DB_NAME=wik_db
DB_USER=postgres
DB_PASSWORD=Abcd@1234
```

**Test backend connection:**
```bash
cd backend
npm run db:validate
```

---

## 🔧 Docker Management Commands

### **Starting Services**

```bash
# Start semantic search database
docker-compose -f docker-compose.semantic.yml up -d

# Start with logs visible
docker-compose -f docker-compose.semantic.yml up

# Start specific service
docker-compose -f docker-compose.semantic.yml up postgres-pgvector
```

### **Stopping Services**

```bash
# Stop all services
docker-compose -f docker-compose.semantic.yml down

# Stop and remove volumes (⚠️ DATA LOSS)
docker-compose -f docker-compose.semantic.yml down -v

# Stop specific service
docker-compose -f docker-compose.semantic.yml stop postgres-pgvector
```

### **Monitoring Services**

```bash
# View running containers
docker ps

# View logs
docker-compose -f docker-compose.semantic.yml logs

# View logs for specific service
docker-compose -f docker-compose.semantic.yml logs postgres-pgvector

# Follow logs in real-time
docker-compose -f docker-compose.semantic.yml logs -f postgres-pgvector
```

### **Database Access**

```bash
# Connect to Docker PostgreSQL
docker exec -it wikramasooriya-postgres-pgvector psql -U postgres -d wik_db

# Connect from local machine
psql -h localhost -p 5433 -U postgres -d wik_db

# Backup Docker database
docker exec wikramasooriya-postgres-pgvector pg_dump -U postgres wik_db > docker_backup.sql

# Restore to Docker database
docker exec -i wikramasooriya-postgres-pgvector psql -U postgres -d wik_db < docker_backup.sql
```

---

## 🗄️ Database Schema

### **Product Embeddings Table**

```sql
-- Table structure created automatically
CREATE TABLE product_embeddings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title_embedding VECTOR(384),      -- Title embeddings
    description_embedding VECTOR(384), -- Description embeddings
    combined_embedding VECTOR(384),   -- Combined embeddings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id)
);

-- Performance indexes
CREATE INDEX idx_product_embeddings_product_id ON product_embeddings(product_id);
CREATE INDEX idx_product_embeddings_created_at ON product_embeddings(created_at);

-- HNSW index for fast similarity search
CREATE INDEX idx_product_embeddings_combined_hnsw 
ON product_embeddings USING hnsw (combined_embedding vector_cosine_ops);
```

### **Vector Operations**

```sql
-- Test vector similarity
SELECT p.*, 1 - (pe.combined_embedding <=> $1) as similarity
FROM products p
JOIN product_embeddings pe ON p.id = pe.product_id
WHERE 1 - (pe.combined_embedding <=> $1) > 0.7
ORDER BY similarity DESC
LIMIT 20;
```

---

## 🔄 Switching Between Databases

### **Use Docker PostgreSQL (Semantic Search)**

```bash
# Backend .env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=wik_db
DB_USER=postgres
DB_PASSWORD=Abcd@1234

# Start Docker services
docker-compose -f docker-compose.semantic.yml up -d
```

### **Use Local PostgreSQL (Original Setup)**

```bash
# Backend .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wik_db
DB_USER=postgres
DB_PASSWORD=Abcd@1234

# Stop Docker services
docker-compose -f docker-compose.semantic.yml down
```

---

## 🧪 Testing Semantic Search

### **Test Vector Operations**

```sql
-- Connect to Docker PostgreSQL
docker exec -it wikramasooriya-postgres-pgvector psql -U postgres -d wik_db

-- Test vector creation
SELECT '[1,2,3,4,5]'::vector as test_vector;

-- Test cosine similarity
SELECT '[1,0,0]'::vector <=> '[0,1,0]'::vector as cosine_distance;

-- Test L2 distance
SELECT '[1,0,0]'::vector <-> '[0,1,0]'::vector as l2_distance;

-- Test inner product
SELECT '[1,0,0]'::vector <#> '[0,1,0]'::vector as inner_product;
```

### **Test Product Embeddings**

```sql
-- Check embeddings table
SELECT COUNT(*) FROM product_embeddings;

-- Check vector columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product_embeddings' 
AND column_name LIKE '%embedding%';

-- Test embedding insertion (placeholder)
UPDATE product_embeddings 
SET combined_embedding = '[0.1,0.2,0.3]'::vector 
WHERE product_id = 1;
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Port Conflict**
```bash
# Error: Port 5433 already in use
# Solution: Change port in docker-compose.semantic.yml
ports:
  - "5434:5432"  # Use different port
```

#### **2. Container Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.semantic.yml logs postgres-pgvector

# Check Docker resources
docker system df
docker system prune  # Clean up if needed
```

#### **3. Data Not Persisting**
```bash
# Check volume mount
docker volume ls
docker volume inspect wikramasooriya_entraprices_postgres_pgvector_data
```

#### **4. Connection Refused**
```bash
# Check container status
docker ps

# Check port binding
docker port wikramasooriya-postgres-pgvector

# Restart container
docker-compose -f docker-compose.semantic.yml restart postgres-pgvector
```

### **Reset Everything**

```bash
# Stop and remove everything
docker-compose -f docker-compose.semantic.yml down -v

# Remove images
docker rmi pgvector/pgvector:pg17

# Start fresh
docker-compose -f docker-compose.semantic.yml up -d
```

---

## 📊 Performance Monitoring

### **Container Resources**

```bash
# Monitor container resources
docker stats wikramasooriya-postgres-pgvector

# Check container health
docker inspect wikramasooriya-postgres-pgvector | grep Health -A 10
```

### **Database Performance**

```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM product_embeddings WHERE product_id = 1;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read 
FROM pg_stat_user_indexes 
WHERE tablename = 'product_embeddings';
```

---

## 🔒 Security Considerations

### **Network Security**

```yaml
# In docker-compose.semantic.yml
networks:
  semantic-search-network:
    driver: bridge
    internal: true  # Isolate from external networks
```

### **Data Backup**

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec wikramasooriya-postgres-pgvector pg_dump -U postgres wik_db > "backup_${DATE}.sql"
```

---

## 📝 Next Steps

### **Phase 1 Complete ✅**
- ✅ Docker PostgreSQL with pgvector running
- ✅ Database schema created
- ✅ Vector operations tested
- ✅ Data migrated from local PostgreSQL

### **Phase 2: Backend Implementation**
1. Install SentenceTransformers in backend
2. Create semantic search service
3. Implement embedding generation
4. Create search API endpoints

### **Phase 3: Frontend Integration**
1. Enhance search component
2. Add semantic search UI
3. Implement search suggestions
4. Add result ranking

---

## 🎉 Success Verification

### **Checklist**
- [ ] Docker container running on port 5433
- [ ] pgvector extension installed and working
- [ ] product_embeddings table created with VECTOR columns
- [ ] HNSW index created for fast similarity search
- [ ] Data migrated from local PostgreSQL
- [ ] Backend connecting to Docker PostgreSQL
- [ ] Vector operations working correctly

### **Test Commands**
```bash
# 1. Container status
docker ps | grep wikramasooriya-postgres-pgvector

# 2. pgvector extension
docker exec wikramasooriya-postgres-pgvector psql -U postgres -d wik_db -c "SELECT extname FROM pg_extension WHERE extname = 'vector';"

# 3. Vector operations
docker exec wikramasooriya-postgres-pgvector psql -U postgres -d wik_db -c "SELECT '[1,2,3]'::vector;"

# 4. Backend connection
cd backend && npm run db:validate
```

---

**Status**: 🚀 **Ready for Semantic Search Implementation**  
**Next**: Begin Phase 2 - Backend Development with SentenceTransformers
