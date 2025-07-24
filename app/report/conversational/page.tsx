'use client'

import { Suspense } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mic, Keyboard, ChevronRight, Check, AlertCircle,
  Camera, User, Bot, Loader2, ArrowLeft
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { AIService } from '@/lib/ai/service'
import type { ConversationMessage as AIMessage } from '@/lib/ai/service'

interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ReportData {
  participant?: string
  incidentType: string
  severity: string
  description: string
  antecedent?: string
  behavior?: string
  consequence?: string
  transcript: string
  patternMatch?: any
  conversationalReport: boolean
  understanding?: any
}

interface AIUnderstanding {
  participant?: string
  trigger?: string
  time?: string
  behavior?: string
  propertyDamage?: boolean
}

// AI conversation state management
const MAX_CONVERSATION_TURNS = 10 // Prevent infinite conversations

function ConversationalReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentUser } = useStore()
  const [loading, setLoading] = useState(true)
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')
  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [conversationTurns, setConversationTurns] = useState(0)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [showPhoto, setShowPhoto] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiUnderstanding, setAiUnderstanding] = useState<AIUnderstanding>({})
  const [reportText, setReportText] = useState('')
  const [participant, setParticipant] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const participantId = searchParams.get('participant')
    if (participantId) {
      loadParticipant(participantId)
    }
    loadInitialData()
  }, [searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadParticipant = async (participantId: string) => {
    const participants = await DataService.getParticipants()
    const found = participants.find(p => p.id === participantId)
    if (found) {
      setParticipant(found)
    }
  }

  const loadInitialData = async () => {
    setLoading(false)
    // Get initial description from URL params
    const initialDescription = searchParams.get('text') || ''
    
    if (initialDescription) {
      // Add user's initial description
      const userMessage: ConversationMessage = {
        id: '1',
        role: 'user',
        content: initialDescription,
        timestamp: new Date()
      }
      setMessages([userMessage])
      
      // Generate AI response
      setIsProcessing(true)
      try {
        const aiResponse = await AIService.generateQuickResponse(initialDescription)
        const assistantMessage: ConversationMessage = {
          id: '2',
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } catch (error) {
        console.error('AI response error:', error)
        // Fallback message
        const fallbackMessage: ConversationMessage = {
          id: '2',
          role: 'assistant',
          content: 'I understand there was an incident. Can you tell me if everyone involved is safe and uninjured?',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, fallbackMessage])
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleVoiceStart = () => {
    setIsRecording(true)
    // Simulate voice recording
    setTimeout(() => {
      handleVoiceComplete()
    }, 3000)
  }

  const handleVoiceComplete = () => {
    setIsRecording(false)
    // In a real implementation, we'd process the audio and transcribe it
    // For demo, we'll use a sample response
    const sampleResponses = [
      "Yes, everyone is safe. No injuries.",
      "It was during lunchtime, around 12:30.",
      "He became upset when we ran out of his favorite food.",
      "We used calming techniques and moved him to a quiet space."
    ]
    const response = sampleResponses[conversationTurns % sampleResponses.length]
    processUserResponse(response)
  }

  const handleTextSubmit = () => {
    if (!userInput.trim()) return
    processUserResponse(userInput)
    setUserInput('')
  }

  const processUserResponse = async (response: string) => {
    // Add user message
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: response,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setConversationTurns(prev => prev + 1)

    // Update report text
    updateReportText(response)

    // Check if we should generate the report
    if (conversationTurns >= MAX_CONVERSATION_TURNS - 1 || 
        response.toLowerCase().includes('that\'s all') ||
        response.toLowerCase().includes('nothing else')) {
      setIsProcessing(true)
      const finalMessage: ConversationMessage = {
        id: Date.now().toString() + '-final',
        role: 'assistant',
        content: 'Thank you for providing all the details. I\'m now generating a comprehensive incident report for your review.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, finalMessage])
      setTimeout(() => {
        generateReport()
      }, 2000)
      return
    }

    // Generate AI response
    setIsProcessing(true)
    try {
      const aiMessages: AIMessage[] = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
      aiMessages.push({ role: 'user', content: response })
      
      const aiResponse = await AIService.generateConversationalResponse(aiMessages, response)
      
      const assistantMessage: ConversationMessage = {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      
      // Extract understanding from AI response
      updateAIUnderstanding(response, aiResponse)
    } catch (error) {
      console.error('AI response error:', error)
      // Fallback to ask for more details
      const fallbackMessage: ConversationMessage = {
        id: Date.now().toString() + '-fallback',
        role: 'assistant',
        content: 'Can you provide more details about what happened?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const updateReportText = (response: string) => {
    const timestamp = new Date().toLocaleString()
    const newEntry = `[${timestamp}] ${currentUser?.name}: ${response}\n`
    setReportText(prev => prev + newEntry)
  }

  const generateReport = async () => {
    setIsGeneratingReport(true)
    try {
      // Generate final report using AI
      const aiMessages: AIMessage[] = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
      
      const { report, understanding } = await AIService.generateFinalReport(aiMessages)
      
      // Check for pattern matching
      const matchedPattern = participant?.behaviorPatterns?.find((p: any) => 
        reportText.toLowerCase().includes(p.trigger?.toLowerCase())
      )

      // Navigate to review with report data
      const reportData: ReportData = {
        participant: understanding.participant || participant?.name || 'Unknown Participant',
        incidentType: 'behavioral',
        severity: understanding.injuries ? 'high' : understanding.propertyDamage ? 'medium' : 'low',
        description: report,
        antecedent: understanding.trigger,
        behavior: understanding.behavior,
        consequence: understanding.interventions?.join(', ') || 'Staff intervention applied',
        transcript: reportText,
        patternMatch: matchedPattern,
        conversationalReport: true,
        understanding
      }

      // Store in session storage for review page
      sessionStorage.setItem('reportDraft', JSON.stringify(reportData))
      router.push('/report/review')
    } catch (error) {
      console.error('Report generation error:', error)
      // Fallback report generation
      const fallbackReport: ReportData = {
        participant: participant?.name || 'Unknown Participant',
        incidentType: 'behavioral',
        severity: 'medium',
        description: reportText,
        transcript: reportText,
        conversationalReport: true
      }
      sessionStorage.setItem('reportDraft', JSON.stringify(fallbackReport))
      router.push('/report/review')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const handlePhotoCapture = () => {
    setShowPhoto(true)
    setTimeout(() => {
      setShowPhoto(false)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const updateAIUnderstanding = (userResponse: string, aiResponse: string) => {
    const combined = userResponse + ' ' + aiResponse
    const newUnderstanding: any = {}
    
    // Extract participant name
    const nameMatch = combined.match(/(?:participant|client|resident|person)(?:\s+named?)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)
    if (nameMatch) newUnderstanding.participant = nameMatch[1]
    
    // Extract time
    const timeMatch = combined.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)|(\d{1,2}\s*(?:o'clock))/i)
    if (timeMatch) newUnderstanding.time = timeMatch[0]
    
    // Extract trigger
    const triggerWords = ['triggered by', 'caused by', 'started when', 'began when', 'because']
    for (const trigger of triggerWords) {
      const triggerMatch = combined.match(new RegExp(`${trigger}\s+([^.]+)`, 'i'))
      if (triggerMatch) {
        newUnderstanding.trigger = triggerMatch[1].trim()
        break
      }
    }
    
    // Check for property damage and injuries
    newUnderstanding.propertyDamage = /property damage|broke|damaged|destroyed/i.test(combined)
    newUnderstanding.injuries = /injur|hurt|harm|wound/i.test(combined) && !/no injur/i.test(combined)
    
    setAiUnderstanding(prev => ({ ...prev, ...newUnderstanding }))
  }

  const progress = Math.min((conversationTurns / MAX_CONVERSATION_TURNS) * 100, 95)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Conversational Reporting</h1>
              <p className="text-gray-600">Having a conversation about the incident</p>
            </div>
            <Badge variant="secondary" className="text-lg py-2 px-4">
              {isGeneratingReport ? 'Generating Report...' : 'AI Conversation'}
            </Badge>
          </div>
          
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        {/* Chat Interface */}
        <Card className="mb-6">
          <div className="h-[500px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}>
                      <div className={`p-2 rounded-full ${
                        message.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </div>
                      <div className={`rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p>{message.content}</p>
                        <span className={`text-xs mt-1 block ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                {/* Input Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={inputMode === 'voice' ? 'default' : 'ghost'}
                    onClick={() => setInputMode('voice')}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={inputMode === 'text' ? 'default' : 'ghost'}
                    onClick={() => setInputMode('text')}
                  >
                    <Keyboard className="h-4 w-4" />
                  </Button>
                </div>

                {/* Input Field */}
                {inputMode === 'text' ? (
                  <>
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                      placeholder="Type your response..."
                      className="flex-1"
                    />
                    <Button onClick={handleTextSubmit}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant={isRecording ? 'destructive' : 'default'}
                      size="lg"
                      className="flex-1"
                      onClick={isRecording ? handleVoiceComplete : handleVoiceStart}
                    >
                      <Mic className={`h-5 w-5 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                      {isRecording ? 'Recording... Tap to stop' : 'Tap to speak'}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePhotoCapture}
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* AI Understanding Panel */}
        {Object.keys(aiUnderstanding).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  AI Understanding
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {aiUnderstanding.participant && (
                    <div>
                      <span className="text-gray-500">Participant:</span>
                      <span className="ml-2 font-medium">{aiUnderstanding.participant}</span>
                    </div>
                  )}
                  {aiUnderstanding.trigger && (
                    <div>
                      <span className="text-gray-500">Trigger:</span>
                      <span className="ml-2 font-medium">{aiUnderstanding.trigger}</span>
                    </div>
                  )}
                  {aiUnderstanding.behavior && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Behavior:</span>
                      <span className="ml-2 font-medium">{aiUnderstanding.behavior}</span>
                    </div>
                  )}
                  {aiUnderstanding.time && (
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <span className="ml-2 font-medium">{aiUnderstanding.time}</span>
                    </div>
                  )}
                  {aiUnderstanding.propertyDamage !== undefined && (
                    <div>
                      <span className="text-gray-500">Property Damage:</span>
                      <span className="ml-2 font-medium">
                        {aiUnderstanding.propertyDamage ? 'Yes' : 'No'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Photo Capture Simulation */}
        <AnimatePresence>
          {showPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white rounded-lg p-8"
              >
                <div className="text-center">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Photo Captured</p>
                  <p className="text-gray-600">Property damage documented</p>
                  <Check className="h-8 w-8 text-green-600 mx-auto mt-4" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function ConversationalReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ConversationalReportContent />
    </Suspense>
  )
}