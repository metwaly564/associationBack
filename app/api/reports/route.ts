import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET - Get all reports (Admin only)
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
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? parseInt(pageParam, 10) : NaN;
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;
    const hasPagination = Number.isFinite(page) && page > 0 && Number.isFinite(limit) && limit > 0;

    if (hasPagination) {
      const offset = (page - 1) * limit;
      const [dataResult, countResult] = await Promise.all([
        pool.query(
          'SELECT * FROM reports ORDER BY year DESC NULLS LAST, created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        ),
        pool.query('SELECT COUNT(*)::int AS count FROM reports'),
      ]);
      const total = countResult.rows[0]?.count ?? 0;
      return NextResponse.json({ items: dataResult.rows, total, page, limit });
    }

    const result = await pool.query(
      'SELECT * FROM reports ORDER BY year DESC NULLS LAST, created_at DESC'
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    // if the table doesn't exist create it and return empty list
    if (error.code === '42P01') {
      try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS reports (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title VARCHAR(500) NOT NULL,
            description TEXT,
            file_url VARCHAR(500),
            year INTEGER,
            type VARCHAR(50),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )`
        );
        console.warn('Reports table was missing; created automatically.');
        return NextResponse.json([]);
      } catch (innerError) {
        console.error('Error creating reports table on the fly:', innerError);
      }
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التقارير', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create report (Admin only)
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
    const { title, description, file_url, year, type } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'الرجاء إدخال العنوان' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO reports (title, description, file_url, year, type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description || null, file_url || null, year || null, type || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating report:', error);
    if (error.code === '42P01') {
      // missing table – create it and ask caller to retry
      try {
        await pool.query(
          `CREATE TABLE IF NOT EXISTS reports (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title VARCHAR(500) NOT NULL,
            description TEXT,
            file_url VARCHAR(500),
            year INTEGER,
            type VARCHAR(50),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )`
        );
        console.warn('Reports table was missing; created automatically on POST.');
        return NextResponse.json(
          { error: 'تم إنشاء جدول التقارير تلقائياً، يرجى إعادة المحاولة' },
          { status: 500 }
        );
      } catch (inner) {
        console.error('Error creating reports table on POST:', inner);
      }
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء التقرير', details: error.message },
      { status: 500 }
    );
  }
}
