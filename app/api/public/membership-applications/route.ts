import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Submit membership application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      idNumber,
      membershipType,
      occupation,
      address,
      reason,
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !idNumber || !membershipType) {
      return NextResponse.json(
        { error: 'الرجاء ملء جميع الحقول المطلوبة' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...corsHeaders,
          },
        }
      );
    }

    // Insert application into database
    const result = await pool.query(
      `INSERT INTO membership_applications 
       (name, email, phone, id_number, membership_type, occupation, address, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING id, created_at`,
      [name, email, phone, idNumber, membershipType, occupation || null, address || null, reason || null]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'تم إرسال طلب العضوية بنجاح! سنتواصل معك قريبًا.',
        applicationId: result.rows[0].id,
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
    console.error('Error submitting membership application:', error);
    
    // Handle duplicate email or id_number if needed
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'تم إرسال طلب سابق بهذا البريد الإلكتروني أو رقم الهوية' },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...corsHeaders,
          },
        }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال طلب العضوية. الرجاء المحاولة مرة أخرى.' },
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
