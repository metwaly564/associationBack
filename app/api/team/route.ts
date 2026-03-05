import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const page = pageParam ? parseInt(pageParam, 10) : NaN;
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;
    const hasValidPagination =
      Number.isFinite(page) && page > 0 && Number.isFinite(limit) && limit > 0;

    if (hasValidPagination) {
      const offset = (page - 1) * limit;

      const [dataResult, countResult] = await Promise.all([
        pool.query(
          'SELECT * FROM team_members ORDER BY order_index, created_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        ),
        pool.query('SELECT COUNT(*)::int AS count FROM team_members'),
      ]);

      const total = countResult.rows[0]?.count ?? 0;

      return NextResponse.json({
        items: dataResult.rows,
        total,
        page,
        limit,
      });
    }

    const result = await pool.query(
      'SELECT * FROM team_members ORDER BY order_index, created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب أعضاء الفريق' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      role,
      type,
      bio,
      image_url,
      order_index = 0,
    } = body;

    const result = await pool.query(
      `INSERT INTO team_members (name, role, type, bio, image_url, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, role, type, bio, image_url, order_index]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء عضو الفريق' },
      { status: 500 }
    );
  }
}
