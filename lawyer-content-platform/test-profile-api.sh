#!/bin/bash

echo "=== Testing Profile API ==="
echo ""

# 从 .env.local 读取环境变量
source .env.local 2>/dev/null || true

# 获取 client_id (从登录的 JWT token 中)
# 这里我们需要先测试登录，获取 token，然后解析 client_id

echo "Step 1: Testing Client Login API"
echo "=================================="

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"client123"}' \
  -c cookies.txt)

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# 检查是否有 cookie
if [ -f cookies.txt ]; then
  echo "Cookies saved:"
  cat cookies.txt
  echo ""
fi

echo "Step 2: Testing /api/client/auth/me"
echo "===================================="

ME_RESPONSE=$(curl -s http://localhost:3000/api/client/auth/me \
  -b cookies.txt)

echo "Auth Me Response:"
echo "$ME_RESPONSE" | jq '.' 2>/dev/null || echo "$ME_RESPONSE"
echo ""

# 提取 client_id
CLIENT_ID=$(echo "$ME_RESPONSE" | jq -r '.data.userId' 2>/dev/null)

if [ "$CLIENT_ID" = "null" ] || [ -z "$CLIENT_ID" ]; then
  echo "❌ Failed to get client_id from auth/me"
  echo "Cannot proceed with profile test"
  rm -f cookies.txt
  exit 1
fi

echo "✅ Got client_id: $CLIENT_ID"
echo ""

echo "Step 3: Testing Profile API"
echo "============================"

PROFILE_RESPONSE=$(curl -s "http://localhost:3000/api/client/profile?client_id=$CLIENT_ID" \
  -b cookies.txt)

echo "Profile Response:"
echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
echo ""

# 检查响应
if echo "$PROFILE_RESPONSE" | grep -q "PROFILE_NOT_FOUND"; then
  echo "❌ Profile not found in database"
  echo ""
  echo "Step 4: Checking database for client_profiles"
  echo "=============================================="
  
  # 使用 Supabase API 检查
  if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    DB_CHECK=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/client_profiles?select=*&client_id=eq.$CLIENT_ID" \
      -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")
    
    echo "Database query result:"
    echo "$DB_CHECK" | jq '.' 2>/dev/null || echo "$DB_CHECK"
    echo ""
    
    if [ "$DB_CHECK" = "[]" ]; then
      echo "❌ No client_profiles found for client_id: $CLIENT_ID"
      echo ""
      echo "ROOT CAUSE: Database has no client_profiles data"
      echo ""
      echo "SOLUTION: Create a client profile in Admin panel:"
      echo "1. Visit http://localhost:3000/admin/login"
      echo "2. Login with admin@example.com / admin123"
      echo "3. Go to 'Client Profiles' page"
      echo "4. Click 'Create Profile'"
      echo "5. Select client and fill in details"
    fi
  fi
else
  echo "✅ Profile API working correctly"
fi

# 清理
rm -f cookies.txt

