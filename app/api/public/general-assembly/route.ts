import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get general assembly content
export async function GET() {
  try {
    // Get page content
    let pageContent: any[] = [];
    try {
      const contentResult = await pool.query(
        'SELECT * FROM general_assembly_content WHERE is_active = true ORDER BY order_index ASC'
      );
      pageContent = contentResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching general assembly page content:', error);
      }
    }
    
    // Get assembly meetings
    let meetings: any[] = [];
    try {
      const meetingsResult = await pool.query(
        'SELECT id, title, description, meeting_date, file_url, file_name, meeting_number FROM assembly_meetings WHERE is_active = true ORDER BY meeting_date DESC, order_index ASC'
      );
      meetings = meetingsResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching assembly meetings:', error);
      }
    }
    
    // Get association members (from existing table)
    let members: any[] = [];
    try {
      const membersResult = await pool.query(
        'SELECT id, name, position, category, email, join_date, membership_number FROM association_members WHERE is_active = true ORDER BY membership_number ASC'
      );
      members = membersResult.rows;
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error fetching association members:', error);
      }
    }

    return NextResponse.json({
      content: pageContent,
      meetings: meetings,
      members: members,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public general assembly:', error);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب محتوى الجمعية العمومية', content: [], meetings: [], members: [] },
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
