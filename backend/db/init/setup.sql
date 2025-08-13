-- Database setup script for Wikramasooriya Enterprises
-- This script creates the database, user, and sets up proper permissions

-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE wik_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'wik_db')\gexec

-- Create the user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'wikadmin') THEN
        CREATE USER wikadmin WITH PASSWORD 'SecretPass123';
    END IF;
END
$$;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE wik_db TO wikadmin;

-- Connect to the wik_db database
\c wik_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO wikadmin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wikadmin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wikadmin;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wikadmin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO wikadmin;

-- Make wikadmin the owner of the public schema
ALTER SCHEMA public OWNER TO wikadmin;
