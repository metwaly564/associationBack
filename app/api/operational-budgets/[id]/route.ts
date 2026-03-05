import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single operational budget
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM operational_budgets WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الخطة/الموازنة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching operational budget:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الخطة/الموازنة' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update operational budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, file_url, file_name, year, type, order_index, is_active } = body;

    const result = await pool.query(
      `UPDATE operational_budgets 
       SET title = $1, description = $2, file_url = $3, file_name = $4, 
           year = $5, type = $6, order_index = $7, is_active = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description || null,
        file_url || null,
        file_name || null,
        year || null,
        type || 'plan',
        order_index || 0,
        is_active !== false,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الخطة/الموازنة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating operational budget:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الخطة/الموازنة', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// DELETE - Delete operational budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM operational_budgets WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الخطة/الموازنة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error deleting operational budget:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الخطة/الموازنة', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
