import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single assembly meeting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM assembly_meetings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'اجتماع الجمعية العمومية غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ meeting: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching assembly meeting:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب اجتماع الجمعية العمومية' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update assembly meeting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, meeting_date, file_url, file_name, meeting_number, order_index, is_active } = body;

    const result = await pool.query(
      `UPDATE assembly_meetings 
       SET title = $1, description = $2, meeting_date = $3, file_url = $4, 
           file_name = $5, meeting_number = $6, order_index = $7, is_active = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        title,
        description,
        meeting_date || null,
        file_url || null,
        file_name || null,
        meeting_number || null,
        order_index || 0,
        is_active !== false,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'اجتماع الجمعية العمومية غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ meeting: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating assembly meeting:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث اجتماع الجمعية العمومية', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// DELETE - Delete assembly meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM assembly_meetings WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'اجتماع الجمعية العمومية غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error deleting assembly meeting:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف اجتماع الجمعية العمومية', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
