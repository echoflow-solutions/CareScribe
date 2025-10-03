const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAlerts() {
  console.log('='.repeat(70))
  console.log('DEBUGGING ALERT LOADING ISSUE')
  console.log('='.repeat(70))
  console.log('')

  try {
    // 1. Check Bernard Adjei's facility_id
    console.log('1. Checking Bernard Adjei user data...')
    const { data: bernard, error: bernardError } = await supabase
      .from('users')
      .select('id, name, email, facility_id')
      .eq('email', 'bernard.adjei@maxlifecare.com.au')
      .single()

    if (bernardError) {
      console.error('Error:', bernardError)
    } else {
      console.log(`   Name: ${bernard.name}`)
      console.log(`   Email: ${bernard.email}`)
      console.log(`   Facility ID: ${bernard.facility_id || 'NULL'}`)
      console.log(`   Is valid UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bernard.facility_id || '')}`)
    }

    // 2. Check alerts in database
    console.log('\n2. Checking alerts in database...')
    const { data: allAlerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('acknowledged', false)

    if (alertsError) {
      console.error('Error:', alertsError)
    } else {
      console.log(`   Total unacknowledged alerts: ${allAlerts?.length || 0}`)
      allAlerts?.forEach((alert, i) => {
        console.log(`   Alert ${i + 1}: facility_id=${alert.facility_id || 'NULL'}, message="${alert.message.substring(0, 50)}..."`)
      })
    }

    // 3. Simulate the query that getAlerts() would make
    console.log('\n3. Simulating DataService.getAlerts() query...')
    const facilityId = bernard?.facility_id

    let query = supabase
      .from('alerts')
      .select('*')
      .eq('acknowledged', false)

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (facilityId && uuidRegex.test(facilityId)) {
      console.log(`   ✓ Filtering by facility_id: ${facilityId}`)
      query = query.eq('facility_id', facilityId)
    } else {
      console.log(`   ✗ Skipping facility filter (invalid UUID: ${facilityId})`)
    }

    const { data: filteredAlerts, error: filterError } = await query

    if (filterError) {
      console.error('Error:', filterError)
    } else {
      console.log(`   Alerts returned: ${filteredAlerts?.length || 0}`)
    }

    // 4. Solution
    console.log('\n4. PROBLEM IDENTIFIED:')
    console.log('   The alerts have no facility_id, but Bernard\'s facility_id is invalid/NULL')
    console.log('   So the query returns all alerts (no facility filter applied)')
    console.log('   This should work... checking if there\'s a client-side caching issue')

    console.log('\n5. SOLUTION:')
    console.log('   - Ensure alerts are being loaded on page mount')
    console.log('   - Add console.log to shift-start page to debug')
    console.log('   - Check browser console for errors')
    console.log('   - Hard refresh browser (Cmd+Shift+R)')

    console.log('\n' + '='.repeat(70))

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

debugAlerts()
