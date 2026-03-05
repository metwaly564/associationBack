-- إنشاء جداول صفحة التقارير السنوية
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_annual_reports_tables.sql

SET client_encoding TO 'UTF8';

-- جدول التقارير السنوية
CREATE TABLE IF NOT EXISTS annual_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  year INTEGER NOT NULL,
  file_url VARCHAR(500),
  file_name VARCHAR(500),
  cover_image_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول محتوى صفحة التقارير السنوية
CREATE TABLE IF NOT EXISTS annual_reports_page_content (
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
INSERT INTO annual_reports_page_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'التقارير السنوية', 'نستعرض إنجازاتنا وإسهاماتنا على مدار السنوات', NULL, 1),
  ('intro_text', NULL, NULL, 'نقدم لكم تقاريرنا السنوية التي توثق إنجازاتنا وبرامجنا ومشاريعنا على مدار السنوات الماضية.', 2)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_annual_reports_year ON annual_reports(year);
CREATE INDEX IF NOT EXISTS idx_annual_reports_active ON annual_reports(is_active);
CREATE INDEX IF NOT EXISTS idx_annual_reports_order ON annual_reports(order_index);
CREATE INDEX IF NOT EXISTS idx_annual_reports_page_content_key ON annual_reports_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_annual_reports_page_content_active ON annual_reports_page_content(is_active);

SELECT '✅ تم إنشاء جداول صفحة التقارير السنوية بنجاح!' AS message;
