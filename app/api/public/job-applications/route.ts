import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Submit job application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job_id, name, email, phone, resume_url, cover_letter } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة: name, email' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const result = await pool.query(
      `INSERT INTO job_applications 
       (job_id, name, email, phone, resume_url, cover_letter, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [
        job_id || null,
        name,
        email,
        phone || null,
        resume_url || null,
        cover_letter || null,
      ]
    );

    return NextResponse.json({ 
      success: true,
      application: result.rows[0],
      message: 'تم إرسال طلب التوظيف بنجاح'
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error creating job application:', error);
    
    // If table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'جدول طلبات التوظيف غير موجود. يرجى تشغيل ملف SQL: admin-cms/database/create_job_tables.sql' },
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال طلب التوظيف', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
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
