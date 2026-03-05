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

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

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
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const page = pageParam ? parseInt(pageParam, 10) : NaN;
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;
    const hasValidPagination =
      Number.isFinite(page) && page > 0 && Number.isFinite(limit) && limit > 0;

    // Extract donation_method_id from notes and join with donation_methods to get the name
    let baseQuery = `
      SELECT 
        d.*,
        (
          SELECT name 
          FROM donation_methods 
          WHERE d.notes LIKE '%طريقة التبرع: %' 
            AND regexp_match(d.notes, 'طريقة التبرع: ([a-f0-9-]{36})') IS NOT NULL
            AND id::text = (regexp_match(d.notes, 'طريقة التبرع: ([a-f0-9-]{36})'))[1]
          LIMIT 1
        ) as donation_method_name
      FROM donations d
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      baseQuery += ` WHERE d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const orderClause = ' ORDER BY d.created_at DESC';

    if (hasValidPagination) {
      const offset = (page - 1) * limit;

      const pagedQuery = `${baseQuery}${orderClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const [dataResult, countResult] = await Promise.all([
        pool.query(pagedQuery, params),
        pool.query(
          `SELECT COUNT(*)::int AS count FROM donations d${status ? ' WHERE d.status = $1' : ''}`,
          status ? [status] : []
        ),
      ]);

      const total = countResult.rows[0]?.count ?? 0;

      return NextResponse.json(dataResult.rows.length ? {
        items: dataResult.rows,
        total,
        page,
        limit,
      } : { items: [], total: 0, page, limit });
    }

    const fullQuery = `${baseQuery}${orderClause}`;
    const result = await pool.query(fullQuery, params);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching donations:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التبرعات' },
      { status: 500 }
    );
  }
}
