import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Public API - Get feedback statistics
export async function GET() {
  try {
    // Get statistics by type
    const statsByType = await pool.query(
      `SELECT 
        survey_type,
        COUNT(*) as count,
        AVG(satisfaction) as avg_satisfaction,
        MIN(satisfaction) as min_satisfaction,
        MAX(satisfaction) as max_satisfaction
       FROM feedback_surveys
       GROUP BY survey_type
       ORDER BY survey_type`
    );

    // Get satisfaction distribution
    const satisfactionDistribution = await pool.query(
      `SELECT 
        satisfaction,
        COUNT(*) as count
       FROM feedback_surveys
       GROUP BY satisfaction
       ORDER BY satisfaction`
    );

    // Get total count
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM feedback_surveys');
    const total = parseInt(totalResult.rows[0].total);

    // Format statistics
    const stats = {
      total,
      byType: statsByType.rows.map((row: any) => ({
        type: row.survey_type,
        count: parseInt(row.count),
        avgSatisfaction: parseFloat(row.avg_satisfaction).toFixed(2),
        minSatisfaction: parseInt(row.min_satisfaction),
        maxSatisfaction: parseInt(row.max_satisfaction),
      })),
      satisfactionDistribution: satisfactionDistribution.rows.map((row: any) => ({
        level: parseInt(row.satisfaction),
        count: parseInt(row.count),
      })),
    };

    return NextResponse.json(stats, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Error fetching feedback statistics:', error);
    
    // If table doesn't exist, return empty stats
    if (error.code === '42P01') {
      return NextResponse.json(
        {
          total: 0,
          byType: [],
          satisfactionDistribution: [],
        },
        {
          headers: corsHeaders,
        }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب إحصائيات الاستبيانات' },
      { 
        status: 500,
        headers: corsHeaders,
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
