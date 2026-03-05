import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List donation methods
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      `SELECT * FROM donation_methods 
       ORDER BY order_index ASC, name ASC`
    );

    return NextResponse.json({
      methods: result.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching donation methods:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        methods: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب طرق التبرع' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Create donation method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, type, account_number, account_name, bank_name, iban, swift_code,
      qr_code_url, icon_name, description, order_index, is_active 
    } = body;

    const result = await pool.query(
      `INSERT INTO donation_methods 
       (name, type, account_number, account_name, bank_name, iban, swift_code,
        qr_code_url, icon_name, description, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      ]
    );

    return NextResponse.json({ method: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error creating donation method:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء طريقة التبرع', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
