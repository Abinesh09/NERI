-- init.sql
-- The database 'neri' is automatically created by the POSTGRES_DB environment variable in docker-compose.
-- This file is executed after the database is created.
-- GORM auto-migration will handle table creation in the Go application, so this can remain mostly empty or be used for extensions.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
