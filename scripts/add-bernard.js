const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function addBernardAdjei() {
  console.log('Checking if Bernard Adjei exists in database...\n')

  try {
    // Check if Bernard Adjei already exists
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'bernard.adjei@maxlifecare.com.au')
      .single()

    if (existing) {
      console.log('✓ Bernard Adjei already exists in database')
      console.log(`  ID: ${existing.id}`)
      console.log(`  Name: ${existing.name}`)
      console.log(`  Email: ${existing.email}`)
      return
    }

    console.log('Bernard Adjei not found. Adding to database...')

    // Get the Support Worker role ID
    const { data: roles, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'Support Worker')
      .limit(1)

    if (roleError || !roles || roles.length === 0) {
      console.error('Error finding Support Worker role:', roleError)
      return
    }

    const role = roles[0]

    // Get a facility ID (Parramatta - Maxlife Care)
    const { data: facilities, error: facilityError } = await supabase
      .from('facilities')
      .select('*')
      .limit(1)

    const facilityId = facilities && facilities.length > 0 ? facilities[0].id : null

    // Add Bernard Adjei
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: 'bernard.adjei@maxlifecare.com.au',
        name: 'Bernard Adjei',
        role_id: role.id,
        facility_id: facilityId,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bernard'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error adding Bernard Adjei:', insertError)
    } else {
      console.log('✓ Bernard Adjei added successfully!')
      console.log(`  ID: ${newUser.id}`)
      console.log(`  Email: ${newUser.email}`)
      console.log(`  Role: Support Worker`)
    }

    console.log('\nCurrent users in database:')
    const { data: allUsers } = await supabase
      .from('users')
      .select('name, email')
      .order('name')

    allUsers?.forEach(user => {
      console.log(`  - ${user.name}: ${user.email}`)
    })

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

addBernardAdjei()
