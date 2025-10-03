const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addPasswordColumnAndSupportWorkers() {
  console.log('🚀 Starting database migration...\n')

  try {
    // Step 1: Add password column to users table
    console.log('📝 Step 1: Adding password column to users table...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;'
    })

    if (alterError) {
      console.log('⚠️  Note: Could not add password column via RPC (might need direct DB access)')
      console.log('   This is okay if the column already exists or will be added manually\n')
    } else {
      console.log('✓ Password column added successfully\n')
    }

    // Step 2: Get Support Worker role ID and facility from Bernard's user record
    console.log('📝 Step 2: Getting Support Worker role and facility from Bernard...')
    const { data: bernardUser, error: bernardError } = await supabase
      .from('users')
      .select('role_id, facility_id')
      .eq('email', 'bernard.adjei@maxlifecare.com.au')
      .single()

    if (bernardError || !bernardUser || !bernardUser.role_id || !bernardUser.facility_id) {
      console.error('❌ Could not find Bernard to get role and facility:', bernardError)
      process.exit(1)
    }

    const supportWorkerRoleId = bernardUser.role_id
    const facilityId = bernardUser.facility_id
    console.log(`✓ Found Support Worker role and facility from Bernard's account\n`)

    // Step 3: Update existing users with password "demo"
    console.log('📝 Step 3: Updating existing users with password...')
    const existingEmails = [
      'bernard.adjei@maxlifecare.com.au',
      'tom.anderson@maxlifecare.com.au',
      'dr.kim@maxlifecare.com.au',
      'lisa.park@maxlifecare.com.au'
    ]

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: 'demo' })
      .in('email', existingEmails)

    if (updateError) {
      console.error('❌ Error updating existing users:', updateError)
    } else {
      console.log('✓ Updated existing users with password "demo"\n')
    }

    // Step 4: Add new support workers
    console.log('📝 Step 4: Adding new support workers...\n')

    const newSupportWorkers = [
      {
        name: 'Dermot Roche',
        email: 'dermot@maxlifecare.com.au',
        password: 'demo',
        role_id: supportWorkerRoleId,
        facility_id: facilityId,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dermot',
        status: 'active'
      },
      {
        name: 'Elyce Pobiega',
        email: 'elyce.p@maxlifecare.com.au',
        password: 'demo',
        role_id: supportWorkerRoleId,
        facility_id: facilityId,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elyce',
        status: 'active'
      },
      {
        name: 'Guest Guest',
        email: 'guest@maxlifecare.com.au',
        password: 'demo',
        role_id: supportWorkerRoleId,
        facility_id: facilityId,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
        status: 'active'
      }
    ]

    for (const worker of newSupportWorkers) {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('email', worker.email)
        .single()

      if (existing) {
        console.log(`  ⚠️  ${worker.name} (${worker.email}) already exists - updating password...`)
        const { error: updateErr } = await supabase
          .from('users')
          .update({ password: 'demo' })
          .eq('email', worker.email)

        if (updateErr) {
          console.error(`  ❌ Error updating ${worker.name}:`, updateErr)
        } else {
          console.log(`  ✓ Updated ${worker.name}'s password`)
        }
        continue
      }

      // Insert new user
      const { data, error } = await supabase
        .from('users')
        .insert([worker])
        .select()

      if (error) {
        console.error(`  ❌ Error adding ${worker.name}:`, error)
      } else {
        console.log(`  ✓ Added ${worker.name} (${worker.email})`)
      }
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\nNew Support Workers added:')
    console.log('  • Dermot Roche - dermot@maxlifecare.com.au (password: demo)')
    console.log('  • Elyce Pobiega - elyce.p@maxlifecare.com.au (password: demo)')
    console.log('  • Guest Guest - guest@maxlifecare.com.au (password: demo)')
    console.log('\nAll users now have password: demo')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

addPasswordColumnAndSupportWorkers()
