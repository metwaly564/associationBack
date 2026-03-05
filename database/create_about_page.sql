-- إنشاء صفحة "من نحن" في قاعدة البيانات
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_about_page.sql

SET client_encoding TO 'UTF8';

-- إدراج صفحة "من نحن" إذا لم تكن موجودة
INSERT INTO static_pages (title, slug, type, summary, body, status, show_in_menu, menu_label, menu_order, seo_title, seo_description)
VALUES (
  'من نحن',
  'about',
  'about',
  'تعرف على قصتنا ورسالتنا وأهدافنا في خدمة المجتمع',
  '<section class="container mx-auto px-4 py-16">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">نبذة عن الجمعية</h2>
      <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
        <p>
          تأسست جمعية الرعاية الخيرية في عام 2009 بهدف تقديم الدعم والرعاية للأسر المحتاجة
          في المجتمع السعودي. منذ تأسيسها، نجحت الجمعية في مساعدة آلاف الأسر وتقديم
          خدمات متنوعة تشمل الدعم المادي، الرعاية الصحية، التعليم، والتأهيل المهني.
        </p>
        <p>
          تعمل الجمعية تحت إشراف وزارة الموارد البشرية والتنمية الاجتماعية، وتلتزم بأعلى
          معايير الشفافية والمساءلة في إدارة مواردها وتنفيذ برامجها. نحن نؤمن بأن كل فرد
          في المجتمع يستحق فرصة للحياة الكريمة، ونسعى جاهدين لتحقيق هذا الهدف من خلال
          برامجنا المبتكرة والمستدامة.
        </p>
      </div>
    </div>
  </section>

  <section class="bg-gray-50 py-16">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div class="bg-white rounded-xl p-8 shadow-lg">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">رؤيتنا</h3>
          <p class="text-gray-700 leading-relaxed text-lg">
            أن نكون الجمعية الرائدة في تقديم الرعاية الشاملة والمستدامة للأسر المحتاجة،
            ونساهم في بناء مجتمع متماسك خالٍ من الفقر والحاجة.
          </p>
        </div>

        <div class="bg-white rounded-xl p-8 shadow-lg">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">رسالتنا</h3>
          <p class="text-gray-700 leading-relaxed text-lg">
            تقديم الدعم الشامل والمتكامل للأسر المحتاجة من خلال برامج مبتكرة ومستدامة،
            بما يحقق التنمية الاجتماعية والاقتصادية للمستفيدين ويعزز استقلاليتهم.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="container mx-auto px-4 py-16">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">أهدافنا الاستراتيجية</h2>
      </div>
      <div class="space-y-4">
        <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <span class="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
          <p class="text-gray-700 text-lg pt-1">تقديم الدعم المادي والعينى للأسر المحتاجة بشكل منتظم ومستدام</p>
        </div>
        <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <span class="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
          <p class="text-gray-700 text-lg pt-1">توفير الرعاية الصحية والعلاجات اللازمة للمرضى غير القادرين</p>
        </div>
        <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <span class="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
          <p class="text-gray-700 text-lg pt-1">دعم تعليم الأبناء من الأسر المحتاجة وتوفير المستلزمات الدراسية</p>
        </div>
        <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <span class="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
          <p class="text-gray-700 text-lg pt-1">تأهيل وتدريب الشباب والباحثين عن عمل لتحسين فرصهم الوظيفية</p>
        </div>
        <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <span class="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">5</span>
          <p class="text-gray-700 text-lg pt-1">بناء شراكات فعالة مع القطاعين العام والخاص لتعزيز أثر البرامج</p>
        </div>
        <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <span class="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">6</span>
          <p class="text-gray-700 text-lg pt-1">تطوير برامج مبتكرة تحقق الاستدامة والاستقلالية للمستفيدين</p>
        </div>
        <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
          <span class="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm">7</span>
          <p class="text-gray-700 text-lg pt-1">نشر ثقافة العمل التطوعي والمسؤولية المجتمعية</p>
        </div>
      </div>
    </div>
  </section>',
  'published',
  true,
  'من نحن',
  1,
  'من نحن - جمعية الرعاية الخيرية',
  'تعرف على قصتنا ورسالتنا وأهدافنا في خدمة المجتمع'
)
ON CONFLICT (slug) DO UPDATE
SET 
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  status = EXCLUDED.status,
  updated_at = NOW();

SELECT '✅ تم إنشاء/تحديث صفحة "من نحن" بنجاح!' AS message;
