const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addPreShiftAlerts() {
  console.log('🔧 Adding Pre-Shift Intelligence alerts to database...\n')

  const parraFacilityId = '650e8400-e29b-41d4-a716-446655440003' // Parramatta - Maxlife Care

  const alerts = [
    {
      facility_id: parraFacilityId,
      type: 'risk',
      severity: 'warning',
      message: 'Michael Brown - High risk period 2:00-3:00 PM based on behavior patterns. Review management plan.',
      acknowledged: false,
      participant_id: null
    },
    {
      facility_id: parraFacilityId,
      type: 'medication',
      severity: 'info',
      message: 'Emma Wilson - Morning medications due at 8:00 AM. PRN medications available if needed.',
      acknowledged: false,
      participant_id: null
    },
    {
      facility_id: parraFacilityId,
      type: 'activity',
      severity: 'info',
      message: 'Lisa Thompson - Scheduled group activity at 2:00 PM. Ensure craft materials are prepared.',
      acknowledged: false,
      participant_id: null
    }
  ]

  try {
    // First, clear any existing alerts to avoid duplicates
    const { error: deleteError } = await supabase
      .from('alerts')
      .delete()
      .eq('facility_id', parraFacilityId)

    if (deleteError) {
      console.log('⚠️  Note: Could not clear existing alerts:', deleteError.message)
    } else {
      console.log('✅ Cleared existing alerts\n')
    }

    // Insert new alerts
    const { data: insertedAlerts, error: insertError } = await supabase
      .from('alerts')
      .insert(alerts)
      .select()

    if (insertError) {
      console.error('❌ Error creating alerts:', insertError)
      return
    }

    console.log(`✅ Successfully added ${insertedAlerts.length} alerts to database!\n`)

    // Verify the alerts
    const { data: verifyAlerts, error: verifyError } = await supabase
      .from('alerts')
      .select('*')
      .eq('facility_id', parraFacilityId)
      .eq('acknowledged', false)

    if (verifyError) {
      console.error('❌ Error verifying alerts:', verifyError)
      return
    }

    console.log('📋 Alerts now visible to all support workers at Parramatta:\n')
    verifyAlerts.forEach((alert, index) => {
      console.log(`${index + 1}. [${alert.severity.toUpperCase()}] ${alert.message}`)
    })

    console.log('\n✨ Both Bernard Adjei and Akua Boateng will now see these same alerts!\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

addPreShiftAlerts()
