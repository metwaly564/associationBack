import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      'SELECT * FROM org_structure ORDER BY order_index, created_at'
    );
    
    return NextResponse.json({ items: result.rows });
  } catch (error: any) {
    console.error('Error fetching org structure:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الهيكل التنظيمي' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'يجب إرسال مصفوفة من العناصر' },
        { status: 400 }
      );
    }

    // Delete all existing items
    await pool.query('DELETE FROM org_structure');

    // Insert new items
    const insertedItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const result = await pool.query(
        `INSERT INTO org_structure (title, description, order_index)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [item.title, item.description, i]
      );
      insertedItems.push(result.rows[0]);
    }

    return NextResponse.json({ items: insertedItems }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving org structure:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الهيكل التنظيمي' },
      { status: 500 }
    );
  }
}
