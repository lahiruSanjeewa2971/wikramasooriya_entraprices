-- Initialize semantic search database with pgvector
-- This script runs when the Docker container starts for the first time

-- Connect to wik_db database
\c wik_db;

-- Create the vector extension (pgvector is pre-installed in the Docker image)
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify pgvector installation
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- Create product_embeddings table with proper VECTOR columns
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

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_product_embeddings_combined_hnsw 
ON product_embeddings USING hnsw (combined_embedding vector_cosine_ops);

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

-- Test vector operations
SELECT 'Testing vector operations...' as status;
SELECT '[1,2,3]'::vector as test_vector;
SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector as cosine_distance;

-- Final verification
SELECT 'Semantic search database initialized successfully!' as status;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as embeddings_created FROM product_embeddings;
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
