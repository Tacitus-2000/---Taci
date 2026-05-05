#!/bin/bash

echo "=== Testing Profile API (V2) ==="
echo ""

# 从登录响应中提取 client_id
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"client123"}' \
  -c cookies.txt)

echo "Step 1: Login Response"
echo "======================"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# 从登录响应中提取 user.id (这就是 client_id)
CLIENT_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')

echo "✅ Extracted client_id: $CLIENT_ID"
echo ""

echo "Step 2: Testing Profile API"
echo "============================"

PROFILE_RESPONSE=$(curl -s "http://localhost:3000/api/client/profile?client_id=$CLIENT_ID" \
  -b cookies.txt)

echo "Profile API Response:"
echo "$PROFILE_RESPONSE" | jq '.'
echo ""

# 检查是否是 404
if echo "$PROFILE_RESPONSE" | grep -q "PROFILE_NOT_FOUND"; then
  echo "❌ Profile not found - checking database..."
  echo ""
  
  # 检查数据库
  source .env.local 2>/dev/null
  
  if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Step 3: Checking database"
    echo "========================="
    
    # 检查 clients 表
    echo "Checking clients table:"
    CLIENTS=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clients?select=id,name&id=eq.$CLIENT_ID" \
      -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")
    echo "$CLIENTS" | jq '.'
    echo ""
    
    # 检查 client_profiles 表
    echo "Checking client_profiles table:"
    PROFILES=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/client_profiles?select=*&client_id=eq.$CLIENT_ID" \
      -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")
    echo "$PROFILES" | jq '.'
    echo ""
    
    if [ "$PROFILES" = "[]" ]; then
      echo "❌ ROOT CAUSE FOUND: No client_profiles record for client_id: $CLIENT_ID"
      echo ""
      echo "The client exists in 'clients' table but has no profile in 'client_profiles' table."
      echo ""
      echo "SOLUTION: Create a client profile via Admin panel"
    else
      echo "✅ Profile exists in database"
      echo ""
      echo "Checking visible_to_client flag:"
      VISIBLE=$(echo "$PROFILES" | jq -r '.[0].visible_to_client')
      echo "visible_to_client = $VISIBLE"
      
      if [ "$VISIBLE" = "false" ]; then
        echo ""
        echo "❌ ROOT CAUSE FOUND: Profile exists but visible_to_client = false"
        echo ""
        echo "SOLUTION: Update the profile to set visible_to_client = true"
      fi
    fi
  fi
fi

rm -f cookies.txt

