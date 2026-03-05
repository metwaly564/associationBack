import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Get all feedback surveys (Admin only)
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const surveyType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = 'SELECT * FROM feedback_surveys';
    const params: any[] = [];
    
    if (surveyType) {
      query += ' WHERE survey_type = $1';
      params.push(surveyType);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM feedback_surveys';
    const countParams: any[] = [];
    if (surveyType) {
      countQuery += ' WHERE survey_type = $1';
      countParams.push(surveyType);
    }
    const countResult = await pool.query(countQuery, countParams);

    return NextResponse.json({
      surveys: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error fetching feedback surveys:', error);
    
    // If table doesn't exist
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'جدول الاستبيانات غير موجود. يرجى تشغيل ملف SQL: admin-cms/database/create_feedback_surveys_table.sql' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الاستبيانات', details: error.message },
      { status: 500 }
    );
  }
}
