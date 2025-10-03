'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'
import { DataService } from '@/lib/data/service'
import { Participant } from '@/lib/types'
import { ArrowLeft, Mic, MicOff, FileText, Save, X, Sparkles, Volume2, Clock, AlertCircle, Info, Pause, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/use-toast'
import { INCIDENT_TYPES, getIncidentTypeLabel } from '@/lib/types/incident-types'

function ManualReportContent() {
  const router = useRouter()
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [reportText, setReportText] = useState('')
  const [participantId, setParticipantId] = useState('')
  const [incidentType, setIncidentType] = useState('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [micPermissionChecked, setMicPermissionChecked] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const cursorPositionRef = useRef<number>(0)
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load participants on mount
  useEffect(() => {
    const loadParticipants = async () => {
      const participantData = await DataService.getParticipants()
      setParticipants(participantData)
    }
    loadParticipants()
    
    // Check microphone permissions on mount
    const checkMicrophonePermissions = async () => {
      try {
        // Check if the browser supports permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
          
          console.log('Microphone permission status:', result.state)
          
          if (result.state === 'denied') {
            toast({
              title: 'Microphone Access Blocked',
              description: 'Microphone access has been blocked. You\'ll need to enable it in your browser settings to use voice recording.',
              variant: 'destructive',
              duration: 8000,
            })
          } else if (result.state === 'prompt') {
            // Permission will be requested when user clicks record
            console.log('Microphone permission will be requested on first use')
          }
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            console.log('Microphone permission changed to:', result.state)
            if (result.state === 'denied') {
              toast({
                title: 'Microphone Access Blocked',
                description: 'Microphone access has been blocked. Please enable it in browser settings.',
                variant: 'destructive',
              })
            } else if (result.state === 'granted') {
              toast({
                title: 'Microphone Access Granted',
                description: 'You can now use voice recording.',
              })
            }
          })
        }
      } catch (error) {
        // Permissions API might not be supported or might fail
        console.log('Could not check microphone permissions:', error)
      }
    }
    
    checkMicrophonePermissions()
  }, [])

  useEffect(() => {
    const words = reportText.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
    setHasUnsavedChanges(reportText.length > 0)
  }, [reportText])

  useEffect(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      setMicPermissionChecked(true)
      
      // Store current cursor position before recording
      if (textareaRef.current) {
        cursorPositionRef.current = textareaRef.current.selectionStart || reportText.length
      }
      
      // Check if we're on a local IP address (not localhost)
      const isLocalIP = /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[01])\./.test(location.hostname)
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      const isHTTP = location.protocol === 'http:'
      
      console.log('Browser context:', {
        hostname: location.hostname,
        protocol: location.protocol,
        isLocalIP,
        isLocalhost,
        isHTTP,
        hasMediaDevices: !!navigator.mediaDevices
      })
      
      // Chrome blocks mediaDevices on local IPs over HTTP
      if (isLocalIP && isHTTP) {
        throw new Error('Chrome blocks microphone access on local network IPs (like ' + location.hostname + ') when using HTTP. Please access the app using http://localhost:3000 instead.')
      }
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording. Please use Chrome, Firefox, or Edge and ensure you are using HTTPS or localhost.')
      }
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in your browser')
      }
      
      // Create MediaRecorder with fallback mime types
      let mediaRecorder: MediaRecorder
      const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/wav']
      
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          mediaRecorder = new MediaRecorder(stream, { mimeType })
          break
        }
      }
      
      if (!mediaRecorder!) {
        mediaRecorder = new MediaRecorder(stream)
      }
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        audioChunksRef.current = []
        
        // Send audio to OpenAI Whisper API for transcription
        setIsProcessing(true)
        
        try {
          // Create FormData with the audio file
          const formData = new FormData()
          const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
          formData.append('audio', audioFile)
          
          // Send to our API route
          const response = await fetch('/api/ai/transcribe', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error('Transcription failed')
          }
          
          const data = await response.json()
          
          if (data.text) {
            // Insert transcribed text at cursor position
            setReportText(prev => {
              const cursorPos = cursorPositionRef.current
              const beforeCursor = prev.slice(0, cursorPos)
              const afterCursor = prev.slice(cursorPos)
              
              // Add a space before the transcribed text if needed
              const needsSpaceBefore = beforeCursor.length > 0 && 
                                      !beforeCursor.endsWith(' ') && 
                                      !beforeCursor.endsWith('\n')
              
              const spaceBefore = needsSpaceBefore ? ' ' : ''
              
              return beforeCursor + spaceBefore + data.text + afterCursor
            })
            
            toast({
              title: 'Success',
              description: 'Voice recording transcribed successfully',
            })
            
            // Update cursor position after insertion
            setTimeout(() => {
              if (textareaRef.current) {
                const needsSpaceBefore = cursorPositionRef.current > 0 && 
                                        !reportText.slice(0, cursorPositionRef.current).endsWith(' ') && 
                                        !reportText.slice(0, cursorPositionRef.current).endsWith('\n')
                const newCursorPos = cursorPositionRef.current + data.text.length + (needsSpaceBefore ? 1 : 0)
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
                textareaRef.current.focus()
              }
            }, 100)
          } else {
            throw new Error('No transcription received')
          }
        } catch (error) {
          console.error('Transcription error:', error)
          toast({
            title: 'Error',
            description: 'Failed to transcribe audio. Please try again.',
            variant: 'destructive',
          })
        } finally {
          setIsProcessing(false)
          stream.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorderRef.current = mediaRecorder!
      mediaRecorder!.start()
      setIsRecording(true)
      toast({
        title: 'Recording started',
        description: 'Speak clearly into your microphone',
      })
    } catch (error: any) {
      console.error('Error accessing microphone:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        browserInfo: {
          userAgent: navigator.userAgent,
          isSecureContext: window.isSecureContext,
          protocol: location.protocol,
          hostname: location.hostname,
          mediaDevices: !!navigator.mediaDevices,
          getUserMedia: !!(navigator.mediaDevices?.getUserMedia)
        }
      })
      
      let errorMessage = 'Unable to access microphone.'
      let errorTitle = 'Voice Recording Error'
      
      // Handle specific error types with helpful messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorTitle = 'Microphone Permission Denied'
        errorMessage = 'Please allow microphone access when prompted by your browser. You may need to:'
        errorMessage += '\n• Click the camera/microphone icon in the address bar'
        errorMessage += '\n• Select "Allow" for microphone access'
        errorMessage += '\n• Refresh the page and try again'
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorTitle = 'No Microphone Found'
        errorMessage = 'No microphone detected. Please:'
        errorMessage += '\n• Connect a microphone to your device'
        errorMessage += '\n• Check your system audio settings'
        errorMessage += '\n• Try using a different browser'
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorTitle = 'Microphone In Use'
        errorMessage = 'Your microphone is being used by another application. Please:'
        errorMessage += '\n• Close other apps using the microphone (Zoom, Teams, etc.)'
        errorMessage += '\n• Check your system audio settings'
        errorMessage += '\n• Try again in a few seconds'
      } else if (error.name === 'AbortError' || error.name === 'SecurityError') {
        errorTitle = 'Security Error'
        errorMessage = 'Browser security settings are preventing microphone access. This can happen when:'
        errorMessage += '\n• The page is not served over HTTPS'
        errorMessage += '\n• Browser security settings are too restrictive'
        errorMessage += '\n• Try using Chrome, Firefox, or Edge browsers'
      } else if (error.message && error.message.includes('Chrome blocks microphone access on local network IPs')) {
        errorTitle = 'Use Localhost Instead'
        errorMessage = 'Chrome blocks microphone access when using IP addresses.'
        errorMessage += '\n\nQuick fix - use localhost:'
        errorMessage += '\n• Click here to copy: http://localhost:3000'
        errorMessage += '\n• Or type it in your browser'
        errorMessage += '\n\nThis is a Chrome security feature that cannot be bypassed.'
        errorMessage += '\n• Use a browser that supports HTTP for local IPs (Firefox)'
      } else if (error.message === 'INSECURE_CONTEXT') {
        errorTitle = 'Secure Context Required'
        errorMessage = 'This feature requires a secure context (HTTPS).'
        errorMessage += '\n\nYour current URL: ' + location.href
        errorMessage += '\n\nPlease access the app via:'
        errorMessage += '\n• HTTPS (secure connection)'
        errorMessage += '\n• localhost or 127.0.0.1'
      } else if (error.message === 'MEDIADEVICES_NOT_SUPPORTED') {
        errorTitle = 'Browser Not Supported'
        errorMessage = 'Your browser does not support the MediaDevices API.'
        errorMessage += '\n\nSupported browsers:'
        errorMessage += '\n• Chrome 53+ (recommended)'
        errorMessage += '\n• Firefox 36+'
        errorMessage += '\n• Safari 11+'
        errorMessage += '\n• Edge 12+'
        errorMessage += '\n\nPlease update your browser or try a different one.'
      } else if (error.message && (error.message.includes('secure') || error.message.includes('https'))) {
        errorTitle = 'Security Context Required'
        errorMessage = 'Microphone access requires a secure connection. Please ensure you are:'
        errorMessage += '\n• Using HTTPS (not HTTP)'
        errorMessage += '\n• Or accessing via localhost/127.0.0.1'
        errorMessage += '\n• Current URL: ' + location.protocol + '//' + location.hostname
      } else if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        errorTitle = 'Browser Compatibility Issue'
        errorMessage = 'Your browser may not fully support audio recording. Please:'
        errorMessage += '\n• Update to the latest version of Chrome, Firefox, or Edge'
        errorMessage += '\n• Ensure JavaScript is enabled'
        errorMessage += '\n• Try disabling browser extensions that might interfere'
      } else {
        // Generic error with debugging info
        errorMessage = `${error.message || 'An unexpected error occurred.'}`
        errorMessage += '\n\nTroubleshooting steps:'
        errorMessage += '\n• Refresh the page and try again'
        errorMessage += '\n• Check browser console for more details'
        errorMessage += '\n• Ensure microphone permissions are enabled'
      }
      
      // Show the error toast with formatted message
      toast({
        title: errorTitle,
        description: (
          <div className="space-y-2">
            <p>{errorMessage.split('\n')[0]}</p>
            {errorMessage.split('\n').slice(1).length > 0 && (
              <ul className="text-xs space-y-1 mt-2">
                {errorMessage.split('\n').slice(1).map((line, i) => (
                  line.trim() && <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        ),
        variant: 'destructive',
        duration: 10000, // Show for longer since it contains instructions
      })
      
      // Reset recording state
      setIsRecording(false)
      setIsProcessing(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast({
        title: 'Recording stopped',
        description: 'Processing your audio...',
      })
    }
  }

  const handleSave = () => {
    if (!participantId) {
      toast({
        title: 'Error',
        description: 'Please select a participant',
        variant: 'destructive',
      })
      return
    }
    if (!incidentType) {
      toast({
        title: 'Error',
        description: 'Please select an incident type',
        variant: 'destructive',
      })
      return
    }
    if (reportText.length < 50) {
      toast({
        title: 'Error',
        description: 'Report must be at least 50 characters long',
        variant: 'destructive',
      })
      return
    }

    // Save report logic here
    toast({
      title: 'Success',
      description: 'Report saved successfully',
    })
    setHasUnsavedChanges(false)
    
    // Navigate to review page after a short delay
    setTimeout(() => {
      router.push('/report/review')
    }, 1000)
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/dashboard')
      }
    } else {
      router.push('/dashboard')
    }
  }

  const generateAISuggestion = () => {
    if (!reportText) {
      toast({
        title: 'Error',
        description: 'Please write something first',
        variant: 'destructive',
      })
      return
    }
    
    setIsProcessing(true)
    setTimeout(() => {
      const suggestion = "\n\nSuggested additions:\n• Environmental factors: Consider noting the time of day, location specifics, and any environmental triggers\n• Intervention effectiveness: Document which specific techniques were most effective\n• Follow-up actions: Include any adjustments to the support plan or additional monitoring needed"
      setReportText(prev => prev + suggestion)
      setIsProcessing(false)
      toast({
        title: 'Success',
        description: 'AI suggestions added',
      })
    }, 1500)
  }

  // Text-to-Speech functions
  const startSpeaking = () => {
    if (!reportText) {
      toast({
        title: 'Error',
        description: 'No text to read',
        variant: 'destructive',
      })
      return
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(reportText)
    speechUtteranceRef.current = utterance
    
    // Configure speech settings
    utterance.rate = 1.0  // Normal speed
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }
    
    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }
    
    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
      toast({
        title: 'Error',
        description: 'Failed to read text',
        variant: 'destructive',
      })
    }
    
    speechSynthesis.speak(utterance)
  }

  const pauseSpeaking = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resumeSpeaking = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="hover:bg-white/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Manual Incident Report
              </h1>
              <p className="text-gray-600 mt-1">Document incidents with precision and clarity</p>
            </div>
          </div>
          <Badge variant={hasUnsavedChanges ? "destructive" : "secondary"} className="gap-1">
            {hasUnsavedChanges ? (
              <>
                <AlertCircle className="h-3 w-3" />
                Unsaved Changes
              </>
            ) : (
              'All Changes Saved'
            )}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Report Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Incident Details
                </CardTitle>
                <CardDescription>
                  Provide essential information about the incident
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="participant">Participant *</Label>
                    <Select value={participantId} onValueChange={setParticipantId}>
                      <SelectTrigger id="participant">
                        <SelectValue placeholder="Select participant" />
                      </SelectTrigger>
                      <SelectContent>
                        {(participants || []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              <span>{p.name}</span>
                              <Badge variant={
                                p.riskLevel === 'high' ? 'destructive' :
                                p.riskLevel === 'medium' ? 'secondary' :
                                'outline'
                              } className="text-xs">
                                {p.riskLevel} risk
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Incident Type *</Label>
                    <Select value={incidentType} onValueChange={setIncidentType}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCIDENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.label}</span>
                              {type.requiresImmediateResponse && (
                                <Badge variant="destructive" className="text-xs">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
                    <SelectTrigger id="severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <Badge variant="outline" className="text-green-600">Low</Badge>
                      </SelectItem>
                      <SelectItem value="medium">
                        <Badge variant="secondary" className="text-yellow-600">Medium</Badge>
                      </SelectItem>
                      <SelectItem value="high">
                        <Badge variant="destructive">High</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Report Text Area */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Incident Report
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {wordCount} words
                  </div>
                </CardTitle>
                <CardDescription>
                  Describe the incident in detail. Be specific and objective.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  ref={textareaRef}
                  placeholder="Start typing your report here... 

Example: At approximately 2:30 PM, during the afternoon activity session in the common room, [Participant Name] became visibly agitated when another participant accidentally knocked over their puzzle..."
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  onSelect={(e) => {
                    // Update cursor position when user clicks or selects text
                    const target = e.target as HTMLTextAreaElement
                    cursorPositionRef.current = target.selectionStart || 0
                  }}
                  className="min-h-[400px] resize-none text-base leading-relaxed"
                />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`
                      relative overflow-hidden transition-all duration-300
                      ${isRecording 
                        ? 'bg-red-600 hover:bg-red-700 shadow-lg scale-105' 
                        : isProcessing
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105'
                      }
                      text-white font-semibold px-6 py-3 h-auto
                    `}
                  >
                    {isRecording && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      </span>
                    )}
                    <span className="relative flex items-center gap-2">
                      {isRecording ? (
                        <>
                          <MicOff className="h-5 w-5" />
                          <span className="text-base">Stop Recording ({formatTime(recordingTime)})</span>
                        </>
                      ) : isProcessing ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                          <span className="text-base">Processing...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-5 w-5" />
                          <span className="text-base">Voice Record</span>
                        </>
                      )}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={generateAISuggestion}
                    disabled={isProcessing || !reportText}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Suggestions
                  </Button>

                  {!isSpeaking ? (
                    <Button
                      variant="outline"
                      onClick={startSpeaking}
                      disabled={!reportText}
                      className="gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      Read Aloud
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      {!isPaused ? (
                        <Button
                          variant="outline"
                          onClick={pauseSpeaking}
                          className="gap-2"
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={resumeSpeaking}
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={stopSpeaking}
                        className="gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Stop
                      </Button>
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={66} className="h-2" />
                    <p className="text-sm text-gray-600 text-center">Transcribing audio with OpenAI Whisper...</p>
                  </div>
                )}
                
                {isSpeaking && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <Volume2 className="h-4 w-4 text-green-600 animate-pulse" />
                    <AlertDescription>
                      <p className="text-sm text-green-800">
                        {isPaused ? 'Reading paused' : 'Reading your report aloud...'}
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
                
                {!micPermissionChecked && (
                  <Alert className="mt-4 border-gradient-to-r from-blue-100 to-purple-100 bg-gradient-to-r from-blue-50 to-purple-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <p className="text-sm text-blue-800">
                        <strong>🎤 Voice Recording Available!</strong><br />
                        Click the <span className="font-semibold text-purple-700">"Voice Record"</span> button above to dictate your report using AI-powered transcription.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Writing Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-purple-600 font-semibold">•</span>
                    <span>Be objective and factual - avoid assumptions or interpretations</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-600 font-semibold">•</span>
                    <span>Include specific times, locations, and people involved</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-600 font-semibold">•</span>
                    <span>Document the sequence of events chronologically</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-600 font-semibold">•</span>
                    <span>Note any interventions used and their effectiveness</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-600 font-semibold">•</span>
                    <span>Include relevant environmental factors or triggers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Templates</CardTitle>
                <CardDescription>
                  Select a template to get started quickly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setReportText('Time: [TIME]\nLocation: [LOCATION]\nParticipant: [NAME]\n\nIncident Description:\n[What happened?]\n\nAntecedent:\n[What led to the incident?]\n\nInterventions:\n[What actions were taken?]\n\nOutcome:\n[How was it resolved?]')}
                >
                  Basic Incident Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setReportText('ABC ANALYSIS\n\nAntecedent (What happened before):\n\n\nBehavior (What exactly occurred):\n\n\nConsequence (What happened after):\n\n\nInterventions Applied:\n\n\nEffectiveness:')}
                >
                  ABC Analysis Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setReportText('MEDICAL INCIDENT REPORT\n\nTime of Incident:\nParticipant:\n\nMedical Issue:\n\n\nSymptoms Observed:\n\n\nImmediate Actions Taken:\n\n\nMedical Professional Contacted:\n\n\nOutcome:')}
                >
                  Medical Incident Template
                </Button>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            {reportText.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold text-blue-900">Report Progress</p>
                    <Progress value={(wordCount / 100) * 100} className="h-2" />
                    <p className="text-xs text-blue-700">
                      {wordCount < 50 ? `${50 - wordCount} more words needed` : 'Good length!'}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 p-6 bg-white rounded-lg shadow-lg">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem('draftReport', JSON.stringify({
                  reportText,
                  participantId,
                  incidentType,
                  severity,
                  savedAt: new Date().toISOString()
                }))
                toast({
                  title: 'Success',
                  description: 'Draft saved',
                })
              }}
            >
              Save Draft
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!participantId || !incidentType || reportText.length < 50}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="h-4 w-4" />
              Submit Report
            </Button>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default function ManualReportPage() {
  return (
    <AuthGuard>
      <ManualReportContent />
    </AuthGuard>
  )
}