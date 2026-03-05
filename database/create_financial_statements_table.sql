-- إنشاء جداول القوائم والتقارير المالية
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_financial_statements_table.sql

SET client_encoding TO 'UTF8';

-- جدول القوائم والتقارير المالية
CREATE TABLE IF NOT EXISTS financial_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  year INTEGER,
  type VARCHAR(50) DEFAULT 'statement' CHECK (type IN ('statement', 'report')),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول محتوى صفحة القوائم المالية
CREATE TABLE IF NOT EXISTS financial_statements_page_content (
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
INSERT INTO financial_statements_page_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'القوائم والتقارير المالية', 'نؤمن بالشفافية والمساءلة في جميع أعمالنا المالية', NULL, 1)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_financial_statements_year ON financial_statements(year);
CREATE INDEX IF NOT EXISTS idx_financial_statements_type ON financial_statements(type);
CREATE INDEX IF NOT EXISTS idx_financial_statements_active ON financial_statements(is_active);
CREATE INDEX IF NOT EXISTS idx_financial_statements_order ON financial_statements(order_index);
CREATE INDEX IF NOT EXISTS idx_financial_statements_page_content_key ON financial_statements_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_financial_statements_page_content_active ON financial_statements_page_content(is_active);

SELECT '✅ تم إنشاء جداول القوائم والتقارير المالية بنجاح!' AS message;
