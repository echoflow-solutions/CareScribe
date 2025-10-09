#!/usr/bin/env node

/**
 * Migration runner script
 * Runs the draft_reports table migration on Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/002_draft_reports.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file:', migrationPath);
    console.log('🔗 Supabase URL:', supabaseUrl);
    console.log('\n📝 Executing SQL migration...\n');

    // Execute the SQL
    // Note: The anon key might not have permissions to run DDL
    // If this fails, we'll need to use the service_role key
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('\n💡 The anon key does not have permission to run migrations.');
      console.log('Please run the SQL manually in the Supabase dashboard:');
      console.log(`\n1. Go to: ${supabaseUrl.replace('https://', 'https://app.')}/project/_/sql`);
      console.log('2. Copy and paste the SQL from: supabase/migrations/002_draft_reports.sql');
      console.log('3. Click "Run"\n');
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('\nThe draft_reports table has been created.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 To run this migration manually:');
    console.log(`\n1. Go to: ${supabaseUrl.replace('https://', 'https://app.')}/project/_/sql`);
    console.log('2. Copy and paste the SQL from: supabase/migrations/002_draft_reports.sql');
    console.log('3. Click "Run"\n');
    process.exit(1);
  }
}

runMigration();
