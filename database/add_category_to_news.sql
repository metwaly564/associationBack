-- إضافة حقل category للأخبار
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/add_category_to_news.sql

-- إضافة عمود category إذا لم يكن موجوداً
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'events';

-- تحديث البيانات الموجودة (اختياري)
-- UPDATE news SET category = 'events' WHERE category IS NULL;

-- إضافة فهرس للتصنيف
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);

SELECT '✅ تم إضافة حقل category للأخبار بنجاح!' AS message;
