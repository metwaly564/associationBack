# حل مشكلة حذف منتج التبرع

## المشكلة:
عند محاولة حذف منتج تبرع، يظهر الخطأ:
```
فشل حذف منتج التبرع: حدث خطأ أثناء حذف منتج التبرع
```

## السبب:
قاعدة البيانات تحتوي على قيد مفتاح أجنبي (Foreign Key Constraint) يمنع حذف منتج إذا كان هناك تبرعات مرتبطة به، دون تحديد ما يجب فعله بهذه التبرعات.

## الحل:

### الخطوة 1: تشغيل SQL للإصلاح

افتح `psql` وتصل لقاعدة البيانات:

```powershell
psql -U postgres -d association_db
```

ثم شغل الأمر التالي (أو افتح الملف [fix_donations_constraint.sql](fix_donations_constraint.sql)):

```sql
-- Drop the existing constraint
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_product_id_fkey;

-- Add the corrected constraint with ON DELETE SET NULL
ALTER TABLE donations 
ADD CONSTRAINT donations_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES donation_products(id) ON DELETE SET NULL;
```

### الخطوة 2: اختبار الحذف

جرب حذف منتج تبرع الآن - يجب أن يعمل بدون مشاكل!

## التأثير:

- ✅ **يمكنك حذف منتج التبرع** حتى لو كانت هناك تبرعات مرتبطة به
- ✅ **التبرعات السابقة** ستبقى في قاعدة البيانات (للمرجعية والإحصائيات)
- ✅ **حقل product_id** سيصبح `NULL` للتبرعات المرتبطة بالمنتج المحذوف

## الملفات المعدلة:

1. [/database/schema.sql](/database/schema.sql) - مُحدّث ليشمل `ON DELETE SET NULL`
2. [/database/fix_donations_constraint.sql](/database/fix_donations_constraint.sql) - سكريبت الإصلاح
