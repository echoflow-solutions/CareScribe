import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  console.log('[Whisper] Processing audio transcription request')

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const language = formData.get('language') as string || 'en'
    const prompt = formData.get('prompt') as string || ''

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      )
    }

    console.log('[Whisper] Audio file received:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
      language: language
    })

    // Convert the File to a format OpenAI accepts
    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const file = new File([buffer], audioFile.name, { type: audioFile.type })

    // Use Whisper API for transcription
    console.log('[Whisper] Sending to OpenAI Whisper API...')
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: language,
      prompt: prompt, // Optional context for better accuracy
      response_format: 'verbose_json', // Get detailed response with timestamps
    })

    console.log('[Whisper] Transcription successful:', {
      text_length: transcription.text?.length || 0,
      duration: transcription.duration,
      language: transcription.language
    })

    return NextResponse.json({
      success: true,
      transcription: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      segments: transcription.segments || []
    })

  } catch (error: any) {
    console.error('[Whisper] Error transcribing audio:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to transcribe audio',
        details: error.response?.data || error
      },
      { status: 500 }
    )
  }
}

// Increase max body size for audio files (25MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
}
