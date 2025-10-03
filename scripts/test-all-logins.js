const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAllLogins() {
  console.log('🧪 Testing all user logins...\n')

  const testUsers = [
    { email: 'bernard.adjei@maxlifecare.com.au', name: 'Bernard Adjei', password: 'demo' },
    { email: 'tom.anderson@maxlifecare.com.au', name: 'Tom Anderson', password: 'demo' },
    { email: 'dr.kim@maxlifecare.com.au', name: 'Dr. Sarah Kim', password: 'demo' },
    { email: 'lisa.park@maxlifecare.com.au', name: 'Lisa Park', password: 'demo' },
    { email: 'dermot@maxlifecare.com.au', name: 'Dermot Roche', password: 'demo' },
    { email: 'elyce.p@maxlifecare.com.au', name: 'Elyce Pobiega', password: 'demo' },
    { email: 'guest@maxlifecare.com.au', name: 'Guest Guest', password: 'demo' },
    { email: 'ceo@maxlifecare.com.au', name: 'Margaret Thompson', password: 'demo' }
  ]

  let passedTests = 0
  let failedTests = 0

  for (const user of testUsers) {
    // Fetch user from database
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('email', user.email)
      .single()

    if (error || !data) {
      console.log(`❌ ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Error: User not found in database\n`)
      failedTests++
      continue
    }

    // Check if password matches
    const passwordMatches = data.password === user.password

    if (passwordMatches) {
      console.log(`✅ ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: ✓ ${data.password}`)
      console.log(`   Role: ${data.role?.name} (Level ${data.role?.level})`)
      console.log(`   Status: ${data.status}`)
      console.log(`   Avatar: ${data.avatar ? '✓' : '❌'}`)
      console.log(`   Phone: ${data.phone || 'N/A'}\n`)
      passedTests++
    } else {
      console.log(`❌ ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Expected password: ${user.password}`)
      console.log(`   Actual password: ${data.password || 'NULL'}`)
      console.log(`   Error: Password mismatch\n`)
      failedTests++
    }
  }

  console.log('═══════════════════════════════════════════════════════')
  console.log('📊 TEST RESULTS')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`✅ Passed: ${passedTests}/${testUsers.length}`)
  console.log(`❌ Failed: ${failedTests}/${testUsers.length}`)
  console.log('═══════════════════════════════════════════════════════\n')

  if (failedTests === 0) {
    console.log('🎉 ALL LOGINS WORKING PERFECTLY!')
    console.log('All users can log in with email and password "demo"\n')
  } else {
    console.log('⚠️  Some logins failed. Please review the errors above.\n')
  }
}

testAllLogins()
