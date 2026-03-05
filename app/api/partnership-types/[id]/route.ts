import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single partnership type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM partnership_types WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'نوع الشراكة غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      type: result.rows[0],
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching partnership type:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب نوع الشراكة' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update partnership type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, icon_name, color, benefits, order_index, is_active } = body;

    const result = await pool.query(
      `UPDATE partnership_types 
       SET title = $1, description = $2, icon_name = $3, color = $4, 
           benefits = $5, order_index = $6, is_active = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        title,
        description || null,
        icon_name || null,
        color || null,
        benefits || null,
        order_index || 0,
        is_active !== false,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'نوع الشراكة غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ type: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating partnership type:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث نوع الشراكة', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// DELETE - Delete partnership type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM partnership_types WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'نوع الشراكة غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error deleting partnership type:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف نوع الشراكة', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
