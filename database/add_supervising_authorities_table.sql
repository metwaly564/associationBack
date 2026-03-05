-- إضافة جدول الجهات المشرفة لصفحة اللجان
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/add_supervising_authorities_table.sql

SET client_encoding TO 'UTF8';

-- جدول الجهات المشرفة
CREATE TABLE IF NOT EXISTS supervising_authorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(500) NOT NULL,
  image_url VARCHAR(500),
  icon_name VARCHAR(100),
  website_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج الجهات المشرفة الافتراضية
INSERT INTO supervising_authorities (name, icon_name, order_index)
VALUES
  ('وزارة الموارد البشرية', 'Building2', 1),
  ('وزارة الصحة', 'Building2', 2),
  ('المركز الوطني لتنمية القطاع غير الربحي', 'Building2', 3)
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_supervising_authorities_active ON supervising_authorities(is_active);
CREATE INDEX IF NOT EXISTS idx_supervising_authorities_order ON supervising_authorities(order_index);

SELECT '✅ تم إنشاء جدول الجهات المشرفة بنجاح!' AS message;
