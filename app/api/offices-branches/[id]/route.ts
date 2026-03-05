import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single office/branch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM offices_branches WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'المكتب/الفرع غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      office: result.rows[0],
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching office/branch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المكتب/الفرع' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update office/branch
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, city, address, phone, email, map_embed_url, latitude, longitude, order_index, is_active } = body;

    const result = await pool.query(
      `UPDATE offices_branches 
       SET name = $1, city = $2, address = $3, phone = $4, email = $5, 
           map_embed_url = $6, latitude = $7, longitude = $8, 
           order_index = $9, is_active = $10, updated_at = NOW()
       WHERE id = $11
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
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'المكتب/الفرع غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ office: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating office/branch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المكتب/الفرع', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// DELETE - Delete office/branch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM offices_branches WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'المكتب/الفرع غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error deleting office/branch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المكتب/الفرع', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
