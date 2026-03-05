-- إنشاء جدول التصنيفات
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_categories_table.sql

-- إنشاء جدول categories
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#1890ff',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إضافة فهرس
CREATE INDEX IF NOT EXISTS idx_news_categories_slug ON news_categories(slug);
CREATE INDEX IF NOT EXISTS idx_news_categories_active ON news_categories(is_active);

-- إدراج التصنيفات الافتراضية
INSERT INTO news_categories (name, slug, description, color, order_index) 
VALUES 
  ('الفعاليات', 'events', 'فعاليات وأنشطة الجمعية', '#52c41a', 1),
  ('البرامج', 'programs', 'البرامج والمشاريع', '#1890ff', 2),
  ('الإنجازات', 'achievements', 'إنجازات الجمعية', '#faad14', 3)
ON CONFLICT (slug) DO NOTHING;

-- تحديث جدول news لاستخدام category_id بدلاً من category (اختياري - يمكن الاحتفاظ بالحقل القديم)
-- ALTER TABLE news ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES news_categories(id);

SELECT '✅ تم إنشاء جدول التصنيفات بنجاح!' AS message;
