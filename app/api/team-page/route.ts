import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get team page content
export async function GET(request: NextRequest) {
  try {
    // Get content sections
    const contentResult = await pool.query(
      'SELECT * FROM team_page_content WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get hero images
    const heroImagesResult = await pool.query(
      'SELECT * FROM team_page_hero_images WHERE is_active = true ORDER BY order_index ASC'
    );
    
    // Get executive director info
    const executiveResult = await pool.query(
      'SELECT * FROM team_page_executive_director WHERE is_active = true LIMIT 1'
    );

    return NextResponse.json({
      content: contentResult.rows,
      heroImages: heroImagesResult.rows,
      executiveDirector: executiveResult.rows[0] || null,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error fetching team page content:', error);
    
    // If tables don't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        content: [],
        heroImages: [],
        executiveDirector: null,
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى صفحة فريق العمل' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// PUT - Update team page content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, heroImages, executiveDirector } = body;

    // Update or insert content sections
    if (content) {
      for (const item of content) {
        if (!item.section_key) continue;
        
        // Check if section exists
        const checkResult = await pool.query(
          'SELECT id FROM team_page_content WHERE section_key = $1',
          [item.section_key]
        );
        
        if (checkResult.rows.length > 0) {
          // Update existing
          await pool.query(
            `UPDATE team_page_content 
             SET title = $1, subtitle = $2, description = $3, content = $4, 
                 image_url = $5, order_index = $6, is_active = $7, 
                 metadata = $8, updated_at = NOW()
             WHERE section_key = $9`,
            [
              item.title,
              item.subtitle,
              item.description,
              item.content,
              item.image_url,
              item.order_index || 0,
              item.is_active !== false,
              item.metadata ? JSON.stringify(item.metadata) : null,
              item.section_key,
            ]
          );
        } else {
          // Insert new
          await pool.query(
            `INSERT INTO team_page_content 
             (section_key, title, subtitle, description, content, image_url, order_index, is_active, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              item.section_key,
              item.title,
              item.subtitle,
              item.description,
              item.content,
              item.image_url,
              item.order_index || 0,
              item.is_active !== false,
              item.metadata ? JSON.stringify(item.metadata) : null,
            ]
          );
        }
      }
    }

    // Delete and recreate hero images
    if (heroImages) {
      await pool.query('DELETE FROM team_page_hero_images');
      for (const image of heroImages) {
        await pool.query(
          `INSERT INTO team_page_hero_images (image_url, order_index, is_active)
           VALUES ($1, $2, $3)`,
          [
            image.image_url,
            image.order_index || 0,
            image.is_active !== false,
          ]
        );
      }
    }

    // Update or insert executive director
    if (executiveDirector) {
      const checkResult = await pool.query(
        'SELECT id FROM team_page_executive_director LIMIT 1'
      );
      
      if (checkResult.rows.length > 0) {
        // Update existing
        await pool.query(
          `UPDATE team_page_executive_director 
           SET name = $1, title = $2, email = $3, phone = $4, image_url = $5,
               period_from = $6, period_to = $7, qualification = $8, 
               description = $9, is_active = $10, updated_at = NOW()`,
          [
            executiveDirector.name,
            executiveDirector.title,
            executiveDirector.email,
            executiveDirector.phone,
            executiveDirector.image_url,
            executiveDirector.period_from,
            executiveDirector.period_to,
            executiveDirector.qualification,
            executiveDirector.description,
            executiveDirector.is_active !== false,
          ]
        );
      } else {
        // Insert new
        await pool.query(
          `INSERT INTO team_page_executive_director 
           (name, title, email, phone, image_url, period_from, period_to, qualification, description, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            executiveDirector.name,
            executiveDirector.title,
            executiveDirector.email,
            executiveDirector.phone,
            executiveDirector.image_url,
            executiveDirector.period_from,
            executiveDirector.period_to,
            executiveDirector.qualification,
            executiveDirector.description,
            executiveDirector.is_active !== false,
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
    console.error('Error updating team page content:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث محتوى صفحة فريق العمل', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}
