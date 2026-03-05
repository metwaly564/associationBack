import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List offices/branches
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      `SELECT * FROM offices_branches 
       ORDER BY order_index ASC, city ASC, name ASC`
    );

    return NextResponse.json({
      offices: result.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching offices/branches:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        offices: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المكاتب والفروع' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Create office/branch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, city, address, phone, email, map_embed_url, latitude, longitude, order_index, is_active } = body;

    const result = await pool.query(
      `INSERT INTO offices_branches 
       (name, city, address, phone, email, map_embed_url, latitude, longitude, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        city,
        address,
        phone || null,
        email || null,
        map_embed_url || null,
        latitude || null,
        longitude || null,
        order_index || 0,
        is_active !== false,
      ]
    );

    return NextResponse.json({ office: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error creating office/branch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المكتب/الفرع', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
