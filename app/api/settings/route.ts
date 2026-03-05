import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // Get user from database
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// GET - Get all site settings (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM site_settings ORDER BY category, order_index ASC'
    );

    return NextResponse.json({
      settings: result.rows,
    });
  } catch (error: any) {
    console.error('Error fetching site settings:', error);
    
    // If table doesn't exist, return empty structure
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        settings: [],
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب إعدادات الموقع', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update site settings (Admin only)
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'الرجاء إرسال قائمة الإعدادات' },
        { status: 400 }
      );
    }

    // Update each setting
    console.log('🔄 Updating settings:', settings.length, 'settings');
    for (const setting of settings) {
      if (!setting.setting_key) continue;

      console.log(`📝 Processing setting: ${setting.setting_key} = ${setting.setting_value} (${setting.setting_type})`);

      const checkResult = await pool.query(
        'SELECT id FROM site_settings WHERE setting_key = $1',
        [setting.setting_key]
      );

      if (checkResult.rows.length > 0) {
        // Update existing setting
        console.log(`✅ Updating existing setting: ${setting.setting_key}`);
        await pool.query(
          `UPDATE site_settings
           SET setting_value = $1, setting_type = $2, description = $3,
               category = $4, order_index = $5, updated_at = NOW()
           WHERE setting_key = $6`,
          [
            setting.setting_value || null,
            setting.setting_type || 'text',
            setting.description || null,
            setting.category || 'general',
            setting.order_index || 0,
            setting.setting_key,
          ]
        );
      } else {
        // Insert new setting
        console.log(`🆕 Inserting new setting: ${setting.setting_key}`);
        await pool.query(
          `INSERT INTO site_settings
           (setting_key, setting_value, setting_type, description, category, order_index)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            setting.setting_key,
            setting.setting_value || null,
            setting.setting_type || 'text',
            setting.description || null,
            setting.category || 'general',
            setting.order_index || 0,
          ]
        );
      }
    }

    console.log('✅ All settings updated successfully');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث إعدادات الموقع', details: error.message },
      { status: 500 }
    );
  }
}
