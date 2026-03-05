-- إنشاء جدول الاستبيانات
-- استخدم: psql -U postgres -d association_db -f admin-cms/database/create_feedback_surveys_table.sql

SET client_encoding TO 'UTF8';

-- جدول الاستبيانات
CREATE TABLE IF NOT EXISTS feedback_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_type VARCHAR(50) NOT NULL CHECK (survey_type IN ('employees', 'volunteers', 'donors', 'beneficiaries', 'stakeholders')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  relation VARCHAR(255),
  satisfaction INTEGER NOT NULL CHECK (satisfaction >= 1 AND satisfaction <= 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_type ON feedback_surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_created_at ON feedback_surveys(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_surveys_satisfaction ON feedback_surveys(satisfaction);

SELECT '✅ تم إنشاء جدول الاستبيانات بنجاح!' AS message;
