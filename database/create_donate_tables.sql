-- إنشاء جداول صفحة التبرع
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_donate_tables.sql

SET client_encoding TO 'UTF8';

-- جدول طرق التبرع
CREATE TABLE IF NOT EXISTS donation_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank', 'electronic_wallet', 'online', 'other')),
  account_number VARCHAR(255),
  account_name VARCHAR(255),
  bank_name VARCHAR(255),
  iban VARCHAR(255),
  swift_code VARCHAR(50),
  qr_code_url VARCHAR(500),
  icon_name VARCHAR(100),
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول محتوى صفحة التبرع
CREATE TABLE IF NOT EXISTS donate_page_content (
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
INSERT INTO donate_page_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'التبرع', 'ساهم في صنع الفرق', NULL, 1),
  ('hero_subtitle', NULL, NULL, 'تبرعك يساهم في تغيير حياة المحتاجين وبناء مستقبل أفضل للمجتمع', 2),
  ('intro_text', NULL, NULL, 'نؤمن بقوة التبرع في إحداث تغيير إيجابي في حياة المحتاجين. تبرعك، مهما كان حجمه، يساهم في بناء مجتمع أفضل.', 3),
  ('products_title', 'منتجات التبرع', NULL, NULL, 4),
  ('zakat_title', 'الزكاة', NULL, NULL, 5),
  ('daily_charity_title', 'الصدقة اليومية', NULL, NULL, 6),
  ('programs_title', 'دعم البرامج والمشاريع', NULL, NULL, 7),
  ('endowments_title', 'الأوقاف الخيرية', NULL, NULL, 8),
  ('gifts_title', 'الإهداءات الوقفية', NULL, NULL, 9),
  ('methods_title', 'طرق التبرع', NULL, NULL, 10),
  ('methods_description', NULL, NULL, 'يمكنك التبرع من خلال أي من الطرق التالية', 11)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إدراج طرق تبرع افتراضية
INSERT INTO donation_methods (name, type, account_number, account_name, bank_name, iban, description, order_index)
VALUES
  ('البنك الأهلي السعودي', 'bank', '1234567890', 'جمعية الرعاية الخيرية', 'البنك الأهلي السعودي', 'SA1234567890123456789012', 'حساب بنكي للتبرعات', 1),
  ('البنك السعودي الفرنسي', 'bank', '0987654321', 'جمعية الرعاية الخيرية', 'البنك السعودي الفرنسي', 'SA0987654321098765432109', 'حساب بنكي للتبرعات', 2),
  ('STC Pay', 'electronic_wallet', '0501234567', 'جمعية الرعاية الخيرية', NULL, NULL, 'محفظة إلكترونية', 3),
  ('مصرف الراجحي', 'bank', '1122334455', 'جمعية الرعاية الخيرية', 'مصرف الراجحي', 'SA1122334455112233445511', 'حساب بنكي للتبرعات', 4)
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_donation_methods_type ON donation_methods(type);
CREATE INDEX IF NOT EXISTS idx_donation_methods_active ON donation_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_donation_methods_order ON donation_methods(order_index);
CREATE INDEX IF NOT EXISTS idx_donate_page_content_key ON donate_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_donate_page_content_active ON donate_page_content(is_active);

SELECT '✅ تم إنشاء جداول صفحة التبرع بنجاح!' AS message;
