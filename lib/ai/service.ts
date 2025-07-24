import { getActiveProvider, INCIDENT_REPORT_SYSTEM_PROMPT, REPORT_GENERATION_PROMPT } from './config'

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ReportGenerationResult {
  report: string
  understanding: {
    participant?: string
    trigger?: string
    behavior?: string
    time?: string
    location?: string
    interventions?: string[]
    propertyDamage?: boolean
    injuries?: boolean
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
    const response = await fetch('/api/ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: provider.model,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate response')
    }
    
    const data = await response.json()
    return data.content
  }
  
  private static async callAnthropic(
    messages: ConversationMessage[],
    provider: any
  ): Promise<string> {
    const response = await fetch('/api/ai/anthropic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: provider.model,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to generate response')
    }
    
    const data = await response.json()
    return data.content
  }
  
  private static extractUnderstanding(
    conversation: ConversationMessage[],
    reportText: string
  ): ReportGenerationResult['understanding'] {
    const text = conversation.map(m => m.content).join(' ') + ' ' + reportText
    
    // Simple extraction logic - in production, this could use NLP
    const understanding: ReportGenerationResult['understanding'] = {}
    
    // Extract participant name
    const nameMatch = text.match(/(?:participant|client|resident)(?:\s+named?)?\s+(\w+\s+\w+)/i)
    if (nameMatch) understanding.participant = nameMatch[1]
    
    // Extract trigger
    const triggerMatch = text.match(/(?:triggered by|caused by|started when|began when)\s+([^.]+)/i)
    if (triggerMatch) understanding.trigger = triggerMatch[1].trim()
    
    // Check for property damage
    understanding.propertyDamage = /property damage|broke|damaged|destroyed/i.test(text)
    
    // Check for injuries
    understanding.injuries = /injur|hurt|harm|wound/i.test(text) && !/no injur/i.test(text)
    
    return understanding
  }
  
  static async generateQuickResponse(initialDescription: string): Promise<string> {
    // Generate the first AI response based on the initial incident description
    const provider = getActiveProvider()
    
    const messages: ConversationMessage[] = [
      { role: 'system', content: INCIDENT_REPORT_SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: `I need to report an incident: ${initialDescription}`
      }
    ]
    
    if (provider.type === 'openai') {
      return this.callOpenAI(messages, provider)
    } else if (provider.type === 'anthropic') {
      return this.callAnthropic(messages, provider)
    }
    
    throw new Error(`Unsupported provider type: ${provider.type}`)
  }
}