import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single annual report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM annual_reports WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'التقرير السنوي غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      report: result.rows[0],
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching annual report:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب التقرير السنوي' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update annual report
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, year, file_url, file_name, cover_image_url, order_index, is_active } = body;

    const result = await pool.query(
      `UPDATE annual_reports 
       SET title = $1, description = $2, year = $3, file_url = $4, file_name = $5,
           cover_image_url = $6, order_index = $7, is_active = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description || null,
        year,
        file_url || null,
        file_name || null,
        cover_image_url || null,
        order_index || 0,
        is_active !== false,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'التقرير السنوي غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ report: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating annual report:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث التقرير السنوي', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// DELETE - Delete annual report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM annual_reports WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'التقرير السنوي غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error deleting annual report:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف التقرير السنوي', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
