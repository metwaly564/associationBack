-- إنشاء جدول إعدادات الموقع
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_site_settings_table.sql

SET client_encoding TO 'UTF8';

-- جدول إعدادات الموقع
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text', -- text, image, url, email, phone, etc.
  description TEXT,
  category VARCHAR(50) DEFAULT 'general', -- general, contact, social, seo, etc.
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج الإعدادات الافتراضية (القيم الحالية من الموقع)
INSERT INTO site_settings (setting_key, setting_value, setting_type, description, category, order_index) 
VALUES 
  -- الإعدادات العامة
  ('site_name', 'جمعية الرعاية الخيرية', 'text', 'اسم الموقع', 'general', 1),
  ('site_name_en', 'Charity Care Association', 'text', 'اسم الموقع بالإنجليزية', 'general', 2),
  ('site_logo', '', 'image', 'شعار الموقع', 'general', 3),
  ('site_favicon', '', 'image', 'أيقونة الموقع (Favicon)', 'general', 4),
  ('site_description', 'نعمل على توفير الرعاية والدعم للأسر المحتاجة في مجتمعنا، ونسعى لبناء مستقبل أفضل من خلال برامجنا المتنوعة.', 'text', 'وصف الموقع', 'general', 5),
  
  -- معلومات الاتصال
  ('contact_email', 'info@charity-association.org', 'email', 'البريد الإلكتروني', 'contact', 10),
  ('contact_phone', '+966 11 234 5678', 'phone', 'رقم الهاتف', 'contact', 11),
  ('contact_mobile', '+966 11 234 5678', 'phone', 'رقم الجوال', 'contact', 12),
  ('contact_address', 'الرياض، المملكة العربية السعودية', 'text', 'العنوان', 'contact', 13),
  ('contact_map_url', '', 'url', 'رابط الخريطة', 'contact', 14),
  
  -- وسائل التواصل الاجتماعي
  ('social_facebook', '', 'url', 'رابط فيسبوك', 'social', 20),
  ('social_twitter', '', 'url', 'رابط تويتر', 'social', 21),
  ('social_instagram', '', 'url', 'رابط إنستغرام', 'social', 22),
  ('social_linkedin', '', 'url', 'رابط لينكد إن', 'social', 23),
  ('social_youtube', '', 'url', 'رابط يوتيوب', 'social', 24),
  ('social_whatsapp', '', 'phone', 'رقم واتساب', 'social', 25),
  
  -- إعدادات SEO
  ('seo_title', 'جمعية الرعاية الخيرية', 'text', 'عنوان SEO', 'seo', 30),
  ('seo_description', 'نعمل على توفير الرعاية والدعم للأسر المحتاجة في مجتمعنا، ونسعى لبناء مستقبل أفضل من خلال برامجنا المتنوعة.', 'text', 'وصف SEO', 'seo', 31),
  ('seo_keywords', 'جمعية خيرية، رعاية، دعم، مساعدة، جمعية الرعاية الخيرية', 'text', 'كلمات مفتاحية', 'seo', 32),
  
  -- إعدادات الفوتر
  ('footer_text', '© 2024 جمعية الرعاية الخيرية. جميع الحقوق محفوظة.', 'text', 'نص الفوتر', 'footer', 40),
  ('footer_copyright_year', '2024', 'text', 'سنة حقوق النشر', 'footer', 41),
  
  -- إعدادات أخرى
  ('working_hours', 'الأحد - الخميس: 8:00 ص - 5:00 م', 'text', 'ساعات العمل', 'contact', 50),
  ('donation_phone', '', 'phone', 'رقم التبرع', 'contact', 51)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

SELECT '✅ تم إنشاء جدول إعدادات الموقع بنجاح!' AS message;
