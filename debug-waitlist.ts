// Debug script to test waitlist update functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugWaitlistUpdate() {
  const testEmail = 'test-debug@example.com'
  
  console.log('1. Inserting test record...')
  const { data: insertData, error: insertError } = await supabase
    .from('waitlist')
    .insert([{ email: testEmail }])
    .select()
  
  if (insertError) {
    console.error('Insert error:', insertError)
    return
  }
  
  console.log('Inserted:', insertData)
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  console.log('\n2. Attempting to update...')
  const updateData = {
    company_name: 'Test Company',
    role: 'team_leader',
    company_size: '11-50',
    state: 'VIC',
    current_solution: 'paper',
    how_heard: 'google'
  }
  
  const { data: updated, error: updateError } = await supabase
    .from('waitlist')
    .update(updateData)
    .eq('email', testEmail)
    .select()
  
  if (updateError) {
    console.error('Update error:', updateError)
  } else {
    console.log('Update result:', updated)
  }
  
  console.log('\n3. Fetching record to verify...')
  const { data: fetchData, error: fetchError } = await supabase
    .from('waitlist')
    .select('*')
    .eq('email', testEmail)
  
  if (fetchError) {
    console.error('Fetch error:', fetchError)
  } else {
    console.log('Current record state:', fetchData)
  }
  
  // Clean up
  console.log('\n4. Cleaning up...')
  await supabase
    .from('waitlist')
    .delete()
    .eq('email', testEmail)
}

// Run the debug
debugWaitlistUpdate().catch(console.error)