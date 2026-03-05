import { Pool } from 'pg';

// Create a connection pool with UTF-8 encoding
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'association_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Force UTF-8 encoding
  options: '-c client_encoding=UTF8',
});

// Set client encoding to UTF-8 for every connection
pool.on('connect', async (client) => {
  try {
    await client.query("SET client_encoding TO 'UTF8'");
  } catch (error) {
    console.error('Error setting encoding:', error);
  }
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

export default pool;
