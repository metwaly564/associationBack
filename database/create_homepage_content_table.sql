-- إنشاء جدول محتوى الصفحة الرئيسية
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_homepage_content_table.sql

-- جدول محتوى الصفحة الرئيسية
CREATE TABLE IF NOT EXISTS homepage_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  content TEXT,
  image_url VARCHAR(500),
  button_text VARCHAR(255),
  button_link VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول الإحصائيات
CREATE TABLE IF NOT EXISTS homepage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label VARCHAR(255) NOT NULL,
  value VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول القيم
CREATE TABLE IF NOT EXISTS homepage_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول الشركاء
CREATE TABLE IF NOT EXISTS homepage_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  website_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج المحتوى الافتراضي
INSERT INTO homepage_content (section_key, title, subtitle, description, content, button_text, button_link, order_index) 
VALUES 
  ('hero', 'نعمل من أجل مجتمع أفضل وحياة كريمة', 'بمنطقة المدينة المنورة', 'جمعية خيرية تهدف إلى تقديم الرعاية والدعم للأسر المحتاجة وتحسين جودة حياتهم من خلال برامج متنوعة ومستدامة', NULL, 'تبرّع الآن', '/donate', 1),
  ('about', 'رسالتنا تقديم العون والرعاية المستدامة', 'عن الجمعية', 'تأسست جمعية الرعاية الخيرية بهدف خدمة المجتمع وتقديم الدعم للأسر المحتاجة. نعمل على توفير برامج شاملة تغطي الاحتياجات الأساسية، التعليم، الصحة، والتأهيل المهني.', 'نؤمن بأن كل فرد في المجتمع يستحق فرصة للحياة الكريمة، ونسعى جاهدين لتحقيق ذلك من خلال برامجنا المبتكرة والمستدامة.', 'اعرف المزيد', '/about', 2),
  ('values_title', 'نلتزم بأعلى المعايير', 'قيمنا ومبادئنا', NULL, NULL, NULL, NULL, 3),
  ('projects_title', 'برامجنا الرائدة', 'البرامج والمشاريع', 'نقدم مجموعة متنوعة من البرامج والمشاريع التي تهدف إلى تحسين حياة المستفيدين', NULL, NULL, NULL, 4),
  ('stats_title', 'إنجازاتنا بالأرقام', NULL, 'نفخر بما حققناه من إنجازات بفضل دعمكم المستمر', NULL, NULL, NULL, 5),
  ('partners_title', 'الجهات المشرفة والداعمة', 'شركاؤنا', NULL, NULL, NULL, NULL, 6),
  ('cta', 'كن جزءًا من التغيير', NULL, 'تبرعك اليوم يساهم في تحسين حياة العشرات من الأسر المحتاجة', NULL, 'تبرّع الآن وساهم في صنع الفرق', '/donate', 7)
ON CONFLICT (section_key) DO NOTHING;

-- إدراج الإحصائيات الافتراضية
INSERT INTO homepage_stats (label, value, icon_name, order_index) 
VALUES 
  ('المستفيدين', '15,000+', 'Users', 1),
  ('الزيارات الميدانية', '3,500+', 'Target', 2),
  ('المتطوعين', '450+', 'Heart', 3),
  ('الأجهزة المقدمة', '2,800+', 'Award', 4)
ON CONFLICT DO NOTHING;

-- إدراج القيم الافتراضية
INSERT INTO homepage_values (title, description, icon_name, order_index) 
VALUES 
  ('السرية التامة', 'نحافظ على خصوصية بيانات جميع المستفيدين والمتبرعين بأعلى معايير الأمان', 'Shield', 1),
  ('الأمانة والشفافية', 'نلتزم بالشفافية الكاملة في إدارة التبرعات وتوزيعها على المستحقين', 'Heart', 2),
  ('الاهتمام والرعاية', 'نقدم خدماتنا بكل اهتمام ورعاية لضمان وصول الدعم لمستحقيه', 'Users', 3)
ON CONFLICT DO NOTHING;

-- إدراج الشركاء الافتراضيين
INSERT INTO homepage_partners (name, image_url, order_index) 
VALUES 
  ('وزارة الموارد البشرية', '/partners/hr.svg', 1),
  ('هيئة تنمية المجتمع', '/partners/community.svg', 2),
  ('الهلال الأحمر', '/partners/red-crescent.svg', 3),
  ('مؤسسة الملك عبدالله', '/partners/kaaf.svg', 4)
ON CONFLICT DO NOTHING;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_homepage_content_key ON homepage_content(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_content_active ON homepage_content(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_stats_active ON homepage_stats(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_values_active ON homepage_values(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_partners_active ON homepage_partners(is_active);

SELECT '✅ تم إنشاء جداول محتوى الصفحة الرئيسية بنجاح!' AS message;
