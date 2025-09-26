-- Semantic Search Database Setup
-- Install pgvector extension and create product_embeddings table
-- Following SEMANTIC_SEARCH_IMPLEMENTATION_PLAN.md Phase 1

-- Connect to the wik_db database
\c wik_db;

-- Note: pgvector extension needs to be installed on the PostgreSQL server first
-- For Windows PostgreSQL 17, you need to:
-- 1. Download pgvector from: https://github.com/pgvector/pgvector/releases
-- 2. Extract the files to PostgreSQL installation directory
-- 3. Or use package manager like Chocolatey: choco install pgvector

-- Try to create the vector extension (will fail if not installed)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Create product_embeddings table as specified in the plan
CREATE TABLE IF NOT EXISTS product_embeddings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title_embedding VECTOR(384),  -- all-MiniLM-L6-v2 produces 384-dimensional vectors
    description_embedding VECTOR(384),
    combined_embedding VECTOR(384),  -- Combined title + description
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_embeddings_product_id ON product_embeddings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_embeddings_created_at ON product_embeddings(created_at);

-- Create HNSW index for fast similarity search (requires pgvector extension)
-- CREATE INDEX IF NOT EXISTS idx_product_embeddings_combined_hnsw 
-- ON product_embeddings USING hnsw (combined_embedding vector_cosine_ops);

-- Create trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_embeddings_updated_at
    BEFORE UPDATE ON product_embeddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (will be replaced with real embeddings later)
INSERT INTO product_embeddings (product_id, title_embedding, description_embedding, combined_embedding) VALUES
(1, NULL, NULL, NULL),
(2, NULL, NULL, NULL),
(3, NULL, NULL, NULL),
(4, NULL, NULL, NULL),
(5, NULL, NULL, NULL)
ON CONFLICT (product_id) DO NOTHING;

-- Verify table creation
SELECT 'Product embeddings table created successfully!' as status;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as embeddings_created FROM product_embeddings;

-- Show table structure
\d product_embeddings;
