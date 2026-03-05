-- إضافة جدول القيم إلى أقسام صفحة "من نحن"
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/add_values_to_about_sections.sql

SET client_encoding TO 'UTF8';

-- جدول القيم
CREATE TABLE IF NOT EXISTS about_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج القيم الافتراضية
INSERT INTO about_values (title, description, icon_name, order_index)
VALUES
  ('الشفافية', 'نؤمن بالشفافية الكاملة في جميع أعمالنا المالية والإدارية', 'Eye', 1),
  ('المساءلة', 'نلتزم بالمساءلة أمام المستفيدين والمجتمع', 'Shield', 2),
  ('التميز', 'نسعى للتميز في جميع برامجنا وخدماتنا', 'Award', 3),
  ('الشراكة', 'نؤمن بقوة الشراكة مع جميع القطاعات', 'Users', 4),
  ('الاستدامة', 'نعمل على بناء برامج مستدامة تحقق الأثر طويل المدى', 'Heart', 5)
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_about_values_active ON about_values(is_active);
CREATE INDEX IF NOT EXISTS idx_about_values_order ON about_values(order_index);

SELECT '✅ تم إضافة جدول القيم بنجاح!' AS message;
