-- حل شامل لمشكلة الترميز العربي
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/fix_encoding_complete.sql

-- 1. تعيين الترميز للعميل والخدمة
SET client_encoding TO 'UTF8';

-- 2. التحقق من الترميز الحالي
SELECT 
    name, 
    setting 
FROM pg_settings 
WHERE name IN ('client_encoding', 'server_encoding');

-- 3. تحديث قاعدة البيانات لاستخدام UTF-8
ALTER DATABASE association_db SET client_encoding = 'UTF8';

-- 4. تحديث الترميز لجميع الجداول
-- ملاحظة: إذا كانت البيانات مخزنة بترميز خاطئ، قد تحتاج لإعادة إدخالها

-- 5. التحقق من الترميز بعد التحديث
SHOW client_encoding;
SHOW server_encoding;

SELECT '✅ تم تعيين الترميز إلى UTF-8 بشكل نهائي!' AS message;
