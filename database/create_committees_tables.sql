-- إنشاء جداول صفحة اللجان
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_committees_tables.sql

SET client_encoding TO 'UTF8';

-- جدول اللجان
CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(500) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'permanent' CHECK (type IN ('permanent', 'temporary', 'both')),
  icon_name VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول أعضاء اللجان
CREATE TABLE IF NOT EXISTS committee_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  position VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول مهام اللجان
CREATE TABLE IF NOT EXISTS committee_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  task_text TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول محتوى صفحة اللجان
CREATE TABLE IF NOT EXISTS committees_page_content (
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
INSERT INTO committees_page_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'اللجان', 'لجان متخصصة لتحقيق أهدافنا', NULL, 1),
  ('intro_text', NULL, NULL, 'نستعرض هنا اللجان الدائمة والمؤقتة والوثائق المرتبطة بها.', 2)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إدراج لجان افتراضية
INSERT INTO committees (name, description, type, icon_name, order_index)
VALUES
  ('اللجنة المالية', 'تشرف على الشؤون المالية للجمعية', 'permanent', 'DollarSign', 1),
  ('اللجنة الطبية', 'تشرف على البرامج الصحية والطبية', 'permanent', 'Stethoscope', 2),
  ('لجنة البرامج والمشاريع', 'تشرف على تنفيذ البرامج والمشاريع', 'permanent', 'Briefcase', 3),
  ('لجنة التطوع', 'تشرف على برامج التطوع والمتطوعين', 'permanent', 'Heart', 4)
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_committees_type ON committees(type);
CREATE INDEX IF NOT EXISTS idx_committees_active ON committees(is_active);
CREATE INDEX IF NOT EXISTS idx_committees_order ON committees(order_index);
CREATE INDEX IF NOT EXISTS idx_committee_members_committee ON committee_members(committee_id);
CREATE INDEX IF NOT EXISTS idx_committee_members_active ON committee_members(is_active);
CREATE INDEX IF NOT EXISTS idx_committee_tasks_committee ON committee_tasks(committee_id);
CREATE INDEX IF NOT EXISTS idx_committee_tasks_active ON committee_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_committees_page_content_key ON committees_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_committees_page_content_active ON committees_page_content(is_active);

SELECT '✅ تم إنشاء جداول صفحة اللجان بنجاح!' AS message;
