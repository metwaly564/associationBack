# إعداد صفحة التطوع

## نظرة عامة

تم إنشاء نظام لإدارة صفحة التطوع من CMS. الآن يمكنك تعديل جميع محتويات الصفحة مباشرة من لوحة التحكم.

## الخطوات المطلوبة

### 1. إنشاء الجداول في قاعدة البيانات

قم بتشغيل ملف SQL التالي:

```bash
psql -U postgres -d association_db -f admin-cms/database/create_volunteering_page_table.sql
```

هذا سينشئ الجداول التالية:
- `volunteering_page_content` - محتوى أقسام الصفحة
- `volunteering_benefits` - فوائد التطوع
- `volunteering_opportunities` - فرص التطوع المتاحة

### 2. الوصول إلى صفحة الإدارة

1. افتح لوحة التحكم: `http://localhost:3001`
2. من القائمة الجانبية، اختر **"صفحة التطوع"**
3. ستجد تبويبات مختلفة لإدارة كل قسم

## الأقسام القابلة للتعديل

### 1. قسم Hero
- العنوان الرئيسي
- العنوان الفرعي

### 2. قسم "لماذا التطوع"
- العنوان
- الوصف

### 3. فوائد التطوع
يمكنك إضافة/تعديل/حذف فوائد التطوع:
- العنوان
- الوصف
- اسم الأيقونة (Heart, Users, CheckCircle, etc.)
- ترتيب العرض
- الحالة (نشط/غير نشط)

### 4. فرص التطوع
يمكنك إضافة/تعديل/حذف فرص التطوع:
- العنوان
- الوصف
- المدة (مثال: 10 ساعات/شهر)
- اسم الأيقونة
- ترتيب العرض
- الحالة (نشط/غير نشط)

### 5. قسم النموذج
- العنوان
- العنوان الفرعي

### 6. عنوان فرص التطوع
- العنوان

## الأيقونات المتاحة

الأيقونات المدعومة من Lucide React:
- `Heart` - القلب
- `Users` - المستخدمين
- `CheckCircle` - علامة صح
- `Clock` - الساعة
- `Send` - إرسال
- `Award` - الجائزة
- `Target` - الهدف
- وغيرها من أيقونات Lucide React

## ملاحظات مهمة

1. **الأيقونات**: استخدم اسم الأيقونة من Lucide React (مثال: Heart, Users)

2. **الحفظ**: بعد تعديل أي قسم، اضغط على زر **"حفظ جميع التغييرات"** في أسفل الصفحة.

3. **الترتيب**: يمكنك تحديد `order_index` لترتيب العناصر.

4. **النموذج**: نموذج التطوع ثابت حالياً في الواجهة الأمامية. يمكن ربطه بـ API لاحقاً.

## API Endpoints

### Public API (للموقع العام)
```
GET /api/public/volunteering-page
```

### Admin API (لإدارة المحتوى)
```
GET /api/volunteering-page
PUT /api/volunteering-page
```

## الملفات المحدثة

- `admin-cms/database/create_volunteering_page_table.sql` - SQL script لإنشاء الجداول
- `admin-cms/app/api/volunteering-page/route.ts` - API لإدارة المحتوى
- `admin-cms/app/api/public/volunteering-page/route.ts` - Public API
- `admin-cms/app/volunteering/page.tsx` - صفحة إدارة المحتوى في CMS
- `admin-cms/lib/apiClient.ts` - إضافة وظائف API
- `src/lib/api.ts` - إضافة وظائف API للموقع العام
- `src/pages/Volunteering.tsx` - تحديث الصفحة لاستخدام المحتوى من API
- `admin-cms/components/AdminLayout.tsx` - إضافة رابط صفحة التطوع

## مثال على البيانات

```json
{
  "content": [
    {
      "section_key": "hero_title",
      "title": "التطوع معنا",
      "subtitle": "كن جزءًا من فريقنا وساهم في صنع التغيير الإيجابي"
    },
    {
      "section_key": "why_title",
      "title": "لماذا التطوع معنا؟",
      "description": "التطوع هو فرصة رائعة..."
    }
  ],
  "benefits": [
    {
      "title": "أثر حقيقي",
      "description": "ساهم في تحسين حياة الآخرين",
      "icon_name": "Heart"
    }
  ],
  "opportunities": [
    {
      "title": "تنظيم الفعاليات الخيرية",
      "description": "المساعدة في تنظيم وإدارة الفعاليات",
      "duration": "10 ساعات/شهر",
      "icon_name": "Users"
    }
  ]
}
```

## التحقق من الصفحة العامة

افتح الصفحة العامة: `http://localhost:5173/volunteering`

ستجد:
- العنوان الرئيسي والفرعي (من CMS)
- قسم "لماذا التطوع" (من CMS)
- فوائد التطوع (من CMS)
- فرص التطوع المتاحة (من CMS)
- نموذج التطوع (ثابت حالياً)

---

✅ **صفحة التطوع جاهزة للاستخدام!**
