-- إنشاء جداول صفحة المكاتب والفروع
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_offices_branches_tables.sql

SET client_encoding TO 'UTF8';

-- جدول المكاتب والفروع
CREATE TABLE IF NOT EXISTS offices_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(500) NOT NULL,
  city VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  map_embed_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول محتوى صفحة المكاتب والفروع
CREATE TABLE IF NOT EXISTS offices_branches_page_content (
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
INSERT INTO offices_branches_page_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'المكاتب والفروع', 'نخدم مجتمعنا عبر شبكة من المكاتب والفروع', NULL, 1),
  ('hero_subtitle', NULL, NULL, 'تواصلوا معنا في أقرب فرع لكم', 2),
  ('intro_text', NULL, NULL, 'تعرف على مواقعنا ووسائل التواصل', 3)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إدراج فرع افتراضي
INSERT INTO offices_branches (name, city, address, phone, email, map_embed_url, order_index)
VALUES
  (
    'فرع المدينة المنورة',
    'المدينة المنورة',
    'حي قربان، المدينة المنورة، المملكة العربية السعودية',
    '+966 14 123 4567',
    'madinah@charity-association.org',
    'https://www.google.com/maps?q=Al+Masjid+an-Nabawi,+Madinah&output=embed',
    1
  )
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_offices_branches_city ON offices_branches(city);
CREATE INDEX IF NOT EXISTS idx_offices_branches_active ON offices_branches(is_active);
CREATE INDEX IF NOT EXISTS idx_offices_branches_order ON offices_branches(order_index);
CREATE INDEX IF NOT EXISTS idx_offices_branches_page_content_key ON offices_branches_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_offices_branches_page_content_active ON offices_branches_page_content(is_active);

SELECT '✅ تم إنشاء جداول صفحة المكاتب والفروع بنجاح!' AS message;
