-- إنشاء جداول محتوى صفحة فريق العمل
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_team_page_table.sql

SET client_encoding TO 'UTF8';

-- جدول محتوى صفحة فريق العمل
CREATE TABLE IF NOT EXISTS team_page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500),
  subtitle VARCHAR(500),
  description TEXT,
  content TEXT,
  image_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول صور Hero slider
CREATE TABLE IF NOT EXISTS team_page_hero_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url VARCHAR(500) NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول معلومات المدير التنفيذي
CREATE TABLE IF NOT EXISTS team_page_executive_director (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  image_url VARCHAR(500),
  period_from VARCHAR(100),
  period_to VARCHAR(100),
  qualification TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج المحتوى الافتراضي
INSERT INTO team_page_content (section_key, title, subtitle, description, order_index) 
VALUES 
  ('board_title', 'أعضاء مجلس الإدارة', NULL, NULL, 1),
  ('staff_title', 'موظفو الجمعية', NULL, NULL, 2)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إدراج صور Hero افتراضية
INSERT INTO team_page_hero_images (image_url, order_index) 
VALUES 
  ('https://images.pexels.com/photos/3184644/pexels-photo-3184644.jpeg', 1),
  ('https://images.pexels.com/photos/3810753/pexels-photo-3810753.jpeg', 2),
  ('https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg', 3)
ON CONFLICT DO NOTHING;

-- إدراج معلومات المدير التنفيذي الافتراضية
INSERT INTO team_page_executive_director (name, title, email, phone, image_url, period_from, period_to, qualification, description) 
VALUES 
  ('الأستاذ باسم بن غيث نويفع الجهني', 'المدير التنفيذي', 'bas.em.3@hotmail.com', '059506264', 
   'https://images.pexels.com/photos/3986626/pexels-photo-3986626.jpeg',
   '13 / 07 / 1440هـ', '05 / 08 / 1444هـ',
   'بكالوريوس علم نفس – كلية الآداب والعلوم الإنسانية – جامعة الملك عبدالعزيز بجدة',
   'يعين المدير التنفيذي بقرار يصدر من مجلس إدارة جمعية الطب المنزلي بمنطقة المدينة المنورة "رعايتي". يتضمن كامل بيانات المدير ويوضح صلاحياته ومسؤولياته وحقوقه والتزاماته وراتبه على ضوء النظام واللائحة التنفيذية واللائحة الأساسية. يجب على المدير التنفيذي إدارة الجمعية وإنهاء الأعمال اليومية بها ومتابعة إداراتها وأقسامها كافة، وإعداد الخطط اللازمة لتحقيق أهدافها كافة، والعمل على تنظيمها وتطويرها.')
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_team_page_content_key ON team_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_team_page_content_active ON team_page_content(is_active);
CREATE INDEX IF NOT EXISTS idx_team_page_hero_images_active ON team_page_hero_images(is_active);
CREATE INDEX IF NOT EXISTS idx_team_page_executive_director_active ON team_page_executive_director(is_active);

SELECT '✅ تم إنشاء جداول محتوى صفحة فريق العمل بنجاح!' AS message;
