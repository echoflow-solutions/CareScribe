'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Mic, Pause, Play, Square, Trash2, Check, Volume2,
  Loader2, AlertCircle, RefreshCw, Edit3
} from 'lucide-react'
import { useToast } from '@/components/hooks/use-toast'

interface AudioSegment {
  id: string
  blob: Blob
  duration: number
  transcription?: string
  isTranscribing?: boolean
}

interface AdvancedVoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  contextPrompt?: string
  onClose?: () => void
}

export default function AdvancedVoiceRecorder({
  onTranscriptionComplete,
  contextPrompt = '',
  onClose
}: AdvancedVoiceRecorderProps) {
  const { toast } = useToast()

  // Recording states
  const [recordingState, setRecordingState] = useState<'idle' | 'listening' | 'paused' | 'processing'>('idle')
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([])
  const [currentSegmentDuration, setCurrentSegmentDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [silenceTimer, setSilenceTimer] = useState(0)

  // Settings
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true)
  const [autoPauseThreshold, setAutoPauseThreshold] = useState(3) // seconds of silence

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const recordingStartRef = useRef<number>(0)
  const currentChunksRef = useRef<Blob[]>([])
  const silenceDetectionRef = useRef<NodeJS.Timeout | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calculate total duration
  const totalDuration = audioSegments.reduce((sum, seg) => sum + seg.duration, 0) + currentSegmentDuration

  // Initialize audio context and analyser
  const initializeAudioAnalysis = useCallback(async (stream: MediaStream) => {
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 256
    source.connect(analyser)

    audioContextRef.current = audioContext
    analyserRef.current = analyser

    // Start visualizing
    visualizeAudio()
  }, [])

  // Visualize audio waveform
  const visualizeAudio = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (recordingState === 'idle') return

      animationFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      // Calculate audio level
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        const value = (dataArray[i] - 128) / 128
        sum += value * value
      }
      const rms = Math.sqrt(sum / bufferLength)
      const level = Math.min(100, rms * 200)
      setAudioLevel(level)

      // Silence detection
      if (autoPauseEnabled && recordingState === 'listening') {
        if (level < 5) {
          setSilenceTimer(prev => {
            const newVal = prev + 0.016 // ~60fps
            if (newVal >= autoPauseThreshold && recordingState === 'listening') {
              handlePause()
            }
            return newVal
          })
        } else {
          setSilenceTimer(0)
        }
      }

      // Draw waveform
      ctx.fillStyle = 'rgb(17, 24, 39)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = recordingState === 'listening'
        ? `rgba(59, 130, 246, ${0.5 + level / 200})`
        : 'rgba(107, 114, 128, 0.5)'

      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()

      // Draw audio level bars
      const barWidth = 4
      const barSpacing = 2
      const numBars = 32

      for (let i = 0; i < numBars; i++) {
        const index = Math.floor(i * bufferLength / numBars)
        const value = dataArray[index] / 255.0
        const barHeight = value * canvas.height * 0.8

        const hue = recordingState === 'listening' ? 217 : 0
        const saturation = recordingState === 'listening' ? 91 : 0
        const lightness = 50 + value * 30

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`
        ctx.fillRect(
          i * (barWidth + barSpacing),
          canvas.height - barHeight,
          barWidth,
          barHeight
        )
      }
    }

    draw()
  }, [recordingState, autoPauseEnabled, autoPauseThreshold])

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

      recorder.start(100) // Collect data every 100ms
      mediaRecorderRef.current = recorder

      await initializeAudioAnalysis(stream)

      setRecordingState('listening')

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setCurrentSegmentDuration((Date.now() - recordingStartRef.current) / 1000)
      }, 100)

      toast({
        title: '🎙️ Recording Started',
        description: 'Speak naturally. The system will listen continuously.',
      })

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
  const handlePause = () => {
    if (mediaRecorderRef.current && recordingState === 'listening') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }

      toast({
        title: '⏸️ Recording Paused',
        description: 'Click Resume to continue recording.',
      })
    }
  }

  // Resume recording
  const handleResume = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume()
      recordingStartRef.current = Date.now() - (currentSegmentDuration * 1000)
      setRecordingState('listening')

      // Restart timer
      timerIntervalRef.current = setInterval(() => {
        setCurrentSegmentDuration((Date.now() - recordingStartRef.current) / 1000)
      }, 100)

      toast({
        title: '▶️ Recording Resumed',
        description: 'Continue speaking...',
      })
    }
  }

  // Stop and save segment
  const handleStopSegment = async () => {
    if (!mediaRecorderRef.current) return

    setRecordingState('processing')

    return new Promise<void>((resolve) => {
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(currentChunksRef.current, { type: 'audio/webm' })
        const duration = currentSegmentDuration

        const newSegment: AudioSegment = {
          id: `segment_${Date.now()}`,
          blob: audioBlob,
          duration: duration,
          isTranscribing: true
        }

        setAudioSegments(prev => [...prev, newSegment])
        setCurrentSegmentDuration(0)

        // Transcribe the segment
        await transcribeSegment(newSegment)

        setRecordingState('idle')
        resolve()
      }

      mediaRecorderRef.current!.stop()

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    })
  }

  // Transcribe a segment
  const transcribeSegment = async (segment: AudioSegment) => {
    try {
      const formData = new FormData()
      formData.append('audio', segment.blob, 'recording.webm')
      formData.append('language', 'en')
      formData.append('prompt', contextPrompt)

      console.log('[Voice] Transcribing segment...')
      const response = await fetch('/api/ai/whisper', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to transcribe audio')
      }

      const data = await response.json()
      console.log('[Voice] Transcription received:', data.transcription)

      // Update segment with transcription
      setAudioSegments(prev => prev.map(seg =>
        seg.id === segment.id
          ? { ...seg, transcription: data.transcription, isTranscribing: false }
          : seg
      ))

    } catch (error) {
      console.error('[Voice] Transcription error:', error)

      setAudioSegments(prev => prev.map(seg =>
        seg.id === segment.id
          ? { ...seg, isTranscribing: false }
          : seg
      ))

      toast({
        title: 'Transcription Error',
        description: 'Failed to transcribe segment. You can retry or delete it.',
        variant: 'destructive'
      })
    }
  }

  // Delete segment
  const handleDeleteSegment = (segmentId: string) => {
    setAudioSegments(prev => prev.filter(seg => seg.id !== segmentId))
    toast({
      title: '🗑️ Segment Deleted',
      description: 'Recording segment removed.',
    })
  }

  // Retry transcription
  const handleRetryTranscription = (segment: AudioSegment) => {
    setAudioSegments(prev => prev.map(seg =>
      seg.id === segment.id
        ? { ...seg, isTranscribing: true }
        : seg
    ))
    transcribeSegment(segment)
  }

  // Complete and submit all transcriptions
  const handleComplete = () => {
    const allTranscriptions = audioSegments
      .filter(seg => seg.transcription)
      .map(seg => seg.transcription)
      .join(' ')

    if (allTranscriptions.trim()) {
      onTranscriptionComplete(allTranscriptions)
      cleanup()
      if (onClose) onClose()
    } else {
      toast({
        title: 'No Transcriptions Available',
        description: 'Please record and transcribe at least one segment.',
        variant: 'destructive'
      })
    }
  }

  // Cleanup resources
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    if (silenceDetectionRef.current) {
      clearTimeout(silenceDetectionRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Waveform Visualization */}
      <div className="relative mb-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-48 rounded-lg bg-gray-900 shadow-xl"
        />

        {/* Recording indicator overlay */}
        <AnimatePresence>
          {recordingState === 'listening' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-4 flex items-center gap-2"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
              <span className="text-white text-sm font-medium">
                RECORDING
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer */}
        <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-lg">
          <span className="text-white font-mono text-sm">
            {formatTime(totalDuration)}
          </span>
        </div>

        {/* Audio level meter */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-white" />
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${audioLevel}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {recordingState === 'idle' && (
          <Button
            size="lg"
            onClick={handleStartRecording}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-8 py-6 text-lg"
          >
            <Mic className="w-6 h-6 mr-2" />
            Start Recording
          </Button>
        )}

        {recordingState === 'listening' && (
          <>
            <Button
              size="lg"
              onClick={handlePause}
              variant="outline"
              className="px-8 py-6"
            >
              <Pause className="w-6 h-6 mr-2" />
              Pause
            </Button>
            <Button
              size="lg"
              onClick={handleStopSegment}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6"
            >
              <Square className="w-6 h-6 mr-2" />
              Stop & Save
            </Button>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <Button
              size="lg"
              onClick={handleResume}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6"
            >
              <Play className="w-6 h-6 mr-2" />
              Resume
            </Button>
            <Button
              size="lg"
              onClick={handleStopSegment}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6"
            >
              <Square className="w-6 h-6 mr-2" />
              Stop & Save
            </Button>
          </>
        )}

        {recordingState === 'processing' && (
          <Button size="lg" disabled className="px-8 py-6">
            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
            Processing...
          </Button>
        )}
      </div>

      {/* Settings */}
      <Card className="p-4 mb-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoPause"
              checked={autoPauseEnabled}
              onChange={(e) => setAutoPauseEnabled(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoPause" className="text-sm font-medium">
              Auto-pause on silence
            </label>
          </div>
          {autoPauseEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {autoPauseThreshold}s
              </span>
              <Slider
                value={[autoPauseThreshold]}
                onValueChange={([val]) => setAutoPauseThreshold(val)}
                min={1}
                max={10}
                step={1}
                className="w-32"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Recorded Segments */}
      {audioSegments.length > 0 && (
        <div className="flex-1 overflow-auto">
          <h3 className="font-semibold mb-3 text-sm text-gray-700">
            Recorded Segments ({audioSegments.length})
          </h3>
          <div className="space-y-3">
            {audioSegments.map((segment, index) => (
              <Card key={segment.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="font-mono">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">
                        {formatTime(segment.duration)}
                      </span>
                      {segment.isTranscribing && (
                        <Badge variant="secondary" className="text-xs">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Transcribing...
                        </Badge>
                      )}
                    </div>
                    {segment.transcription ? (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {segment.transcription}
                      </p>
                    ) : !segment.isTranscribing && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Transcription failed
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!segment.transcription && !segment.isTranscribing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRetryTranscription(segment)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSegment(segment.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Complete Button */}
      {audioSegments.length > 0 && audioSegments.some(seg => seg.transcription) && (
        <div className="mt-6 pt-6 border-t">
          <Button
            size="lg"
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            <Check className="w-5 h-5 mr-2" />
            Complete & Use Transcription
          </Button>
        </div>
      )}
    </div>
  )
}
