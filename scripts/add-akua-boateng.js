const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addAkuaBoateng() {
  console.log('🔧 Adding Akua Boateng to the database...\n')

  try {
    // First, get the Support Worker role ID (level 4)
    const { data: roles, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('level', 4)
      .limit(1)
      .single()

    if (roleError) {
      console.error('❌ Error fetching Support Worker role:', roleError)
      return
    }

    console.log('✅ Found Support Worker role:', roles.id, '-', roles.name)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'akua@maxlifecare.com.au')
      .single()

    if (existingUser) {
      console.log('⚠️  User already exists. Updating...')

      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          name: 'Akua Boateng',
          password: 'demo',
          role_id: roles.id,
          facility_id: '650e8400-e29b-41d4-a716-446655440003', // Parramatta - Maxlife Care
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AkuaBoateng'
        })
        .eq('email', 'akua@maxlifecare.com.au')
        .select()

      if (updateError) {
        console.error('❌ Error updating user:', updateError)
        return
      }

      console.log('✅ Updated Akua Boateng:', updated)
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: 'akua@maxlifecare.com.au',
          name: 'Akua Boateng',
          password: 'demo',
          role_id: roles.id,
          facility_id: '650e8400-e29b-41d4-a716-446655440003', // Parramatta - Maxlife Care
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AkuaBoateng'
        })
        .select()

      if (insertError) {
        console.error('❌ Error creating user:', insertError)
        return
      }

      console.log('✅ Created Akua Boateng:', newUser)
    }

    // Verify the user was created
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('email', 'akua@maxlifecare.com.au')
      .single()

    if (verifyError) {
      console.error('❌ Error verifying user:', verifyError)
      return
    }

    console.log('\n✅ SUCCESS! Akua Boateng has been added to the database\n')
    console.log('📋 User Details:')
    console.log('   Name:', verifyUser.name)
    console.log('   Email:', verifyUser.email)
    console.log('   Password: demo')
    console.log('   Role:', verifyUser.role.name)
    console.log('   Facility ID:', verifyUser.facility_id)
    console.log('   User ID:', verifyUser.id)
    console.log('\n✨ You can now login with: akua@maxlifecare.com.au / demo\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

addAkuaBoateng()
