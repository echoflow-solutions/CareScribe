const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function setupThreeParticipants() {
  console.log('Setting up 3 active participants for shift...\n')

  try {
    // 1. Get all participants
    const { data: allParticipants, error: fetchError } = await supabase
      .from('participants')
      .select('id, name, risk_level')
      .order('risk_level', { ascending: false })
      .limit(10)

    if (fetchError) {
      console.error('Error fetching participants:', fetchError)
      return
    }

    console.log(`Found ${allParticipants?.length || 0} participants in database`)

    // Select 3 participants: 1 high risk, 1 medium risk, 1 low risk for variety
    const selectedParticipants = []

    // Get one high-risk participant
    const highRisk = allParticipants?.find(p => p.risk_level === 'high')
    if (highRisk) selectedParticipants.push(highRisk)

    // Get one medium-risk participant
    const mediumRisk = allParticipants?.find(p => p.risk_level === 'medium')
    if (mediumRisk) selectedParticipants.push(mediumRisk)

    // Get one low-risk participant
    const lowRisk = allParticipants?.find(p => p.risk_level === 'low')
    if (lowRisk) selectedParticipants.push(lowRisk)

    // If we don't have 3 yet, just take the first 3
    if (selectedParticipants.length < 3 && allParticipants) {
      for (let i = 0; i < allParticipants.length && selectedParticipants.length < 3; i++) {
        if (!selectedParticipants.find(p => p.id === allParticipants[i].id)) {
          selectedParticipants.push(allParticipants[i])
        }
      }
    }

    console.log('\nSelected 3 participants for this shift:')
    selectedParticipants.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.risk_level} risk)`)
    })

    // 2. Clear all existing alerts
    console.log('\nClearing old alerts...')
    const { error: deleteError } = await supabase
      .from('alerts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.error('Error deleting old alerts:', deleteError)
    } else {
      console.log('✓ Old alerts cleared')
    }

    // 3. Create pre-shift intelligence alerts for the 3 participants
    console.log('\nCreating pre-shift intelligence alerts...')

    const alertsToCreate = []

    // Add participant-specific alerts
    if (selectedParticipants[0]) {
      alertsToCreate.push({
        type: 'risk',
        severity: selectedParticipants[0].risk_level === 'high' ? 'critical' : 'warning',
        message: `${selectedParticipants[0].name} - ${selectedParticipants[0].risk_level === 'high' ? 'High risk participant. Review behavior management plan before shift.' : 'Monitor throughout shift based on patterns'}`,
        participant_id: selectedParticipants[0].id,
        acknowledged: false
      })
    }

    if (selectedParticipants[1]) {
      alertsToCreate.push({
        type: 'medication',
        severity: 'info',
        message: `${selectedParticipants[1].name} - Morning medications due at 8:00 AM (check PRN availability)`,
        participant_id: selectedParticipants[1].id,
        acknowledged: false
      })
    }

    if (selectedParticipants[2]) {
      alertsToCreate.push({
        type: 'environmental',
        severity: 'info',
        message: `${selectedParticipants[2].name} - Scheduled activity at 2:00 PM, ensure materials prepared`,
        participant_id: selectedParticipants[2].id,
        acknowledged: false
      })
    }

    // Add general shift alert
    alertsToCreate.push({
      type: 'risk',
      severity: 'info',
      message: `3 active participants today - All support plans reviewed and current`,
      acknowledged: false
    })

    // Insert all alerts
    const { error: insertError } = await supabase
      .from('alerts')
      .insert(alertsToCreate)

    if (insertError) {
      console.error('Error creating alerts:', insertError)
    } else {
      console.log(`✓ Created ${alertsToCreate.length} pre-shift intelligence alerts`)
    }

    // 4. Verify alerts were created
    console.log('\nVerifying alerts...')
    const { data: verifyAlerts, error: verifyError } = await supabase
      .from('alerts')
      .select('type, severity, message')
      .eq('acknowledged', false)
      .order('created_at', { ascending: false })

    if (verifyError) {
      console.error('Error verifying alerts:', verifyError)
    } else {
      console.log(`\n✅ ${verifyAlerts?.length || 0} alerts ready for pre-shift intelligence:`)
      verifyAlerts?.forEach((alert, i) => {
        console.log(`  ${i + 1}. [${alert.type}] ${alert.message}`)
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Setup complete!')
    console.log('Pre-shift intelligence is now configured for 3 participants')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

setupThreeParticipants()
