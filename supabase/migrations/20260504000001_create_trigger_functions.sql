-- Create common trigger functions
-- This migration creates reusable trigger functions used across multiple tables

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create trigger function for updated_at column
-- This function automatically updates the updated_at timestamp on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates updated_at timestamp on row update';
