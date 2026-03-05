import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single committee with members and tasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const committeeResult = await pool.query(
      'SELECT * FROM committees WHERE id = $1',
      [id]
    );

    if (committeeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'اللجنة غير موجودة' },
        { status: 404 }
      );
    }

    const committee = committeeResult.rows[0];

    // Get members
    const membersResult = await pool.query(
      'SELECT * FROM committee_members WHERE committee_id = $1 ORDER BY order_index ASC, name ASC',
      [id]
    );

    // Get tasks
    const tasksResult = await pool.query(
      'SELECT * FROM committee_tasks WHERE committee_id = $1 ORDER BY order_index ASC',
      [id]
    );

    return NextResponse.json({
      committee: {
        ...committee,
        members: membersResult.rows,
        tasks: tasksResult.rows,
      },
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching committee:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب اللجنة' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update committee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, type, icon_name, order_index, is_active, members, tasks } = body;

    // Update committee (with constraint-fix retry)
    const execUpdate = async () => {
      return await pool.query(
        `UPDATE committees 
         SET name = $1, description = $2, type = $3, icon_name = $4, 
             order_index = $5, is_active = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [
          name,
          description || null,
          type || 'permanent',
          icon_name || null,
          order_index || 0,
          is_active !== false,
          id,
        ]
      );
    };

    let result;
    try {
      result = await execUpdate();
    } catch (err: any) {
      if (err.code === '23514' && err.constraint === 'committees_type_check') {
        console.warn('Fixing outdated type constraint during update');
        await pool.query(`ALTER TABLE committees DROP CONSTRAINT IF EXISTS committees_type_check`);
        await pool.query(`ALTER TABLE committees ADD CONSTRAINT committees_type_check CHECK (type IN ('permanent','temporary','both'))`);
        result = await execUpdate();
      } else {
        throw err;
      }
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'اللجنة غير موجودة' },
        { status: 404 }
      );
    }

    // Update members if provided
    if (members !== undefined) {
      await pool.query('DELETE FROM committee_members WHERE committee_id = $1', [id]);
      for (const member of members) {
        await pool.query(
          `INSERT INTO committee_members 
           (committee_id, name, role, position, order_index, is_active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            id,
            member.name,
            member.role || null,
            member.position || null,
            member.order_index || 0,
            member.is_active !== false,
          ]
        );
      }
    }

    // Update tasks if provided
    if (tasks !== undefined) {
      await pool.query('DELETE FROM committee_tasks WHERE committee_id = $1', [id]);
      for (const task of tasks) {
        await pool.query(
          `INSERT INTO committee_tasks 
           (committee_id, task_text, order_index, is_active)
           VALUES ($1, $2, $3, $4)`,
          [
            id,
            task.task_text,
            task.order_index || 0,
            task.is_active !== false,
          ]
        );
      }
    }

    return NextResponse.json({ committee: result.rows[0] }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating committee:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث اللجنة', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// DELETE - Delete committee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      'DELETE FROM committees WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'اللجنة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error deleting committee:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف اللجنة', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
