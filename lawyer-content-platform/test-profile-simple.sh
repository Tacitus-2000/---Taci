#!/bin/bash

echo "=== Testing Profile API ==="
echo ""

# Step 1: Login
echo "Step 1: Login"
echo "============="
curl -s -X POST http://localhost:3000/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"client123"}' \
  -c cookies.txt

echo ""
echo ""

# Step 2: Get client_id from auth/me
echo "Step 2: Get Auth Info"
echo "====================="
AUTH_RESPONSE=$(curl -s http://localhost:3000/api/client/auth/me -b cookies.txt)
echo "$AUTH_RESPONSE"
echo ""

# Extract client_id manually
CLIENT_ID=$(echo "$AUTH_RESPONSE" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
echo "Extracted client_id: $CLIENT_ID"
echo ""

# Step 3: Test Profile API
echo "Step 3: Test Profile API"
echo "========================"
PROFILE_URL="http://localhost:3000/api/client/profile?client_id=$CLIENT_ID"
echo "URL: $PROFILE_URL"
echo ""
curl -s "$PROFILE_URL" -b cookies.txt
echo ""
echo ""

# Step 4: Check database directly
echo "Step 4: Check Database"
echo "======================"
source .env.local 2>/dev/null

if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Checking client_profiles table for client_id: $CLIENT_ID"
  echo ""
  curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/client_profiles?select=*&client_id=eq.$CLIENT_ID" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
  echo ""
  echo ""
  
  echo "Checking all client_profiles (limit 5):"
  echo ""
  curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/client_profiles?select=id,client_id,client_name,visible_to_client&limit=5" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
  echo ""
fi

rm -f cookies.txt

