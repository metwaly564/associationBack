import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get site settings
export async function GET() {
  try {
    console.log('📖 Public API: Fetching site settings...');
    const result = await pool.query(
      'SELECT setting_key, setting_value, setting_type FROM site_settings ORDER BY category, order_index ASC'
    );

    console.log(`📊 Found ${result.rows.length} settings in database`);

    // Convert to object format for easier access
    const settings: Record<string, any> = {};
    result.rows.forEach((row: any) => {
      settings[row.setting_key] = {
        value: row.setting_value,
        type: row.setting_type,
      };
      console.log(`🔍 Setting: ${row.setting_key} = ${row.setting_value} (${row.setting_type})`);
    });

    console.log('✅ Public API: Settings fetched successfully');

    return NextResponse.json({
      settings,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public site settings:', error);
    
    // If table doesn't exist, return empty structure
    if (error.code === '42P01') {
      return NextResponse.json({
        settings: {},
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      });
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب إعدادات الموقع', settings: {} },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders,
        },
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
