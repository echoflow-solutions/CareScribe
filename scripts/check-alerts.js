const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAlerts() {
  console.log('🔍 Checking alerts for Parramatta facility...\n')

  const parraFacilityId = '650e8400-e29b-41d4-a716-446655440003'

  try {
    // Fetch all alerts for Parramatta facility
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('facility_id', parraFacilityId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching alerts:', error)
      return
    }

    console.log(`📋 Found ${alerts?.length || 0} alerts for Parramatta facility:\n`)

    if (alerts && alerts.length > 0) {
      alerts.forEach((alert, index) => {
        console.log(`${index + 1}. [${alert.severity}] ${alert.type}`)
        console.log(`   Message: ${alert.message}`)
        console.log(`   Acknowledged: ${alert.acknowledged}`)
        console.log(`   Created: ${alert.created_at}`)
        console.log('')
      })
    } else {
      console.log('⚠️  No alerts found. This might be why you see empty alerts.')
    }

    // Check unacknowledged alerts specifically (what users see)
    const { data: unackAlerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('facility_id', parraFacilityId)
      .eq('acknowledged', false)

    console.log(`\n🔔 Unacknowledged alerts (what users will see): ${unackAlerts?.length || 0}\n`)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkAlerts()
