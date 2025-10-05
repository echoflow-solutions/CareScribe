import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function setupShiftParticipants() {
  console.log('🔧 Setting up shift-participant assignments...\n')

  // Bernard's user ID
  const bernardUserId = 'f6758906-f83c-4b4f-991c-eaa2a1066734'

  // Step 1: Check for ANY Bernard's shifts (not just today)
  console.log('1️⃣ Checking for Bernard\'s shifts...')

  const { data: bernardShifts, error: shiftsError } = await supabase
    .from('shifts')
    .select('*')
    .eq('staff_id', bernardUserId)
    .order('shift_date', { ascending: false })
    .order('start_time', { ascending: true })
    .limit(10)

  if (shiftsError) {
    console.error('❌ Error fetching shifts:', shiftsError)
    return
  }

  console.log(`   Found ${bernardShifts?.length || 0} shifts for Bernard`)
  if (bernardShifts && bernardShifts.length > 0) {
    console.log(`   Latest shift: ${bernardShifts[0].shift_date} ${bernardShifts[0].start_time} - ${bernardShifts[0].end_time}`)
    console.log(`   Status: ${bernardShifts[0].status}`)
  }

  if (!bernardShifts || bernardShifts.length === 0) {
    console.log('   ❌  No shifts found for Bernard at all!')
    console.log('   Please ensure shifts are created in the database first.')
    return
  }

  // Step 2: Get the target participants
  console.log('\n2️⃣ Fetching participants...')
  const targetNames = ['Michael Brown', 'Emma Wilson', 'Lisa Thompson']

  const { data: participants, error: participantsError } = await supabase
    .from('participants')
    .select('id, name')
    .in('name', targetNames)

  if (participantsError) {
    console.error('❌ Error fetching participants:', participantsError)
    return
  }

  console.log(`   Found ${participants?.length || 0} participants:`)
  participants?.forEach(p => console.log(`   - ${p.name} (${p.id})`))

  if (!participants || participants.length === 0) {
    console.log('   ⚠️  No participants found! Please ensure participants are created first.')
    return
  }

  // Step 3: Create shift_participants assignments
  console.log('\n3️⃣ Creating shift-participant assignments...')

  for (const shift of bernardShifts) {
    console.log(`\n   Processing shift ${shift.id}...`)

    for (const participant of participants) {
      const { error: assignError } = await supabase
        .from('shift_participants')
        .upsert({
          shift_id: shift.id,
          participant_id: participant.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'shift_id,participant_id'
        })

      if (assignError) {
        console.error(`   ❌ Error assigning ${participant.name}:`, assignError)
      } else {
        console.log(`   ✅ Assigned ${participant.name} to shift`)
      }
    }
  }

  // Step 4: Verify assignments
  console.log('\n4️⃣ Verifying assignments...')

  for (const shift of bernardShifts) {
    const { data: assignedParticipants, error: verifyError } = await supabase
      .from('shift_participants')
      .select(`
        participant:participants(id, name)
      `)
      .eq('shift_id', shift.id)

    if (verifyError) {
      console.error('   ❌ Error verifying:', verifyError)
    } else {
      console.log(`   Shift ${shift.id} has ${assignedParticipants?.length || 0} participants:`)
      assignedParticipants?.forEach((ap: any) => {
        console.log(`   - ${ap.participant?.name}`)
      })
    }
  }

  console.log('\n✅ Setup complete!')
  console.log('\n📋 Summary:')
  console.log(`   - Shifts for Bernard today: ${bernardShifts.length}`)
  console.log(`   - Participants assigned: ${participants.length}`)
  console.log(`   - Total assignments: ${bernardShifts.length * participants.length}`)
}

setupShiftParticipants()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
