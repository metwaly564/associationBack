# إصلاح الترميز وإضافة التصنيفات

## المشكلتان:

1. ❌ **التصنيفات غير موجودة في CMS** - الموقع العام يحتوي على تصنيفات (الفعاليات، البرامج، الإنجازات) لكن CMS لا يدعمها
2. ❌ **مشكلة الترميز العربي** - النصوص العربية تظهر كـ `ط¨ط±ظ†ط§ظ…ط¬ ط§ظ„ط£ظٹطھط§ظ…`

---

## الحلول المطبقة:

### 1. إضافة التصنيفات للأخبار ✅

#### أ) تحديث قاعدة البيانات:

```powershell
# تشغيل SQL لإضافة حقل category
psql -U postgres -d association_db -f admin-cms\database\add_category_to_news.sql
```

أو يدوياً:
```sql
ALTER TABLE news ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'events';
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
```

#### ب) تحديث Schema (للمستقبل):
تم تحديث `schema.sql` ليشمل حقل `category` تلقائياً.

### 2. إصلاح الترميز العربي ✅

#### أ) تحديث قاعدة البيانات:

```powershell
# تشغيل SQL لإصلاح الترميز
psql -U postgres -d association_db -f admin-cms\database\fix_encoding.sql
```

#### ب) تحديثات الكود:
- ✅ إضافة `charset=utf-8` في جميع API responses
- ✅ تعيين `client_encoding` في اتصال PostgreSQL
- ✅ إضافة meta charset في HTML

---

## الخطوات المطلوبة:

### 1. إضافة حقل category للأخبار الموجودة:

```powershell
cd "D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project"
psql -U postgres -d association_db -f admin-cms\database\add_category_to_news.sql
```

### 2. إصلاح الترميز:

```powershell
psql -U postgres -d association_db -f admin-cms\database\fix_encoding.sql
```

### 3. تحديث البيانات الموجودة (اختياري):

```sql
-- تحديث الأخبار الموجودة بإضافة تصنيفات
UPDATE news SET category = 'events' WHERE category IS NULL OR category = '';
```

### 4. إعادة تشغيل CMS:

```powershell
cd admin-cms
# أوقف التطبيق (Ctrl+C) ثم:
npm run dev
```

---

## ما تم تحديثه:

### في CMS:
- ✅ إضافة حقل "التصنيف" في صفحة إنشاء/تعديل الخبر
- ✅ عرض التصنيف في قائمة الأخبار
- ✅ دعم التصنيفات: الفعاليات، البرامج، الإنجازات

### في API:
- ✅ إضافة `category` في جميع endpoints
- ✅ إضافة `charset=utf-8` في جميع responses
- ✅ تعيين UTF-8 في اتصال قاعدة البيانات

### في الموقع العام:
- ✅ استخدام `category` من API
- ✅ التصنيفات تعمل بشكل صحيح

---

## بعد التطبيق:

1. **أعد تشغيل CMS** (أوقف وأعد التشغيل)
2. **افتح صفحة إنشاء خبر جديد**
3. **ستجد حقل "التصنيف"** مع الخيارات:
   - الفعاليات
   - البرامج
   - الإنجازات
4. **النصوص العربية ستظهر بشكل صحيح** ✅

---

## ملاحظات:

- إذا استمرت مشكلة الترميز، تأكد من أن قاعدة البيانات تستخدم UTF-8:
  ```sql
  SHOW server_encoding;  -- يجب أن يكون UTF8
  ```
- يمكنك تحديث الأخبار الموجودة يدوياً من CMS لإضافة التصنيفات
