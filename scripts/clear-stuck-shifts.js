const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function clearStuckShifts() {
  console.log('🔧 Clearing all stuck shifts...\n')

  try {
    // First, let's see all shifts
    const { data: allShifts, error: fetchError } = await supabase
      .from('shifts')
      .select('*')
      .order('start_time', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching shifts:', fetchError)
      return
    }

    console.log(`📊 Found ${allShifts?.length || 0} total shifts in database:\n`)

    if (allShifts && allShifts.length > 0) {
      allShifts.forEach(shift => {
        console.log(`  Shift ID: ${shift.id}`)
        console.log(`  Staff ID: ${shift.staff_id}`)
        console.log(`  Status: ${shift.status}`)
        console.log(`  Start: ${shift.start_time}`)
        console.log(`  End: ${shift.end_time || 'N/A'}`)
        console.log('  ---')
      })
    }

    // Mark all active shifts as completed
    const { data: updatedShifts, error: updateError } = await supabase
      .from('shifts')
      .update({
        status: 'completed',
        end_time: new Date().toISOString()
      })
      .eq('status', 'active')
      .select()

    if (updateError) {
      console.error('❌ Error updating shifts:', updateError)
      return
    }

    console.log(`\n✅ Marked ${updatedShifts?.length || 0} active shifts as completed\n`)

    if (updatedShifts && updatedShifts.length > 0) {
      updatedShifts.forEach(shift => {
        console.log(`  ✓ Completed shift ${shift.id} for staff ${shift.staff_id}`)
      })
    }

    console.log('\n✅ All stuck shifts have been cleared!')
    console.log('\n📝 NEXT STEPS:')
    console.log('1. Clear your browser localStorage (Application > Local Storage > Clear)')
    console.log('2. Refresh the page')
    console.log('3. Login again and try clocking in\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

clearStuckShifts()
