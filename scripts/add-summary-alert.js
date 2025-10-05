const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addSummaryAlert() {
  const parraFacilityId = '650e8400-e29b-41d4-a716-446655440003'

  const summaryAlert = {
    facility_id: parraFacilityId,
    type: 'info',
    severity: 'info',
    message: '3 active participants today - All support plans reviewed and current for this shift',
    acknowledged: false,
    participant_id: null
  }

  try {
    const { data, error } = await supabase
      .from('alerts')
      .insert(summaryAlert)
      .select()

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log('✅ Added summary alert!')

    // Show all current alerts
    const { data: allAlerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('facility_id', parraFacilityId)
      .eq('acknowledged', false)
      .order('created_at', { ascending: true })

    console.log(`\n📋 All ${allAlerts.length} alerts for Parramatta:\n`)
    allAlerts.forEach((alert, i) => {
      console.log(`${i + 1}. ${alert.message}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addSummaryAlert()
