-- إنشاء جدول طلبات التطوع
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_volunteering_applications_table.sql

SET client_encoding TO 'UTF8';

-- جدول طلبات التطوع
CREATE TABLE IF NOT EXISTS volunteering_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  age INTEGER,
  education VARCHAR(100),
  experience TEXT,
  interest VARCHAR(255),
  availability VARCHAR(100),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_volunteering_applications_status ON volunteering_applications(status);
CREATE INDEX IF NOT EXISTS idx_volunteering_applications_created_at ON volunteering_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_volunteering_applications_email ON volunteering_applications(email);

SELECT '✅ تم إنشاء جدول طلبات التطوع بنجاح!' AS message;
