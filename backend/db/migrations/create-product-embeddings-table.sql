-- Migration: Create product_embeddings table for semantic search
-- This migration creates the table structure for storing vector embeddings
-- Generated: 2025-09-26
-- Description: Semantic search infrastructure setup

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create product_embeddings table
CREATE TABLE IF NOT EXISTS product_embeddings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    title_embedding VECTOR(384),  -- all-MiniLM-L6-v2 produces 384-dimensional vectors
    description_embedding VECTOR(384),
    combined_embedding VECTOR(384),  -- Combined title + description
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint (will be added after table creation)
    -- CONSTRAINT fk_product_embeddings_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Ensure one embedding record per product
    UNIQUE(product_id)
);

-- Create indexes for fast similarity search using HNSW algorithm
-- Combined embedding index (most commonly used)
CREATE INDEX IF NOT EXISTS idx_product_embeddings_combined_hnsw 
ON product_embeddings USING hnsw (combined_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Title embedding index
CREATE INDEX IF NOT EXISTS idx_product_embeddings_title_hnsw 
ON product_embeddings USING hnsw (title_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Description embedding index
CREATE INDEX IF NOT EXISTS idx_product_embeddings_description_hnsw 
ON product_embeddings USING hnsw (description_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Regular B-tree indexes for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_product_embeddings_product_id 
ON product_embeddings (product_id);

CREATE INDEX IF NOT EXISTS idx_product_embeddings_created_at 
ON product_embeddings (created_at);

CREATE INDEX IF NOT EXISTS idx_product_embeddings_updated_at 
ON product_embeddings (updated_at);

-- Add foreign key constraint (commented out until products table is confirmed)
-- This will be uncommented after verifying the products table exists
-- ALTER TABLE product_embeddings 
-- ADD CONSTRAINT fk_product_embeddings_product_id 
-- FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_product_embeddings_updated_at ON product_embeddings;
CREATE TRIGGER trigger_update_product_embeddings_updated_at
    BEFORE UPDATE ON product_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_product_embeddings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE product_embeddings IS 'Stores vector embeddings for semantic search functionality';
COMMENT ON COLUMN product_embeddings.product_id IS 'Foreign key reference to products table';
COMMENT ON COLUMN product_embeddings.title_embedding IS '384-dimensional vector embedding of product title';
COMMENT ON COLUMN product_embeddings.description_embedding IS '384-dimensional vector embedding of product description';
COMMENT ON COLUMN product_embeddings.combined_embedding IS '384-dimensional vector embedding of combined title + description';
COMMENT ON COLUMN product_embeddings.created_at IS 'Timestamp when embedding was created';
COMMENT ON COLUMN product_embeddings.updated_at IS 'Timestamp when embedding was last updated';

-- Verify table creation
SELECT 
    'product_embeddings table created successfully' as status,
    COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_name = 'product_embeddings' AND table_schema = 'public';

-- Verify pgvector extension
SELECT 
    'pgvector extension status' as status,
    extname as extension_name,
    extversion as version
FROM pg_extension 
WHERE extname = 'vector';