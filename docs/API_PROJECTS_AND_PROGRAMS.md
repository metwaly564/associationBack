# API المشاريع والبرامج — للربط مع الفرونت

الـ Base URL للـ API (عدّل حسب بيئة السيرفر):
```
https://your-domain.com/api
```
أو للتطوير المحلي:
```
http://localhost:3000/api
```

---

## 0. API رفع الملف (للمرفق في المشروع)

يُستخدم لرفع ملف (PDF أو صورة) ثم وضع الرابط الناتج في حقل `file_url` عند إنشاء أو تعديل مشروع.

**الرابط:** `POST /api/upload`

**Headers:** لا تحتاج `Content-Type` — المتصفح يضع `multipart/form-data` تلقائياً.

**Body (FormData):**

| الحقل | النوع | مطلوب | الوصف |
|-------|--------|--------|--------|
| `file` | File | نعم | الملف (صورة أو PDF) |

**الصيغ المسموحة:** JPG, PNG, WebP, GIF, PDF  
**أقصى حجم:** 100 ميجابايت

**مثال من الفرونت (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', file); // file = input.files[0] أو من اختيار المستخدم

const res = await fetch('https://your-domain.com/api/upload', {
  method: 'POST',
  body: formData,
});

if (!res.ok) {
  const err = await res.json();
  throw new Error(err.error || 'فشل رفع الملف');
}

const data = await res.json();
// data.url   → الرابط الكامل للملف (تحطه في file_url عند إنشاء/تعديل المشروع)
// data.filename → اسم الملف المُخزَن
// data.size  → حجم الملف
// data.type  → نوع MIME
```

**استجابة ناجحة (200):**
```json
{
  "url": "https://your-domain.com/uploads/1734567890123-abc123.pdf",
  "filename": "1734567890123-abc123.pdf",
  "size": 102400,
  "type": "application/pdf"
}
```

**استخدام الرابط مع المشروع:**  
بعد الرفع، أرسل `data.url` في حقل `file_url` و (اختياري) `data.filename` أو اسم الملف الأصلي في `file_name` عند استدعاء `POST /api/projects` أو `PUT /api/projects/:id`.

**أخطاء:**
- `400`: لم يُرسل ملف، أو نوع غير مدعوم، أو حجم أكبر من 100MB — الرسالة في `error`.
- `500`: خطأ من السيرفر — راجع `error` و `details`.

---

## 1. جلب تصنيفات المشاريع (للقائمة عند الإضافة)

يُستخدم لملء قائمة التصنيف في نموذج "إضافة مشروع".

**الرابط:** `GET /api/project-categories`

**الاستجابة (200):**
```json
[
  {
    "id": "uuid",
    "name": "الرعاية الاجتماعية",
    "slug": "social-care",
    "description": "برامج ومشاريع الرعاية الاجتماعية",
    "color": "#10b981",
    "icon_name": null,
    "order_index": 1,
    "is_active": true,
    "created_at": "...",
    "updated_at": "..."
  }
]
```

---

## 2. إضافة مشروع / برنامج جديد

**الرابط:** `POST /api/projects`

**Headers:**
```
Content-Type: application/json
```
(إذا كان عندك مصادقة: `Authorization: Bearer <token>`)

**Body (JSON):**

| الحقل | النوع | مطلوب | الوصف |
|-------|--------|--------|--------|
| `title` | string | نعم | عنوان المشروع |
| `slug` | string | نعم | الرابط (فريد، مثال: `orphan-support`) |
| `short_description` | string | لا | وصف مختصر |
| `body` | string | لا | التفاصيل (نص أو HTML) |
| `category_id` | string (UUID) أو null | لا | معرّف التصنيف من `/api/project-categories` |
| `status` | string | لا | `ongoing` \| `upcoming` \| `completed` (الافتراضي: `ongoing`) |
| `location` | string | لا | الموقع / المدينة |
| `start_date` | string | لا | تاريخ البداية `YYYY-MM-DD` |
| `end_date` | string | لا | تاريخ النهاية `YYYY-MM-DD` |
| `show_on_home` | boolean | لا | إظهار في الرئيسية (الافتراضي: `false`) |
| `priority` | number | لا | أولوية العرض (الافتراضي: `0`) |
| `file_url` | string | لا | رابط الملف المرفق (بعد رفعه عبر `/api/upload`) |
| `file_name` | string | لا | اسم الملف للعرض |

**مثال طلب:**
```json
{
  "title": "برنامج الأيتام",
  "slug": "baramij-al-aytam",
  "short_description": "رعاية شاملة للأيتام تشمل الدعم المالي والتعليمي والنفسي.",
  "body": "<p>تفاصيل البرنامج...</p>",
  "category_id": "uuid-from-categories-api",
  "status": "ongoing",
  "location": "الرياض",
  "start_date": "2025-01-01",
  "end_date": null,
  "show_on_home": true,
  "priority": 5
}
```

**استجابة ناجحة (201):**
```json
{
  "id": "uuid",
  "title": "برنامج الأيتام",
  "slug": "baramij-al-aytam",
  "short_description": "...",
  "body": "...",
  "status": "ongoing",
  "category_id": "uuid",
  "start_date": "2025-01-01",
  "end_date": null,
  "location": "الرياض",
  "show_on_home": true,
  "priority": 5,
  "created_at": "...",
  "updated_at": "..."
}
```

**أخطاء:**
- `500`: خطأ من السيرفر — راجع `error` و `details` في الجسم.

---

## 3. قائمة المشاريع (اختياري للعرض)

**الرابط:** `GET /api/projects`

**الاستجابة (200):** مصفوفة مشاريع، كل عنصر يحتوي الحقول أعلاه + `category_name`, `category_slug`, `category_color` إذا كان مربوطاً بتصنيف.

---

## 4. مشروع واحد (للعرض أو التعديل)

**الرابط:** `GET /api/projects/:id`

**الاستجابة (200):** نفس شكل عنصر المشروع مع `category_name`, `category_slug`, `category_color`.

**أخطاء:** `404` إذا المشروع غير موجود.

---

## 5. تعديل مشروع

**الرابط:** `PUT /api/projects/:id`

**Body:** نفس حقول `POST /api/projects` (كلها اختيارية عدا ما تحتاج تغييره).

---

## 6. حذف مشروع

**الرابط:** `DELETE /api/projects/:id`

**الاستجابة (200):** `{ "ok": true }`

---

## ملاحظات للفرونت

- الـ **slug** يجب أن يكون فريداً؛ يمكن توليده من العنوان (إزالة مسافات، تحويل لعربي/إنجليزي حسب نظامك).
- **status**: `ongoing` = جارٍ، `upcoming` = قادم، `completed` = مكتمل.
- حقول الصور (صورة الغلاف، المعرض، المرفقات) موجودة في واجهة الإدارة لكن غير مخزنة في الـ API الحالي؛ إذا احتجتها لاحقاً يمكن إضافتها في الـ API.
