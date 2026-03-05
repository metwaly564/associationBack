import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List partnership types
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      `SELECT * FROM partnership_types 
       ORDER BY order_index ASC, title ASC`
    );

    return NextResponse.json({
      types: result.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching partnership types:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        types: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب أنواع الشراكة' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Create partnership type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, icon_name, color, benefits, order_index, is_active } = body;

    const result = await pool.query(
      `INSERT INTO partnership_types 
       (title, description, icon_name, color, benefits, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title,
        description || null,
        icon_name || null,
        color || null,
        benefits || null,
        order_index || 0,
        is_active !== false,
      ]
    );

    return NextResponse.json({ type: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error creating partnership type:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء نوع الشراكة', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
