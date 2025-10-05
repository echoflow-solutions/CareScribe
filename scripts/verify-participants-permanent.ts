#!/usr/bin/env tsx
/**
 * PERMANENT VERIFICATION SCRIPT
 * Run this anytime to verify participants are still assigned correctly
 *
 * Usage:
 *   npx tsx scripts/verify-participants-permanent.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BERNARD_EMAIL = 'bernard.adjei@maxlifecare.com.au'
const EXPECTED_PARTICIPANTS = ['Lisa Thompson', 'Michael Brown', 'Emma Wilson']

async function verifyParticipants() {
  console.log('🔍 VERIFICATION: Checking participant assignments...\n')
  console.log('═══════════════════════════════════════════════════════\n')

  let allChecks = true

  // Step 1: Verify Bernard's staff record exists
  console.log('1️⃣ Checking Bernard\'s staff record...')
  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('id, name, email, role')
    .eq('email', BERNARD_EMAIL)
    .maybeSingle()

  if (staffError || !staffData) {
    console.error('   ❌ CRITICAL: Bernard\'s staff record not found!')
    console.error('   Error:', staffError?.message || 'No data returned')
    allChecks = false
    return
  }

  console.log('   ✅ Staff record found:')
  console.log(`      Name: ${staffData.name}`)
  console.log(`      Email: ${staffData.email}`)
  console.log(`      Staff ID: ${staffData.id}`)
  console.log(`      Role: ${staffData.role}`)

  const bernardStaffId = staffData.id

  // Step 2: Verify Bernard has shifts
  console.log('\n2️⃣ Checking Bernard\'s shifts...')
  const { data: shifts, error: shiftsError } = await supabase
    .from('shifts')
    .select('*')
    .eq('staff_id', bernardStaffId)
    .order('shift_date')
    .limit(5)

  if (shiftsError || !shifts || shifts.length === 0) {
    console.error('   ❌ WARNING: No shifts found for Bernard!')
    console.error('   Error:', shiftsError?.message || 'No shifts in database')
    allChecks = false
  } else {
    console.log(`   ✅ Found ${shifts.length} shifts:`)
    shifts.forEach((shift, i) => {
      console.log(`      ${i + 1}. ${shift.shift_date} ${shift.start_time}-${shift.end_time} (${shift.status})`)
    })
  }

  // Step 3: Verify participants are assigned
  console.log('\n3️⃣ Checking participant assignments...')

  if (shifts && shifts.length > 0) {
    let participantsFound = false

    for (const shift of shifts) {
      const { data: assignments, error: assignError } = await supabase
        .from('shift_participants')
        .select(`
          participant:participants(id, name, age, risk_level)
        `)
        .eq('shift_id', shift.id)

      if (!assignError && assignments && assignments.length > 0) {
        participantsFound = true
        console.log(`   ✅ Shift ${shift.shift_date} has ${assignments.length} participants:`)
        assignments.forEach((a: any) => {
          const p = a.participant
          const isExpected = EXPECTED_PARTICIPANTS.includes(p.name)
          const icon = isExpected ? '✅' : '⚠️'
          console.log(`      ${icon} ${p.name} (Age: ${p.age}, Risk: ${p.risk_level})`)
        })
        break // Found participants, we're good
      }
    }

    if (!participantsFound) {
      console.error('   ❌ CRITICAL: No participants assigned to any shifts!')
      allChecks = false
    }
  }

  // Step 4: Verify expected participants exist in database
  console.log('\n4️⃣ Verifying expected participants exist...')
  for (const name of EXPECTED_PARTICIPANTS) {
    const { data: participant, error: pError } = await supabase
      .from('participants')
      .select('id, name')
      .eq('name', name)
      .maybeSingle()

    if (pError || !participant) {
      console.error(`   ❌ CRITICAL: Participant "${name}" not found in database!`)
      allChecks = false
    } else {
      console.log(`   ✅ ${name} exists (ID: ${participant.id})`)
    }
  }

  // Final Summary
  console.log('\n═══════════════════════════════════════════════════════')
  if (allChecks) {
    console.log('✅ ALL CHECKS PASSED - System is working correctly!')
    console.log('═══════════════════════════════════════════════════════\n')
    process.exit(0)
  } else {
    console.log('❌ SOME CHECKS FAILED - Review errors above')
    console.log('═══════════════════════════════════════════════════════')
    console.log('\n📖 See PARTICIPANTS-FIX-PERMANENT.md for recovery steps\n')
    process.exit(1)
  }
}

verifyParticipants()
  .catch((error) => {
    console.error('\n💥 FATAL ERROR:', error)
    console.log('\n📖 See PARTICIPANTS-FIX-PERMANENT.md for help\n')
    process.exit(1)
  })
