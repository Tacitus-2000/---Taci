-- Migration: Add user_id to clients table
-- This links the authentication layer (users) to the business layer (clients)

-- Step 1: Add user_id column to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Step 3: Add unique constraint (one user = one client)
ALTER TABLE clients
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Step 4: Update existing client to link with test user
-- Find the test client user
DO $$
DECLARE
  test_user_id UUID;
  test_client_id UUID;
BEGIN
  -- Get the test user ID
  SELECT id INTO test_user_id
  FROM users
  WHERE email = 'client@example.com'
  LIMIT 1;

  -- Get the existing client ID (if any)
  SELECT id INTO test_client_id
  FROM clients
  LIMIT 1;

  -- If both exist, link them
  IF test_user_id IS NOT NULL AND test_client_id IS NOT NULL THEN
    UPDATE clients
    SET user_id = test_user_id
    WHERE id = test_client_id;

    RAISE NOTICE 'Linked user % to client %', test_user_id, test_client_id;
  ELSE
    RAISE NOTICE 'User or client not found. User: %, Client: %', test_user_id, test_client_id;
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN clients.user_id IS 'Reference to the user account (authentication layer)';
