import { NextRequest, NextResponse } from 'next/server'

// Configuration
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second
const MAX_RETRY_DELAY = 10000 // 10 seconds
const REQUEST_TIMEOUT = 30000 // 30 seconds

// Rate limiting (simple in-memory store - for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20

interface OpenAIError {
  error?: {
    message?: string
    type?: string
    code?: string
  }
}

/**
 * Safely parse response as JSON, falling back to text if JSON parsing fails
 */
async function safeParseResponse(response: Response): Promise<{ json?: any; text?: string; error?: string }> {
  try {
    const text = await response.text()

    if (!text || text.trim().length === 0) {
      return { text: '', error: 'Empty response from API' }
    }

    // Try to parse as JSON
    try {
      const json = JSON.parse(text)
      return { json, text }
    } catch (parseError) {
      // If it's not JSON, return the text
      console.warn('Response is not valid JSON, returning as text:', text.substring(0, 200))
      return { text, error: 'Response is not valid JSON' }
    }
  } catch (error) {
    console.error('Failed to read response:', error)
    return { error: `Failed to read response: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay with jitter
 */
function getRetryDelay(retryCount: number): number {
  const exponentialDelay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
    MAX_RETRY_DELAY
  )
  // Add jitter (random delay between 0-25% of the exponential delay)
  const jitter = Math.random() * exponentialDelay * 0.25
  return exponentialDelay + jitter
}

/**
 * Check rate limit for a client
 */
function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const clientData = rateLimitStore.get(clientId)

  if (!clientData || now > clientData.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  clientData.count++
  return true
}

/**
 * Make a request to OpenAI with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout exceeded')
    }
    throw error
  }
}

/**
 * Make a request to OpenAI with retries
 */
async function makeOpenAIRequest(
  apiKey: string,
  messages: any[],
  model: string,
  options: {
    temperature?: number
    max_tokens?: number
    response_format?: { type: string }
    timeout?: number
  } = {},
  retryCount = 0
): Promise<Response> {
  try {
    const timeout = options.timeout || REQUEST_TIMEOUT
    console.log(`[OpenAI] Making request (attempt ${retryCount + 1}/${MAX_RETRIES + 1}), timeout: ${timeout}ms`)

    const requestBody: any = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
    }

    // Add response_format if provided
    if (options.response_format) {
      requestBody.response_format = options.response_format
    }

    const response = await fetchWithTimeout(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      },
      timeout
    )

    // If response is OK, return it
    if (response.ok) {
      console.log('[OpenAI] Request successful')
      return response
    }

    // For certain error codes, retry
    const shouldRetry =
      response.status === 429 || // Rate limit
      response.status === 500 || // Internal server error
      response.status === 502 || // Bad gateway
      response.status === 503 || // Service unavailable
      response.status === 504    // Gateway timeout

    if (shouldRetry && retryCount < MAX_RETRIES) {
      const delay = getRetryDelay(retryCount)
      console.log(`[OpenAI] Request failed with status ${response.status}, retrying in ${Math.round(delay)}ms...`)
      await sleep(delay)
      return makeOpenAIRequest(apiKey, messages, model, options, retryCount + 1)
    }

    // Don't retry for other errors
    return response

  } catch (error) {
    console.error('[OpenAI] Request error:', error)

    // Retry on network errors if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES) {
      const delay = getRetryDelay(retryCount)
      console.log(`[OpenAI] Network error, retrying in ${Math.round(delay)}ms...`)
      await sleep(delay)
      return makeOpenAIRequest(apiKey, messages, model, options, retryCount + 1)
    }

    throw error
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get client identifier for rate limiting
    const clientId = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'default'

    // Check rate limit
    if (!checkRateLimit(clientId)) {
      console.warn(`[OpenAI] Rate limit exceeded for client: ${clientId}`)
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      )
    }

    // Validate API key
    const apiKey = process.env.AI_API_KEY
    if (!apiKey) {
      console.error('[OpenAI] API key not configured')
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add AI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    // Parse and validate request body
    let requestBody
    try {
      requestBody = await request.json()
    } catch (error) {
      console.error('[OpenAI] Invalid request body:', error)
      return NextResponse.json(
        { error: 'Invalid request body: must be valid JSON' },
        { status: 400 }
      )
    }

    const {
      messages,
      model = 'gpt-4o',
      temperature,
      max_tokens,
      response_format,
      timeout
    } = requestBody

    if (!messages || !Array.isArray(messages)) {
      console.error('[OpenAI] Invalid messages parameter')
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    if (messages.length === 0) {
      console.error('[OpenAI] Empty messages array')
      return NextResponse.json(
        { error: 'Invalid request: messages array cannot be empty' },
        { status: 400 }
      )
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        console.error('[OpenAI] Invalid message format:', msg)
        return NextResponse.json(
          { error: 'Invalid request: each message must have role and content' },
          { status: 400 }
        )
      }
    }

    // Use custom timeout if provided, otherwise use default
    const requestTimeout = timeout || REQUEST_TIMEOUT
    console.log(`[OpenAI] Processing request with ${messages.length} messages using model ${model}, timeout: ${requestTimeout}ms`)

    // Prepare options
    const options: {
      temperature?: number
      max_tokens?: number
      response_format?: { type: string }
      timeout?: number
    } = {}

    if (temperature !== undefined) options.temperature = temperature
    if (max_tokens !== undefined) options.max_tokens = max_tokens
    if (response_format !== undefined) options.response_format = response_format
    options.timeout = requestTimeout

    // Make request with retries
    const response = await makeOpenAIRequest(apiKey, messages, model, options)

    // Handle error responses
    if (!response.ok) {
      const parsed = await safeParseResponse(response)

      let errorMessage = 'OpenAI API request failed'
      let errorDetails = ''

      if (parsed.json) {
        const openaiError = parsed.json as OpenAIError
        errorMessage = openaiError.error?.message || errorMessage
        errorDetails = openaiError.error?.type || openaiError.error?.code || ''
      } else if (parsed.text) {
        errorDetails = parsed.text.substring(0, 200) // First 200 chars
      }

      console.error('[OpenAI] API error:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        details: errorDetails
      })

      // Return appropriate error based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key configuration.' },
          { status: 500 } // Don't expose auth issues to client
        )
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }

      if (response.status === 400) {
        return NextResponse.json(
          { error: `Invalid request: ${errorMessage}` },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: errorMessage || 'Failed to generate response. Please try again.' },
        { status: response.status }
      )
    }

    // Parse successful response
    const parsed = await safeParseResponse(response)

    if (!parsed.json) {
      console.error('[OpenAI] Failed to parse successful response as JSON:', parsed.error)
      return NextResponse.json(
        { error: 'Invalid response from OpenAI API' },
        { status: 500 }
      )
    }

    const data = parsed.json
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      console.error('[OpenAI] No content in response:', data)
      return NextResponse.json(
        { error: 'No content received from OpenAI API' },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime
    console.log(`[OpenAI] Request completed successfully in ${duration}ms`)

    return NextResponse.json({ content })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[OpenAI] Unhandled error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration
    })

    // Provide helpful error message
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. The AI service took too long to respond. Please try again.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}