-- حل نهائي لمشكلة الترميز العربي في محتوى الصفحة الرئيسية
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/fix_homepage_encoding.sql

-- 1. تعيين الترميز
SET client_encoding TO 'UTF8';

-- 2. حذف البيانات القديمة (التي تم إدخالها بترميز خاطئ)
DELETE FROM homepage_content;
DELETE FROM homepage_stats;
DELETE FROM homepage_values;
DELETE FROM homepage_partners;

-- 3. إعادة إدخال البيانات بترميز صحيح
INSERT INTO homepage_content (section_key, title, subtitle, description, content, button_text, button_link, order_index) 
VALUES 
  ('hero', 'نعمل من أجل مجتمع أفضل وحياة كريمة', 'بمنطقة المدينة المنورة', 'جمعية خيرية تهدف إلى تقديم الرعاية والدعم للأسر المحتاجة وتحسين جودة حياتهم من خلال برامج متنوعة ومستدامة', NULL, 'تبرّع الآن', '/donate', 1),
  ('about', 'رسالتنا تقديم العون والرعاية المستدامة', 'عن الجمعية', 'تأسست جمعية الرعاية الخيرية بهدف خدمة المجتمع وتقديم الدعم للأسر المحتاجة. نعمل على توفير برامج شاملة تغطي الاحتياجات الأساسية، التعليم، الصحة، والتأهيل المهني.', 'نؤمن بأن كل فرد في المجتمع يستحق فرصة للحياة الكريمة، ونسعى جاهدين لتحقيق ذلك من خلال برامجنا المبتكرة والمستدامة.', 'اعرف المزيد', '/about', 2),
  ('values_title', 'نلتزم بأعلى المعايير', 'قيمنا ومبادئنا', NULL, NULL, NULL, NULL, 3),
  ('projects_title', 'برامجنا الرائدة', 'البرامج والمشاريع', 'نقدم مجموعة متنوعة من البرامج والمشاريع التي تهدف إلى تحسين حياة المستفيدين', NULL, NULL, NULL, 4),
  ('stats_title', 'إنجازاتنا بالأرقام', NULL, 'نفخر بما حققناه من إنجازات بفضل دعمكم المستمر', NULL, NULL, NULL, 5),
  ('partners_title', 'الجهات المشرفة والداعمة', 'شركاؤنا', NULL, NULL, NULL, NULL, 6),
  ('cta', 'كن جزءًا من التغيير', NULL, 'تبرعك اليوم يساهم في تحسين حياة العشرات من الأسر المحتاجة', NULL, 'تبرّع الآن وساهم في صنع الفرق', '/donate', 7);

-- إدراج الإحصائيات
INSERT INTO homepage_stats (label, value, icon_name, order_index) 
VALUES 
  ('المستفيدين', '15,000+', 'Users', 1),
  ('الزيارات الميدانية', '3,500+', 'Target', 2),
  ('المتطوعين', '450+', 'Heart', 3),
  ('الأجهزة المقدمة', '2,800+', 'Award', 4);

-- إدراج القيم
INSERT INTO homepage_values (title, description, icon_name, order_index) 
VALUES 
  ('السرية التامة', 'نحافظ على خصوصية بيانات جميع المستفيدين والمتبرعين بأعلى معايير الأمان', 'Shield', 1),
  ('الأمانة والشفافية', 'نلتزم بالشفافية الكاملة في إدارة التبرعات وتوزيعها على المستحقين', 'Heart', 2),
  ('الاهتمام والرعاية', 'نقدم خدماتنا بكل اهتمام ورعاية لضمان وصول الدعم لمستحقيه', 'Users', 3);

-- إدراج الشركاء
INSERT INTO homepage_partners (name, image_url, order_index) 
VALUES 
  ('وزارة الموارد البشرية', '/partners/hr.svg', 1),
  ('هيئة تنمية المجتمع', '/partners/community.svg', 2),
  ('الهلال الأحمر', '/partners/red-crescent.svg', 3),
  ('مؤسسة الملك عبدالله', '/partners/kaaf.svg', 4);

-- التحقق من البيانات
SELECT section_key, title, subtitle FROM homepage_content ORDER BY order_index;

SELECT '✅ تم إصلاح الترميز وإعادة إدخال البيانات بنجاح!' AS message;
