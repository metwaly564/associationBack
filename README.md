# جمعية الرعاية الخيرية - لوحة التحكم 📊

نظام إدارة محتوى شامل مبني بـ Next.js لإدارة موقع الجمعية.

## 🚀 الميزات

- 🔐 **نظام مصادقة آمن**: JWT مع حماية متقدمة
- 📝 **إدارة محتوى شاملة**: أخبار، صفحات، مشاريع، فريق العمل
- 🎨 **نظام تخصيص متقدم**: ألوان، خطوط، شعار، إعدادات
- 📁 **رفع ملفات آمن**: صور، PDF مع فلترة وتحقق
- 📊 **إحصائيات شاملة**: تحليلات الاستبيانات والتبرعات
- 🌐 **API موثق**: نقاط نهاية RESTful

## 📋 المتطلبات

- Node.js 18+
- PostgreSQL 12+
- npm أو yarn

## 🗄️ قاعدة البيانات

### إعداد PostgreSQL
```bash
# إنشاء قاعدة البيانات
createdb association_db

# تشغيل المخطط
psql -U postgres -d association_db -f database/schema.sql

# إضافة البيانات الأولية
psql -U postgres -d association_db -f database/seed.sql
```

## 🔧 التثبيت والتشغيل

```bash
# استنساخ المشروع
git clone https://github.com/yourusername/association-backend.git
cd association-backend

# تثبيت التبعيات
npm install

# إنشاء مستخدم إداري
npm run create-admin

# تشغيل المشروع محلياً
npm run dev
```

## 🔐 إعداد متغيرات البيئة

أنشئ ملف `.env.local`:

```env
# قاعدة البيانات
DB_HOST=localhost
DB_PORT=5432
DB_NAME=association_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secret (32 حرف على الأقل)
JWT_SECRET=your-very-secure-secret-key-change-this-in-production-minimum-32-characters-long

# URLs للواجهة الأمامية
NEXT_PUBLIC_BASE_URL=https://your-frontend-domain.com
NEXT_PUBLIC_API_BASE=/api
```

## 📁 هيكل المشروع

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # مصادقة المستخدمين
│   │   ├── settings/      # إعدادات الموقع
│   │   ├── news/          # إدارة الأخبار
│   │   ├── upload/        # رفع الملفات
│   │   └── ...
│   ├── settings/          # صفحة الإعدادات
│   └── dashboard/         # لوحة التحكم
├── components/            # المكونات المشتركة
│   ├── AdminLayout.tsx    # تخطيط لوحة الإدارة
│   ├── ImageInput.tsx     # رفع الصور
│   └── ColorPicker.tsx    # اختيار الألوان
├── database/              # ملفات قاعدة البيانات
│   ├── schema.sql         # هيكل الجداول
│   ├── seed.sql           # البيانات الأولية
│   └── add_color_settings_to_site_settings.sql
├── lib/                   # المساعدات
│   ├── db.ts              # اتصال قاعدة البيانات
│   ├── apiClient.ts       # عميل API
│   └── validators.ts      # التحقق من البيانات
└── public/                # الملفات الثابتة
    └── uploads/           # الملفات المرفوعة
```

## 🎨 نظام التخصيص

### الإعدادات المتاحة:
- **30 إعداد متنوع** للموقع
- **17 لون** للتخصيص الكامل
- **13 خط** وأحجام متنوعة
- **شعار وصور** قابلة للرفع
- **نصوص ورسائل** قابلة للتخصيص

### كيفية الوصول:
```bash
# اذهب للإعدادات
http://localhost:3001/settings

# سجل دخول
admin@example.com / admin123
```

## 🚀 النشر

### Vercel (موصى به)
```bash
npm i -g vercel
vercel

# متغيرات البيئة في Vercel:
DB_HOST=your_postgres_host
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=your_database_name
JWT_SECRET=your_secure_jwt_secret
```

### Railway
```bash
# ربط قاعدة بيانات PostgreSQL
# إعداد متغيرات البيئة
# نشر تلقائي من GitHub
```

### PlanetScale + Vercel
```bash
# قاعدة بيانات PlanetScale
# نشر Vercel للـ API
# ربط مع الفرونت اند
```

## 🔒 الأمان

- **JWT Authentication** مع انتهاء صلاحية
- **SQL Injection Protection** مع prepared statements
- **File Upload Security** مع فلترة الأنواع
- **CORS Configuration** للواجهات الأمامية
- **Input Validation** على جميع المدخلات

## 📊 الإحصائيات والتقارير

- **إحصائيات الاستبيانات**: رضا الموظفين/المتطوعين/المتبرعين
- **إحصائيات التبرعات**: حسب النوع والمبلغ
- **إحصائيات المحتوى**: مشاهدات الأخبار والصفحات

## 🔄 API Endpoints

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - بيانات المستخدم الحالي

### الإعدادات
- `GET /api/settings` - جلب الإعدادات
- `PUT /api/settings` - تحديث الإعدادات
- `GET /api/public/settings` - الإعدادات العامة

### رفع الملفات
- `POST /api/upload` - رفع ملف
- `GET /api/uploads/[filename]` - عرض ملف مرفوع

### إدارة المحتوى
- `GET|POST /api/news` - الأخبار
- `GET|POST /api/pages` - الصفحات
- `GET|POST /api/projects` - المشاريع
- `GET|POST /api/team` - فريق العمل

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# اختبار API
npm run test:api

# اختبار قاعدة البيانات
npm run test:db
```

## 📈 المراقبة

- **Health Check**: `GET /api/health`
- **Database Status**: فحص اتصال قاعدة البيانات
- **Memory Usage**: مراقبة استهلاك الذاكرة
- **API Response Times**: سرعة الاستجابة

## 🚨 استكشاف الأخطاء

### قاعدة البيانات لا تعمل؟
```bash
# فحص الاتصال
psql -U postgres -d association_db -c "SELECT 1;"

# تشغيل الـ migrations
npm run migrate
```

### API لا يعمل؟
```bash
# فحص السجلات
npm run logs

# فحص متغيرات البيئة
npm run env:check
```

### رفع الملفات لا يعمل؟
```bash
# فحص مجلد uploads
ls -la public/uploads/

# فحص صلاحيات
chmod 755 public/uploads/
```

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch جديد
3. Commit التغييرات
4. Push للـ branch
5. إنشاء Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

---

**🚀 لوحة تحكم قوية ومرنة لإدارة المحتوى!**