-- إنشاء جدول محتوى صفحة الهيكل التنظيمي
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_org_structure_content_table.sql

SET client_encoding TO 'UTF8';

-- جدول محتوى صفحة الهيكل التنظيمي
CREATE TABLE IF NOT EXISTS org_structure_content (
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
INSERT INTO org_structure_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'الهيكل التنظيمي', 'نظام إداري متكامل لتحقيق أهدافنا', NULL, 1),
  ('intro_text', NULL, NULL, 'يتميز الهيكل التنظيمي للجمعية بالوضوح والشفافية، حيث يتكون من عدة مستويات إدارية تعمل بشكل متكامل لتحقيق أهداف الجمعية وخدمة المجتمع.', 2)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_org_structure_content_key ON org_structure_content(section_key);
CREATE INDEX IF NOT EXISTS idx_org_structure_content_active ON org_structure_content(is_active);

SELECT '✅ تم إنشاء جدول محتوى صفحة الهيكل التنظيمي بنجاح!' AS message;
