-- Initial DB setup for Banking Workflow System
-- This runs once when PostgreSQL container is first created

-- Ensure UTF-8 encoding
SET client_encoding = 'UTF8';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- Grant privileges (user already created via env vars)
GRANT ALL PRIVILEGES ON DATABASE banking_workflow TO banking_user;

-- Performance settings hints (apply via postgresql.conf in production)
-- shared_buffers = 256MB
-- work_mem = 16MB
-- maintenance_work_mem = 128MB
-- effective_cache_size = 1GB
