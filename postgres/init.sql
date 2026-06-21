-- Init script for NERI database
-- We will use GORM's AutoMigrate feature in the backend to create tables, 
-- but we can put any manual SQL setup here if necessary.

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
