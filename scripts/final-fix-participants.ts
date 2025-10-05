import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function finalFixParticipants() {
  console.log('🔧 FINAL FIX: Assigning participants to Bernard\'s shifts...\n')

  const bernardStaffId = 'a3db607f-689b-46e4-b38b-1a5db4e9059d'

  console.log(`👤 Bernard's staff ID: ${bernardStaffId}\n`)

  // Step 1: Get Bernard's shifts (today and tomorrow)
  console.log('1️⃣ Finding Bernard\'s shifts...')

  const { data: shifts, error: shiftsError } = await supabase
    .from('shifts')
    .select('*')
    .eq('staff_id', bernardStaffId)
    .order('shift_date')
    .limit(5)

  if (shiftsError) {
    console.error('   ❌ Error fetching shifts:', shiftsError)
    return
  }

  if (!shifts || shifts.length === 0) {
    console.log('   ⚠️  No shifts found for Bernard!')
    return
  }

  console.log(`   Found ${shifts.length} shifts for Bernard:`)
  shifts.forEach(s => {
    console.log(`   - ${s.shift_date} ${s.start_time}-${s.end_time} (${s.status})`)
  })

  // Use the first shift
  const shift = shifts[0]
  console.log(`\n   Using shift: ${shift.id} on ${shift.shift_date}`)

  // Step 2: Get participants
  console.log('\n2️⃣ Fetching participants...')
  const targetNames = ['Michael Brown', 'Emma Wilson', 'Lisa Thompson']

  const { data: participants } = await supabase
    .from('participants')
    .select('id, name')
    .in('name', targetNames)

  console.log(`   Found ${participants?.length || 0} participants`)
  participants?.forEach(p => console.log(`   - ${p.name}`))

  if (!participants || participants.length === 0) {
    console.log('   ⚠️  No participants found!')
    return
  }

  // Step 3: Assign participants to shift
  console.log('\n3️⃣ Assigning participants to shift...')

  for (const participant of participants) {
    const { error } = await supabase
      .from('shift_participants')
      .upsert({
        shift_id: shift.id,
        participant_id: participant.id,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'shift_id,participant_id'
      })

    if (error) {
      console.error(`   ❌ Error assigning ${participant.name}:`, error.message)
    } else {
      console.log(`   ✅ Assigned ${participant.name}`)
    }
  }

  // Step 4: Verify
  console.log('\n4️⃣ Verifying assignments...')

  const { data: assignments } = await supabase
    .from('shift_participants')
    .select(`
      participant:participants(id, name)
    `)
    .eq('shift_id', shift.id)

  console.log(`\n✅ Shift ${shift.id} now has ${assignments?.length || 0} participants:`)
  assignments?.forEach((a: any) => {
    console.log(`   - ${a.participant?.name}`)
  })

  console.log('\n═══════════════════════════════════════')
  console.log('✅ SETUP COMPLETE!')
  console.log('═══════════════════════════════════════')
  console.log(`📅 Shift Date: ${shift.shift_date}`)
  console.log(`⏰ Shift Time: ${shift.start_time} - ${shift.end_time}`)
  console.log(`📍 Location: ${shift.facility_name}`)
  console.log(`👥 Participants: ${assignments?.length || 0}`)
  console.log('═══════════════════════════════════════\n')
}

finalFixParticipants()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
