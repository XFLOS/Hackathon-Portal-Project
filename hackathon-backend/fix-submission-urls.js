/**
 * Fix submission file URLs - replace broken Cloudinary URLs with working placeholder PDF
 * Run this script to update the database: node fix-submission-urls.js
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function fixSubmissionUrls() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('🔧 Connecting to database...');
    
    // Update submission URLs
    const updateResult = await pool.query(`
      UPDATE submissions 
      SET file_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      WHERE team_id IN (1, 2, 3) AND file_url LIKE '%cloudinary%';
    `);

    console.log(`✅ Updated ${updateResult.rowCount} submission(s)`);

    // Verify the update
    const verifyResult = await pool.query(`
      SELECT id, team_id, title, file_url 
      FROM submissions 
      WHERE team_id IN (1, 2, 3)
      ORDER BY team_id;
    `);

    console.log('\n📋 Current submissions:');
    verifyResult.rows.forEach(row => {
      console.log(`  Team ${row.team_id}: ${row.title}`);
      console.log(`    File: ${row.file_url}`);
    });

    console.log('\n✅ Fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing submission URLs:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixSubmissionUrls();
