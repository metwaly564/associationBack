-- إنشاء جداول محتوى صفحة التطوع
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_volunteering_page_table.sql

SET client_encoding TO 'UTF8';

-- جدول محتوى صفحة التطوع
CREATE TABLE IF NOT EXISTS volunteering_page_content (
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

-- جدول فوائد التطوع
CREATE TABLE IF NOT EXISTS volunteering_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول فرص التطوع
CREATE TABLE IF NOT EXISTS volunteering_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(100),
  icon_name VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج المحتوى الافتراضي
INSERT INTO volunteering_page_content (section_key, title, subtitle, description, order_index) 
VALUES 
  ('hero_title', 'التطوع معنا', 'كن جزءًا من فريقنا وساهم في صنع التغيير الإيجابي', NULL, 1),
  ('why_title', 'لماذا التطوع معنا؟', NULL, 'التطوع هو فرصة رائعة لإحداث تأثير إيجابي في المجتمع، واكتساب مهارات جديدة، والتواصل مع أشخاص ملهمين. نحن نقدر وقتك وجهدك ونوفر لك بيئة داعمة ومشجعة.', 2),
  ('opportunities_title', 'فرص التطوع المتاحة', NULL, NULL, 3),
  ('form_title', 'قدّم طلب تطوع', 'املأ النموذج أدناه وسنتواصل معك لمناقشة فرص التطوع المناسبة', NULL, 4)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إدراج الفوائد الافتراضية
INSERT INTO volunteering_benefits (title, description, icon_name, order_index) 
VALUES 
  ('أثر حقيقي', 'ساهم في تحسين حياة الآخرين', 'Heart', 1),
  ('مهارات جديدة', 'اكتسب خبرات وتجارب قيمة', 'Users', 2),
  ('مرونة في الوقت', 'اختر الأوقات المناسبة لك', 'CheckCircle', 3)
ON CONFLICT DO NOTHING;

-- إدراج فرص التطوع الافتراضية
INSERT INTO volunteering_opportunities (title, description, duration, icon_name, order_index) 
VALUES 
  ('تنظيم الفعاليات الخيرية', 'المساعدة في تنظيم وإدارة الفعاليات والحملات الخيرية', '10 ساعات/شهر', 'Users', 1),
  ('الزيارات الميدانية', 'زيارة الأسر المستفيدة وتقديم الدعم المعنوي والمادي', '8 ساعات/شهر', 'Heart', 2),
  ('التدريب والتأهيل', 'تقديم دورات تدريبية ومهارية للمستفيدين', '12 ساعات/شهر', 'CheckCircle', 3)
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_volunteering_page_content_key ON volunteering_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_volunteering_page_content_active ON volunteering_page_content(is_active);
CREATE INDEX IF NOT EXISTS idx_volunteering_benefits_active ON volunteering_benefits(is_active);
CREATE INDEX IF NOT EXISTS idx_volunteering_opportunities_active ON volunteering_opportunities(is_active);

SELECT '✅ تم إنشاء جداول محتوى صفحة التطوع بنجاح!' AS message;
