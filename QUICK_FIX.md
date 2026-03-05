# إصلاح سريع - التصنيفات والترميز

## الخطوات السريعة:

### 1. إضافة حقل category للأخبار:

```powershell
cd "D:\My Documents\DIT Tech\موقع الجمعية ابو بسام\project"
psql -U postgres -d association_db -f admin-cms\database\add_category_to_news.sql
```

### 2. إصلاح الترميز:

```powershell
psql -U postgres -d association_db -f admin-cms\database\fix_encoding.sql
```

### 3. إعادة تشغيل CMS:

```powershell
cd admin-cms
# أوقف التطبيق (Ctrl+C) ثم:
npm run dev
```

---

## النتيجة:

✅ **التصنيفات متاحة الآن** في صفحة إنشاء/تعديل الخبر:
- الفعاليات
- البرامج  
- الإنجازات

✅ **الترميز العربي يعمل بشكل صحيح** - النصوص تظهر بشكل سليم

---

## ملاحظة:

إذا كانت هناك أخبار موجودة بدون تصنيف، يمكنك تحديثها من CMS يدوياً.
