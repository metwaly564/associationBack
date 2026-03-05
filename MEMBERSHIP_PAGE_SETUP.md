# إعداد صفحة العضوية

## نظرة عامة

تم إنشاء نظام لإدارة صفحة العضوية من CMS. الآن يمكنك تعديل جميع محتويات الصفحة مباشرة من لوحة التحكم.

## الخطوات المطلوبة

### 1. إنشاء الجداول في قاعدة البيانات

قم بتشغيل ملف SQL التالي:

```bash
psql -U postgres -d association_db -f admin-cms/database/create_membership_page_table.sql
```

هذا سينشئ الجداول التالية:
- `membership_page_content` - محتوى أقسام الصفحة
- `membership_types` - أنواع العضوية

### 2. الوصول إلى صفحة الإدارة

1. افتح لوحة التحكم: `http://localhost:3001`
2. من القائمة الجانبية، اختر **"صفحة العضوية"**
3. ستجد تبويبات مختلفة لإدارة كل قسم

## الأقسام القابلة للتعديل

### 1. قسم Hero
- العنوان الرئيسي
- العنوان الفرعي

### 2. قسم "لماذا تصبح عضوًا"
- العنوان
- الوصف

### 3. أنواع العضويات
يمكنك إضافة/تعديل/حذف أنواع العضوية:
- العنوان
- اسم الأيقونة (Users, Star, Award, etc.)
- اللون (emerald, amber, purple, blue, etc.)
- المزايا (قائمة - سطر واحد لكل ميزة)
- الشروط
- ترتيب العرض
- الحالة (نشط/غير نشط)

### 4. قسم النموذج
- العنوان
- العنوان الفرعي

## الأيقونات المتاحة

الأيقونات المدعومة من Lucide React:
- `Users` - المستخدمين
- `Star` - النجمة
- `Award` - الجائزة
- `Heart` - القلب
- `CheckCircle` - علامة صح
- وغيرها من أيقونات Lucide React

## الألوان المتاحة

الألوان المدعومة في Tailwind CSS:
- `emerald` - أخضر زمردي
- `amber` - كهرماني
- `purple` - بنفسجي
- `blue` - أزرق
- `red` - أحمر
- `indigo` - نيلي
- وغيرها من ألوان Tailwind CSS

## ملاحظات مهمة

1. **المزايا**: أدخل المزايا في حقل "المزايا" بحيث يكون كل سطر يمثل ميزة واحدة.

2. **الأيقونات**: استخدم اسم الأيقونة من Lucide React (مثال: Users, Star, Award)

3. **الألوان**: استخدم اسم اللون من Tailwind CSS (مثال: emerald, amber, purple)

4. **الحفظ**: بعد تعديل أي قسم، اضغط على زر **"حفظ جميع التغييرات"** في أسفل الصفحة.

5. **الترتيب**: يمكنك تحديد `order_index` لترتيب أنواع العضوية.

6. **النموذج**: نموذج طلب العضوية ثابت حالياً في الواجهة الأمامية. يمكن ربطه بـ API لاحقاً.

## API Endpoints

### Public API (للموقع العام)
```
GET /api/public/membership-page
```

### Admin API (لإدارة المحتوى)
```
GET /api/membership-page
PUT /api/membership-page
```

## الملفات المحدثة

- `admin-cms/database/create_membership_page_table.sql` - SQL script لإنشاء الجداول
- `admin-cms/app/api/membership-page/route.ts` - API لإدارة المحتوى
- `admin-cms/app/api/public/membership-page/route.ts` - Public API
- `admin-cms/app/membership/page.tsx` - صفحة إدارة المحتوى في CMS
- `admin-cms/lib/apiClient.ts` - إضافة وظائف API
- `src/lib/api.ts` - إضافة وظائف API للموقع العام
- `src/pages/Membership.tsx` - تحديث الصفحة لاستخدام المحتوى من API
- `admin-cms/components/AdminLayout.tsx` - إضافة رابط صفحة العضوية

## مثال على البيانات

```json
{
  "content": [
    {
      "section_key": "hero_title",
      "title": "العضوية",
      "subtitle": "انضم إلى عائلة الجمعية وكن شريكًا في رحلة العطاء"
    },
    {
      "section_key": "why_title",
      "title": "لماذا تصبح عضوًا؟",
      "description": "العضوية في جمعية الرعاية الخيرية تمنحك فرصة المشاركة الفعالة..."
    }
  ],
  "types": [
    {
      "title": "العضوية العادية",
      "icon_name": "Users",
      "color": "emerald",
      "features": [
        "حضور الجمعية العمومية",
        "التصويت على القرارات",
        "المشاركة في الفعاليات"
      ],
      "requirements": "مفتوحة لجميع المواطنين والمقيمين"
    }
  ]
}
```

## التحقق من الصفحة العامة

افتح الصفحة العامة: `http://localhost:5173/membership`

ستجد:
- العنوان الرئيسي والفرعي (من CMS)
- قسم "لماذا تصبح عضوًا؟" (من CMS)
- أنواع العضويات (من CMS)
- نموذج طلب العضوية (ثابت حالياً)

---

✅ **صفحة العضوية جاهزة للاستخدام!**
