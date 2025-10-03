const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'
const supabase = createClient(supabaseUrl, supabaseKey)

// Parramatta - Maxlife Care facility ID (from Bernard's user record)
const PARRAMATTA_FACILITY_ID = '650e8400-e29b-41d4-a716-446655440001'

async function fixAlertFacility() {
  console.log('Fixing alert facility_id to match Bernard\'s facility...\n')

  try {
    // Get all alerts with NULL facility_id
    const { data: nullAlerts, error: fetchError } = await supabase
      .from('alerts')
      .select('id, message')
      .is('facility_id', null)

    if (fetchError) {
      console.error('Error fetching alerts:', fetchError)
      return
    }

    console.log(`Found ${nullAlerts?.length || 0} alerts with NULL facility_id`)

    if (!nullAlerts || nullAlerts.length === 0) {
      console.log('No alerts to fix.')
      return
    }

    // Update all alerts to have the Parramatta facility ID
    const { error: updateError } = await supabase
      .from('alerts')
      .update({ facility_id: PARRAMATTA_FACILITY_ID })
      .is('facility_id', null)

    if (updateError) {
      console.error('Error updating alerts:', updateError)
      return
    }

    console.log(`✓ Updated ${nullAlerts.length} alerts with facility_id: ${PARRAMATTA_FACILITY_ID}`)

    // Verify
    console.log('\nVerifying updates...')
    const { data: verifyAlerts, error: verifyError } = await supabase
      .from('alerts')
      .select('id, message, facility_id')
      .eq('facility_id', PARRAMATTA_FACILITY_ID)
      .eq('acknowledged', false)

    if (verifyError) {
      console.error('Error verifying:', verifyError)
    } else {
      console.log(`\n✅ ${verifyAlerts?.length || 0} alerts now associated with Parramatta facility:`)
      verifyAlerts?.forEach((alert, i) => {
        console.log(`  ${i + 1}. ${alert.message.substring(0, 60)}...`)
      })
    }

    console.log('\n' + '='.repeat(70))
    console.log('✅ Fix complete! Alerts will now show for Bernard Adjei.')
    console.log('Please hard refresh your browser (Cmd+Shift+R) to see the changes.')
    console.log('='.repeat(70))

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

fixAlertFacility()
