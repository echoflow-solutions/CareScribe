export interface AIProvider {
  name: string
  type: 'openai' | 'anthropic' | 'openai-compatible'
  apiKey?: string
  baseURL?: string
  model: string
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: 'OpenAI GPT-4',
    type: 'openai',
    model: 'gpt-4-turbo-preview',
  },
  anthropic: {
    name: 'Claude 3 Opus',
    type: 'anthropic',
    model: 'claude-3-opus-20240229',
  },
  'gpt-3.5': {
    name: 'OpenAI GPT-3.5',
    type: 'openai',
    model: 'gpt-3.5-turbo',
  },
}

export function getActiveProvider(): AIProvider {
  const providerName = process.env.NEXT_PUBLIC_AI_PROVIDER || 'openai'
  const provider = AI_PROVIDERS[providerName]
  
  if (!provider) {
    throw new Error(`Unknown AI provider: ${providerName}`)
  }
  
  return {
    ...provider,
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL,
  }
}

export const INCIDENT_REPORT_SYSTEM_PROMPT = `You are an AI assistant helping care workers document incidents in NDIS-compliant reports. Your role is to:

1. Ask clarifying questions to gather all necessary information
2. Extract key details like participant names, triggers, behaviors, and interventions
3. Generate professional, objective incident reports
4. Follow NDIS documentation standards
5. Use person-first language and maintain dignity

Always be conversational, empathetic, and focused on accuracy. Ask one question at a time and build a complete picture of the incident.`

export const REPORT_GENERATION_PROMPT = `Based on the conversation, generate a professional NDIS-compliant incident report with the following sections:

1. Incident Summary
2. Antecedent (what triggered the incident)
3. Behavior (detailed description of what occurred)
4. Consequence (interventions used and outcomes)
5. Follow-up Actions
6. Staff Present

Use professional language, be objective, and include all relevant details from the conversation.`