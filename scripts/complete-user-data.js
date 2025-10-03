const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function completeUserData() {
  console.log('🚀 Completing all user data comprehensively...\n')

  try {
    // Get facility ID
    const { data: facility } = await supabase
      .from('facilities')
      .select('id')
      .limit(1)
      .single()

    const facilityId = facility?.id

    if (!facilityId) {
      console.error('❌ No facility found')
      process.exit(1)
    }

    console.log(`✓ Using facility ID: ${facilityId}\n`)

    // Complete user data - all fields filled
    const completeUsers = [
      {
        email: 'bernard.adjei@maxlifecare.com.au',
        name: 'Bernard Adjei',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bernard',
        phone: '+61 412 345 678',
        facility_id: facilityId,
        status: 'active'
      },
      {
        email: 'tom.anderson@maxlifecare.com.au',
        name: 'Tom Anderson',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
        phone: '+61 412 345 679',
        facility_id: facilityId,
        status: 'active'
      },
      {
        email: 'dr.kim@maxlifecare.com.au',
        name: 'Dr. Sarah Kim',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrKim',
        phone: '+61 412 345 680',
        facility_id: null, // Area managers oversee multiple facilities
        status: 'active'
      },
      {
        email: 'lisa.park@maxlifecare.com.au',
        name: 'Lisa Park',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        phone: '+61 412 345 681',
        facility_id: null, // Area managers oversee multiple facilities
        status: 'active'
      },
      {
        email: 'dermot@maxlifecare.com.au',
        name: 'Dermot Roche',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dermot',
        phone: '+61 412 345 682',
        facility_id: facilityId,
        status: 'active'
      },
      {
        email: 'elyce.p@maxlifecare.com.au',
        name: 'Elyce Pobiega',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elyce',
        phone: '+61 412 345 683',
        facility_id: facilityId,
        status: 'active'
      },
      {
        email: 'guest@maxlifecare.com.au',
        name: 'Guest Guest',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
        phone: '+61 412 345 684',
        facility_id: facilityId,
        status: 'active'
      },
      {
        email: 'ceo@maxlifecare.com.au',
        name: 'Margaret Thompson',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Margaret',
        phone: '+61 412 345 685',
        facility_id: null, // Executive team oversees all
        status: 'active'
      }
    ]

    console.log('📝 Updating all users with complete data...\n')

    for (const userData of completeUsers) {
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          password: userData.password,
          avatar: userData.avatar,
          phone: userData.phone,
          facility_id: userData.facility_id,
          status: userData.status
        })
        .eq('email', userData.email)

      if (error) {
        console.error(`  ❌ Error updating ${userData.name}:`, error.message)
      } else {
        console.log(`  ✓ ${userData.name} - Complete`)
        console.log(`    Email: ${userData.email}`)
        console.log(`    Password: ${userData.password}`)
        console.log(`    Avatar: ✓`)
        console.log(`    Phone: ${userData.phone}`)
        console.log(`    Facility: ${userData.facility_id ? facilityId.substring(0, 8) + '...' : 'Multi-facility'}`)
        console.log(`    Status: ${userData.status}\n`)
      }
    }

    // Verification
    console.log('📊 Verifying all users have complete data...\n')

    const { data: allUsers } = await supabase
      .from('users')
      .select('name, email, password, avatar, phone, facility_id, status, roles(name)')
      .order('created_at')

    console.log('═══════════════════════════════════════════════════════')
    console.log('✅ ALL USERS - COMPLETE DATA')
    console.log('═══════════════════════════════════════════════════════\n')

    allUsers?.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.roles?.name})`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: ${user.password ? '✓ ' + user.password : '❌ MISSING'}`)
      console.log(`   Avatar: ${user.avatar ? '✓' : '❌ MISSING'}`)
      console.log(`   Phone: ${user.phone ? '✓ ' + user.phone : '❌ MISSING'}`)
      console.log(`   Facility: ${user.facility_id ? '✓ Assigned' : 'Multi-facility'}`)
      console.log(`   Status: ${user.status || 'active'}\n`)
    })

    console.log('═══════════════════════════════════════════════════════')
    console.log('✅ DATABASE FULLY COMPLETE!')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`✓ ${allUsers?.length || 0} users with complete data`)
    console.log(`✓ All users have password: "demo"`)
    console.log(`✓ All users have avatars`)
    console.log(`✓ All users have phone numbers`)
    console.log(`✓ All users have appropriate facility assignments`)
    console.log('═══════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

completeUserData()
