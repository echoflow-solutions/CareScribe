import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkShiftsDates() {
  console.log('📅 Checking shift dates...\n')
  console.log('System date:', new Date().toISOString().split('T')[0])

  const { data: shifts } = await supabase
    .from('shifts')
    .select('shift_date, count')
    .limit(20)
    .order('shift_date')

  console.log('\n📊 Shifts by date:')
  const dateCount: Record<string, number> = {}

  shifts?.forEach(shift => {
    const date = shift.shift_date as string
    dateCount[date] = (dateCount[date] || 0) + 1
  })

  Object.entries(dateCount).forEach(([date, count]) => {
    console.log(`  ${date}: ${count} shifts`)
  })

  // Check Bernard specifically
  const { data: bernardShifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('staff_id', 'a3db607f-689b-46e4-b38b-1a5db4e9059d')
    .order('shift_date')
    .limit(10)

  console.log(`\n👤 Bernard's shifts:`)
  bernardShifts?.forEach(shift => {
    console.log(`  ${shift.shift_date} ${shift.start_time}-${shift.end_time} (${shift.status})`)
  })
}

checkShiftsDates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
