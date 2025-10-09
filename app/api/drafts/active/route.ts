import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const sessionId = searchParams.get('session_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required', success: false },
        { status: 400 }
      )
    }

    // Check if Supabase is available
    if (!supabase || process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true') {
      console.log('[Drafts] Supabase not available, using local storage')
      return NextResponse.json({
        success: true,
        useLocalStorage: true,
        draft: null,
        message: 'Using local storage'
      })
    }

    console.log(`[Drafts] Fetching active draft for user ${userId}, session ${sessionId}`)

    // Build query
    let query = supabase
      .from('draft_reports')
      .select('*')
      .eq('user_id', userId)
      .eq('is_complete', false)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data, error } = await query
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      // If table doesn't exist, fallback to local storage
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('[Drafts] Table does not exist, using local storage fallback')
        return NextResponse.json({
          success: true,
          useLocalStorage: true,
          draft: null,
          message: 'Using local storage (database table not yet created)'
        })
      }

      console.error('[Drafts] Error fetching draft:', error)
      return NextResponse.json(
        { error: 'Failed to fetch draft', success: false, details: error.message },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime
    console.log(`[Drafts] Fetch completed in ${duration}ms, found: ${data ? 'yes' : 'no'}`)

    return NextResponse.json({
      success: true,
      draft: data,
      message: data ? 'Draft found' : 'No draft found'
    })
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
