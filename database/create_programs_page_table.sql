-- إنشاء جداول محتوى صفحة "البرامج والمشاريع"
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_programs_page_table.sql

SET client_encoding TO 'UTF8';

-- جدول محتوى صفحة البرامج والمشاريع
CREATE TABLE IF NOT EXISTS programs_page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500),
  subtitle VARCHAR(500),
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول تصنيفات البرامج (الفئات)
CREATE TABLE IF NOT EXISTS programs_page_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_key VARCHAR(100) UNIQUE NOT NULL,
  label VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج المحتوى الافتراضي
INSERT INTO programs_page_content (section_key, title, subtitle, description, order_index) 
VALUES 
  ('hero', 'البرامج والمشاريع', 'نقدم مجموعة متنوعة من البرامج التي تلبي احتياجات المجتمع', NULL, 1)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إدراج التصنيفات الافتراضية
INSERT INTO programs_page_categories (category_key, label, order_index) 
VALUES 
  ('all', 'جميع البرامج', 0),
  ('social', 'الرعاية الاجتماعية', 1),
  ('health', 'الرعاية الصحية', 2),
  ('education', 'التعليم', 3),
  ('employment', 'التوظيف والتأهيل', 4)
ON CONFLICT (category_key) DO UPDATE SET
  label = EXCLUDED.label,
  order_index = EXCLUDED.order_index;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_programs_page_content_key ON programs_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_programs_page_content_active ON programs_page_content(is_active);
CREATE INDEX IF NOT EXISTS idx_programs_page_categories_key ON programs_page_categories(category_key);
CREATE INDEX IF NOT EXISTS idx_programs_page_categories_active ON programs_page_categories(is_active);

SELECT '✅ تم إنشاء جداول محتوى صفحة "البرامج والمشاريع" بنجاح!' AS message;
