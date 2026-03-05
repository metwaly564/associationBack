-- إضافة حقول "إظهار في الرئيسية" و "الأولوية" لجدول الأخبار
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/add_homepage_fields_to_news.sql

SET client_encoding TO 'UTF8';

-- إضافة الحقول إذا لم تكن موجودة
DO $$ 
BEGIN
  -- إضافة show_on_home
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news' AND column_name = 'show_on_home'
  ) THEN
    ALTER TABLE news ADD COLUMN show_on_home BOOLEAN DEFAULT false;
  END IF;

  -- إضافة priority
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news' AND column_name = 'priority'
  ) THEN
    ALTER TABLE news ADD COLUMN priority INTEGER DEFAULT 0;
  END IF;
END $$;

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_news_show_on_home ON news(show_on_home);
CREATE INDEX IF NOT EXISTS idx_news_priority ON news(priority);

SELECT '✅ تم إضافة حقول "إظهار في الرئيسية" و "الأولوية" لجدول الأخبار بنجاح!' AS message;
