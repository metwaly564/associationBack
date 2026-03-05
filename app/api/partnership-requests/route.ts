import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [decoded.userId]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    return null;
  }
}

// GET - List partnership requests (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT pr.*, pt.title as partnership_type_title
      FROM partnership_requests pr
      LEFT JOIN partnership_types pt ON pr.partnership_type_id = pt.id
    `;
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE pr.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY pr.created_at DESC';

    const result = await pool.query(query, params);

    return NextResponse.json({
      requests: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching partnership requests:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        requests: [],
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب طلبات الشراكة' },
      { status: 500 }
    );
  }
}

// CORS headers for public API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// POST - Create partnership request (Public API)
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

    return NextResponse.json({ request: result.rows[0] }, {
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
