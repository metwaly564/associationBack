-- إنشاء جدول محتوى صفحة التقارير
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_reports_page_table.sql

SET client_encoding TO 'UTF8';

-- جدول محتوى صفحة التقارير
CREATE TABLE IF NOT EXISTS reports_page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500),
  subtitle VARCHAR(500),
  description TEXT,
  content TEXT,
  image_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج المحتوى الافتراضي
INSERT INTO reports_page_content (section_key, title, subtitle, description, order_index) 
VALUES 
  ('hero_title', 'التقارير', 'نقدم لكم تقاريرنا الدورية والسنوية', 'نقدم لكم تقاريرنا الدورية والسنوية التي توثق إنجازاتنا وبرامجنا ومشاريعنا', 1)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_reports_page_content_key ON reports_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_reports_page_content_active ON reports_page_content(is_active);

SELECT '✅ تم إنشاء جدول محتوى صفحة التقارير بنجاح!' AS message;
