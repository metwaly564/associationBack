# إعداد صفحة القوائم والتقارير المالية

## نظرة عامة

تم إنشاء نظام إدارة صفحة القوائم والتقارير المالية من CMS. الآن يمكنك إدارة وعرض القوائم والتقارير المالية مباشرة من لوحة التحكم.

## الخطوات المطلوبة

### 1. إنشاء الجداول في قاعدة البيانات

قم بتشغيل ملف SQL التالي:

```bash
psql -U postgres -d association_db -f admin-cms/database/create_financial_statements_table.sql
```

هذا سينشئ الجداول التالية:
- `financial_statements` - القوائم والتقارير المالية
- `financial_statements_page_content` - محتوى أقسام الصفحة (Hero section)

### 2. الوصول إلى صفحة الإدارة

1. افتح لوحة التحكم: `http://localhost:3001`
2. من القائمة الجانبية، اختر **"الحوكمة"** ثم **"القوائم والتقارير المالية"**
3. ستجد تبويبين:
   - **"قائمة القوائم المالية"** - لإدارة القوائم والتقارير (CRUD)
   - **"محتوى الصفحة"** - لإدارة محتوى الصفحة (Hero section)

## الأقسام القابلة للتعديل

### 1. قسم Hero
- العنوان الرئيسي
- العنوان الفرعي

### 2. قائمة القوائم المالية
يمكنك إضافة/تعديل/حذف القوائم والتقارير المالية:
- العنوان
- الوصف (اختياري)
- السنة (مطلوبة)
- النوع (قائمة مالية / تقرير مالي)
- رابط الملف (PDF) أو رفع ملف مباشر
- اسم الملف (اختياري - يتم استخراجه تلقائياً)
- ترتيب العرض
- الحالة (نشط/غير نشط)

## ملاحظات مهمة

1. **الحفظ**: بعد تعديل محتوى الصفحة، اضغط على زر **"حفظ التغييرات"** في تبويب "محتوى الصفحة".

2. **القوائم المالية**: يمكنك إضافة قوائم مالية جديدة من زر **"إضافة قائمة مالية"** في تبويب "قائمة القوائم المالية".

3. **الملفات**: يمكنك رفع ملفات PDF للقوائم والتقارير المالية، أو إدخال رابط مباشر للملف.

4. **السنة**: يجب تحديد السنة لكل قائمة مالية لعرضها بشكل منظم حسب السنوات.

5. **النوع**: يمكنك تصنيف كل عنصر كـ "قائمة مالية" أو "تقرير مالي".

## API Endpoints

### Public API (للموقع العام)
```
GET /api/public/financial-statements
```
يرجع:
```json
{
  "statements": [...],
  "content": [...]
}
```

### Admin API (لإدارة المحتوى)
```
GET /api/financial-statements-page
PUT /api/financial-statements-page
```

### Admin API (لإدارة القوائم المالية)
```
GET /api/financial-statements
POST /api/financial-statements
GET /api/financial-statements/[id]
PUT /api/financial-statements/[id]
DELETE /api/financial-statements/[id]
```

## الملفات المحدثة

- `admin-cms/database/create_financial_statements_table.sql` - SQL script لإنشاء الجداول
- `admin-cms/app/api/financial-statements/route.ts` - API لإدارة القوائم المالية (GET, POST)
- `admin-cms/app/api/financial-statements/[id]/route.ts` - API لإدارة قائمة مالية واحدة (GET, PUT, DELETE)
- `admin-cms/app/api/financial-statements-page/route.ts` - API لإدارة محتوى الصفحة
- `admin-cms/app/api/public/financial-statements/route.ts` - Public API
- `admin-cms/app/governance/financial-statements/page.tsx` - صفحة إدارة القوائم المالية في CMS
- `admin-cms/app/governance/financial-statements/new/page.tsx` - صفحة إنشاء قائمة مالية
- `admin-cms/app/governance/financial-statements/[id]/page.tsx` - صفحة تعديل قائمة مالية
- `admin-cms/lib/apiClient.ts` - إضافة وظائف `getFinancialStatementsPageContent()` و `updateFinancialStatementsPageContent()`
- `src/lib/api.ts` - إضافة وظيفة `getFinancialStatements()`
- `src/pages/governance/FinancialStatements.tsx` - تحديث الصفحة لاستخدام المحتوى من API

## مثال على البيانات

```json
{
  "statements": [
    {
      "id": "uuid",
      "title": "القائمة المالية لعام 2024",
      "description": "القائمة المالية السنوية للجمعية",
      "file_url": "https://example.com/financial-2024.pdf",
      "file_name": "financial-2024.pdf",
      "year": 2024,
      "type": "statement",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "content": [
    {
      "section_key": "hero_title",
      "title": "القوائم والتقارير المالية",
      "subtitle": "نؤمن بالشفافية والمساءلة في جميع أعمالنا المالية"
    }
  ]
}
```

## التحقق من الصفحة العامة

افتح الصفحة العامة: `http://localhost:5173/governance/financial-statements`

ستجد:
- العنوان الرئيسي والفرعي (من CMS)
- قائمة القوائم والتقارير المالية مجمعة حسب السنوات (من CMS)
- إمكانية عرض/تحميل الملفات

---

✅ **صفحة القوائم والتقارير المالية جاهزة للاستخدام!**
