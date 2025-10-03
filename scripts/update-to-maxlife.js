const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateToMaxlifeCare() {
  console.log('Starting comprehensive update to Maxlife Care...\n')

  try {
    // 1. Delete Sarah Johnson from users
    console.log('1. Removing Sarah Johnson...')

    // First, get Sarah Johnson's ID
    const { data: sarahUser, error: sarahFetchError } = await supabase
      .from('users')
      .select('id')
      .eq('name', 'Sarah Johnson')
      .single()

    if (sarahFetchError) {
      console.log('Sarah Johnson not found (may already be deleted)\n')
    } else if (sarahUser) {
      // Delete her shifts first
      const { error: shiftsError } = await supabase
        .from('shifts')
        .delete()
        .eq('staff_id', sarahUser.id)

      if (shiftsError) {
        console.error('Error deleting Sarah Johnson shifts:', shiftsError)
      } else {
        console.log('✓ Deleted Sarah Johnson shifts')
      }

      // Delete any incidents by Sarah Johnson
      const { error: incidentsError } = await supabase
        .from('incidents')
        .delete()
        .eq('staff_id', sarahUser.id)

      if (incidentsError) {
        console.error('Error deleting Sarah Johnson incidents:', incidentsError)
      } else {
        console.log('✓ Deleted Sarah Johnson incidents')
      }

      // Now delete the user
      const { error: sarahError } = await supabase
        .from('users')
        .delete()
        .eq('id', sarahUser.id)

      if (sarahError) {
        console.error('Error removing Sarah Johnson:', sarahError)
      } else {
        console.log('✓ Sarah Johnson removed completely\n')
      }
    }

    // 2. Update all email addresses from @sunshinesupport.com.au to @maxlifecare.com.au
    console.log('2. Updating email addresses...')

    // Get all users with @sunshinesupport.com.au emails
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .like('email', '%@sunshinesupport.com.au')

    if (fetchError) {
      console.error('Error fetching users:', fetchError)
    } else {
      console.log(`Found ${users?.length || 0} users with @sunshinesupport.com.au emails`)

      // Update each user's email
      for (const user of users || []) {
        const newEmail = user.email.replace('@sunshinesupport.com.au', '@maxlifecare.com.au')
        const { error: updateError } = await supabase
          .from('users')
          .update({ email: newEmail })
          .eq('id', user.id)

        if (updateError) {
          console.error(`Error updating ${user.name}:`, updateError)
        } else {
          console.log(`✓ Updated ${user.name}: ${user.email} → ${newEmail}`)
        }
      }
      console.log('')
    }

    // 3. Update organization name
    console.log('3. Updating organization name...')
    const { error: orgError } = await supabase
      .from('organizations')
      .update({ name: 'Maxlife Care' })
      .like('name', '%Sunshine%')

    if (orgError) {
      console.error('Error updating organization:', orgError)
    } else {
      console.log('✓ Organization name updated to Maxlife Care\n')
    }

    // 4. Verify changes
    console.log('4. Verifying changes...')
    const { data: verifyUsers, error: verifyError } = await supabase
      .from('users')
      .select('name, email')
      .order('name')

    if (verifyError) {
      console.error('Error verifying:', verifyError)
    } else {
      console.log('\nCurrent users in database:')
      verifyUsers?.forEach(user => {
        console.log(`  - ${user.name}: ${user.email}`)
      })
    }

    const { data: verifyOrg } = await supabase
      .from('organizations')
      .select('name')
      .limit(1)
      .single()

    console.log(`\nOrganization: ${verifyOrg?.name || 'Not found'}`)

    console.log('\n✅ Database update complete!')

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

updateToMaxlifeCare()
