import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// CORS headers for public endpoints
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

// GET - List job applications (Admin only)
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
    const jobId = searchParams.get('job_id');
    const status = searchParams.get('status');

    let query = `
      SELECT ja.*, j.title as job_title
      FROM job_applications ja
      LEFT JOIN jobs j ON ja.job_id = j.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (jobId) {
      conditions.push(`ja.job_id = $${params.length + 1}`);
      params.push(jobId);
    }
    
    if (status) {
      conditions.push(`ja.status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY ja.created_at DESC';

    const result = await pool.query(query, params);

    return NextResponse.json({
      applications: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching job applications:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        applications: [],
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب طلبات التوظيف' },
      { status: 500 }
    );
  }
}

// POST - Create job application (Public API)
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
