const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ongxuvdbrraqnjnmaibv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ3h1dmRicnJhcW5qbm1haWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNDQ5MTMsImV4cCI6MjA2ODgyMDkxM30.ia14_terhF2_f5isS5kkisnPtROLDD--92Sc14DmOFc'
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixOrgEmail() {
  console.log('Updating organization primary email...')

  const { error } = await supabase
    .from('organizations')
    .update({ primary_email: 'admin@maxlifecare.com.au' })
    .like('name', 'Maxlife%')

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✓ Organization primary email updated to admin@maxlifecare.com.au')
  }
}

fixOrgEmail()
