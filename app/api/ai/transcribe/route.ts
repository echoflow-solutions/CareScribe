import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.AI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add AI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }
    
    // Get the form data from the request
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }
    
    // Create form data for OpenAI Whisper API
    const openAIFormData = new FormData()
    openAIFormData.append('file', audioFile)
    openAIFormData.append('model', 'whisper-1')
    openAIFormData.append('language', 'en')
    openAIFormData.append('response_format', 'json')
    
    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: openAIFormData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI Whisper API error:', error)
      return NextResponse.json(
        { error: error.error?.message || 'Whisper API request failed' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    const transcription = data.text || ''
    
    // Return the transcribed text
    return NextResponse.json({ 
      text: transcription,
      success: true 
    })
  } catch (error) {
    console.error('Transcription route error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Configure max duration for audio processing
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max for audio processing