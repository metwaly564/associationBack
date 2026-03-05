import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single donation method
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'SELECT * FROM donation_methods WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'طريقة التبرع غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      method: result.rows[0],
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching donation method:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب طريقة التبرع' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update donation method
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, type, account_number, account_name, bank_name, iban, swift_code,
      qr_code_url, icon_name, description, order_index, is_active 
    } = body;

    const result = await pool.query(
      `UPDATE donation_methods 
       SET name = $1, type = $2, account_number = $3, account_name = $4, 
           bank_name = $5, iban = $6, swift_code = $7, qr_code_url = $8,
           icon_name = $9, description = $10, order_index = $11, is_active = $12, updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [
        name,
        type || 'bank',
        account_number || null,
        account_name || null,
        bank_name || null,
        iban || null,
        swift_code || null,
        qr_code_url || null,
        icon_name || null,
        description || null,
        order_index || 0,
        is_active !== false,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'طريقة التبرع غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ method: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating donation method:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث طريقة التبرع', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// DELETE - Delete donation method
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM donation_methods WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'طريقة التبرع غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error deleting donation method:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف طريقة التبرع', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
