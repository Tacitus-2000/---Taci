#!/bin/bash

source .env.local 2>/dev/null

CLIENT_ID="e1b6ca76-82cf-4001-bd5f-ba9434d6eade"

echo "=== Checking User-Client Mapping ==="
echo ""

echo "Step 1: Check users table"
echo "========================="
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=*&id=eq.$CLIENT_ID" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo ""

echo "Step 2: Check clients table"
echo "============================"
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clients?select=*&id=eq.$CLIENT_ID" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo ""

echo "Step 3: Check all clients"
echo "========================="
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clients?select=id,name&limit=10" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo ""

echo "Step 4: Check client_profiles"
echo "=============================="
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/client_profiles?select=id,client_id,client_name&limit=10" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
echo ""

