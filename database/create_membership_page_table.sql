-- إنشاء جداول محتوى صفحة العضوية
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_membership_page_table.sql

SET client_encoding TO 'UTF8';

-- جدول محتوى صفحة العضوية
CREATE TABLE IF NOT EXISTS membership_page_content (
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

-- جدول أنواع العضوية
CREATE TABLE IF NOT EXISTS membership_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  icon_name VARCHAR(100),
  color VARCHAR(50) DEFAULT 'emerald',
  features JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج المحتوى الافتراضي
INSERT INTO membership_page_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'العضوية', 'انضم إلى عائلة الجمعية وكن شريكًا في رحلة العطاء', NULL, 1),
  ('why_title', 'لماذا تصبح عضوًا؟', NULL, 'العضوية في جمعية الرعاية الخيرية تمنحك فرصة المشاركة الفعالة في خدمة المجتمع والمساهمة في صنع القرارات المهمة. كما توفر لك فرصة التواصل مع أشخاص يشاركونك نفس الاهتمامات والقيم.', 2),
  ('types_title', 'أنواع العضويات', NULL, NULL, 3),
  ('form_title', 'قدّم طلب عضوية', 'املأ النموذج أدناه للانضمام إلى عائلة الجمعية', NULL, 4)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إدراج أنواع العضوية الافتراضية
INSERT INTO membership_types (title, icon_name, color, features, requirements, order_index)
VALUES
  (
    'العضوية العادية',
    'Users',
    'emerald',
    '["حضور الجمعية العمومية", "التصويت على القرارات", "المشاركة في الفعاليات", "تلقي النشرات الدورية", "الاستفادة من الخدمات"]'::jsonb,
    'مفتوحة لجميع المواطنين والمقيمين',
    1
  ),
  (
    'العضوية الشرفية',
    'Star',
    'amber',
    '["جميع مزايا العضوية العادية", "التكريم في الفعاليات", "الأولوية في المشاركة", "شهادة عضوية مميزة", "دعوة خاصة للفعاليات الكبرى"]'::jsonb,
    'لمن قدم خدمات جليلة للجمعية',
    2
  ),
  (
    'العضوية الفخرية',
    'Award',
    'purple',
    '["جميع مزايا العضوية الشرفية", "عضوية مدى الحياة", "المشاركة في صنع القرار الاستراتيجي", "تكريم سنوي خاص", "لقاءات دورية مع القيادة"]'::jsonb,
    'تمنح للشخصيات البارزة والداعمة',
    3
  )
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_membership_page_content_key ON membership_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_membership_page_content_active ON membership_page_content(is_active);
CREATE INDEX IF NOT EXISTS idx_membership_types_active ON membership_types(is_active);
CREATE INDEX IF NOT EXISTS idx_membership_types_order ON membership_types(order_index);

SELECT '✅ تم إنشاء جداول محتوى صفحة العضوية بنجاح!' AS message;
