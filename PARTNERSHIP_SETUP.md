# إعداد صفحة الشراكة

## نظرة عامة

تم إنشاء نظام إدارة صفحة **الشراكة** التي تحتوي على:
- **معلومات عن الشراكة** (Hero section ونص تمهيدي)
- **أنواع الشراكة** (قابلة للتعديل)
- **نموذج طلب الشراكة**
- **إدارة طلبات الشراكة**

## الخطوات

### 1. إنشاء الجداول في قاعدة البيانات

قم بتشغيل ملف SQL التالي:

```powershell
psql -U postgres -d association_db -f admin-cms/database/create_partnership_tables.sql
```

هذا سينشئ الجداول التالية:
- `partnership_types` - أنواع الشراكة
- `partnership_requests` - طلبات الشراكة
- `partnership_page_content` - محتوى الصفحة (Hero section ونص تمهيدي)

### 2. الوصول إلى صفحة الإدارة

1. سجّل الدخول إلى CMS: `http://localhost:3001`
2. من القائمة الجانبية، اختر **"الشراكة"**
3. ستجد تبويبات:
   - **أنواع الشراكة** - لإدارة أنواع الشراكة (CRUD)
   - **طلبات الشراكة** - لعرض طلبات الشراكة المستلمة
   - **محتوى الصفحة** - لإدارة Hero section والنص التمهيدي

### 3. إدارة المحتوى

#### محتوى الصفحة
- **Hero Section:**
  - العنوان الرئيسي
  - العنوان الفرعي
  - الحالة (نشط/غير نشط)
- **النص التمهيدي:**
  - النص التمهيدي
  - الحالة (نشط/غير نشط)
- **قسم "لماذا الشراكة معنا؟":**
  - العنوان
  - الوصف
- **نموذج التقديم:**
  - عنوان النموذج
  - نص النموذج

#### إدارة أنواع الشراكة
- يمكنك إضافة/تعديل/حذف أنواع الشراكة
- كل نوع يحتوي على:
  - العنوان
  - الوصف
  - اسم الأيقونة (اختياري)
  - اللون (اختياري)
  - المزايا
  - الترتيب
  - الحالة (نشط/غير نشط)

## الأقسام القابلة للتعديل

### 1. Hero Section
- العنوان الرئيسي
- العنوان الفرعي
- الحالة

### 2. النص التمهيدي
- النص التمهيدي
- الحالة

### 3. أنواع الشراكة
- العنوان
- الوصف
- الأيقونة
- اللون
- المزايا
- الترتيب
- الحالة

## الملفات المحدثة/المضافة

### قاعدة البيانات
- `admin-cms/database/create_partnership_tables.sql` - جداول الشراكة

### API Routes
- `admin-cms/app/api/partnership-types/route.ts` - API لإدارة أنواع الشراكة (GET, POST)
- `admin-cms/app/api/partnership-types/[id]/route.ts` - API لإدارة نوع واحد (GET, PUT, DELETE)
- `admin-cms/app/api/partnership-requests/route.ts` - API لإدارة طلبات الشراكة
- `admin-cms/app/api/partnership-requests/[id]/route.ts` - API لإدارة طلب واحد
- `admin-cms/app/api/partnership-page/route.ts` - API لإدارة محتوى الصفحة
- `admin-cms/app/api/public/partnership/route.ts` - Public API

### CMS Pages
- `admin-cms/app/partnership/page.tsx` - صفحة إدارة الشراكة
- `admin-cms/app/partnership/types/new/page.tsx` - صفحة إضافة نوع شراكة جديد
- `admin-cms/app/partnership/types/[id]/page.tsx` - صفحة تعديل نوع شراكة

### Frontend
- `admin-cms/lib/apiClient.ts` - إضافة وظائف API لمحتوى الصفحة
- `src/lib/api.ts` - إضافة `getPartnership()` و `submitPartnershipRequest()`
- `src/pages/membership/Partnership.tsx` - تحديث صفحة الواجهة الأمامية
- `admin-cms/components/AdminLayout.tsx` - إضافة رابط الشراكة

## استخدام الصفحة

بعد إتمام الإعداد، يمكن الوصول إلى صفحة الشراكة من الموقع العام عبر:
- الرابط: `/membership-partnership` (حسب التوجيه في `App.tsx`)

الصفحة تعرض تلقائياً:
- Hero section مع العنوان والعنوان الفرعي
- النص التمهيدي
- قسم "لماذا الشراكة معنا؟"
- أنواع الشراكة المتاحة مع:
  - الأيقونة واللون
  - العنوان والوصف
  - المزايا
- نموذج طلب الشراكة مع:
  - معلومات المنظمة
  - معلومات الاتصال
  - نوع الشراكة المطلوبة
  - وصف المنظمة
  - مقترح الشراكة

## ملاحظات مهمة

1. **طلبات الشراكة:** يتم حفظ جميع طلبات الشراكة في جدول `partnership_requests` ويمكن عرضها من تبويب "طلبات الشراكة" في CMS.
2. **أنواع الشراكة:** يمكن إضافة أنواع شراكة متعددة مع أيقونات وألوان مختلفة.
3. **الترتيب:** يتم ترتيب أنواع الشراكة باستخدام `order_index`.
4. **الألوان:** يمكن استخدام ألوان من Tailwind CSS (emerald, blue, purple, amber, etc.).
5. **الأيقونات:** يمكن استخدام أيقونات من Lucide React (Handshake, DollarSign, Code, Users, etc.).
