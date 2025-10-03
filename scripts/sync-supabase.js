const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function syncSupabaseDatabase() {
  console.log('🚀 Starting comprehensive Supabase database sync...\n')

  try {
    // ========================================
    // STEP 1: Verify/Create Roles
    // ========================================
    console.log('📝 Step 1: Syncing roles...')

    const rolesData = [
      { name: 'Executive Team', level: 1, permissions: ['view_all', 'strategic_insights', 'compliance_overview'] },
      { name: 'Area Manager', level: 2, permissions: ['multi_facility_view', 'pattern_analysis', 'staff_performance'] },
      { name: 'Team Leader', level: 3, permissions: ['team_oversight', 'report_approval', 'real_time_alerts'] },
      { name: 'Support Worker', level: 4, permissions: ['incident_reporting', 'view_own_reports'] }
    ]

    const roleIds = {}

    for (const roleData of rolesData) {
      const { data: existing } = await supabase
        .from('roles')
        .select('*')
        .eq('name', roleData.name)
        .single()

      if (existing) {
        console.log(`  ✓ Role "${roleData.name}" already exists`)
        roleIds[roleData.name] = existing.id
      } else {
        const { data: newRole, error } = await supabase
          .from('roles')
          .insert([roleData])
          .select()
          .single()

        if (error) {
          console.error(`  ❌ Error creating role "${roleData.name}":`, error)
        } else {
          console.log(`  ✓ Created role "${roleData.name}"`)
          roleIds[roleData.name] = newRole.id
        }
      }
    }

    console.log('\n✓ Roles synced successfully\n')

    // ========================================
    // STEP 2: Verify/Create Facility
    // ========================================
    console.log('📝 Step 2: Syncing facility...')

    const { data: facility, error: facilityError } = await supabase
      .from('facilities')
      .select('*')
      .limit(1)
      .single()

    let facilityId
    if (!facility) {
      console.log('  Creating Parramatta facility...')
      const { data: newFacility, error } = await supabase
        .from('facilities')
        .insert([{ name: 'Parramatta', address: '123 Main St, Parramatta NSW 2150' }])
        .select()
        .single()

      if (error) {
        console.error('  ❌ Error creating facility:', error)
        process.exit(1)
      }
      facilityId = newFacility.id
      console.log('  ✓ Created Parramatta facility')
    } else {
      facilityId = facility.id
      console.log(`  ✓ Using existing facility: ${facility.name}`)
    }

    console.log('\n✓ Facility synced successfully\n')

    // ========================================
    // STEP 3: Sync All Users
    // ========================================
    console.log('📝 Step 3: Syncing users with passwords...\n')

    const allUsers = [
      {
        email: 'bernard.adjei@maxlifecare.com.au',
        name: 'Bernard Adjei',
        role: 'Support Worker',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bernard',
        facility_id: facilityId
      },
      {
        email: 'tom.anderson@maxlifecare.com.au',
        name: 'Tom Anderson',
        role: 'Team Leader',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
        facility_id: facilityId
      },
      {
        email: 'dr.kim@maxlifecare.com.au',
        name: 'Dr. Sarah Kim',
        role: 'Area Manager',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrKim',
        facility_id: null // Area managers oversee multiple facilities
      },
      {
        email: 'lisa.park@maxlifecare.com.au',
        name: 'Lisa Park',
        role: 'Area Manager',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        facility_id: null // Area managers oversee multiple facilities
      },
      {
        email: 'dermot@maxlifecare.com.au',
        name: 'Dermot Roche',
        role: 'Support Worker',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dermot',
        facility_id: facilityId
      },
      {
        email: 'elyce.p@maxlifecare.com.au',
        name: 'Elyce Pobiega',
        role: 'Support Worker',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elyce',
        facility_id: facilityId
      },
      {
        email: 'guest@maxlifecare.com.au',
        name: 'Guest Guest',
        role: 'Support Worker',
        password: 'demo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
        facility_id: facilityId
      }
    ]

    for (const userData of allUsers) {
      const roleId = roleIds[userData.role]
      if (!roleId) {
        console.error(`  ❌ Role "${userData.role}" not found for ${userData.name}`)
        continue
      }

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            name: userData.name,
            role_id: roleId,
            facility_id: userData.facility_id,
            avatar: userData.avatar,
            password: userData.password,
            status: 'active'
          })
          .eq('email', userData.email)

        if (error) {
          console.error(`  ❌ Error updating ${userData.name}:`, error.message)
        } else {
          console.log(`  ✓ Updated ${userData.name} (${userData.role})`)
        }
      } else {
        // Create new user
        const { error } = await supabase
          .from('users')
          .insert([{
            email: userData.email,
            name: userData.name,
            role_id: roleId,
            facility_id: userData.facility_id,
            avatar: userData.avatar,
            password: userData.password,
            status: 'active'
          }])

        if (error) {
          console.error(`  ❌ Error creating ${userData.name}:`, error.message)
        } else {
          console.log(`  ✓ Created ${userData.name} (${userData.role})`)
        }
      }
    }

    console.log('\n✓ Users synced successfully\n')

    // ========================================
    // STEP 4: Verification
    // ========================================
    console.log('📝 Step 4: Verifying database state...\n')

    const { data: allRoles } = await supabase.from('roles').select('*').order('level')
    console.log(`  ✓ Roles in database: ${allRoles?.length || 0}`)
    allRoles?.forEach(role => {
      console.log(`    - ${role.name} (Level ${role.level})`)
    })

    const { data: allUsersInDb } = await supabase
      .from('users')
      .select('name, email, roles(name)')
      .order('created_at')

    console.log(`\n  ✓ Users in database: ${allUsersInDb?.length || 0}`)
    allUsersInDb?.forEach(user => {
      console.log(`    - ${user.name} (${user.roles?.name}) - ${user.email}`)
    })

    console.log('\n✅ Database sync completed successfully!\n')
    console.log('═══════════════════════════════════════════════════════')
    console.log('📊 SUMMARY')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`✓ ${allRoles?.length || 0} roles configured`)
    console.log(`✓ ${allUsersInDb?.length || 0} users synced`)
    console.log(`✓ All users have password: "demo"`)
    console.log(`✓ Support Workers (4): Bernard, Dermot, Elyce, Guest`)
    console.log(`✓ Team Leader (1): Tom Anderson`)
    console.log(`✓ Area Managers (2): Dr. Kim, Lisa Park`)
    console.log('═══════════════════════════════════════════════════════\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

syncSupabaseDatabase()
