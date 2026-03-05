-- إضافة عمود ملف مرفق لجدول المشاريع والبرامج
-- تشغيل: psql -U postgres -d association_db -f database/add_project_file_url.sql

ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_url VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

SELECT 'تم إضافة أعمدة file_url و file_name لجدول projects بنجاح' AS message;
