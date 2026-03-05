-- إنشاء جدول محتوى صفحة مجلس الإدارة
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_management_board_table.sql

SET client_encoding TO 'UTF8';

-- جدول محتوى صفحة مجلس الإدارة
CREATE TABLE IF NOT EXISTS management_board_content (
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
INSERT INTO management_board_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'مجلس الإدارة', 'قيادة متميزة لرؤية طموحة', NULL, 1),
  ('intro_text', NULL, NULL, 'مجلس الإدارة هو الجهة المسؤولة عن إدارة شؤون الجمعية وتنفيذ قرارات الجمعية العمومية. يتكون المجلس من أعضاء يتم انتخابهم من قبل الجمعية العمومية، ويعملون على تحقيق أهداف الجمعية ورؤيتها الاستراتيجية.', 2)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_management_board_content_key ON management_board_content(section_key);
CREATE INDEX IF NOT EXISTS idx_management_board_content_active ON management_board_content(is_active);

SELECT '✅ تم إنشاء جدول محتوى صفحة مجلس الإدارة بنجاح!' AS message;
