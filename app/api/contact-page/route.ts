import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get contact page content
export async function GET(request: NextRequest) {
  try {
    // Get content sections
    const contentResult = await pool.query(
      'SELECT * FROM contact_page_content WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get contact info
    const infoResult = await pool.query(
      'SELECT * FROM contact_info WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get working hours
    const hoursResult = await pool.query(
      'SELECT * FROM contact_working_hours ORDER BY order_index ASC'
    );

    return NextResponse.json({
      content: contentResult.rows,
      contactInfo: infoResult.rows,
      workingHours: hoursResult.rows,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching contact page content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
        contactInfo: [],
        workingHours: [],
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة التواصل' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update contact page content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, contactInfo, workingHours } = body;

    // Update or insert content sections
    if (content) {
      for (const item of content) {
        if (!item.section_key) continue;
        
        const checkResult = await pool.query(
          'SELECT id FROM contact_page_content WHERE section_key = $1',
          [item.section_key]
        );
        
        if (checkResult.rows.length > 0) {
          await pool.query(
            `UPDATE contact_page_content 
             SET title = $1, subtitle = $2, description = $3, content = $4, 
                 order_index = $5, is_active = $6, updated_at = NOW()
             WHERE section_key = $7`,
            [
              item.title,
              item.subtitle,
              item.description,
              item.content,
              item.order_index || 0,
              item.is_active !== false,
              item.section_key,
            ]
          );
        } else {
          await pool.query(
            `INSERT INTO contact_page_content 
             (section_key, title, subtitle, description, content, order_index, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              item.section_key,
              item.title,
              item.subtitle,
              item.description,
              item.content,
              item.order_index || 0,
              item.is_active !== false,
            ]
          );
        }
      }
    }

    // Delete and recreate contact info
    if (contactInfo) {
      await pool.query('DELETE FROM contact_info');
      for (const info of contactInfo) {
        await pool.query(
          `INSERT INTO contact_info (info_type, label, value, icon_name, order_index, is_active, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            info.info_type,
            info.label,
            info.value,
            info.icon_name,
            info.order_index || 0,
            info.is_active !== false,
            info.metadata ? JSON.stringify(info.metadata) : null,
          ]
        );
      }
    }

    // Delete and recreate working hours
    if (workingHours) {
      await pool.query('DELETE FROM contact_working_hours');
      for (const hour of workingHours) {
        await pool.query(
          `INSERT INTO contact_working_hours (day_label, time_range, is_closed, order_index)
           VALUES ($1, $2, $3, $4)`,
          [
            hour.day_label,
            hour.time_range,
            hour.is_closed || false,
            hour.order_index || 0,
          ]
        );
      }
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error updating contact page content:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث محتوى صفحة التواصل', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
