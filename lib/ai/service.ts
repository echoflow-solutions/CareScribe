import { getActiveProvider, INCIDENT_REPORT_SYSTEM_PROMPT, REPORT_GENERATION_PROMPT } from './config'

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ReportGenerationResult {
  report: string
  understanding: {
    // Basic Info
    participant?: string
    location?: string
    time?: string

    // Before (Antecedent)
    trigger?: string
    beforeIncident?: string

    // During (Incident)
    behavior?: string
    peopleInvolved?: string[]
    injuries?: boolean
    injuryDetails?: string
    propertyDamage?: boolean
    propertyDamageDetails?: string

    // After (Post-Incident)
    participantReaction?: string
    emotionalState?: string

    // Interventions
    interventions?: string[]
    immediateActions?: string[]

    // Medical Response
    medicationGiven?: boolean
    medicationDetails?: string
    firstAidProvided?: boolean
    firstAidDetails?: string
    medicalServicesContacted?: boolean
    medicalServicesDetails?: string
  }
}

export class AIService {
  static async generateConversationalResponse(
    messages: ConversationMessage[],
    userInput: string
  ): Promise<string> {
    const provider = getActiveProvider()
    
    const allMessages: ConversationMessage[] = [
      { role: 'system', content: INCIDENT_REPORT_SYSTEM_PROMPT },
      ...messages,
      { role: 'user', content: userInput }
    ]
    
    if (provider.type === 'openai') {
      return this.callOpenAI(allMessages, provider)
    } else if (provider.type === 'anthropic') {
      return this.callAnthropic(allMessages, provider)
    }
    
    throw new Error(`Unsupported provider type: ${provider.type}`)
  }
  
  static async generateFinalReport(
    conversation: ConversationMessage[]
  ): Promise<ReportGenerationResult> {
    const provider = getActiveProvider()
    
    const messages: ConversationMessage[] = [
      { role: 'system', content: REPORT_GENERATION_PROMPT },
      { 
        role: 'user', 
        content: `Here is the conversation about the incident:\n\n${
          conversation.map(m => `${m.role}: ${m.content}`).join('\n')
        }\n\nPlease generate a professional incident report based on this conversation.`
      }
    ]
    
    const reportText = provider.type === 'openai' 
      ? await this.callOpenAI(messages, provider)
      : await this.callAnthropic(messages, provider)
    
    // Extract understanding from the conversation
    const understanding = this.extractUnderstanding(conversation, reportText)
    
    return { report: reportText, understanding }
  }
  
  private static async callOpenAI(
    messages: ConversationMessage[],
    provider: any
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: provider.model,
        }),
      })

      if (!response.ok) {
        // Try to parse error response, but handle non-JSON responses
        let errorMessage = 'Failed to generate response'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (parseError) {
          // If we can't parse the error, try to get it as text
          try {
            const errorText = await response.text()
            if (errorText) {
              errorMessage = `Server error: ${errorText.substring(0, 100)}`
            }
          } catch (textError) {
            // Fall back to status-based error
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
        }

        console.error('[AIService] OpenAI call failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        })

        throw new Error(errorMessage)
      }

      // Parse successful response
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('[AIService] Failed to parse OpenAI response:', parseError)
        throw new Error('Invalid response format from AI service')
      }

      if (!data.content) {
        console.error('[AIService] No content in OpenAI response:', data)
        throw new Error('No response content received from AI service')
      }

      return data.content
    } catch (error) {
      // Re-throw with more context if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to AI service. Please check your connection.')
      }
      throw error
    }
  }
  
  private static async callAnthropic(
    messages: ConversationMessage[],
    provider: any
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai/anthropic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: provider.model,
        }),
      })

      if (!response.ok) {
        // Try to parse error response, but handle non-JSON responses
        let errorMessage = 'Failed to generate response'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (parseError) {
          // If we can't parse the error, try to get it as text
          try {
            const errorText = await response.text()
            if (errorText) {
              errorMessage = `Server error: ${errorText.substring(0, 100)}`
            }
          } catch (textError) {
            // Fall back to status-based error
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
        }

        console.error('[AIService] Anthropic call failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage
        })

        throw new Error(errorMessage)
      }

      // Parse successful response
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('[AIService] Failed to parse Anthropic response:', parseError)
        throw new Error('Invalid response format from AI service')
      }

      if (!data.content) {
        console.error('[AIService] No content in Anthropic response:', data)
        throw new Error('No response content received from AI service')
      }

      return data.content
    } catch (error) {
      // Re-throw with more context if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to AI service. Please check your connection.')
      }
      throw error
    }
  }
  
  private static extractUnderstanding(
    conversation: ConversationMessage[],
    reportText: string
  ): ReportGenerationResult['understanding'] {
    const text = conversation.map(m => m.content).join(' ') + ' ' + reportText
    const lowerText = text.toLowerCase()

    const understanding: ReportGenerationResult['understanding'] = {}

    // Extract participant name
    const nameMatch = text.match(/(?:participant|client|resident)(?:\s+named?|was|is)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)
    if (nameMatch) understanding.participant = nameMatch[1]

    // Extract location
    const locationMatch = text.match(/(?:in|at|location|room|area)(?:\s+the)?\s+([^.,\n]+(?:room|lounge|kitchen|bathroom|bedroom|area|house|facility))/i)
    if (locationMatch) understanding.location = locationMatch[1].trim()

    // Extract time
    const timeMatch = text.match(/(?:at|around|approximately)\s+(\d{1,2}:\d{2}\s*(?:am|pm)?|\d{1,2}\s*(?:am|pm))/i)
    if (timeMatch) understanding.time = timeMatch[1]

    // Extract trigger/antecedent
    const triggerMatch = text.match(/(?:triggered by|caused by|started when|began when|before.*?incident|antecedent.*?was)\s+([^.]+)/i)
    if (triggerMatch) understanding.trigger = triggerMatch[1].trim()

    // Extract before incident details
    const beforeMatch = text.match(/(?:before|prior to|leading up).*?(?:incident|event)[:\s]+([^.]+)/i)
    if (beforeMatch) understanding.beforeIncident = beforeMatch[1].trim()

    // Extract behavior
    const behaviorMatch = text.match(/(?:behavior|behavio?r|did|action).*?(?:was|included|involved)[:\s]+([^.]+)/i)
    if (behaviorMatch) understanding.behavior = behaviorMatch[1].trim()

    // Check for injuries
    understanding.injuries = /injur(?:y|ies|ed)|hurt|harm|wound/i.test(text) && !/no injur|without injur|not injured|no one.*hurt/i.test(lowerText)
    if (understanding.injuries) {
      const injuryMatch = text.match(/injur(?:y|ies|ed).*?(?:to|was|included)[:\s]*([^.]+)/i)
      if (injuryMatch) understanding.injuryDetails = injuryMatch[1].trim()
    }

    // Check for property damage
    understanding.propertyDamage = /property damage|broke|damaged|destroyed|knocked over|pushed.*?over|smashed/i.test(text)
    if (understanding.propertyDamage) {
      const damageMatch = text.match(/(?:property damage|broke|damaged|destroyed|knocked over|pushed.*?over)[:\s]*([^.]+)/i)
      if (damageMatch) understanding.propertyDamageDetails = damageMatch[1].trim()
    }

    // Extract participant reaction after incident
    const reactionMatch = text.match(/(?:after|following|subsequently).*?(?:participant|client|resident).*?(?:was|became|appeared)[:\s]*([^.]+)/i)
    if (reactionMatch) understanding.participantReaction = reactionMatch[1].trim()

    // Extract emotional state
    const emotionMatch = text.match(/(?:emotional state|mood|feeling|appeared|seemed)[:\s]*([^.]+)/i)
    if (emotionMatch) understanding.emotionalState = emotionMatch[1].trim()

    // Extract interventions
    const interventionMatches = text.match(/(?:intervention|strategy|technique|approach|response).*?(?:was|included|used)[:\s]*([^.]+)/gi)
    if (interventionMatches) {
      understanding.interventions = interventionMatches.map(m => m.trim())
    }

    // Check for medication
    understanding.medicationGiven = /medication.*?(?:given|administered|provided)|gave.*?medication|administered.*?(?:prn|medication)/i.test(text) && !/no medication|without medication|did not.*?medication/i.test(lowerText)
    if (understanding.medicationGiven) {
      const medMatch = text.match(/(?:medication|gave|administered).*?(?:was|included|details)[:\s]*([^.]+)/i)
      if (medMatch) understanding.medicationDetails = medMatch[1].trim()
    }

    // Check for first aid
    understanding.firstAidProvided = /first aid.*?(?:given|provided|administered)|provided.*?first aid|administered.*?first aid/i.test(text) && !/no first aid|without first aid|did not.*?first aid/i.test(lowerText)
    if (understanding.firstAidProvided) {
      const firstAidMatch = text.match(/(?:first aid).*?(?:was|included|provided|details)[:\s]*([^.]+)/i)
      if (firstAidMatch) understanding.firstAidDetails = firstAidMatch[1].trim()
    }

    // Check for medical services
    understanding.medicalServicesContacted = /(?:ambulance|doctor|nurse|medical.*?service|called.*?(?:000|ambulance|doctor|medical))/i.test(text)
    if (understanding.medicalServicesContacted) {
      const medServicesMatch = text.match(/(?:ambulance|doctor|nurse|medical.*?service|called).*?([^.]+)/i)
      if (medServicesMatch) understanding.medicalServicesDetails = medServicesMatch[1].trim()
    }

    return understanding
  }
  
  static async generateQuickResponse(initialDescription: string): Promise<string> {
    // Generate the first AI response based on the initial incident description
    // CRITICAL: Must start with safety-first questioning per NDIS compliance
    const provider = getActiveProvider()

    const messages: ConversationMessage[] = [
      { role: 'system', content: INCIDENT_REPORT_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `I need to report an incident: ${initialDescription}`
      },
      {
        role: 'assistant',
        content: `I understand there's been an incident. First and most important - is everyone safe right now? Were there any injuries to anyone involved?

Once you confirm everyone's safety, I'll help you document this incident comprehensively. Which participant was involved?`
      }
    ]

    // Return the pre-formatted safety-first response that ensures compliance
    return `I understand there's been an incident. First and most important - is everyone safe right now? Were there any injuries to anyone involved?

Once you confirm everyone's safety, I'll help you document this incident comprehensively. Which participant was involved?`
  }
}