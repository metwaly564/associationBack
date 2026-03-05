-- إنشاء جداول محتوى صفحة التواصل
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_contact_page_table.sql

SET client_encoding TO 'UTF8';

-- جدول محتوى صفحة التواصل
CREATE TABLE IF NOT EXISTS contact_page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500),
  subtitle VARCHAR(500),
  description TEXT,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول معلومات الاتصال
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  info_type VARCHAR(50) NOT NULL, -- 'phone', 'email', 'address', 'social'
  label VARCHAR(255),
  value VARCHAR(500) NOT NULL,
  icon_name VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول ساعات العمل
CREATE TABLE IF NOT EXISTS contact_working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_label VARCHAR(50) NOT NULL, -- 'السبت - الأربعاء', 'الخميس', 'الجمعة'
  time_range VARCHAR(100) NOT NULL, -- '8:00 ص - 4:00 م'
  is_closed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج المحتوى الافتراضي
INSERT INTO contact_page_content (section_key, title, subtitle, description, order_index) 
VALUES 
  ('hero_title', 'تواصل معنا', 'نحن هنا للإجابة على استفساراتك ومساعدتك', NULL, 1)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إدراج معلومات الاتصال الافتراضية
INSERT INTO contact_info (info_type, label, value, icon_name, order_index) 
VALUES 
  ('phone', 'اتصل بنا', '+966 11 234 5678', 'Phone', 1),
  ('phone', NULL, '+966 11 234 5679', NULL, 2),
  ('email', 'راسلنا', 'info@charity-association.org', 'Mail', 3),
  ('email', NULL, 'support@charity-association.org', NULL, 4),
  ('address', 'زُرنا', 'الرياض، حي الملك فهد', 'MapPin', 5),
  ('address', NULL, 'طريق الملك عبدالعزيز', NULL, 6),
  ('address', NULL, 'مبنى رقم 1234، الطابق الثاني', NULL, 7),
  ('social', 'Facebook', 'https://facebook.com', 'Facebook', 8),
  ('social', 'Twitter', 'https://twitter.com', 'Twitter', 9),
  ('social', 'Instagram', 'https://instagram.com', 'Instagram', 10),
  ('social', 'LinkedIn', 'https://linkedin.com', 'Linkedin', 11)
ON CONFLICT DO NOTHING;

-- إدراج ساعات العمل الافتراضية
INSERT INTO contact_working_hours (day_label, time_range, is_closed, order_index) 
VALUES 
  ('السبت - الأربعاء', '8:00 ص - 4:00 م', false, 1),
  ('الخميس', '8:00 ص - 2:00 م', false, 2),
  ('الجمعة والعطل', 'مغلق', true, 3)
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_contact_page_content_key ON contact_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_contact_page_content_active ON contact_page_content(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_info_type ON contact_info(info_type);
CREATE INDEX IF NOT EXISTS idx_contact_info_active ON contact_info(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_working_hours_order ON contact_working_hours(order_index);

SELECT '✅ تم إنشاء جداول محتوى صفحة التواصل بنجاح!' AS message;
