import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Check if DATABASE_URL is configured
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('<')) {
  console.warn('⚠️  WARNING: DATABASE_URL is not properly configured in .env file');
  console.warn('⚠️  Please update .env with your actual Neon PostgreSQL credentials');
  console.warn('⚠️  Database operations will fail until this is fixed\n');
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/hackathon',
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to query the database
export const query = (text, params) => pool.query(text, params);

// Export the pool as default
export default pool;
