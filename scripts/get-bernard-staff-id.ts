import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function getBernardStaffId() {
  console.log('🔍 Looking for Bernard in staff table...\n')

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('name', 'Bernard Adjei')
    .single()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('✅ Found Bernard!')
  console.log('Staff ID:', data.id)
  console.log('Name:', data.name)
  console.log('Role:', data.role)
  console.log('Email:', data.email)

  // Now check his shifts
  const { data: shifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('staff_id', data.id)
    .eq('shift_date', new Date().toISOString().split('T')[0])
    .order('start_time')

  console.log(`\n📅 Shifts today: ${shifts?.length || 0}`)
  shifts?.forEach(shift => {
    console.log(`  - ${shift.start_time} - ${shift.end_time} at ${shift.facility_name} (${shift.status})`)
  })
}

getBernardStaffId()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
