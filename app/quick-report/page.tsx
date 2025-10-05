'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Mic, Keyboard, ArrowRight, ArrowLeft, CheckCircle, Bot,
  Shield, Clock, Sparkles, ChevronRight
} from 'lucide-react'
import { useStore } from '@/lib/store'

// Initial question is always fixed - safety first
const INITIAL_QUESTION = {
  question: "First and most important - is everyone safe right now?",
  subtext: "Were there any injuries to anyone involved?",
  category: 'Safety Check',
  placeholder: "e.g., Yes, everyone is safe. No injuries."
}

// System prompt for AI to guide the conversation
const CONVERSATION_GUIDE_PROMPT = `You are an AI assistant helping a support worker document an incident for NDIS compliance. Your role is to ask ONE follow-up question at a time based on their previous answers.

CRITICAL COMPLIANCE AREAS YOU MUST COVER:
1. Safety & Injuries (if any)
2. Participant identification (full name)
3. What happened (specific incident details)
4. Where it happened (exact location)
5. What happened BEFORE (antecedent/trigger)
6. What happened AFTER (participant's response/emotional state)
7. Medication given (if any - including PRN)
8. First aid provided (if any)

INSTRUCTIONS:
- Ask ONE specific question at a time
- Base your next question on what they just told you
- Be conversational and empathetic like talking to a friend
- If they mention something that needs clarification, ask about it
- Keep track of what information you still need
- When you have ALL 8 areas covered, respond with exactly: "COMPLETE"
- Never ask multiple questions at once

RESPONSE FORMAT:
Just provide the question text. Include a brief subtext hint if helpful, separated by a pipe |

Example responses:
"Which participant was involved? | Please provide their full name"
"Can you tell me more about what triggered this? | What was happening right before?"
"COMPLETE" (when all areas are covered)

Current conversation context:`

interface ConversationTurn {
  question: string
  subtext?: string
  answer: string
  category?: string
}

export default function QuickReportPage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const [isOpen, setIsOpen] = useState(true)
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(INITIAL_QUESTION)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text')
  const [isRecording, setIsRecording] = useState(false)
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    router.back()
  }

  // Calculate progress based on conversation length (estimate 8 questions total)
  const estimatedTotalQuestions = 8
  const progress = Math.min((conversation.length / estimatedTotalQuestions) * 100, 95)

  const generateNextQuestion = async (conversationHistory: ConversationTurn[]) => {
    setIsGeneratingQuestion(true)

    try {
      // Build conversation context for AI
      const conversationContext = conversationHistory.map(turn =>
        `Q: ${turn.question}\nA: ${turn.answer}`
      ).join('\n\n')

      const prompt = CONVERSATION_GUIDE_PROMPT + '\n\n' + conversationContext

      // Call OpenAI API to get next question
      const response = await fetch('/api/ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: 'What should I ask next?' }
          ],
          model: 'gpt-4-turbo-preview',
        }),
      })

      if (!response.ok) throw new Error('Failed to generate question')

      const data = await response.json()
      const aiResponse = data.content.trim()

      // Check if conversation is complete
      if (aiResponse === 'COMPLETE') {
        setIsComplete(true)
        handleCompleteReport(conversationHistory)
        return
      }

      // Parse question and subtext (format: "Question text | Subtext")
      const parts = aiResponse.split('|').map((p: string) => p.trim())
      const nextQuestion = {
        question: parts[0],
        subtext: parts[1] || 'Please provide details',
        category: determineCategoryFromQuestion(parts[0]),
        placeholder: 'Type your answer here...'
      }

      setCurrentQuestion(nextQuestion)
      setCurrentAnswer('')
    } catch (error) {
      console.error('Error generating question:', error)
      // Fallback to basic question
      setCurrentQuestion({
        question: 'Can you provide more details about what happened?',
        subtext: 'Any additional information would be helpful',
        category: 'Additional Details',
        placeholder: 'Type your answer here...'
      })
    } finally {
      setIsGeneratingQuestion(false)
    }
  }

  const determineCategoryFromQuestion = (question: string): string => {
    const lowerQ = question.toLowerCase()
    if (lowerQ.includes('safe') || lowerQ.includes('injur')) return 'Safety Check'
    if (lowerQ.includes('participant') || lowerQ.includes('who')) return 'Participant Info'
    if (lowerQ.includes('where') || lowerQ.includes('location')) return 'Location'
    if (lowerQ.includes('before') || lowerQ.includes('trigger') || lowerQ.includes('antecedent')) return 'Before Incident'
    if (lowerQ.includes('after') || lowerQ.includes('respond') || lowerQ.includes('reaction')) return 'After Incident'
    if (lowerQ.includes('medication')) return 'Medication'
    if (lowerQ.includes('first aid') || lowerQ.includes('medical')) return 'Medical Response'
    return 'Incident Details'
  }

  const handleNext = async () => {
    if (!currentAnswer.trim()) return

    // Save current Q&A to conversation
    const newTurn: ConversationTurn = {
      question: currentQuestion.question,
      subtext: currentQuestion.subtext,
      answer: currentAnswer,
      category: currentQuestion.category
    }

    const updatedConversation = [...conversation, newTurn]
    setConversation(updatedConversation)

    // Generate next question based on conversation
    await generateNextQuestion(updatedConversation)
  }

  const handleBack = () => {
    if (conversation.length > 0) {
      // Go back to previous question
      const previousTurn = conversation[conversation.length - 1]
      setConversation(prev => prev.slice(0, -1))
      setCurrentQuestion({
        question: previousTurn.question,
        subtext: previousTurn.subtext || 'Please provide details',
        category: previousTurn.category || 'Additional Details',
        placeholder: 'Type your answer here...'
      })
      setCurrentAnswer(previousTurn.answer)
    }
  }

  const handleCompleteReport = (conversationHistory: ConversationTurn[]) => {
    // Compile all Q&A into a narrative for AI processing
    const narrative = conversationHistory.map(turn =>
      `Q: ${turn.question}\nA: ${turn.answer}`
    ).join('\n\n')

    // Navigate to AI report generation with full conversation
    router.push('/report/conversational?text=' + encodeURIComponent(narrative))
  }

  const handleVoiceInput = () => {
    setIsRecording(true)
    // Simulate voice input
    setTimeout(() => {
      setCurrentAnswer("Sample voice response")
      setIsRecording(false)
    }, 2000)
  }

  if (!currentUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Incident Report - Guided Questions</DialogTitle>
          <DialogDescription>
            Answer guided questions to create a complete, NDIS-compliant incident report
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Header */}
          <div className="p-6 pb-4 border-b bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AI-Guided Report</h2>
                  <p className="text-sm text-gray-600">
                    {isGeneratingQuestion ? 'AI is thinking...' : `${conversation.length + 1} questions asked`}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                NDIS Compliant
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{currentQuestion?.category || 'Getting started'}</span>
                <span>{isComplete ? '100%' : `~${Math.round(progress)}%`} complete</span>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${conversation.length}-${isGeneratingQuestion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* AI Question Card */}
                <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-xl">
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Bot className={`h-5 w-5 ${isGeneratingQuestion ? 'animate-pulse' : ''}`} />
                      </div>
                      <div className="flex-1">
                        {isGeneratingQuestion ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <h3 className="text-xl font-semibold">AI is thinking...</h3>
                            </div>
                            <p className="text-blue-100 text-sm">Analyzing your response to ask the best follow-up question</p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl font-semibold mb-2">{currentQuestion?.question}</h3>
                            <p className="text-blue-100 text-sm">{currentQuestion?.subtext}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Input method toggle */}
                <div className="flex justify-center">
                  <div className="inline-flex gap-1 bg-gray-200 rounded-lg p-1">
                    <Button
                      variant={inputMode === 'text' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setInputMode('text')}
                      className="gap-2"
                    >
                      <Keyboard className="h-4 w-4" />
                      Type
                    </Button>
                    <Button
                      variant={inputMode === 'voice' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setInputMode('voice')}
                      className="gap-2"
                    >
                      <Mic className="h-4 w-4" />
                      Voice
                    </Button>
                  </div>
                </div>

                {/* Answer Input */}
                {inputMode === 'text' ? (
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder={currentQuestion?.placeholder || "Type your answer here..."}
                    className="min-h-[120px] text-lg border-2 focus:border-primary"
                    autoFocus
                    disabled={isGeneratingQuestion}
                  />
                ) : (
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300">
                    <div className="p-8 text-center">
                      <motion.div
                        animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="relative inline-flex mb-4 cursor-pointer"
                        onClick={handleVoiceInput}
                      >
                        {isRecording && (
                          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25" />
                        )}
                        <div className={`relative rounded-full p-6 transition-all hover:scale-105 ${
                          isRecording ? 'bg-red-500 shadow-xl shadow-red-500/50' : 'bg-blue-500 shadow-lg shadow-blue-500/50'
                        } text-white`}>
                          <Mic className="h-10 w-10" />
                        </div>
                      </motion.div>
                      <p className={`text-lg font-medium ${
                        isRecording ? 'text-red-600 animate-pulse' : 'text-gray-700'
                      }`}>
                        {isRecording ? 'Recording...' : 'Tap to Speak'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {isRecording ? 'Speaking now...' : 'Click the microphone to start'}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Character count / help text */}
                {inputMode === 'text' && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Be as specific as possible
                    </span>
                    <span>{currentAnswer.length} characters</span>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={conversation.length === 0 || isGeneratingQuestion}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={handleNext}
                    disabled={!currentAnswer.trim() || isGeneratingQuestion}
                  >
                    {isGeneratingQuestion ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Answered questions preview */}
                {conversation.length > 0 && (
                  <Card className="bg-green-50 border-green-200">
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{conversation.length} question{conversation.length > 1 ? 's' : ''} answered</span>
                      </div>
                      <p className="text-xs text-green-600">
                        AI is adapting questions based on your answers • You can go back anytime
                      </p>
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}