-- إضافة حقل اسم الملف لجدول التراخيص
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/add_file_name_to_licenses.sql

SET client_encoding TO 'UTF8';

-- إضافة حقل file_name إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'licenses' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE licenses ADD COLUMN file_name VARCHAR(255);
  END IF;
END $$;

-- تحديث file_name من file_url إذا كان فارغاً
UPDATE licenses 
SET file_name = CASE 
  WHEN file_url IS NOT NULL THEN 
    SUBSTRING(file_url FROM '([^/]+)$')
  ELSE NULL
END
WHERE file_name IS NULL;

SELECT '✅ تم إضافة حقل اسم الملف لجدول التراخيص بنجاح!' AS message;
