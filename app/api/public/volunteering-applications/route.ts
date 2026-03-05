import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// POST - Submit volunteering application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      age,
      education,
      experience,
      interest,
      availability,
      message,
    } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'الرجاء إدخال الاسم والبريد الإلكتروني ورقم الجوال' },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...corsHeaders,
          },
        }
      );
    }

    // Insert application
    const result = await pool.query(
      `INSERT INTO volunteering_applications 
       (name, email, phone, age, education, experience, interest, availability, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING id`,
      [name, email, phone, age || null, education || null, experience || null, interest || null, availability || null, message || null]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'تم إرسال طلبك بنجاح! سنتواصل معك قريبًا.',
        id: result.rows[0].id,
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error submitting volunteering application:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.' },
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
