-- إنشاء جداول صفحة الجمعية العمومية
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_general_assembly_tables.sql

SET client_encoding TO 'UTF8';

-- جدول محتوى صفحة الجمعية العمومية
CREATE TABLE IF NOT EXISTS general_assembly_content (
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

-- جدول اجتماعات الجمعية العمومية
CREATE TABLE IF NOT EXISTS assembly_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  meeting_date DATE,
  file_url VARCHAR(500),
  file_name VARCHAR(500),
  meeting_number INTEGER,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج المحتوى الافتراضي
INSERT INTO general_assembly_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'الجمعية العمومية', 'أعضاء الجمعية العمومية', NULL, 1),
  ('intro_text', NULL, NULL, 'بموجب نظام الجمعيات والمؤسسات الأهلية الصادر بقرار مجلس الوزراء رقم ( 61 ) وتاريخ 18 / 02 / 1437هـ ولائحته التنفيذية الصادرة بالقرار الوزاري رقم ( 73739 ) وتاريخ 11  / 06 / 1437هـ ، فقد تم تأسيس جمعية الطب المنزلي بالمدينة المنورة من الأشخاص الآتية أسماؤهم ، وفقاً لما حددته اللائحة الأساسية للجمعية', 2)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_general_assembly_content_key ON general_assembly_content(section_key);
CREATE INDEX IF NOT EXISTS idx_general_assembly_content_active ON general_assembly_content(is_active);
CREATE INDEX IF NOT EXISTS idx_assembly_meetings_active ON assembly_meetings(is_active);
CREATE INDEX IF NOT EXISTS idx_assembly_meetings_date ON assembly_meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_assembly_meetings_order ON assembly_meetings(order_index);

SELECT '✅ تم إنشاء جداول صفحة الجمعية العمومية بنجاح!' AS message;
