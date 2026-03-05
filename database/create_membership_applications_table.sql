-- إنشاء جدول طلبات العضوية
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_membership_applications_table.sql

SET client_encoding TO 'UTF8';

-- جدول طلبات العضوية
CREATE TABLE IF NOT EXISTS membership_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  id_number VARCHAR(50) NOT NULL,
  membership_type VARCHAR(50) NOT NULL,
  occupation VARCHAR(255),
  address TEXT,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_membership_applications_email ON membership_applications(email);
CREATE INDEX IF NOT EXISTS idx_membership_applications_created_at ON membership_applications(created_at DESC);

SELECT '✅ تم إنشاء جدول طلبات العضوية بنجاح!' AS message;
