import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export interface DraftReportData {
  id?: string
  user_id: string
  facility_id?: string
  participant_id?: string
  conversation: Array<{
    question: string
    subtext?: string
    answer: string
    category?: string
    timestamp?: string
  }>
  current_question?: {
    question: string
    subtext?: string
    category?: string
    placeholder?: string
  }
  current_answer?: string
  progress?: number
  report_type?: string
  session_id?: string
  device_info?: object
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    let draftData: DraftReportData
    try {
      draftData = await request.json()
    } catch (error) {
      console.error('[Drafts] Invalid request body:', error)
      return NextResponse.json(
        { error: 'Invalid request body: must be valid JSON', success: false },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!draftData.user_id) {
      return NextResponse.json(
        { error: 'user_id is required', success: false },
        { status: 400 }
      )
    }

    if (!draftData.conversation || !Array.isArray(draftData.conversation)) {
      return NextResponse.json(
        { error: 'conversation must be an array', success: false },
        { status: 400 }
      )
    }

    // Check if Supabase is available
    if (!supabase || process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true') {
      // Fallback: Return the draft data for local storage handling
      console.log('[Drafts] Supabase not available, using local storage')
      return NextResponse.json({
        success: true,
        useLocalStorage: true,
        draft: draftData,
        message: 'Draft saved to local storage'
      })
    }

    const {
      id,
      user_id,
      facility_id,
      participant_id,
      conversation,
      current_question,
      current_answer,
      progress = 0,
      report_type = 'ai-guided',
      session_id,
      device_info
    } = draftData

    console.log(`[Drafts] Saving draft for user ${user_id}, session ${session_id}`)

    // Check if draft already exists for this user/session
    let existingDraft = null
    try {
      if (id) {
        const { data } = await supabase
          .from('draft_reports')
          .select('id')
          .eq('id', id)
          .single()
        existingDraft = data
      } else if (session_id) {
        const { data } = await supabase
          .from('draft_reports')
          .select('id')
          .eq('user_id', user_id)
          .eq('session_id', session_id)
          .eq('is_complete', false)
          .order('last_activity_at', { ascending: false })
          .limit(1)
          .single()
        existingDraft = data
      }
    } catch (tableError: any) {
      // If table doesn't exist, fallback to local storage
      if (tableError?.code === '42P01' || tableError?.message?.includes('does not exist')) {
        console.log('[Drafts] Table does not exist, using local storage fallback')
        return NextResponse.json({
          success: true,
          useLocalStorage: true,
          draft: draftData,
          message: 'Draft saved to local storage (database table not yet created)'
        })
      }
      throw tableError
    }

    if (existingDraft) {
      // Update existing draft
      const { data, error } = await supabase
        .from('draft_reports')
        .update({
          conversation,
          current_question,
          current_answer,
          progress,
          participant_id,
          facility_id,
          last_activity_at: new Date().toISOString(),
          device_info
        })
        .eq('id', existingDraft.id)
        .select()
        .single()

      if (error) {
        console.error('[Drafts] Error updating draft:', error)
        return NextResponse.json(
          { error: 'Failed to update draft', success: false, details: error.message },
          { status: 500 }
        )
      }

      const duration = Date.now() - startTime
      console.log(`[Drafts] Draft updated successfully in ${duration}ms`)

      return NextResponse.json({
        success: true,
        draft: data,
        message: 'Draft updated successfully'
      })
    } else {
      // Create new draft
      const { data, error } = await supabase
        .from('draft_reports')
        .insert({
          user_id,
          facility_id,
          participant_id,
          conversation,
          current_question,
          current_answer,
          progress,
          report_type,
          session_id,
          device_info,
          last_activity_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('[Drafts] Error creating draft:', error)
        return NextResponse.json(
          { error: 'Failed to create draft', success: false, details: error.message },
          { status: 500 }
        )
      }

      const duration = Date.now() - startTime
      console.log(`[Drafts] Draft created successfully in ${duration}ms`)

      return NextResponse.json({
        success: true,
        draft: data,
        message: 'Draft created successfully'
      })
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Drafts] Unhandled error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration
    })

    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}
