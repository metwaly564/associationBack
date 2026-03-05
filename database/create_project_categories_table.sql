-- إنشاء جدول تصنيفات المشاريع
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_project_categories_table.sql

SET client_encoding TO 'UTF8';

-- جدول تصنيفات المشاريع
CREATE TABLE IF NOT EXISTS project_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT '#1890ff',
  icon_name VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إضافة عمود category_id لجدول projects (إذا لم يكن موجوداً)
DO $$ 
BEGIN
  -- إضافة category_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN category_id UUID REFERENCES project_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- إدراج التصنيفات الافتراضية
INSERT INTO project_categories (name, slug, description, color, order_index) 
VALUES 
  ('الرعاية الاجتماعية', 'social-care', 'برامج ومشاريع الرعاية الاجتماعية', '#10b981', 1),
  ('الرعاية الصحية', 'health-care', 'برامج ومشاريع الرعاية الصحية', '#3b82f6', 2),
  ('التعليم', 'education', 'برامج ومشاريع التعليم', '#8b5cf6', 3),
  ('التوظيف والتأهيل', 'employment', 'برامج ومشاريع التوظيف والتأهيل المهني', '#f59e0b', 4),
  ('الإسكان', 'housing', 'برامج ومشاريع الإسكان', '#ef4444', 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_project_categories_slug ON project_categories(slug);
CREATE INDEX IF NOT EXISTS idx_project_categories_active ON project_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);

SELECT '✅ تم إنشاء جدول تصنيفات المشاريع بنجاح!' AS message;
