import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List operational budgets
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      `SELECT * FROM operational_budgets 
       ORDER BY year DESC, order_index ASC, created_at DESC`
    );

    return NextResponse.json(result.rows, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching operational budgets:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json([], {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الخطط التشغيلية والموازنات' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

function jsonResponse(data: object, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

// POST - Create operational budget
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch (_e) {
    return jsonResponse(
      { error: 'طلب غير صالح', details: 'يجب إرسال JSON صحيح' },
      400
    );
  }

  if (!body || typeof body !== 'object') {
    return jsonResponse(
      { error: 'طلب غير صالح', details: 'الجسم فارغ أو غير صحيح' },
      400
    );
  }

  const { title, description, file_url, file_name, year, type, order_index, is_active } = body as Record<string, unknown>;

  if (!title || String(title).trim() === '') {
    return jsonResponse({ error: 'العنوان مطلوب', details: 'title مطلوب' }, 400);
  }

  try {
    const result = await pool.query(
      `INSERT INTO operational_budgets 
       (title, description, file_url, file_name, year, type, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        String(title).trim(),
        description ?? null,
        file_url ?? null,
        file_name ?? null,
        year ?? null,
        type ?? 'plan',
        order_index ?? 0,
        is_active !== false,
      ]
    );

    return jsonResponse(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating operational budget:', error);

    const code = error?.code;
    const details = error?.message || String(error);

    if (code === '42P01') {
      return jsonResponse(
        {
          error: 'جدول الخطة التشغيلية غير موجود',
          details: 'شغّل في قاعدة البيانات: psql -U postgres -d association_db -f database/create_operational_budget_tables.sql',
        },
        500
      );
    }

    if (code === '42883') {
      return jsonResponse(
        {
          error: 'الدالة uuid_generate_v4 غير متوفرة',
          details: 'شغّل أولاً: CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; ثم ملف create_operational_budget_tables.sql',
        },
        500
      );
    }

    return jsonResponse(
      {
        error: 'حدث خطأ أثناء إنشاء الخطة/الموازنة',
        details: details,
      },
      500
    );
  }
}
