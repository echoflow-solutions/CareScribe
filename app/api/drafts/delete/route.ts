import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function DELETE(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const draftId = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!draftId && !userId) {
      return NextResponse.json(
        { error: 'Either id or user_id is required', success: false },
        { status: 400 }
      )
    }

    // Check if Supabase is available
    if (!supabase || process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true') {
      console.log('[Drafts] Supabase not available, using local storage')
      return NextResponse.json({
        success: true,
        useLocalStorage: true,
        message: 'Using local storage'
      })
    }

    console.log(`[Drafts] Deleting draft: id=${draftId}, user_id=${userId}`)

    // Build query
    let query = supabase.from('draft_reports').delete()

    if (draftId) {
      query = query.eq('id', draftId)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    const { error } = await query

    if (error) {
      console.error('[Drafts] Error deleting draft:', error)
      return NextResponse.json(
        { error: 'Failed to delete draft', success: false, details: error.message },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime
    console.log(`[Drafts] Draft deleted successfully in ${duration}ms`)

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
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
