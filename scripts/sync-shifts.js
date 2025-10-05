require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { addDays, format } = require('date-fns')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function syncShiftsDatabase() {
  console.log('🚀 Starting comprehensive shifts database sync...\n')

  try {
    // ========================================
    // STEP 1: Create Facilities
    // ========================================
    console.log('📝 Step 1: Syncing facilities...\n')

    const facilitiesData = [
      { name: 'House 1 - Riverside', address: '123 Riverside Ave, Parramatta NSW 2150', capacity: 6, status: 'active' },
      { name: 'House 2 - Parkview', address: '456 Park St, Parramatta NSW 2150', capacity: 5, status: 'active' },
      { name: 'House 3 - Sunshine', address: '789 Sunny Rd, Parramatta NSW 2150', capacity: 4, status: 'active' }
    ]

    const facilityIds = {}

    for (const facData of facilitiesData) {
      const { data: existing } = await supabase
        .from('facilities')
        .select('*')
        .eq('name', facData.name)
        .maybeSingle()

      if (existing) {
        console.log(`  ✓ Facility "${facData.name}" already exists`)
        facilityIds[facData.name] = existing.id
      } else {
        const { data: newFacility, error } = await supabase
          .from('facilities')
          .insert([facData])
          .select()
          .single()

        if (error) {
          console.error(`  ❌ Error creating facility "${facData.name}":`, error.message)
        } else {
          console.log(`  ✓ Created facility "${facData.name}"`)
          facilityIds[facData.name] = newFacility.id
        }
      }
    }

    console.log('\n✓ Facilities synced successfully\n')

    // ========================================
    // STEP 2: Create/Sync Staff
    // ========================================
    console.log('📝 Step 2: Syncing staff members...\n')

    const staffData = [
      { name: 'Bernard Adjei', role: 'Support Worker', email: 'bernard.adjei@maxlifecare.com.au', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bernard' },
      { name: 'Tom Anderson', role: 'Team Leader', email: 'tom.anderson@maxlifecare.com.au', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom' },
      { name: 'Emily Chen', role: 'Support Worker', email: 'emily.chen@maxlifecare.com.au', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },
      { name: 'Mark Williams', role: 'Support Worker', email: 'mark.williams@maxlifecare.com.au', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark' },
      { name: 'Lisa Brown', role: 'Nurse', email: 'lisa.brown@maxlifecare.com.au', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
      { name: 'Sarah Johnson', role: 'Manager', email: 'sarah.johnson@maxlifecare.com.au', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }
    ]

    const staffIds = {}

    for (const staff of staffData) {
      const { data: existing } = await supabase
        .from('staff')
        .select('*')
        .eq('email', staff.email)
        .maybeSingle()

      if (existing) {
        console.log(`  ✓ Staff "${staff.name}" already exists`)
        staffIds[staff.name] = existing.id
      } else {
        const { data: newStaff, error } = await supabase
          .from('staff')
          .insert([staff])
          .select()
          .single()

        if (error) {
          console.error(`  ❌ Error creating staff "${staff.name}":`, error.message)
        } else {
          console.log(`  ✓ Created staff "${staff.name}"`)
          staffIds[staff.name] = newStaff.id
        }
      }
    }

    console.log('\n✓ Staff synced successfully\n')

    // ========================================
    // STEP 3: Clear Existing Shifts (Optional)
    // ========================================
    console.log('📝 Step 3: Clearing old shifts...\n')

    const { error: deleteError } = await supabase
      .from('shifts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('  ⚠️  Error clearing shifts:', deleteError.message)
    } else {
      console.log('  ✓ Old shifts cleared\n')
    }

    // ========================================
    // STEP 4: Generate Comprehensive Shifts
    // ========================================
    console.log('📝 Step 4: Generating comprehensive shift schedule...\n')

    const facilities = Object.entries(facilityIds).map(([name, id]) => ({ name, id }))
    const staff = Object.entries(staffIds).map(([name, id]) => ({ name, id }))

    // Get the user ID for Sarah Johnson (manager) from users table
    const { data: managerUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'sarah.johnson@maxlifecare.com.au')
      .maybeSingle()

    const managerUserId = managerUser?.id || null

    let totalShiftsCreated = 0

    // Generate shifts for next 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const shiftDate = addDays(new Date(), dayOffset)
      const dateStr = format(shiftDate, 'yyyy-MM-dd')

      // Morning shifts (7 AM - 3 PM)
      for (let fIndex = 0; fIndex < facilities.length; fIndex++) {
        const facility = facilities[fIndex]
        const staffMember = staff[(dayOffset + fIndex) % (staff.length - 1)] // Exclude manager

        // Get co-workers at different facilities at same time
        const coWorkers = facilities
          .filter((_, idx) => idx !== fIndex)
          .map((_, idx) => staff[(dayOffset + idx) % (staff.length - 1)])

        const shiftData = {
          staff_id: staffMember.id,
          staff_name: staffMember.name,
          staff_role: staffData.find(s => s.name === staffMember.name)?.role || 'Support Worker',
          facility_id: facility.id,
          facility_name: facility.name,
          shift_date: dateStr,
          start_time: '07:00:00',
          end_time: '15:00:00',
          shift_type: 'morning',
          status: 'scheduled',
          assigned_by: managerUserId,
          assigned_by_name: 'Sarah Johnson (Manager)',
          co_worker_ids: coWorkers.map(cw => cw.id).slice(0, 2),
          co_worker_names: coWorkers.map(cw => cw.name).slice(0, 2)
        }

        const { error } = await supabase.from('shifts').insert([shiftData])

        if (error) {
          console.error(`    ❌ Error creating morning shift:`, error.message)
        } else {
          totalShiftsCreated++
        }
      }

      // Afternoon shifts (3 PM - 11 PM)
      for (let fIndex = 0; fIndex < facilities.length; fIndex++) {
        const facility = facilities[fIndex]
        const staffMember = staff[(dayOffset + fIndex + 2) % (staff.length - 1)]

        const coWorkers = facilities
          .filter((_, idx) => idx !== fIndex)
          .map((_, idx) => staff[(dayOffset + idx + 2) % (staff.length - 1)])

        const shiftData = {
          staff_id: staffMember.id,
          staff_name: staffMember.name,
          staff_role: staffData.find(s => s.name === staffMember.name)?.role || 'Support Worker',
          facility_id: facility.id,
          facility_name: facility.name,
          shift_date: dateStr,
          start_time: '15:00:00',
          end_time: '23:00:00',
          shift_type: 'afternoon',
          status: 'scheduled',
          assigned_by: managerUserId,
          assigned_by_name: 'Sarah Johnson (Manager)',
          co_worker_ids: coWorkers.map(cw => cw.id).slice(0, 2),
          co_worker_names: coWorkers.map(cw => cw.name).slice(0, 2)
        }

        const { error } = await supabase.from('shifts').insert([shiftData])

        if (error) {
          console.error(`    ❌ Error creating afternoon shift:`, error.message)
        } else {
          totalShiftsCreated++
        }
      }

      // Night shifts (11 PM - 7 AM)
      for (let fIndex = 0; fIndex < facilities.length; fIndex++) {
        const facility = facilities[fIndex]
        const staffMember = staff[(dayOffset + fIndex + 4) % (staff.length - 1)]

        const coWorkers = facilities
          .filter((_, idx) => idx !== fIndex)
          .map((_, idx) => staff[(dayOffset + idx + 4) % (staff.length - 1)])

        const shiftData = {
          staff_id: staffMember.id,
          staff_name: staffMember.name,
          staff_role: staffData.find(s => s.name === staffMember.name)?.role || 'Support Worker',
          facility_id: facility.id,
          facility_name: facility.name,
          shift_date: dateStr,
          start_time: '23:00:00',
          end_time: '07:00:00',
          shift_type: 'night',
          status: 'scheduled',
          assigned_by: managerUserId,
          assigned_by_name: 'Sarah Johnson (Manager)',
          co_worker_ids: coWorkers.map(cw => cw.id).slice(0, 2),
          co_worker_names: coWorkers.map(cw => cw.name).slice(0, 2)
        }

        const { error } = await supabase.from('shifts').insert([shiftData])

        if (error) {
          console.error(`    ❌ Error creating night shift:`, error.message)
        } else {
          totalShiftsCreated++
        }
      }

      console.log(`  ✓ Generated shifts for ${dateStr}`)
    }

    console.log(`\n  ✓ Created ${totalShiftsCreated} shifts total\n`)

    // ========================================
    // STEP 5: Verification
    // ========================================
    console.log('📝 Step 5: Verifying database state...\n')

    const { count: facilitiesCount } = await supabase
      .from('facilities')
      .select('*', { count: 'exact', head: true })

    const { count: staffCount } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })

    const { count: shiftsCount } = await supabase
      .from('shifts')
      .select('*', { count: 'exact', head: true })

    const { data: todayShifts } = await supabase
      .from('shifts')
      .select('*')
      .eq('shift_date', format(new Date(), 'yyyy-MM-dd'))

    console.log(`  ✓ Facilities in database: ${facilitiesCount}`)
    console.log(`  ✓ Staff in database: ${staffCount}`)
    console.log(`  ✓ Total shifts in database: ${shiftsCount}`)
    console.log(`  ✓ Shifts for today: ${todayShifts?.length || 0}`)

    console.log('\n✅ Shifts database sync completed successfully!\n')
    console.log('═══════════════════════════════════════════════════════')
    console.log('📊 SUMMARY')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`✓ ${facilitiesCount} facilities created`)
    console.log(`✓ ${staffCount} staff members synced`)
    console.log(`✓ ${shiftsCount} shifts scheduled (14 days)`)
    console.log(`✓ ${todayShifts?.length || 0} shifts today`)
    console.log('✓ Shift times: 7-3, 3-11, 11-7')
    console.log('✓ All shifts assigned by Sarah Johnson (Manager)')
    console.log('✓ Co-workers tracked for each shift')
    console.log('═══════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

syncShiftsDatabase()
