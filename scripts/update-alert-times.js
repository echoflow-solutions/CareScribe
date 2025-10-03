const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'
const supabase = createClient(supabaseUrl, supabaseKey)

const FACILITY_ID = '650e8400-e29b-41d4-a716-446655440001'

async function updateAlertTimes() {
  console.log('Updating alert messages to ensure all times are within 7 AM - 3 PM shift...\n')

  try {
    // Get all current alerts
    const { data: alerts, error: fetchError } = await supabase
      .from('alerts')
      .select('*')
      .eq('facility_id', FACILITY_ID)
      .eq('acknowledged', false)

    if (fetchError) {
      console.error('Error fetching alerts:', fetchError)
      return
    }

    console.log(`Found ${alerts?.length || 0} alerts to review`)

    // Delete old alerts and create new ones with proper times
    console.log('\nClearing old alerts...')
    const { error: deleteError } = await supabase
      .from('alerts')
      .delete()
      .eq('facility_id', FACILITY_ID)

    if (deleteError) {
      console.error('Error deleting alerts:', deleteError)
      return
    }

    // Create new alerts with times within shift (7 AM - 3 PM)
    console.log('Creating new alerts with shift-appropriate times...\n')

    const newAlerts = [
      {
        type: 'risk',
        severity: 'warning',
        message: 'Michael Brown - High risk period 2:00-3:00 PM based on behavior patterns. Review management plan.',
        facility_id: FACILITY_ID,
        acknowledged: false
      },
      {
        type: 'medication',
        severity: 'info',
        message: 'Emma Wilson - Morning medications due at 8:00 AM. PRN medications available if needed.',
        facility_id: FACILITY_ID,
        acknowledged: false
      },
      {
        type: 'environmental',
        severity: 'info',
        message: 'Lisa Thompson - Scheduled group activity at 2:00 PM. Ensure craft materials are prepared.',
        facility_id: FACILITY_ID,
        acknowledged: false
      },
      {
        type: 'risk',
        severity: 'info',
        message: '3 active participants today - All support plans reviewed and current for this shift',
        facility_id: FACILITY_ID,
        acknowledged: false
      }
    ]

    const { error: insertError } = await supabase
      .from('alerts')
      .insert(newAlerts)

    if (insertError) {
      console.error('Error creating alerts:', insertError)
      return
    }

    console.log(`✅ Created ${newAlerts.length} alerts with shift-appropriate times:\n`)
    newAlerts.forEach((alert, i) => {
      const icon = alert.type === 'risk' ? '⚠️' : alert.type === 'medication' ? '💊' : '📋'
      console.log(`  ${icon} ${alert.message}`)
    })

    console.log('\n' + '='.repeat(70))
    console.log('All alert times are now within the 7 AM - 3 PM shift window')
    console.log('Hard refresh your browser (Cmd+Shift+R) to see the updates')
    console.log('='.repeat(70))

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

updateAlertTimes()
