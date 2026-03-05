import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List committees
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      `SELECT c.*, 
       COUNT(DISTINCT cm.id) as members_count,
       COUNT(DISTINCT ct.id) as tasks_count
       FROM committees c
       LEFT JOIN committee_members cm ON c.id = cm.committee_id AND cm.is_active = true
       LEFT JOIN committee_tasks ct ON c.id = ct.committee_id AND ct.is_active = true
       GROUP BY c.id
       ORDER BY c.order_index ASC, c.name ASC`
    );

    return NextResponse.json({
      committees: result.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching committees:', error);
    
    if (error.code === '42P01') {
      return NextResponse.json({
        committees: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب اللجان', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST - Create committee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, icon_name, order_index, is_active } = body;

    const execInsert = async () => {
      return await pool.query(
        `INSERT INTO committees 
         (name, description, type, icon_name, order_index, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          name,
          description || null,
          type || 'permanent',
          icon_name || null,
          order_index || 0,
          is_active !== false,
        ]
      );
    };

    try {
      const result = await execInsert();
      return NextResponse.json({ committee: result.rows[0] }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    } catch (err: any) {
      // if check constraint failure on type, fix constraint and retry
      if (err.code === '23514' && err.constraint === 'committees_type_check') {
        console.warn('Detected outdated type constraint, updating.');
        await pool.query(`ALTER TABLE committees DROP CONSTRAINT IF EXISTS committees_type_check`);
        await pool.query(`ALTER TABLE committees ADD CONSTRAINT committees_type_check CHECK (type IN ('permanent','temporary','both'))`);
        const result2 = await execInsert();
        return NextResponse.json({ committee: result2.rows[0] }, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        });
      }
      throw err;
    }
  } catch (error: any) {
    console.error('Error creating committee:', error);
    // include PG details if available
    const resp: any = { error: 'حدث خطأ أثناء إنشاء اللجنة' };
    if (error.message) resp.details = error.message;
    if (error.detail) resp.details = resp.details ? resp.details + ' - ' + error.detail : error.detail;
    return NextResponse.json(
      resp,
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
