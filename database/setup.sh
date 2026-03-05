#!/bin/bash

# Script لإعداد قاعدة البيانات بالكامل
# استخدم: bash database/setup.sh

echo "🚀 بدء إعداد قاعدة البيانات..."

# ألوان للرسائل
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# التحقق من وجود PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL غير مثبت. يرجى تثبيته أولاً.${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 يرجى إدخال معلومات قاعدة البيانات:${NC}"
read -p "اسم المستخدم (postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "كلمة المرور: " DB_PASSWORD
echo ""

read -p "اسم قاعدة البيانات (association_db): " DB_NAME
DB_NAME=${DB_NAME:-association_db}

read -p "المنفذ (5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "العنوان (localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

# إنشاء قاعدة البيانات
echo -e "${YELLOW}📦 إنشاء قاعدة البيانات...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "قاعدة البيانات موجودة بالفعل"

# تشغيل ملف Schema
echo -e "${YELLOW}📋 إنشاء الجداول...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم إنشاء قاعدة البيانات والجداول بنجاح!${NC}"
    
    # إنشاء ملف .env.local
    echo -e "${YELLOW}📝 إنشاء ملف .env.local...${NC}"
    cat > .env.local << EOF
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_SSL=false
JWT_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_API_BASE=/api
EOF
    
    echo -e "${GREEN}✅ تم إنشاء ملف .env.local${NC}"
    echo -e "${YELLOW}⚠️  الآن قم بتشغيل: npm run create-admin${NC}"
else
    echo -e "${RED}❌ حدث خطأ أثناء إنشاء قاعدة البيانات${NC}"
    exit 1
fi
