import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  console.log('[Reports] Creating new incident report')

  try {
    const body = await request.json()

    const {
      user_id,
      facility_id,
      participant_id,
      participant_name,
      participant_first_name,
      participant_last_name,
      type,
      severity,
      location,
      description,
      antecedent,
      behavior,
      consequence,
      interventions,
      outcomes,
      photos,
      report_type,
      conversation_transcript
    } = body

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      )
    }

    // Prepare incident data with participant names
    const incidentData: any = {
      staff_id: user_id,
      type: type || 'behavioral',
      severity: severity || 'medium',
      location: location || 'Not specified',
      description,
      antecedent,
      behavior,
      consequence,
      interventions: interventions || [],
      outcomes: outcomes || [],
      photos: photos || [],
      report_type: report_type || 'incident',
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    // Add participant names if provided
    if (participant_first_name) {
      incidentData.participant_first_name = participant_first_name
    }
    if (participant_last_name) {
      incidentData.participant_last_name = participant_last_name
    }

    // Add facility_id if provided
    if (facility_id) {
      incidentData.facility_id = facility_id
    }

    // Add participant_id if provided
    if (participant_id) {
      incidentData.participant_id = participant_id
    }

    console.log('[Reports] Inserting incident:', {
      staff_id: incidentData.staff_id,
      type: incidentData.type,
      severity: incidentData.severity,
      participant_first_name: incidentData.participant_first_name || 'Not provided',
      participant_last_name: incidentData.participant_last_name || 'Not provided',
      has_participant_id: !!incidentData.participant_id,
      has_facility_id: !!incidentData.facility_id
    })

    // Insert into database
    const { data, error } = await supabase
      .from('incidents')
      .insert(incidentData)
      .select()
      .single()

    if (error) {
      console.error('[Reports] Database error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('[Reports] Report created successfully:', data.id)

    return NextResponse.json({
      success: true,
      report: data
    })

  } catch (error: any) {
    console.error('[Reports] Error creating report:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create report' },
      { status: 500 }
    )
  }
}
