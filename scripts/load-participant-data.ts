/**
 * Load Comprehensive Participant Data into Supabase
 *
 * This script loads the comprehensive dummy participant data from
 * supabase/seed-comprehensive-participants.sql into your Supabase database
 *
 * Usage:
 * npm run load-participants
 *
 * Or manually via Supabase SQL Editor:
 * 1. Go to https://supabase.com/dashboard
 * 2. Navigate to your project
 * 3. Click "SQL Editor"
 * 4. Copy and paste the contents of supabase/seed-comprehensive-participants.sql
 * 5. Click "Run"
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function loadParticipantData() {
  console.log('🚀 Loading comprehensive participant data into Supabase...\n')

  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'supabase', 'seed-comprehensive-participants.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    console.log('📄 SQL file loaded successfully')
    console.log('💡 NOTE: This script requires direct SQL execution.')
    console.log('\n📋 MANUAL STEPS REQUIRED:\n')
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Navigate to "SQL Editor" in the left sidebar')
    console.log('4. Create a new query')
    console.log('5. Copy and paste the contents of:')
    console.log(`   ${sqlPath}`)
    console.log('6. Click "Run" to execute\n')
    console.log('✅ This will create:')
    console.log('   - 12 participants in House 3 (3 high, 4 medium, 5 low risk)')
    console.log('   - 8 participants in House 1 (2 high, 3 medium, 3 low risk)')
    console.log('   - 8 participants in House 2 (1 high, 4 medium, 3 low risk)')
    console.log('   - Comprehensive support plans')
    console.log('   - Detailed behavior patterns')
    console.log('   - Medication schedules')
    console.log('\n🎉 Total: 28 realistic, comprehensive participants!\n')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

loadParticipantData()
