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
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const page = pageParam ? parseInt(pageParam, 10) : NaN;
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;
    const hasValidPagination =
      Number.isFinite(page) && page > 0 && Number.isFinite(limit) && limit > 0;

    const baseQuery = `
      SELECT 
        d.id,
        d.name,
        d.email,
        d.phone,
        COALESCE(SUM(CASE WHEN don.status = 'success' THEN don.amount ELSE 0 END), 0) as total_donated,
        COUNT(CASE WHEN don.status = 'success' THEN 1 END) as donations_count,
        d.created_at
      FROM donors d
      LEFT JOIN donations don ON (don.donor_email = d.email OR don.donor_phone = d.phone)
      GROUP BY d.id, d.name, d.email, d.phone, d.created_at
    `;

    if (hasValidPagination) {
      const offset = (page - 1) * limit;
      const pagedQuery = `${baseQuery} ORDER BY total_donated DESC LIMIT $1 OFFSET $2`;

      const [dataResult, countResult] = await Promise.all([
        pool.query(pagedQuery, [limit, offset]),
        pool.query('SELECT COUNT(*)::int AS count FROM donors'),
      ]);

      const total = countResult.rows[0]?.count ?? 0;

      return NextResponse.json({
        items: dataResult.rows,
        total,
        page,
        limit,
      });
    }

    const result = await pool.query(`${baseQuery} ORDER BY total_donated DESC`);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching donors:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المتبرعين' },
      { status: 500 }
    );
  }
}
