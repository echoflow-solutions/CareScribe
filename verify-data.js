const { createClient } = require('@supabase/supabase-js')

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyData() {
  console.log('🔍 Checking participant data...\n')

  try {
    // Check participants
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, name, conditions')
      .order('name')

    if (participantsError) {
      console.error('❌ Error fetching participants:', participantsError)
      return
    }

    console.log(`✅ Found ${participants.length} participants`)
    
    // Check Lisa Thompson specifically
    const lisa = participants.find(p => p.name === 'Lisa Thompson')
    if (lisa) {
      console.log(`\n👤 Lisa Thompson (ID: ${lisa.id})`)
      console.log(`   Conditions: ${lisa.conditions ? lisa.conditions.join(', ') : 'None'}`)

      // Check medications for Lisa
      const { data: medications, error: medsError } = await supabase
        .from('participant_medications')
        .select('*')
        .eq('participant_id', lisa.id)

      if (medsError) {
        console.error('❌ Error fetching medications:', medsError)
      } else {
        console.log(`   Medications: ${medications.length} found`)
        medications.forEach(med => {
          console.log(`   - ${med.name} (${med.dosage}) at ${med.time}`)
        })
      }
    } else {
      console.log('\n⚠️  Lisa Thompson not found in database')
    }

    // Show all participants and their data
    console.log('\n📊 All Participants Summary:')
    for (const participant of participants) {
      const { data: meds } = await supabase
        .from('participant_medications')
        .select('id')
        .eq('participant_id', participant.id)

      console.log(`   ${participant.name}:`)
      console.log(`   - Conditions: ${participant.conditions ? participant.conditions.length : 0}`)
      console.log(`   - Medications: ${meds ? meds.length : 0}`)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

verifyData()