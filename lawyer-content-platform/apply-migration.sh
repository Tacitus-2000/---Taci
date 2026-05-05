#!/bin/bash

source .env.local 2>/dev/null

echo "=== Applying Migration: Add user_id to clients ==="
echo ""

# Read the migration SQL
MIGRATION_SQL=$(cat supabase/migrations/20260505000001_add_user_id_to_clients.sql)

# Execute via Supabase SQL API
echo "Step 1: Adding user_id column to clients table"
echo "==============================================="

# Note: Supabase doesn't have a direct SQL execution API via REST
# We need to use psql or the Supabase dashboard
# Let's use a workaround: execute SQL statements one by one

echo "Executing: ALTER TABLE clients ADD COLUMN user_id..."
curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE"}' 2>&1

echo ""
echo ""
echo "Note: Supabase REST API doesn't support DDL operations directly."
echo "We need to execute the migration manually via Supabase Dashboard or psql."
echo ""
echo "Alternative: Let's try to link the existing client to the user directly"
echo "========================================================================"

# Get user ID
USER_ID=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=id&email=eq.client@example.com" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

echo "User ID: $USER_ID"

# Get client ID
CLIENT_ID=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clients?select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

echo "Client ID: $CLIENT_ID"
echo ""

if [ -n "$USER_ID" ] && [ -n "$CLIENT_ID" ]; then
  echo "Attempting to update client with user_id..."
  curl -s -X PATCH "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clients?id=eq.$CLIENT_ID" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{\"user_id\":\"$USER_ID\"}"
  echo ""
fi

