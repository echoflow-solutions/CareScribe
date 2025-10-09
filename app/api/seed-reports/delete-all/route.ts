import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  console.log('[Delete All] Deleting all incidents from database')

  try {
    // Delete all incidents
    const { error } = await supabase
      .from('incidents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (using a condition that matches all rows)

    if (error) {
      console.error('[Delete All] Error deleting incidents:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    console.log('[Delete All] Successfully deleted all incidents')

    return NextResponse.json({
      success: true,
      message: 'All incidents deleted successfully'
    })

  } catch (error: any) {
    console.error('[Delete All] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete incidents' },
      { status: 500 }
    )
  }
}
