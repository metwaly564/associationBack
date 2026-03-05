import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get all about page sections
export async function GET(request: NextRequest) {
  try {
    // Get sections (vision, mission)
    const sectionsResult = await pool.query(
      'SELECT * FROM about_sections WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get goals
    const goalsResult = await pool.query(
      'SELECT * FROM about_goals WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get values
    let valuesResult: any = { rows: [] };
    try {
      valuesResult = await pool.query(
        'SELECT * FROM about_values WHERE is_active = true ORDER BY order_index ASC'
      );
    } catch (error: any) {
      // If table doesn't exist, continue without values
      if (error.code !== '42P01') {
        console.error('Error fetching about values:', error);
      }
    }

    return NextResponse.json({
      sections: sectionsResult.rows,
      goals: goalsResult.rows,
      values: valuesResult.rows || [],
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching about sections:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        sections: [],
        goals: [],
        values: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب أقسام صفحة "من نحن"' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update about page sections
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections, goals, values } = body;

    // Update or insert sections
    if (sections) {
      for (const section of sections) {
        if (!section.section_key) continue;
        
        // Check if section exists
        const checkResult = await pool.query(
          'SELECT id FROM about_sections WHERE section_key = $1',
          [section.section_key]
        );
        
        if (checkResult.rows.length > 0) {
          // Update existing
          await pool.query(
            `UPDATE about_sections 
             SET title = $1, content = $2, icon_name = $3, order_index = $4, 
                 is_active = $5, metadata = $6, updated_at = NOW()
             WHERE section_key = $7`,
            [
              section.title,
              section.content,
              section.icon_name,
              section.order_index || 0,
              section.is_active !== false,
              section.metadata ? JSON.stringify(section.metadata) : null,
              section.section_key,
            ]
          );
        } else {
          // Insert new
          await pool.query(
            `INSERT INTO about_sections 
             (section_key, title, content, icon_name, order_index, is_active, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              section.section_key,
              section.title,
              section.content,
              section.icon_name,
              section.order_index || 0,
              section.is_active !== false,
              section.metadata ? JSON.stringify(section.metadata) : null,
            ]
          );
        }
      }
    }

    // Delete and recreate goals
    if (goals) {
      await pool.query('DELETE FROM about_goals');
      for (const goal of goals) {
        await pool.query(
          `INSERT INTO about_goals (title, order_index, is_active)
           VALUES ($1, $2, $3)`,
          [goal.title, goal.order_index || 0, goal.is_active !== false]
        );
      }
    }

    // Delete and recreate values
    if (values) {
      try {
        await pool.query('DELETE FROM about_values');
        for (const value of values) {
          await pool.query(
            `INSERT INTO about_values (title, description, icon_name, order_index, is_active)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              value.title,
              value.description,
              value.icon_name,
              value.order_index || 0,
              value.is_active !== false,
            ]
          );
        }
      } catch (error: any) {
        // If table doesn't exist, skip values
        if (error.code !== '42P01') {
          throw error;
        }
      }
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating about sections:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث أقسام صفحة "من نحن"', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
