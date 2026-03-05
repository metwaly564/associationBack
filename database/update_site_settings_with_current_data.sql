-- تحديث إعدادات الموقع بالقيم الحالية من الموقع
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/update_site_settings_with_current_data.sql

-- تحديث الإعدادات العامة
UPDATE site_settings 
SET setting_value = 'جمعية الرعاية الخيرية', updated_at = NOW()
WHERE setting_key = 'site_name';

UPDATE site_settings 
SET setting_value = 'نعمل على توفير الرعاية والدعم للأسر المحتاجة في مجتمعنا، ونسعى لبناء مستقبل أفضل من خلال برامجنا المتنوعة.', updated_at = NOW()
WHERE setting_key = 'site_description';

-- تحديث معلومات الاتصال
UPDATE site_settings 
SET setting_value = 'info@charity-association.org', updated_at = NOW()
WHERE setting_key = 'contact_email';

UPDATE site_settings 
SET setting_value = '+966 11 234 5678', updated_at = NOW()
WHERE setting_key = 'contact_phone';

UPDATE site_settings 
SET setting_value = '+966 11 234 5678', updated_at = NOW()
WHERE setting_key = 'contact_mobile';

UPDATE site_settings 
SET setting_value = 'الرياض، المملكة العربية السعودية', updated_at = NOW()
WHERE setting_key = 'contact_address';

-- تحديث إعدادات SEO
UPDATE site_settings 
SET setting_value = 'نعمل على توفير الرعاية والدعم للأسر المحتاجة في مجتمعنا، ونسعى لبناء مستقبل أفضل من خلال برامجنا المتنوعة.', updated_at = NOW()
WHERE setting_key = 'seo_description';

UPDATE site_settings 
SET setting_value = 'جمعية خيرية، رعاية، دعم، مساعدة، جمعية الرعاية الخيرية', updated_at = NOW()
WHERE setting_key = 'seo_keywords';

-- تحديث إعدادات الفوتر
UPDATE site_settings 
SET setting_value = '© 2024 جمعية الرعاية الخيرية. جميع الحقوق محفوظة.', updated_at = NOW()
WHERE setting_key = 'footer_text';

SELECT '✅ تم تحديث إعدادات الموقع بالقيم الحالية بنجاح!' AS message;
