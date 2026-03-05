-- إصلاح مشكلة الترميز العربي
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/fix_encoding.sql

-- تعيين الترميز للعميل
SET client_encoding TO 'UTF8';

-- التحقق من الترميز
SHOW client_encoding;
SHOW server_encoding;

-- تحديث الترميز للجداول الموجودة (إذا لزم الأمر)
-- ALTER DATABASE association_db SET client_encoding = 'UTF8';

SELECT '✅ تم تعيين الترميز إلى UTF-8!' AS message;
