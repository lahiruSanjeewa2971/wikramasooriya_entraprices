# pgvector Installation Guide for Windows PostgreSQL 17

## 🎯 Overview
This guide explains how to install the pgvector extension for PostgreSQL 17 on Windows to enable semantic search functionality.

## 📋 Prerequisites
- PostgreSQL 17 installed on Windows
- Administrator privileges
- Internet connection for downloading

## 🚀 Installation Methods

### Method 1: Using Chocolatey (Recommended)
```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install pgvector
choco install pgvector
```

### Method 2: Manual Installation
1. **Download pgvector**:
   - Go to: https://github.com/pgvector/pgvector/releases
   - Download the latest Windows binary for PostgreSQL 17

2. **Extract and Install**:
   ```powershell
   # Extract to PostgreSQL installation directory
   # Usually: C:\Program Files\PostgreSQL\17\
   ```

3. **Restart PostgreSQL Service**:
   ```powershell
   Restart-Service postgresql-x64-17
   ```

### Method 3: Build from Source
```powershell
# Install Visual Studio Build Tools
# Install PostgreSQL development headers
# Clone and build pgvector
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install
```

## ✅ Verification
After installation, verify pgvector is available:

```sql
-- Connect to PostgreSQL
psql -U postgres -d wik_db

-- Check available extensions
SELECT * FROM pg_available_extensions WHERE name = 'vector';

-- Create the extension
CREATE EXTENSION vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

## 🔄 Update Database Schema
Once pgvector is installed, update the product_embeddings table:

```sql
-- Connect to wik_db
\c wik_db;

-- Create the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Update table columns to use VECTOR type
ALTER TABLE product_embeddings 
ALTER COLUMN title_embedding TYPE VECTOR(384);

ALTER TABLE product_embeddings 
ALTER COLUMN description_embedding TYPE VECTOR(384);

ALTER TABLE product_embeddings 
ALTER COLUMN combined_embedding TYPE VECTOR(384);

-- Create HNSW index for fast similarity search
CREATE INDEX idx_product_embeddings_combined_hnsw 
ON product_embeddings USING hnsw (combined_embedding vector_cosine_ops);

-- Verify the changes
\d product_embeddings;
```

## 🧪 Test Vector Operations
```sql
-- Test vector operations
SELECT '[1,2,3]'::vector;
SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector as distance;
```

## 📝 Next Steps
After successful pgvector installation:

1. **Update Database Schema**: Run the schema update script
2. **Install SentenceTransformers**: Add to backend dependencies
3. **Generate Embeddings**: Create embeddings for existing products
4. **Implement Search**: Build semantic search functionality

## 🆘 Troubleshooting

### Common Issues:
- **Extension not found**: Ensure pgvector is properly installed
- **Permission denied**: Run as administrator
- **Service won't start**: Check PostgreSQL logs
- **Vector operations fail**: Verify extension is created

### Logs Location:
- PostgreSQL logs: `C:\Program Files\PostgreSQL\17\data\log\`

## 📚 Resources
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [PostgreSQL Extensions](https://www.postgresql.org/docs/current/extend-extensions.html)
- [Vector Similarity Search](https://github.com/pgvector/pgvector#vector-similarity-search)
