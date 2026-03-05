-- إنشاء جدول أقسام صفحة "من نحن"
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_about_sections_table.sql

SET client_encoding TO 'UTF8';

-- جدول أقسام صفحة "من نحن"
CREATE TABLE IF NOT EXISTS about_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500),
  content TEXT,
  icon_name VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول الأهداف الاستراتيجية
CREATE TABLE IF NOT EXISTS about_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج الأقسام الافتراضية
INSERT INTO about_sections (section_key, title, content, icon_name, order_index) 
VALUES 
  ('vision', 'رؤيتنا', 'أن نكون الجمعية الرائدة في تقديم الرعاية الشاملة والمستدامة للأسر المحتاجة، ونساهم في بناء مجتمع متماسك خالٍ من الفقر والحاجة.', 'Eye', 1),
  ('mission', 'رسالتنا', 'تقديم الدعم الشامل والمتكامل للأسر المحتاجة من خلال برامج مبتكرة ومستدامة، بما يحقق التنمية الاجتماعية والاقتصادية للمستفيدين ويعزز استقلاليتهم.', 'Target', 2)
ON CONFLICT (section_key) DO NOTHING;

-- إدراج الأهداف الافتراضية
INSERT INTO about_goals (title, order_index) 
VALUES 
  ('تقديم الدعم المادي والعينى للأسر المحتاجة بشكل منتظم ومستدام', 1),
  ('توفير الرعاية الصحية والعلاجات اللازمة للمرضى غير القادرين', 2),
  ('دعم تعليم الأبناء من الأسر المحتاجة وتوفير المستلزمات الدراسية', 3),
  ('تأهيل وتدريب الشباب والباحثين عن عمل لتحسين فرصهم الوظيفية', 4),
  ('بناء شراكات فعالة مع القطاعين العام والخاص لتعزيز أثر البرامج', 5),
  ('تطوير برامج مبتكرة تحقق الاستدامة والاستقلالية للمستفيدين', 6),
  ('نشر ثقافة العمل التطوعي والمسؤولية المجتمعية', 7)
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_about_sections_key ON about_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_about_sections_active ON about_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_about_goals_active ON about_goals(is_active);

SELECT '✅ تم إنشاء جداول أقسام صفحة "من نحن" بنجاح!' AS message;
