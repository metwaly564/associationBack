# إضافة اسم الملف للتراخيص

## نظرة عامة

تم إضافة حقل `file_name` لجدول التراخيص لعرض اسم الملف في الواجهة الأمامية.

## الخطوات المطلوبة

### 1. تحديث قاعدة البيانات

قم بتشغيل ملف SQL التالي لإضافة حقل `file_name`:

```bash
psql -U postgres -d association_db -f admin-cms/database/add_file_name_to_licenses.sql
```

هذا سينشئ حقل `file_name` في جدول `licenses` ويحاول ملء القيم الموجودة تلقائياً من `file_url`.

### 2. الوصول إلى إدارة التراخيص

1. افتح لوحة التحكم: `http://localhost:3001`
2. انتقل إلى **التراخيص والاعتمادات** من القائمة الجانبية
3. يمكنك إضافة ترخيص جديد أو تعديل ترخيص موجود

### 3. استخدام حقل اسم الملف

عند إضافة أو تعديل ترخيص:
- **رابط الملف**: ارفع ملف أو أدخل رابط خارجي
- **اسم الملف**: سيتم ملؤه تلقائياً من رابط الملف، أو يمكنك إدخاله يدوياً

**ملاحظة**: إذا لم تقم بإدخال اسم الملف، سيتم استخراجه تلقائياً من رابط الملف عند الحفظ.

### 4. العرض في الواجهة الأمامية

في صفحة التراخيص (`/about-licenses`):
- سيظهر اسم الترخيص كعنوان رئيسي
- سيظهر اسم الملف أسفل العنوان (إن كان موجوداً)
- يمكن للمستخدمين النقر على البطاقة لفتح/تحميل الملف

## الملفات المحدثة

- `admin-cms/database/add_file_name_to_licenses.sql` - SQL script لإضافة الحقل
- `admin-cms/app/api/licenses/route.ts` - تحديث API لإنشاء ترخيص
- `admin-cms/app/api/licenses/[id]/route.ts` - تحديث API لتعديل ترخيص
- `admin-cms/app/api/public/licenses/route.ts` - API عام للتراخيص
- `admin-cms/app/licenses/page.tsx` - إضافة عمود اسم الملف في القائمة
- `admin-cms/app/licenses/new/page.tsx` - إضافة حقل اسم الملف في النموذج
- `admin-cms/app/licenses/[id]/page.tsx` - إضافة حقل اسم الملف في النموذج
- `src/lib/api.ts` - إضافة دالة `getLicenses()`
- `src/pages/about/Licenses.tsx` - تحديث الصفحة لقراءة البيانات من API وعرض اسم الملف

## API Endpoints

### Public API (للموقع العام)
```
GET /api/public/licenses
```

### Admin API (لإدارة التراخيص)
```
GET /api/licenses
POST /api/licenses
PUT /api/licenses/[id]
DELETE /api/licenses/[id]
```

## مثال على البيانات

```json
{
  "id": "uuid",
  "title": "ترخيص جمعية الطب المنزلي",
  "description": "وصف الترخيص",
  "file_url": "/uploads/license-2024.pdf",
  "file_name": "ترخيص_الجمعية_2024.pdf",
  "created_at": "2024-01-01T00:00:00Z"
}
```
