-- إنشاء جداول صفحة الخطة التشغيلية والموازنة
-- استخدم: psql -U postgres -d association_db -f database/create_operational_budget_tables.sql

SET client_encoding TO 'UTF8';

-- مطلوب لـ uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول الخطط التشغيلية والموازنات
CREATE TABLE IF NOT EXISTS operational_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  file_name VARCHAR(500),
  year INTEGER,
  type VARCHAR(50) NOT NULL CHECK (type IN ('plan', 'budget', 'both')),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول محتوى صفحة الخطة التشغيلية والموازنة
CREATE TABLE IF NOT EXISTS operational_budget_page_content (
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
INSERT INTO operational_budget_page_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'الخطة التشغيلية والموازنة', 'نؤمن بالشفافية والتخطيط الاستراتيجي', NULL, 1),
  ('hero_subtitle', NULL, NULL, 'نعرض هنا الخطط التشغيلية والموازنات المعتمدة للجمعية', 2),
  ('intro_text', NULL, NULL, 'نؤمن بأهمية التخطيط الاستراتيجي والشفافية المالية. نعرض هنا الخطط التشغيلية والموازنات المعتمدة لضمان الشفافية والمساءلة.', 3)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_operational_budgets_year ON operational_budgets(year);
CREATE INDEX IF NOT EXISTS idx_operational_budgets_type ON operational_budgets(type);
CREATE INDEX IF NOT EXISTS idx_operational_budgets_active ON operational_budgets(is_active);
CREATE INDEX IF NOT EXISTS idx_operational_budgets_order ON operational_budgets(order_index);
CREATE INDEX IF NOT EXISTS idx_operational_budget_page_content_key ON operational_budget_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_operational_budget_page_content_active ON operational_budget_page_content(is_active);

SELECT '✅ تم إنشاء جداول صفحة الخطة التشغيلية والموازنة بنجاح!' AS message;
