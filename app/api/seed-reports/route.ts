import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { subDays } from 'date-fns'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  console.log('[Seed] Starting to seed dummy reports')

  try {
    const { userId, facilityId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch real participants from database
    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('id, name')
      .limit(50)

    if (participantsError || !participantsData || participantsData.length === 0) {
      console.error('[Seed] Error fetching participants:', participantsError)
      return NextResponse.json(
        { success: false, error: 'No participants found in database' },
        { status: 500 }
      )
    }

    console.log(`[Seed] Found ${participantsData.length} participants`)

    const reporters = ['Bernard Adjei', 'Tom Anderson', 'Emily Chen', 'Mark Williams']
    const facilities = ['House 1 - Riverside', 'House 2 - Parkview', 'House 3 - Sunshine']
    const locations = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Garden', 'Dining Room']
    const types = ['behavioral', 'medical', 'property', 'other'] as const
    const severities = ['low', 'medium', 'high'] as const
    const statuses = ['submitted', 'reviewed', 'closed'] as const

    const descriptions = [
      'Participant became agitated during meal preparation. Staff provided calm reassurance and offered preferred activity.',
      'Minor verbal disagreement with peer resident. Situation resolved quickly with staff mediation.',
      'Participant refused medication. Staff documented and will follow up with healthcare professional.',
      'Participant expressed frustration about schedule change. Staff listened actively and problem-solved together.',
      'Brief anxiety episode managed with deep breathing exercises and quiet time in preferred space.',
      'Participant damaged personal property during distress. Staff ensured safety and helped participant calm down.',
      'Behavioral escalation due to sensory overload. Staff implemented sensory break with positive results.',
      'Participant exhibited challenging behavior during community outing. Staff used de-escalation techniques successfully.',
      'Minor property damage occurred. Staff documented incident and supported participant through emotional regulation.',
      'Participant became upset when routine was disrupted. Staff provided structure and predictability to ease transition.'
    ]

    const antecedents = [
      'Change in daily routine',
      'Preferred activity was cancelled',
      'Peer conflict during shared activity',
      'Sensory overstimulation in common area',
      'Transition between activities',
      'Unexpected visitor',
      'Meal not to preference',
      'Medication time',
      'Noise level in environment',
      'Request was denied'
    ]

    const behaviors = [
      'Raised voice and used challenging language',
      'Refused to participate in scheduled activity',
      'Left common area abruptly',
      'Threw personal item',
      'Hit wall with hand',
      'Paced back and forth repeatedly',
      'Refused verbal communication',
      'Engaged in self-talk',
      'Pushed furniture',
      'Locked self in bedroom'
    ]

    const consequences = [
      'Staff provided space and monitoring',
      'Participant calmed after 15 minutes',
      'Engaged in preferred activity',
      'Accepted staff support',
      'Returned to normal routine',
      'Apologized to staff',
      'Discussed feelings with staff',
      'Requested quiet time',
      'Participated in calming activity',
      'Went for walk with staff'
    ]

    const interventions = [
      ['Quiet room', 'Deep pressure therapy'],
      ['Active listening', 'Problem-solving discussion'],
      ['Sensory break', 'Preferred music'],
      ['Calm reassurance', 'Visual schedule review'],
      ['Space and time', 'Check-in after 10 minutes'],
      ['Redirect to preferred activity', 'Positive reinforcement'],
      ['Breathing exercises', 'Mindfulness techniques'],
      ['Walk outside', 'Physical activity'],
      ['One-on-one support', 'Emotional validation'],
      ['Choice offered', 'Compromise reached']
    ]

    const reports = []

    // Generate 50 reports over the past 30 days (before Oct 9, 2025)
    const baseDate = new Date('2025-10-08') // Oct 8, 2025 - day before today

    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30) + 1 // 1-30 days ago
      const incidentDate = subDays(baseDate, daysAgo)

      // Random hour between 6 AM and 10 PM
      const hour = Math.floor(Math.random() * 16) + 6
      incidentDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0)

      // Select random participant from database
      const randomParticipant = participantsData[Math.floor(Math.random() * participantsData.length)]

      const report = {
        staff_id: userId,
        facility_id: facilityId || null,
        participant_id: randomParticipant.id, // Use real participant ID from database
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        antecedent: antecedents[Math.floor(Math.random() * antecedents.length)],
        behavior: behaviors[Math.floor(Math.random() * behaviors.length)],
        consequence: consequences[Math.floor(Math.random() * consequences.length)],
        interventions: JSON.stringify(
          interventions[Math.floor(Math.random() * interventions.length)].map(desc => ({ description: desc }))
        ),
        outcomes: JSON.stringify([]),
        photos: [],
        report_type: ['incident', 'abc', 'both'][Math.floor(Math.random() * 3)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        submitted_at: incidentDate.toISOString(),
        created_at: incidentDate.toISOString()
      }

      reports.push(report)
    }

    console.log(`[Seed] Inserting ${reports.length} dummy reports`)

    // Insert all reports
    const { data, error } = await supabase
      .from('incidents')
      .insert(reports)
      .select()

    if (error) {
      console.error('[Seed] Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log(`[Seed] Successfully inserted ${data.length} reports`)

    return NextResponse.json({
      success: true,
      count: data.length,
      message: `Successfully seeded ${data.length} dummy reports`
    })

  } catch (error: any) {
    console.error('[Seed] Error seeding reports:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed reports' },
      { status: 500 }
    )
  }
}
