-- إنشاء جداول صفحة الشراكة
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_partnership_tables.sql

SET client_encoding TO 'UTF8';

-- جدول أنواع الشراكة
CREATE TABLE IF NOT EXISTS partnership_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  color VARCHAR(50),
  benefits TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول طلبات الشراكة
CREATE TABLE IF NOT EXISTS partnership_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnership_type_id UUID REFERENCES partnership_types(id) ON DELETE SET NULL,
  organization_name VARCHAR(500) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(500),
  organization_type VARCHAR(255),
  description TEXT,
  partnership_proposal TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول محتوى صفحة الشراكة
CREATE TABLE IF NOT EXISTS partnership_page_content (
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
INSERT INTO partnership_page_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'الشراكة', 'نعمل معاً لتحقيق أهداف مشتركة', NULL, 1),
  ('intro_text', NULL, NULL, 'نؤمن بقوة الشراكة في تحقيق أهدافنا المشتركة. نبحث عن شركاء استراتيجيين يشاركوننا رؤيتنا ويساهمون في خدمة المجتمع.', 2),
  ('why_title', 'لماذا الشراكة معنا؟', NULL, NULL, 3),
  ('why_description', NULL, NULL, 'الشراكة معنا تفتح آفاقاً واسعة للتعاون المثمر والاستفادة المتبادلة. نحن نقدم بيئة داعمة وشفافة للشركاء مع إمكانية الوصول إلى شبكة واسعة من المستفيدين والمجتمعات المحلية.', 4),
  ('form_title', 'قدّم طلب شراكة', NULL, NULL, 5),
  ('form_subtitle', NULL, NULL, 'املأ النموذج أدناه وسنتواصل معك لمناقشة فرص الشراكة المتاحة', 6)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إدراج أنواع شراكة افتراضية
INSERT INTO partnership_types (title, description, icon_name, color, benefits, order_index)
VALUES
  ('شراكة استراتيجية', 'شراكات طويلة الأمد لتحقيق أهداف مشتركة', 'Handshake', 'emerald', 'وصول إلى شبكة واسعة من المستفيدين، فرص للتعاون في المشاريع الكبرى', 1),
  ('شراكة تمويلية', 'شراكات لدعم البرامج والمشاريع', 'DollarSign', 'blue', 'إمكانية رعاية برامج محددة، شفافية كاملة في استخدام التمويل', 2),
  ('شراكة تقنية', 'شراكات في المجالات التقنية والرقمية', 'Code', 'purple', 'فرص للابتكار، استخدام التقنيات الحديثة', 3),
  ('شراكة مجتمعية', 'شراكات مع منظمات المجتمع المدني', 'Users', 'amber', 'تعزيز التأثير المجتمعي، بناء شبكات قوية', 4)
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_partnership_types_active ON partnership_types(is_active);
CREATE INDEX IF NOT EXISTS idx_partnership_types_order ON partnership_types(order_index);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_type ON partnership_requests(partnership_type_id);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_status ON partnership_requests(status);
CREATE INDEX IF NOT EXISTS idx_partnership_page_content_key ON partnership_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_partnership_page_content_active ON partnership_page_content(is_active);

SELECT '✅ تم إنشاء جداول صفحة الشراكة بنجاح!' AS message;
