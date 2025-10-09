'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  Shield, Clock, Sparkles, ChevronRight, Save, WifiOff, Wifi,
  AlertCircle, CheckCircle2, Loader2, FileText, Edit2, Plus,
  Pause, Play, Square, Volume2
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/hooks/use-toast'

// Initial question is always fixed - safety first
const INITIAL_QUESTION = {
  question: "First and most important - is everyone safe right now?",
  subtext: "Were there any injuries to anyone involved?",
  category: 'Safety Check',
  placeholder: "e.g., Yes, everyone is safe. No injuries."
}

// System prompt for AI to guide the conversation
const CONVERSATION_GUIDE_PROMPT = `You are an intelligent AI assistant helping a support worker document an incident for NDIS compliance. Your role is to ask ONE follow-up question at a time based on their previous answers.

CRITICAL RULES:
1. Carefully read ALL previous answers to see what information has already been provided
2. If a user provides more info than asked (e.g., "Michael Lee" when you only asked for first name), recognize you now have BOTH pieces of information
3. NEVER ask for information that has already been given
4. Skip to the next MISSING piece of information
5. Your response should ONLY be the next question - nothing else

INFORMATION YOU NEED TO GATHER (only ask if missing):
1. Safety & Injuries status
2. Participant's full name (first AND last - if they gave both together, you have it)
3. When it happened (date and time)
4. Where exactly it happened (specific location)
5. What happened (detailed description)
6. What happened BEFORE (trigger/antecedent)
7. What happened AFTER (consequence/response)
8. Who witnessed it
9. What support was provided
10. First aid (if any)
11. Medication (if any)
12. Environmental factors
13. Impact on others
14. Property damage
15. Follow-up needed

INSTRUCTIONS:
- Be conversational and empathetic
- Ask ONE specific question at a time for the next MISSING piece of information
- Prioritize: safety → participant → what/when/where → behavioral details → medical → follow-up
- When you have comprehensive information covering all areas, respond with exactly: "COMPLETE"
- If user provides minimal info, ask follow-up questions for more detail

RESPONSE FORMAT - CRITICAL:
You MUST respond with ONLY the question text (and optional subtext after a pipe |)
Do NOT include any analysis, reasoning, or list of what you know
Just the question, nothing else

Good examples:
"What's the participant's last name? | We need their full name for the report"
"When did this incident happen? | Approximate time is fine, like 'around 2 PM'"
"COMPLETE"

Bad examples:
"Based on the conversation history, here's what we know: ..." ❌ DON'T DO THIS
"I can see that..." ❌ DON'T DO THIS

Current conversation context:`

interface ConversationTurn {
  question: string
  subtext?: string
  answer: string
  category?: string
  timestamp?: string
}

type SaveStatus = 'saving' | 'saved' | 'error' | 'offline' | 'idle'

// Configuration
const AUTO_SAVE_DELAY = 2000 // 2 seconds debounce
const ACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const SESSION_WARNING_TIME = 25 * 60 * 1000 // 25 minutes (warn 5 min before timeout)
const LOCAL_STORAGE_KEY = 'draft_report_backup'

export default function QuickReportPage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(true)
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(INITIAL_QUESTION)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text')
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Voice recording state
  const [recordingState, setRecordingState] = useState<'idle' | 'listening' | 'paused' | 'processing'>('idle')
  const [audioSegments, setAudioSegments] = useState<Array<{ id: string; blob: Blob; duration: number; transcription?: string; isTranscribing?: boolean }>>([])
  const [currentSegmentDuration, setCurrentSegmentDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const recordingStartRef = useRef<number>(0)
  const currentChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save and resilience state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [isOnline, setIsOnline] = useState(true)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [lastActivityTime, setLastActivityTime] = useState(Date.now())
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false)
  const [recoveredDraft, setRecoveredDraft] = useState<any>(null)
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)
  const [showCompletionReview, setShowCompletionReview] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [showEarlyFinishDialog, setShowEarlyFinishDialog] = useState(false)

  // Refs for timers and debouncing
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const activityCheckTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveDataRef = useRef<string>('')

  // Track activity to prevent timeout
  const trackActivity = useCallback(() => {
    const now = Date.now()
    setLastActivityTime(now)

    // Hide session warning if shown
    if (showSessionWarning) {
      setShowSessionWarning(false)
    }
  }, [showSessionWarning])

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Draft] Back online')
      setIsOnline(true)
      // Trigger save when back online
      saveDraft()
    }

    const handleOffline = () => {
      console.log('[Draft] Gone offline')
      setIsOnline(false)
      setSaveStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial state
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Activity timeout monitoring
  useEffect(() => {
    const checkActivity = () => {
      const timeSinceActivity = Date.now() - lastActivityTime

      // Show warning 5 minutes before timeout
      if (timeSinceActivity > SESSION_WARNING_TIME && !showSessionWarning) {
        setShowSessionWarning(true)
      }

      // Save and cleanup if timeout exceeded
      if (timeSinceActivity > ACTIVITY_TIMEOUT) {
        console.log('[Draft] Session timeout - saving draft')
        saveDraft()
      }
    }

    // Check every minute
    activityCheckTimerRef.current = setInterval(checkActivity, 60000)

    return () => {
      if (activityCheckTimerRef.current) {
        clearInterval(activityCheckTimerRef.current)
      }
    }
  }, [lastActivityTime, showSessionWarning])

  // Save draft function
  const saveDraft = useCallback(async () => {
    if (!currentUser) return

    try {
      // Prepare draft data
      const draftData = {
        id: draftId || undefined,
        user_id: currentUser.id,
        facility_id: currentUser.facilityId,
        conversation,
        current_question: currentQuestion,
        current_answer: currentAnswer,
        progress: Math.floor(Math.min((conversation.length / 8) * 100, 95)),
        session_id: sessionId,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        }
      }

      // Check if data has changed
      const currentDataString = JSON.stringify(draftData)
      if (currentDataString === lastSaveDataRef.current) {
        return // No changes, skip save
      }

      // Always save to local storage as backup
      localStorage.setItem(LOCAL_STORAGE_KEY, currentDataString)
      lastSaveDataRef.current = currentDataString

      // If offline or using local storage mode, only save locally
      if (!isOnline || process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true') {
        setSaveStatus(isOnline ? 'saved' : 'offline')
        setTimeout(() => setSaveStatus('idle'), 2000)
        console.log('[Draft] Saved to local storage')
        return
      }

      // Try to save to server
      setSaveStatus('saving')

      try {
        const response = await fetch('/api/drafts/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: currentDataString,
        })

        if (response.ok) {
          const result = await response.json()

          if (result.success) {
            // Update draft ID if new draft was created
            if (result.draft?.id && !draftId) {
              setDraftId(result.draft.id)
            }

            setSaveStatus('saved')
            setTimeout(() => setSaveStatus('idle'), 2000)
            console.log('[Draft] Saved successfully to server')
          } else {
            throw new Error(result.error || 'Failed to save')
          }
        } else {
          // Server error - fall back to local storage (already saved above)
          console.warn('[Draft] Server save failed, using local storage')
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        }
      } catch (fetchError) {
        // Network error - fall back to local storage (already saved above)
        console.warn('[Draft] Network error, using local storage:', fetchError)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    } catch (error) {
      console.error('[Draft] Save error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [currentUser, draftId, conversation, currentQuestion, currentAnswer, sessionId, isOnline])

  // Auto-save with debouncing
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    // Don't auto-save if no conversation started or complete
    if (conversation.length === 0 && !currentAnswer) return
    if (isComplete) return

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft()
    }, AUTO_SAVE_DELAY)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [conversation, currentAnswer, isComplete, saveDraft])

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (!currentUser) return

      try {
        // Check local storage first (always available)
        const localDraft = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (localDraft) {
          const parsed = JSON.parse(localDraft)
          // Only recover if it has content
          if (parsed.conversation?.length > 0) {
            setRecoveredDraft(parsed)
            setShowRecoveryDialog(true)
            return // Found local draft, no need to check server
          }
        }

        // Only try server if using Supabase
        if (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE !== 'true') {
          const response = await fetch(
            `/api/drafts/active?user_id=${currentUser.id}&session_id=${sessionId}`
          )

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.draft) {
              setRecoveredDraft(result.draft)
              setShowRecoveryDialog(true)
            }
          }
        }
      } catch (error) {
        console.error('[Draft] Load error:', error)
        // Errors are non-fatal - app continues without draft recovery
      }
    }

    loadDraft()
  }, [currentUser, sessionId])

  // Recover draft function
  const recoverDraft = useCallback(() => {
    if (!recoveredDraft) return

    setDraftId(recoveredDraft.id || null)
    setConversation(recoveredDraft.conversation || [])

    if (recoveredDraft.current_question) {
      setCurrentQuestion(recoveredDraft.current_question)
    }

    if (recoveredDraft.current_answer) {
      setCurrentAnswer(recoveredDraft.current_answer)
    }

    setShowRecoveryDialog(false)
    console.log('[Draft] Recovered draft successfully')
  }, [recoveredDraft])

  // Discard draft function
  const discardDraft = useCallback(async () => {
    // Try to delete from server if we have an ID and not using local storage only
    if (recoveredDraft?.id && process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE !== 'true') {
      try {
        await fetch(`/api/drafts/delete?id=${recoveredDraft.id}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.warn('[Draft] Delete from server failed (non-critical):', error)
      }
    }

    // Always clear local storage
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setShowRecoveryDialog(false)
    setRecoveredDraft(null)
    console.log('[Draft] Discarded draft')
  }, [recoveredDraft])

  // Extend session function
  const extendSession = useCallback(() => {
    trackActivity()
    saveDraft()
    console.log('[Draft] Session extended')
  }, [trackActivity, saveDraft])

  const handleClose = (open: boolean) => {
    // If trying to close the dialog (open = false)
    if (!open) {
      // Check if there's any progress worth confirming
      const hasProgress = conversation.length > 0 || currentAnswer.trim().length > 0

      if (hasProgress) {
        // Show confirmation dialog instead of closing
        setShowCloseConfirmation(true)
        // Don't close the main dialog yet
        return
      }
    }

    // No progress or opening dialog, proceed normally
    setIsOpen(open)
    if (!open) {
      router.back()
    }
  }

  const confirmClose = () => {
    // Save before closing
    saveDraft()
    setShowCloseConfirmation(false)
    setIsOpen(false)
    router.back()
  }

  const discardAndExit = async () => {
    // Delete draft from database if it exists
    if (draftId) {
      try {
        await fetch(`/api/drafts/delete?id=${draftId}`, {
          method: 'DELETE'
        })
      } catch (error) {
        console.warn('[Draft] Delete failed (non-critical):', error)
      }
    }

    // Clear local storage
    localStorage.removeItem(LOCAL_STORAGE_KEY)

    // Clear all state
    setConversation([])
    setCurrentAnswer('')
    setCurrentQuestion(INITIAL_QUESTION)
    setDraftId(null)

    // Close dialog
    setShowCloseConfirmation(false)
    setIsOpen(false)
    router.back()
  }

  const cancelClose = () => {
    setShowCloseConfirmation(false)
  }

  // Intelligent progress calculation based on conversation quality
  const getProgressStage = () => {
    const questionCount = conversation.length

    // Calculate average answer quality (detailed answers = faster completion)
    const avgAnswerLength = conversation.reduce((sum, turn) => sum + turn.answer.length, 0) / (questionCount || 1)
    const isDetailed = avgAnswerLength > 100 // Detailed answers mean less follow-ups needed

    if (questionCount === 0) {
      return { stage: 'Getting started', visual: 5, description: 'Just beginning' }
    } else if (questionCount === 1) {
      return { stage: 'Building context', visual: 15, description: '1 question answered' }
    } else if (questionCount === 2) {
      return { stage: 'Gathering details', visual: 30, description: '2 questions answered' }
    } else if (questionCount === 3) {
      return { stage: 'Understanding the incident', visual: 45, description: '3 questions answered' }
    } else if (questionCount === 4) {
      return { stage: isDetailed ? 'Almost there' : 'Building details', visual: isDetailed ? 70 : 55, description: '4 questions answered' }
    } else if (questionCount === 5) {
      return { stage: isDetailed ? 'Finalizing' : 'Gathering more context', visual: isDetailed ? 85 : 65, description: '5 questions answered' }
    } else if (questionCount >= 6) {
      return { stage: 'Wrapping up', visual: Math.min(90, 60 + (questionCount * 5)), description: `${questionCount} questions answered` }
    }

    return { stage: 'In progress', visual: 40, description: `${questionCount} questions answered` }
  }

  const progressInfo = getProgressStage()
  const progress = progressInfo.visual

  // Calculate NDIS compliance score based on gathered information
  const calculateNDISCompliance = () => {
    const requirements = {
      safetyCheck: false,
      participantIdentified: false,
      locationSpecified: false,
      incidentDescription: false,
      timelineEstablished: false,
      injuryAssessed: false,
      medicationDocumented: false,
      responseActions: false,
      followUp: false,
      antecedent: false
    }

    const conversationText = conversation.map(turn =>
      `${turn.question} ${turn.answer}`.toLowerCase()
    ).join(' ')

    // Check for safety confirmation
    if (conversationText.includes('safe') || conversationText.includes('injury') || conversationText.includes('injuries')) {
      requirements.safetyCheck = true
    }

    // Check for participant identification
    if (conversationText.includes('participant') || conversationText.includes('name') || conversationText.match(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/)) {
      requirements.participantIdentified = true
    }

    // Check for location
    if (conversationText.includes('where') || conversationText.includes('location') || conversationText.includes('room') || conversationText.includes('building')) {
      requirements.locationSpecified = true
    }

    // Check for incident description (minimum 3 questions answered)
    if (conversation.length >= 3) {
      requirements.incidentDescription = true
    }

    // Check for timeline
    if (conversationText.includes('when') || conversationText.includes('time') || conversationText.includes('before') || conversationText.includes('after')) {
      requirements.timelineEstablished = true
    }

    // Check for injury assessment
    if (conversationText.includes('injury') || conversationText.includes('hurt') || conversationText.includes('harm') || conversationText.includes('no injuries')) {
      requirements.injuryAssessed = true
    }

    // Check for medication
    if (conversationText.includes('medication') || conversationText.includes('medicine') || conversationText.includes('prn') || conversationText.includes('no medication')) {
      requirements.medicationDocumented = true
    }

    // Check for response actions
    if (conversationText.includes('did') || conversationText.includes('action') || conversationText.includes('responded') || conversationText.includes('helped')) {
      requirements.responseActions = true
    }

    // Check for antecedent/trigger
    if (conversationText.includes('before') || conversationText.includes('trigger') || conversationText.includes('caused') || conversationText.includes('led to')) {
      requirements.antecedent = true
    }

    // Count completed requirements
    const completed = Object.values(requirements).filter(Boolean).length
    const total = Object.keys(requirements).length
    const percentage = Math.round((completed / total) * 100)

    return {
      percentage,
      completed,
      total,
      requirements,
      missingCritical: !requirements.safetyCheck || !requirements.participantIdentified || !requirements.incidentDescription
    }
  }

  const complianceScore = calculateNDISCompliance()

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', badge: 'bg-green-600' }
    if (percentage >= 60) return { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', badge: 'bg-yellow-600' }
    if (percentage >= 40) return { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', badge: 'bg-orange-600' }
    return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', badge: 'bg-red-600' }
  }

  const complianceColors = getComplianceColor(complianceScore.percentage)

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
            { role: 'user', content: 'What is the next question I should ask? Remember: respond with ONLY the question text (and optional subtext after |). Do not include any analysis or explanation.' }
          ],
          model: 'gpt-4o',
          temperature: 0.3,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate question')

      const data = await response.json()
      const aiResponse = data.content.trim()

      // Check if conversation is complete
      if (aiResponse === 'COMPLETE') {
        setIsComplete(true)
        setShowCompletionReview(true)
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

    trackActivity() // Track user activity

    // Save current Q&A to conversation
    const newTurn: ConversationTurn = {
      question: currentQuestion.question,
      subtext: currentQuestion.subtext,
      answer: currentAnswer,
      category: currentQuestion.category,
      timestamp: new Date().toISOString()
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

  const handleGenerateReport = async () => {
    if (!currentUser) return

    setIsGeneratingReport(true)

    try {
      // Save draft one final time before generating
      await saveDraft()

      // Compile conversation into a narrative
      const conversationText = conversation.map(turn =>
        `Q: ${turn.question}\nA: ${turn.answer}`
      ).join('\n\n')

      // Generate comprehensive report with detailed extraction using AI
      console.log('[Report] Generating comprehensive incident report with AI')

      // Get current date and time
      const now = new Date()
      const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000)
      const defaultTime = thirtyMinsAgo.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

      const extractionPrompt = `You are an NDIS compliance expert. Extract and EXPAND information from this conversation into detailed professional documentation.

CONVERSATION:
${conversationText}

CURRENT DATE/TIME:
- Today's date: ${currentDate}
- Current time: ${defaultTime}

INSTRUCTIONS:
1. Extract facts from conversation
2. EXPAND brief statements with realistic professional details
3. NEVER use "Not specified" or "Unknown" - infer reasonable details
4. Add specific observations (measurements, times, professional language)
5. Write as if you were the professional care worker documenting this

EXPANSION EXAMPLES:
- "fell on knee" → "Participant ambulated when they lost balance and fell to knees on tiled floor. Sustained superficial abrasion to right knee approximately 3cm x 2cm with minimal bleeding. Pain rated 3/10. Remained conscious and alert."
- "kitchen" → "Residential kitchen, communal space, ground floor with tiled flooring and fluorescent lighting."

JSON STRUCTURE - 2-4 sentences per field:

{
  "participant_first_name": "exact first name from conversation",
  "participant_last_name": "exact last name or infer professional placeholder",
  "incident_date": "${currentDate}",
  "incident_time": "specific time from conversation or '${defaultTime}'",

  "location_specific": "Detailed location description with type, flooring, lighting",
  "location_area": "kitchen/bedroom/bathroom/living room/outdoor",
  "witnesses": ["list names or 'Staff member on duty'"],
  "incident_description": "2-4 sentence narrative: what happened before, during, after with professional detail",
  "antecedent": "2-3 sentences: what led up to it, environment, participant's baseline",
  "behavior": "2-3 sentences: specific behaviors observed, body language, duration",
  "consequence": "2-3 sentences: immediate aftermath, participant state, recovery",
  "injuries": "If injury: describe severity, location, size, pain level. If none: state comprehensive assessment showed no injuries",
  "injury_details": "If injury: specific details (size, appearance, pain, function). If none: 'No injuries sustained'",
  "first_aid_provided": "If given: who, when, what was done, participant response. If not: 'Not required, no injuries identified'",
  "medical_attention": "If needed: who contacted, when, advice given. If not: 'Not required based on assessment, vitals stable'",
  "medication_given": "If given: name, dose, time, reason, effect. If not: 'No medication administered'",
  "support_provided": "2-3 sentences: emotional/physical support, techniques used, participant response",
  "environmental_factors": "Lighting, noise, temperature, people present, any changes",
  "contributing_factors": "2-3 sentences: root cause analysis, triggers, patterns, preventive strategies",
  "risk_level": "low/medium/high",
  "immediate_actions": "2-3 sentences: who responded, what they did, notifications made",
  "follow_up_required": "Specific actions needed with responsible parties and deadlines",
  "notification_required": "Who needs to be notified and by when",
  "participant_communication": "How participant communicated (verbal/non-verbal), ability to express needs",
  "participant_emotional_state": "Emotional state before, during, after. Recovery time",
  "property_damage": "If damage: what, extent, cost. If none: 'No property damage'",
  "impact_on_others": "Impact on other participants/staff or 'No impact on others'"
}

Remember: Expand brief statements with professional detail. Each field 2-4 sentences. Never say "Not specified" - infer realistic details.`

      const aiResponse = await fetch('/api/ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are an NDIS compliance expert. You must respond with valid JSON only. Properly escape all special characters in strings.' },
            { role: 'user', content: extractionPrompt }
          ],
          model: 'gpt-4o',
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
          timeout: 120000  // 2 minutes for complex report generation
        }),
      })

      if (!aiResponse.ok) {
        throw new Error('Failed to generate report with AI')
      }

      const aiData = await aiResponse.json()
      let extractedData

      try {
        // Try to parse the JSON response
        const content = aiData.content.trim()
        console.log('[Report] AI Response length:', content.length)

        // Remove markdown code blocks if present
        const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

        // Log a preview of the JSON for debugging
        console.log('[Report] JSON Preview (first 500 chars):', jsonContent.substring(0, 500))

        extractedData = JSON.parse(jsonContent)
        console.log('[Report] Successfully parsed AI response')
      } catch (parseError) {
        console.error('[Report] Failed to parse AI response:', parseError)
        const error = parseError as Error
        console.error('[Report] Parse error details:', {
          name: error.name,
          message: error.message,
          position: error.message.match(/position (\d+)/)?.[1]
        })

        console.log('[Report] Attempting fallback extraction from raw content')

        // Fallback to basic extraction
        extractedData = {
          participant_first_name: 'Unknown',
          participant_last_name: 'Not provided',
          incident_date: new Date().toISOString().split('T')[0],
          incident_time: 'Time not specified',
          location_specific: 'Not specified',
          location_area: 'Not specified',
          witnesses: ['No witnesses mentioned'],
          incident_description: conversationText,
          antecedent: '',
          behavior: '',
          consequence: '',
          injuries: 'No injuries reported',
          injury_details: 'N/A',
          first_aid_provided: 'No',
          medical_attention: 'Not required',
          medication_given: 'None',
          support_provided: 'Information not provided',
          environmental_factors: 'Not specified',
          contributing_factors: 'Not specified',
          risk_level: 'low',
          immediate_actions: 'Not specified',
          follow_up_required: 'To be determined',
          notification_required: 'To be determined',
          participant_communication: 'Not specified',
          participant_emotional_state: 'Not specified',
          property_damage: 'None reported',
          impact_on_others: 'Not specified'
        }
      }

      // Determine incident type based on content
      const contentLower = conversationText.toLowerCase()
      let incidentType = 'behavioral'
      if (contentLower.includes('medical') || contentLower.includes('injury') || contentLower.includes('fall')) {
        incidentType = 'medical'
      } else if (contentLower.includes('property') || contentLower.includes('damage') || contentLower.includes('broke')) {
        incidentType = 'property'
      }

      // Determine severity - normalize to valid database values
      let severity = 'low'
      const riskLevel = (extractedData.risk_level || 'low').toLowerCase().trim()
      if (riskLevel.includes('high') || riskLevel === 'critical' || riskLevel === 'severe') {
        severity = 'high'
      } else if (riskLevel.includes('medium') || riskLevel === 'moderate') {
        severity = 'medium'
      } else {
        severity = 'low'
      }

      // Store comprehensive report data in sessionStorage for review page
      const reportData = {
        // Basic Info
        user_id: currentUser.id,
        facility_id: currentUser.facilityId,
        participant_id: null,

        // Participant Details
        participant_first_name: extractedData.participant_first_name,
        participant_last_name: extractedData.participant_last_name,
        participant_full_name: `${extractedData.participant_first_name} ${extractedData.participant_last_name}`.trim(),

        // Incident Classification
        type: incidentType,
        severity: severity,

        // Time and Location
        incident_date: extractedData.incident_date,
        incident_time: extractedData.incident_time,
        location: extractedData.location_specific,
        location_area: extractedData.location_area,

        // People Involved
        witnesses: extractedData.witnesses,

        // Incident Details (ABC Format)
        description: extractedData.incident_description,
        antecedent: extractedData.antecedent,
        behavior: extractedData.behavior,
        consequence: extractedData.consequence,

        // Medical Information
        injuries: extractedData.injuries,
        injury_details: extractedData.injury_details,
        first_aid_provided: extractedData.first_aid_provided,
        medical_attention: extractedData.medical_attention,
        medication_given: extractedData.medication_given,

        // Response and Support
        support_provided: extractedData.support_provided,
        immediate_actions: extractedData.immediate_actions,

        // Contributing Factors
        environmental_factors: extractedData.environmental_factors,
        contributing_factors: extractedData.contributing_factors,

        // Participant State
        participant_communication: extractedData.participant_communication,
        participant_emotional_state: extractedData.participant_emotional_state,

        // Impact Assessment
        property_damage: extractedData.property_damage,
        impact_on_others: extractedData.impact_on_others,

        // Follow-up
        follow_up_required: extractedData.follow_up_required,
        notification_required: extractedData.notification_required,

        // Legacy fields for backward compatibility
        interventions: [],
        outcomes: [],
        photos: [],
        report_type: 'incident',
        conversation_transcript: conversationText,
        draft_id: draftId,

        // Track AI-generated fields - mark most fields as AI-generated since they're inferred
        aiGenerated: {
          // Participant details - only mark as AI-generated if not directly provided by user
          participant_first_name: false, // Directly asked
          participant_last_name: false, // Directly asked

          // Time and location - may be partially AI-inferred
          incident_time: true, // Often inferred/formatted by AI
          location: false, // Directly asked
          location_area: true, // Often inferred from specific location

          // People involved
          witnesses: true, // May be inferred if not explicitly asked

          // Incident details - often expanded by AI
          description: true, // AI expands this
          antecedent: true, // AI infers/expands this
          behavior: true, // AI expands from brief description
          consequence: true, // AI expands this

          // Medical information - highly expanded by AI
          injuries: true,
          injury_details: true,
          first_aid_provided: true,
          medical_attention: true,
          medication_given: true,

          // Response and support - heavily inferred/expanded by AI
          support_provided: true,
          immediate_actions: true,

          // Contributing factors - AI analysis
          environmental_factors: true,
          contributing_factors: true,

          // Participant state - AI interpretation
          participant_communication: true,
          participant_emotional_state: true,

          // Impact - AI inference
          property_damage: true,
          impact_on_others: true,

          // Follow-up - AI recommendations
          follow_up_required: true,
          notification_required: true
        }
      }

      sessionStorage.setItem('pending_report', JSON.stringify(reportData))

      // Navigate to review page instead of saving directly
      router.push('/report/review')

    } catch (error) {
      console.error('Error generating report:', error)

      // Provide helpful error message to user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
        alert('The AI generated a response that could not be processed. This sometimes happens with very detailed reports. Please try generating the report again, or contact support if the issue persists.')
      } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        alert('Network error: Could not connect to the AI service. Please check your internet connection and try again.')
      } else {
        alert(`Failed to generate report: ${errorMessage}. Please try again or contact support if the issue persists.`)
      }

      setIsGeneratingReport(false)
    }
  }

  const handleEditAnswer = (index: number) => {
    // Load the question and answer back into the form for editing
    const turn = conversation[index]
    setCurrentQuestion({
      question: turn.question,
      subtext: turn.subtext || '',
      category: turn.category || '',
      placeholder: 'Edit your answer...'
    })
    setCurrentAnswer(turn.answer)

    // Remove this Q&A and all subsequent ones
    setConversation(conversation.slice(0, index))
    setIsComplete(false)
    setShowCompletionReview(false)
  }

  const handleContinueQuestioning = () => {
    // User wants to answer more questions
    setIsComplete(false)
    setShowCompletionReview(false)
    setCurrentQuestion({
      question: "Is there anything else you'd like to add about this incident?",
      subtext: 'Any additional details that might be helpful',
      category: 'Additional Information',
      placeholder: 'Type your answer here...'
    })
    setCurrentAnswer('')
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate total duration
  const totalDuration = audioSegments.reduce((sum, seg) => sum + seg.duration, 0) + currentSegmentDuration

  // Visualize audio - smooth and responsive
  const visualizeAudio = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    let smoothedLevel = 0 // For smooth transitions

    const updateAudioLevel = () => {
      if (!analyserRef.current) return

      // Get frequency data
      analyser.getByteFrequencyData(dataArray)

      // Calculate average audio level (0-100)
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength
      const targetLevel = Math.min(100, (average / 255) * 200) // Amplify for better visibility

      // Smooth the level changes for fluid animation
      smoothedLevel += (targetLevel - smoothedLevel) * 0.3 // 30% interpolation

      setAudioLevel(smoothedLevel)

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    }

    updateAudioLevel()
  }, [])

  // Start recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      streamRef.current = stream

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      currentChunksRef.current = []
      recordingStartRef.current = Date.now()

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          currentChunksRef.current.push(event.data)
        }
      }

      recorder.start(100)
      mediaRecorderRef.current = recorder

      // Initialize audio analysis
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      setRecordingState('listening')

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setCurrentSegmentDuration((Date.now() - recordingStartRef.current) / 1000)
      }, 100)

      // Start visualization immediately
      visualizeAudio()

    } catch (error) {
      console.error('[Voice] Microphone access error:', error)
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to use voice input.',
        variant: 'destructive'
      })
    }
  }

  // Pause recording
  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'listening') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  // Resume recording
  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume()
      recordingStartRef.current = Date.now() - (currentSegmentDuration * 1000)
      setRecordingState('listening')
      timerIntervalRef.current = setInterval(() => {
        setCurrentSegmentDuration((Date.now() - recordingStartRef.current) / 1000)
      }, 100)
    }
  }

  // Stop and transcribe
  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current) return

    setRecordingState('processing')

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(currentChunksRef.current, { type: 'audio/webm' })
        const duration = currentSegmentDuration

        const newSegment = {
          id: `segment_${Date.now()}`,
          blob: audioBlob,
          duration: duration,
          isTranscribing: true
        }

        setAudioSegments(prev => [...prev, newSegment])
        setCurrentSegmentDuration(0)

        // Transcribe
        try {
          const formData = new FormData()
          formData.append('audio', audioBlob, 'recording.webm')
          formData.append('language', 'en')
          formData.append('prompt', currentQuestion?.question || '')

          const response = await fetch('/api/ai/whisper', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) throw new Error('Failed to transcribe')

          const data = await response.json()

          setAudioSegments(prev => prev.map(seg =>
            seg.id === newSegment.id
              ? { ...seg, transcription: data.transcription, isTranscribing: false }
              : seg
          ))

          // Only append the NEW transcription (not all transcriptions)
          const newTranscription = data.transcription

          // Append to existing answer (for draft recovery and multiple recordings)
          setCurrentAnswer(prev => {
            if (prev && prev.trim()) {
              // If there's existing text (from draft or previous recordings), append with space
              return `${prev} ${newTranscription}`
            }
            return newTranscription
          })

          // Trigger auto-save for voice transcriptions (same as text input)
          trackActivity()

        } catch (error) {
          console.error('[Voice] Transcription error:', error)
          setAudioSegments(prev => prev.map(seg =>
            seg.id === newSegment.id ? { ...seg, isTranscribing: false } : seg
          ))
          toast({
            title: 'Transcription Error',
            description: 'Failed to transcribe audio. Please try again.',
            variant: 'destructive'
          })
        }

        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
        }

        setRecordingState('idle')
        resolve()
      }

      mediaRecorderRef.current!.stop()
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

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

            {/* Intelligent Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">{progressInfo.stage}</span>
                </div>
                <span className="text-xs text-gray-500">{progressInfo.description}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 italic">
                AI adapts questions based on your answers • Length varies by detail provided
              </p>
            </div>

            {/* Save Status Indicator */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    <span className="text-blue-600">Saving draft...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Draft saved</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">Save error - retrying...</span>
                  </>
                )}
                {saveStatus === 'offline' && (
                  <>
                    <WifiOff className="h-3 w-3 text-orange-600" />
                    <span className="text-orange-600">Offline - saved locally</span>
                  </>
                )}
                {saveStatus === 'idle' && conversation.length > 0 && (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">Auto-save enabled</span>
                  </>
                )}
              </div>

              {!isOnline && (
                <Badge variant="destructive" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  No connection
                </Badge>
              )}
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
                    onChange={(e) => {
                      setCurrentAnswer(e.target.value)
                      trackActivity()
                    }}
                    placeholder={currentQuestion?.placeholder || "Type your answer here..."}
                    className="min-h-[120px] text-lg border-2 focus:border-primary"
                    autoFocus
                    disabled={isGeneratingQuestion}
                    onFocus={trackActivity}
                    onKeyDown={trackActivity}
                  />
                ) : (
                  <div className="space-y-3">
                    {/* Inline Voice Recording Interface */}
                    {recordingState === 'idle' && !currentAnswer ? (
                      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300">
                        <div className="p-6 text-center">
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="relative inline-flex mb-3"
                          >
                            <div className="relative rounded-full p-6 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg text-white">
                              <Mic className="h-8 w-8" />
                            </div>
                          </motion.div>
                          <p className="text-sm text-gray-600 mb-4">
                            Tap to start recording your answer
                          </p>
                          <Button
                            onClick={handleStartRecording}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            <Mic className="w-5 h-5 mr-2" />
                            Start Recording
                          </Button>
                        </div>
                      </Card>
                    ) : (recordingState === 'listening' || recordingState === 'paused' || recordingState === 'processing') ? (
                      <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 shadow-xl">
                        <div className="p-6 space-y-4">
                          {/* Recording Status & Timer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {recordingState === 'listening' && (
                                <>
                                  <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
                                  />
                                  <span className="text-gray-900 font-semibold text-sm">Listening...</span>
                                </>
                              )}
                              {recordingState === 'paused' && (
                                <>
                                  <Pause className="w-4 h-4 text-yellow-600" />
                                  <span className="text-yellow-700 font-semibold text-sm">Paused</span>
                                </>
                              )}
                              {recordingState === 'processing' && (
                                <>
                                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                  <span className="text-blue-700 font-semibold text-sm">Transcribing...</span>
                                </>
                              )}
                            </div>
                            <div className="text-gray-700 font-mono text-sm bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                              {formatTime(totalDuration)}
                            </div>
                          </div>

                          {/* Beautiful Voice-Responsive Waveform */}
                          <div className="relative bg-gradient-to-r from-blue-100/50 via-purple-100/50 to-pink-100/50 rounded-2xl p-4 overflow-hidden">
                            {/* Background glow effect */}
                            {recordingState === 'listening' && (
                              <motion.div
                                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-xl"
                              />
                            )}

                            {/* Voice-responsive animation bars */}
                            <div className="relative w-full h-32 flex items-center justify-center gap-1.5">
                              {Array.from({ length: 35 }).map((_, i) => {
                                // Calculate height based on audio level with smooth variation
                                const variation = Math.sin(i * 0.4) * 0.4
                                const baseHeight = recordingState === 'listening'
                                  ? Math.max(10, Math.min(85, (audioLevel * 0.8) * (1 + variation)))
                                  : 8

                                // Color gradient from blue to purple to pink
                                const hueShift = (i / 35) * 60 // 0 to 60
                                const baseHue = 220 // Start at blue

                                return (
                                  <motion.div
                                    key={i}
                                    className="flex-1 rounded-full shadow-lg relative"
                                    style={{
                                      minHeight: '8px',
                                      maxWidth: '8px',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <motion.div
                                      className="w-full rounded-full"
                                      animate={{
                                        scaleY: baseHeight / 100,
                                        opacity: recordingState === 'listening' ? 0.9 : 0.4
                                      }}
                                      transition={{
                                        scaleY: {
                                          type: "spring",
                                          stiffness: 300,
                                          damping: 20
                                        },
                                        opacity: { duration: 0.3 }
                                      }}
                                      style={{
                                        height: '100%',
                                        background: `linear-gradient(to top,
                                          hsl(${baseHue + hueShift}, 85%, 60%),
                                          hsl(${baseHue + hueShift}, 75%, 70%)
                                        )`,
                                        boxShadow: recordingState === 'listening'
                                          ? `0 0 ${audioLevel * 0.3}px hsla(${baseHue + hueShift}, 85%, 60%, 0.6)`
                                          : 'none',
                                        originY: 0.5
                                      }}
                                    />
                                  </motion.div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Control Buttons */}
                          <div className="flex gap-3">
                            {recordingState === 'listening' && (
                              <>
                                <Button
                                  onClick={handlePauseRecording}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
                                >
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pause
                                </Button>
                                <Button
                                  onClick={handleStopRecording}
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                                >
                                  <Square className="w-4 h-4 mr-2" />
                                  Stop & Transcribe
                                </Button>
                              </>
                            )}
                            {recordingState === 'paused' && (
                              <>
                                <Button
                                  onClick={handleResumeRecording}
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Resume
                                </Button>
                                <Button
                                  onClick={handleStopRecording}
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                                >
                                  <Square className="w-4 h-4 mr-2" />
                                  Stop & Transcribe
                                </Button>
                              </>
                            )}
                            {recordingState === 'processing' && (
                              <Button disabled size="sm" className="w-full bg-blue-100 text-blue-700">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Converting speech to text...
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ) : null}

                    {/* Transcribed Text - Editable */}
                    {currentAnswer && recordingState === 'idle' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Your Answer (Transcribed)</label>
                          <Button
                            onClick={handleStartRecording}
                            variant="outline"
                            size="sm"
                          >
                            <Mic className="w-4 h-4 mr-2" />
                            Record More
                          </Button>
                        </div>
                        <Textarea
                          value={currentAnswer}
                          onChange={(e) => {
                            setCurrentAnswer(e.target.value)
                            trackActivity() // Auto-save when editing transcription
                          }}
                          className="min-h-[120px] text-lg border-2 focus:border-primary"
                          placeholder="Edit your transcription..."
                          onFocus={trackActivity}
                        />
                      </div>
                    )}
                  </div>
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
                <div className="space-y-3 pt-4">
                  <div className="flex gap-3">
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

                  {/* Finish Early Button */}
                  {conversation.length >= 2 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowEarlyFinishDialog(true)}
                      disabled={isGeneratingQuestion}
                      className="w-full border-dashed border-2 hover:bg-purple-50 hover:border-purple-400"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      I'm ready to finish ({complianceScore.percentage}% NDIS compliant)
                    </Button>
                  )}
                </div>

                {/* Answered questions preview */}
                {conversation.length > 0 && (
                  <Card className="bg-green-50 border-green-200">
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{conversation.length} question{conversation.length > 1 ? 's' : ''} answered so far</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-green-600 leading-relaxed">
                          More detailed answers help AI ask fewer follow-up questions
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>

      {/* Session Warning Dialog */}
      <Dialog open={showSessionWarning} onOpenChange={setShowSessionWarning}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Still working on this report?
            </DialogTitle>
            <DialogDescription>
              You've been inactive for a while. Your progress is automatically saved, but we wanted to check in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <div className="p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900">Don't worry!</p>
                <p className="text-xs text-blue-700">
                  Your work is automatically saved every 2 seconds. You can take all the time you need.
                </p>
              </div>
            </Card>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSessionWarning(false)}
                className="flex-1"
              >
                I'll finish later
              </Button>
              <Button
                onClick={extendSession}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Continue working
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Draft Recovery Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-green-600" />
              Resume your report?
            </DialogTitle>
            <DialogDescription>
              We found a draft report you were working on. Would you like to continue where you left off?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {recoveredDraft && (
              <Card className="bg-green-50 border-green-200">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">Draft found</span>
                    <Badge variant="secondary" className="text-xs">
                      {recoveredDraft.conversation?.length || 0} questions answered
                    </Badge>
                  </div>
                  <p className="text-xs text-green-700">
                    Last saved: {recoveredDraft.last_saved_at
                      ? new Date(recoveredDraft.last_saved_at).toLocaleString()
                      : 'Recently'}
                  </p>
                </div>
              </Card>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={discardDraft}
                className="flex-1"
              >
                Start fresh
              </Button>
              <Button
                onClick={recoverDraft}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Resume draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={showCloseConfirmation} onOpenChange={setShowCloseConfirmation}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-blue-600" />
              Save your progress?
            </DialogTitle>
            <DialogDescription>
              Your report will be automatically saved and you can resume it anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">
                      Your progress is safe
                    </p>
                    <p className="text-xs text-blue-700">
                      {progressInfo.description} • {progressInfo.stage}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-700">
                      Next time you click "Quick Report", you'll be asked if you want to resume this draft or start a new report.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelClose}
                  className="flex-1"
                >
                  Continue working
                </Button>
                <Button
                  onClick={confirmClose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Save & close
                </Button>
              </div>

              {/* Discard option - visually separated */}
              <Button
                variant="ghost"
                onClick={discardAndExit}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Discard & exit (delete all progress)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Review Dialog */}
      <Dialog open={showCompletionReview} onOpenChange={setShowCompletionReview}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Review Your Answers
            </DialogTitle>
            <DialogDescription>
              Great job! Review your answers below. You can edit any response or add more details before generating the final report.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {conversation.length} Questions Answered
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your responses are ready to be compiled into an NDIS-compliant incident report
                    </p>
                  </div>
                  <Badge className="bg-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">AI-Guided Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">Ready for Report</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Questions & Answers List */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Your Conversation
              </h4>

              <div className="space-y-3">
                {conversation.map((turn, index) => (
                  <Card key={index} className="hover:border-blue-300 transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              Q{index + 1}
                            </Badge>
                            {turn.category && (
                              <span className="text-xs text-gray-500">{turn.category}</span>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 mb-2">{turn.question}</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                            {turn.answer}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAnswer(index)}
                          className="ml-2 flex-shrink-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Card className="bg-blue-50 border-blue-200">
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 text-sm text-blue-800">
                      <p className="font-medium">What happens next?</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Click "Generate Report" to create your NDIS-compliant report</li>
                        <li>The AI will compile all your answers into a comprehensive document</li>
                        <li>You can review and edit the report before final submission</li>
                        <li>The draft is auto-saved - you can close and resume anytime</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleContinueQuestioning}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Details
                </Button>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGeneratingReport ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Early Finish Dialog with Compliance Score */}
      <Dialog open={showEarlyFinishDialog} onOpenChange={setShowEarlyFinishDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className={`h-6 w-6 ${complianceScore.percentage >= 60 ? 'text-yellow-600' : 'text-orange-600'}`} />
              Ready to Finish?
            </DialogTitle>
            <DialogDescription>
              Let's review your report completeness before generating the final document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Compliance Score Card */}
            <Card className={`${complianceColors.bg} ${complianceColors.border} border-2`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-2xl font-bold ${complianceColors.text}`}>
                      {complianceScore.percentage}%
                    </h3>
                    <p className={`text-sm font-medium ${complianceColors.text}`}>
                      NDIS Compliance Score
                    </p>
                  </div>
                  <Badge className={complianceColors.badge}>
                    {complianceScore.completed}/{complianceScore.total} requirements
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      complianceScore.percentage >= 80 ? 'bg-green-600' :
                      complianceScore.percentage >= 60 ? 'bg-yellow-500' :
                      complianceScore.percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${complianceScore.percentage}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <div className="space-y-3">
              {complianceScore.percentage < 80 && (
                <Card className="bg-blue-50 border-blue-200">
                  <div className="p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <Bot className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-blue-900">
                          {complianceScore.percentage < 50
                            ? 'Your report needs more information for NDIS compliance'
                            : complianceScore.percentage < 70
                            ? 'A few more details would strengthen your report'
                            : 'Almost there! Just a bit more to be fully compliant'}
                        </p>
                        <p className="text-blue-700">
                          {complianceScore.percentage < 50
                            ? 'NDIS requires comprehensive incident documentation. Continuing will help ensure all requirements are met.'
                            : complianceScore.percentage < 70
                            ? 'Answering a few more questions will help meet all NDIS documentation requirements.'
                            : 'You\'re close to 80% - the recommended completeness for NDIS reports.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {complianceScore.percentage >= 80 && (
                <Card className="bg-green-50 border-green-200">
                  <div className="p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-green-900">
                          Great job! Your report meets NDIS compliance standards
                        </p>
                        <p className="text-green-700">
                          You've provided enough information for a comprehensive incident report.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* What's Captured */}
              <Card>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Information Captured
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {complianceScore.requirements.safetyCheck && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Safety confirmed
                      </div>
                    )}
                    {complianceScore.requirements.participantIdentified && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Participant identified
                      </div>
                    )}
                    {complianceScore.requirements.locationSpecified && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Location specified
                      </div>
                    )}
                    {complianceScore.requirements.incidentDescription && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Incident described
                      </div>
                    )}
                    {complianceScore.requirements.timelineEstablished && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Timeline noted
                      </div>
                    )}
                    {complianceScore.requirements.injuryAssessed && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Injury status
                      </div>
                    )}
                    {complianceScore.requirements.medicationDocumented && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Medication info
                      </div>
                    )}
                    {complianceScore.requirements.responseActions && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Response actions
                      </div>
                    )}
                    {complianceScore.requirements.antecedent && (
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Trigger/antecedent
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowEarlyFinishDialog(false)}
                  className="flex-1"
                >
                  Continue Answering
                </Button>
                <Button
                  onClick={() => {
                    setShowEarlyFinishDialog(false)
                    setShowCompletionReview(true)
                  }}
                  className={`flex-1 ${
                    complianceScore.percentage >= 60
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {complianceScore.percentage >= 80 ? (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Review & Generate
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Generate Anyway
                    </>
                  )}
                </Button>
              </div>
              {complianceScore.percentage < 80 && (
                <p className="text-xs text-center text-gray-500 italic">
                  AI can ask {Math.ceil((80 - complianceScore.percentage) / 10)} more questions to reach 80% compliance
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}