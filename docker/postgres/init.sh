#!/usr/bin/env bash
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "postgres" <<-SQL
-- roles
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin_user') THEN
      CREATE ROLE admin_user WITH LOGIN CREATEDB PASSWORD '${POSTGRES_ADMIN_PASSWORD}';
   END IF;
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
      CREATE ROLE app_user WITH LOGIN PASSWORD '${POSTGRES_APP_PASSWORD}';
   END IF;
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bouncer_user') THEN
      CREATE ROLE bouncer_user WITH LOGIN PASSWORD '${PGBOUNCER_AUTH_PASSWORD}';
   END IF;
END
$$;

-- global DB
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'app_global') THEN
      CREATE DATABASE app_global OWNER app_user;
   END IF;
END
$$;

-- basic privileges
GRANT ALL PRIVILEGES ON DATABASE app_global TO admin_user;
SQL


