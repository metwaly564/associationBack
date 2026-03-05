-- إنشاء جدول التقارير العام
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_reports_table.sql

SET client_encoding TO 'UTF8';

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  year INTEGER,
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إضافة فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_reports_year ON reports(year);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);

SELECT '✅ تم إنشاء جدول التقارير بنجاح!' AS message;