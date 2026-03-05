import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List financial statements
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      'SELECT * FROM financial_statements ORDER BY year DESC, order_index ASC, created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching financial statements:', error);
    
    // If table doesn't exist, return empty array
    if (error.code === '42P01') {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب القوائم المالية' },
      { status: 500 }
    );
  }
}

// POST - Create financial statement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, file_url, file_name, year, type, order_index, is_active } = body;

    const result = await pool.query(
      `INSERT INTO financial_statements (title, description, file_url, file_name, year, type, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        description,
        file_url,
        file_name,
        year,
        type || 'statement',
        order_index || 0,
        is_active !== false,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating financial statement:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء القائمة المالية' },
      { status: 500 }
    );
  }
}
