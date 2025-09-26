-- Create product_embeddings table structure (without pgvector for now)
-- This will be updated once pgvector is installed

-- Connect to the wik_db database
\c wik_db;

-- Create product_embeddings table with placeholder columns
-- These will be changed to VECTOR(384) once pgvector is installed
CREATE TABLE IF NOT EXISTS product_embeddings (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title_embedding TEXT,  -- Will be changed to VECTOR(384) after pgvector installation
    description_embedding TEXT,  -- Will be changed to VECTOR(384) after pgvector installation
    combined_embedding TEXT,  -- Will be changed to VECTOR(384) after pgvector installation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_embeddings_product_id ON product_embeddings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_embeddings_created_at ON product_embeddings(created_at);

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
