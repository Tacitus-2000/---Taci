#!/bin/bash

source .env.local 2>/dev/null

echo "=========================================="
echo "认证来源核查报告"
echo "=========================================="
echo ""

echo "一、检查 auth.users 表"
echo "======================"
AUTH_USERS=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" 2>&1)

if echo "$AUTH_USERS" | grep -q "users"; then
  echo "✅ auth.users 表存在"
  echo "$AUTH_USERS" | grep -o '"email":"[^"]*"' | head -5
else
  echo "❌ auth.users 表不存在或无数据"
  echo "响应: $AUTH_USERS"
fi
echo ""

echo "二、检查 public.users 表"
echo "======================="
PUBLIC_USERS=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=id,email,role&limit=5" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

if [ "$PUBLIC_USERS" != "[]" ]; then
  echo "✅ public.users 表存在且有数据"
  echo "$PUBLIC_USERS"
else
  echo "❌ public.users 表无数据"
fi
echo ""

echo "三、检查 client@example.com 在两个表中的情况"
echo "==========================================="

# 检查 public.users
PUBLIC_CLIENT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?select=id,email,role&email=eq.client@example.com" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

echo "public.users 中的 client@example.com:"
echo "$PUBLIC_CLIENT"
PUBLIC_CLIENT_ID=$(echo "$PUBLIC_CLIENT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "ID: $PUBLIC_CLIENT_ID"
echo ""

# 检查 auth.users
AUTH_CLIENT=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | grep -A 5 "client@example.com")

echo "auth.users 中的 client@example.com:"
if [ -n "$AUTH_CLIENT" ]; then
  echo "$AUTH_CLIENT"
else
  echo "❌ 未找到"
fi
echo ""

echo "四、检查 clients 表结构"
echo "======================"
CLIENTS_SCHEMA=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clients?select=*&limit=0" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -I 2>&1 | grep -i "content-profile")

echo "clients 表当前列（通过查询第一条记录）:"
CLIENTS_SAMPLE=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/clients?select=*&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")
echo "$CLIENTS_SAMPLE"
echo ""

# 检查是否有 user_id 列
if echo "$CLIENTS_SAMPLE" | grep -q "user_id"; then
  echo "✅ clients 表已有 user_id 列"
else
  echo "❌ clients 表没有 user_id 列"
fi
echo ""

echo "五、结论"
echo "========"
echo "1. 登录系统使用: public.users (自定义认证)"
echo "2. 登录方式: 查询 public.users 表 + bcrypt 密码验证 + 自定义 JWT"
echo "3. 不使用 Supabase Auth (auth.users)"
echo "4. clients.user_id 应该引用: public.users(id)"
echo ""

