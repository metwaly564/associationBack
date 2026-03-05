import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? parseInt(pageParam, 10) : NaN;
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;
    const hasPagination = Number.isFinite(page) && page > 0 && Number.isFinite(limit) && limit > 0;

    if (hasPagination) {
      const offset = (page - 1) * limit;
      const [dataResult, countResult] = await Promise.all([
        pool.query('SELECT * FROM policies ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
        pool.query('SELECT COUNT(*)::int AS count FROM policies'),
      ]);
      const total = countResult.rows[0]?.count ?? 0;
      return NextResponse.json({ items: dataResult.rows, total, page, limit });
    }

    const result = await pool.query(
      'SELECT * FROM policies ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب السياسات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, file_url } = body;

    const result = await pool.query(
      `INSERT INTO policies (title, description, file_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, file_url]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating policy:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء السياسة' },
      { status: 500 }
    );
  }
}
