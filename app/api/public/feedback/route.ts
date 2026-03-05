import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Submit feedback survey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { survey_type, name, email, relation, satisfaction, notes } = body;

    // Validate required fields
    if (!survey_type || !name || !satisfaction) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة: survey_type, name, satisfaction' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate survey_type
    const validTypes = ['employees', 'volunteers', 'donors', 'beneficiaries', 'stakeholders'];
    if (!validTypes.includes(survey_type)) {
      return NextResponse.json(
        { error: 'نوع الاستبيان غير صحيح' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate satisfaction (1-5)
    if (satisfaction < 1 || satisfaction > 5) {
      return NextResponse.json(
        { error: 'مستوى الرضا يجب أن يكون بين 1 و 5' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO feedback_surveys (survey_type, name, email, relation, satisfaction, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [survey_type, name, email || null, relation || null, satisfaction, notes || null]
    );

    return NextResponse.json(
      { 
        success: true,
        id: result.rows[0].id,
        message: 'تم إرسال الاستبيان بنجاح'
      },
      { 
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    
    // If table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'جدول الاستبيانات غير موجود. يرجى تشغيل ملف SQL: admin-cms/database/create_feedback_surveys_table.sql' },
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الاستبيان', details: error.message },
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
