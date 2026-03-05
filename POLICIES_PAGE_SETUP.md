# إعداد صفحة السياسات

## نظرة عامة

تم تحديث نظام إدارة صفحة السياسات (الأنظمة واللوائح والسياسات) ليشمل إدارة محتوى الصفحة من CMS. الآن يمكنك تعديل محتوى الصفحة وعرض السياسات مباشرة من لوحة التحكم.

## الخطوات المطلوبة

### 1. إنشاء الجدول في قاعدة البيانات

قم بتشغيل ملف SQL التالي:

```bash
psql -U postgres -d association_db -f admin-cms/database/create_policies_page_table.sql
```

هذا سينشئ الجدول التالي:
- `policies_page_content` - محتوى أقسام الصفحة (Hero section)

**ملاحظة:** جدول `policies` موجود بالفعل في قاعدة البيانات.

### 2. الوصول إلى صفحة الإدارة

1. افتح لوحة التحكم: `http://localhost:3001`
2. من القائمة الجانبية، اختر **"الأنظمة واللوائح والسياسات"** (ضمن قسم الحوكمة)
3. ستجد تبويبين:
   - **"قائمة السياسات"** - لإدارة السياسات (CRUD)
   - **"محتوى الصفحة"** - لإدارة محتوى الصفحة (Hero section)

## الأقسام القابلة للتعديل

### 1. قسم Hero
- العنوان الرئيسي
- العنوان الفرعي

### 2. قائمة السياسات
يمكنك إضافة/تعديل/حذف السياسات:
- اسم السياسة/اللائحة
- الوصف (اختياري)
- رابط الملف (PDF أو صورة)
- رفع ملف مباشر

## ملاحظات مهمة

1. **الحفظ**: بعد تعديل محتوى الصفحة، اضغط على زر **"حفظ التغييرات"** في تبويب "محتوى الصفحة".

2. **السياسات**: يمكنك إضافة سياسات جديدة من زر **"إضافة لائحة"** في تبويب "قائمة السياسات".

3. **الملفات**: يمكنك رفع ملفات PDF أو صور للسياسات، أو إدخال رابط مباشر للملف.

## API Endpoints

### Public API (للموقع العام)
```
GET /api/public/policies
```
يرجع:
```json
{
  "policies": [...],
  "content": [...]
}
```

### Admin API (لإدارة المحتوى)
```
GET /api/policies-page
PUT /api/policies-page
```

### Admin API (لإدارة السياسات)
```
GET /api/policies
POST /api/policies
GET /api/policies/[id]
PUT /api/policies/[id]
DELETE /api/policies/[id]
```

## الملفات المحدثة

- `admin-cms/database/create_policies_page_table.sql` - SQL script لإنشاء جدول محتوى الصفحة
- `admin-cms/app/api/policies-page/route.ts` - API لإدارة محتوى الصفحة
- `admin-cms/app/api/public/policies/route.ts` - Public API للسياسات ومحتوى الصفحة
- `admin-cms/app/policies/page.tsx` - تحديث صفحة CMS لتشمل تبويب محتوى الصفحة
- `admin-cms/lib/apiClient.ts` - إضافة وظائف `getPoliciesPageContent()` و `updatePoliciesPageContent()`
- `src/lib/api.ts` - إضافة وظيفة `getPolicies()`
- `src/pages/governance/Policies.tsx` - تحديث الصفحة لاستخدام المحتوى من API

## مثال على البيانات

```json
{
  "policies": [
    {
      "id": "uuid",
      "title": "لائحة الحوكمة",
      "description": "لائحة تحدد قواعد الحوكمة في الجمعية",
      "file_url": "https://example.com/policy.pdf",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "content": [
    {
      "section_key": "hero_title",
      "title": "الأنظمة واللوائح والسياسات",
      "subtitle": "نؤمن بالشفافية والحوكمة الرشيدة في جميع أعمالنا"
    }
  ]
}
```

## التحقق من الصفحة العامة

افتح الصفحة العامة: `http://localhost:5173/governance/policies`

ستجد:
- العنوان الرئيسي والفرعي (من CMS)
- قائمة السياسات مع إمكانية عرض/تحميل الملفات

---

✅ **صفحة السياسات جاهزة للاستخدام!**
