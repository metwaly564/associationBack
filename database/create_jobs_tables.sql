-- إنشاء جداول صفحة الوظائف
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_jobs_tables.sql

SET client_encoding TO 'UTF8';

-- جدول الوظائف
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  department VARCHAR(255),
  location VARCHAR(255),
  employment_type VARCHAR(50) DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  description TEXT,
  requirements TEXT,
  responsibilities TEXT,
  benefits TEXT,
  salary_range VARCHAR(255),
  application_deadline DATE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول طلبات التوظيف
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  resume_url VARCHAR(500),
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interviewed', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- جدول محتوى صفحة الوظائف
CREATE TABLE IF NOT EXISTS jobs_page_content (
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
INSERT INTO jobs_page_content (section_key, title, subtitle, description, order_index)
VALUES
  ('hero_title', 'الوظائف المتاحة', 'انضم إلى فريقنا وكن جزءاً من رحلة التغيير', NULL, 1),
  ('intro_text', NULL, NULL, 'نبحث عن موظفين مبدعين ومتحمسين للانضمام إلى فريقنا. نقدم بيئة عمل محفزة وفرصاً للنمو والتطوير المهني.', 2),
  ('form_title', 'قدّم طلب توظيف', NULL, NULL, 3),
  ('form_subtitle', NULL, NULL, 'املأ النموذج أدناه وسنتواصل معك قريباً', 4)
ON CONFLICT (section_key) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_order ON jobs(order_index);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_jobs_page_content_key ON jobs_page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_jobs_page_content_active ON jobs_page_content(is_active);

SELECT '✅ تم إنشاء جداول صفحة الوظائف بنجاح!' AS message;
