import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Submit partnership request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      partnership_type_id, organization_name, contact_name, email, phone, 
      website, organization_type, description, partnership_proposal 
    } = body;

    // Validate required fields
    if (!organization_name || !contact_name || !email) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة: organization_name, contact_name, email' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const result = await pool.query(
      `INSERT INTO partnership_requests 
       (partnership_type_id, organization_name, contact_name, email, phone, 
        website, organization_type, description, partnership_proposal, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING *`,
      [
        partnership_type_id || null,
        organization_name,
        contact_name,
        email,
        phone || null,
        website || null,
        organization_type || null,
        description || null,
        partnership_proposal || null,
      ]
    );

    return NextResponse.json({ 
      success: true,
      request: result.rows[0],
      message: 'تم إرسال طلب الشراكة بنجاح'
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error creating partnership request:', error);
    
    // If table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'جدول طلبات الشراكة غير موجود. يرجى تشغيل ملف SQL: admin-cms/database/create_partnership_tables.sql' },
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال طلب الشراكة', details: error.message },
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
