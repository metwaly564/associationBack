import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - List jobs (Admin only)
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

    const result = await pool.query(
      `SELECT j.*, COUNT(ja.id) as applications_count
       FROM jobs j
       LEFT JOIN job_applications ja ON j.id = ja.job_id
       GROUP BY j.id
       ORDER BY j.order_index ASC, j.created_at DESC`
    );

    return NextResponse.json({
      jobs: result.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        jobs: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الوظائف' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Create job (Admin only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { 
      title, department, location, employment_type, description, 
      requirements, responsibilities, benefits, salary_range, 
      application_deadline, order_index, is_active 
    } = body;

    const result = await pool.query(
      `INSERT INTO jobs 
       (title, department, location, employment_type, description, requirements, 
        responsibilities, benefits, salary_range, application_deadline, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        title,
        department || null,
        location || null,
        employment_type || 'full-time',
        description || null,
        requirements || null,
        responsibilities || null,
        benefits || null,
        salary_range || null,
        application_deadline || null,
        order_index || 0,
        is_active !== false,
      ]
    );

    return NextResponse.json({ job: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الوظيفة', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
