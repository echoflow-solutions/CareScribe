'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MapPin, Clock, Users, AlertTriangle, Calendar,
  Thermometer, Pill, Settings, FileText, Play, ChevronDown, ChevronRight,
  Bell, ArrowRight, CheckCircle, Navigation, AlertCircle, LogIn, LogOut,
  Coffee, Activity, TrendingUp, Timer, CheckSquare, Award, Star
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/hooks/use-toast'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { SupabaseService } from '@/lib/supabase/service'
import { Participant } from '@/lib/types'
import { format } from 'date-fns'
import { AuthGuard } from '@/components/auth/auth-guard'

function ShiftStartContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentUser, currentShift, setCurrentShift, hasHydrated } = useStore()
  const [alerts, setAlerts] = useState<any[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showStaffList, setShowStaffList] = useState(false)
  const [showClockOutModal, setShowClockOutModal] = useState(false)
  const [showShiftEndedModal, setShowShiftEndedModal] = useState(false)
  const [handoverNotes, setHandoverNotes] = useState('')
  const [progressNotes, setProgressNotes] = useState('')
  const [onBreak, setOnBreak] = useState(false)
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null)
  const [totalBreakTime, setTotalBreakTime] = useState(0)
  const [tasksCompleted, setTasksCompleted] = useState({
    progressNotes: false,
    medicationReview: false,
    incidentReports: false,
    handoverNotes: false
  })

  // Derive shift state from currentShift instead of duplicating in local state
  const isShiftActive = currentShift?.status === 'active'
  const shiftStartTime = currentShift ? new Date(currentShift.startTime) : null
  const shiftEndTime = currentShift ? new Date(currentShift.endTime) : null
  
  // Location options for demo
  const locations = [
    { id: 'house3', name: 'Parramatta - Maxlife Care' },
    { id: 'house1', name: 'Clyde - Maxlife Care' },
    { id: 'house2', name: 'Strathfield - Maxlife Care' },
    { id: 'house4', name: 'Rouse Hill - Maxlife Care' },
    { id: 'house5', name: 'Blacktown - Maxlife Care' }
  ]
  
  // Support workers on duty for this shift with location status
  const supportWorkers = [
    {
      name: 'Bernard Adjei',
      role: 'Support Worker',
      shift: '7:00 AM - 3:00 PM',
      status: 'on-site',
      statusText: 'On Site',
      statusColor: 'green',
      distance: '0 km',
      eta: null
    },
    {
      name: 'Michael Chen',
      role: 'Support Worker',
      shift: '7:00 AM - 3:00 PM',
      status: 'en-route',
      statusText: 'En Route',
      statusColor: 'blue',
      distance: '1.2 km away',
      eta: 'Arriving in 3 min'
    },
    {
      name: 'Priya Patel',
      role: 'Support Worker',
      shift: '7:00 AM - 3:00 PM',
      status: 'on-site',
      statusText: 'Clocked In',
      statusColor: 'green',
      distance: '0 km',
      eta: null
    }
  ]

  const loadParticipants = async () => {
    if (!currentShift?.id) {
      console.log('[Shift Start] No current shift, clearing participants')
      setParticipants([])
      return
    }

    try {
      console.log('[Shift Start] Loading participants for shift:', currentShift.id)
      const shiftParticipants = await SupabaseService.getShiftParticipants(currentShift.id)
      console.log('[Shift Start] Loaded participants:', shiftParticipants)
      setParticipants(shiftParticipants)
    } catch (error) {
      console.error('[Shift Start] Error loading participants:', error)
      setParticipants([])
    }
  }

  useEffect(() => {
    // Load alerts
    loadAlerts()

    // Load participants when shift becomes active
    if (currentShift?.id && hasHydrated) {
      loadParticipants()
    }

    // Debug: Log shift state on mount
    console.log('[Shift Start] Current shift from store:', currentShift)
    console.log('[Shift Start] Has hydrated:', hasHydrated)
    console.log('[Shift Start] Is shift active:', isShiftActive)

    // Validate current shift on mount - clear if invalid
    if (currentShift && hasHydrated) {
      const endTime = new Date(currentShift.endTime)
      const now = new Date()

      // If shift has expired or is invalid, clear it
      if (endTime <= now || currentShift.status !== 'active') {
        console.log('[Shift Start] Shift expired or invalid, clearing it')
        setCurrentShift(null)

        // Try to end it in database
        if (currentShift.id) {
          DataService.endShift(currentShift.id).catch((error) => {
            console.warn('[Shift Start] Error ending expired shift:', error)
          })
        }
      }
    }

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [hasHydrated])

  useEffect(() => {
    // Monitor currentShift changes and reload participants
    console.log('[Shift Start] currentShift changed:', currentShift)
    if (currentShift?.id && hasHydrated) {
      loadParticipants()
    } else {
      setParticipants([])
    }
  }, [currentShift, hasHydrated])

  // Detect when shift time expires
  useEffect(() => {
    if (currentShift && isShiftActive) {
      const timeRemaining = getTimeRemaining()

      // Check if shift has ended (countdown reached 0)
      if (timeRemaining && timeRemaining.total <= 0) {
        console.log('[Shift Start] Shift time has expired! Opening shift end modal...')
        setShowShiftEndedModal(true)
      }
    }
  }, [currentTime, currentShift, isShiftActive])

  const loadAlerts = async () => {
    try {
      const alertData = await DataService.getAlerts()
      const unacknowledged = alertData.filter(a => !a.acknowledged)
      console.log(`[Shift Start] Loaded ${unacknowledged.length} unacknowledged alerts from database`)
      setAlerts(unacknowledged)
    } catch (error) {
      console.error('[Shift Start] Error loading alerts:', error)
      setAlerts([])
    }
  }

  // Helper functions
  const getTimeRemaining = () => {
    if (!shiftEndTime) return null
    const diff = shiftEndTime.getTime() - currentTime.getTime()
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return { hours, minutes, seconds, total: diff }
  }

  const getShiftProgress = () => {
    if (!shiftStartTime || !shiftEndTime) return 0
    const total = shiftEndTime.getTime() - shiftStartTime.getTime()
    const elapsed = currentTime.getTime() - shiftStartTime.getTime()
    return Math.min((elapsed / total) * 100, 100)
  }

  const getBreakDuration = () => {
    if (!onBreak || !breakStartTime) return totalBreakTime
    const currentBreak = Math.floor((currentTime.getTime() - breakStartTime.getTime()) / 1000)
    return totalBreakTime + currentBreak
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const handleClockIn = async () => {
    setIsLoading(true)
    try {
      const startTime = new Date()
      const endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000) // 8 hours

      const shiftData = {
        staffId: currentUser!.id,
        facilityId: '650e8400-e29b-41d4-a716-446655440003', // Parramatta - Maxlife Care UUID
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: 'active' as const
      }

      console.log('[Shift Start] Clocking in with shift data:', shiftData)
      // DataService.startShift now saves to database and returns shift with database ID
      const createdShift = await DataService.startShift(shiftData as any)
      setCurrentShift(createdShift) // Store shift with database ID
      console.log('[Shift Start] Shift saved to database and store with ID:', createdShift.id)
      console.log('[Shift Start] localStorage after save:', localStorage.getItem('carescribe-storage'))
      setIsLoading(false)
    } catch (error) {
      console.error('Error clocking in:', error)
      setIsLoading(false)
    }
  }

  const handleClockOut = async () => {
    // Check if all required tasks are completed
    if (!tasksCompleted.progressNotes) {
      setShowClockOutModal(true)
      return
    }

    setIsLoading(true)
    try {
      if (currentShift) {
        await DataService.endShift(currentShift.id)
      }
      setCurrentShift(null) // This will clear from localStorage automatically
      setOnBreak(false)
      setBreakStartTime(null)
      setTotalBreakTime(0)
      setTasksCompleted({
        progressNotes: false,
        medicationReview: false,
        incidentReports: false,
        handoverNotes: false
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('Error clocking out:', error)
      setIsLoading(false)
    }
  }

  const handleBreakToggle = () => {
    if (onBreak) {
      // End break
      if (breakStartTime) {
        const breakDuration = Math.floor((currentTime.getTime() - breakStartTime.getTime()) / 1000)
        setTotalBreakTime(prev => prev + breakDuration)
      }
      setBreakStartTime(null)
      setOnBreak(false)
    } else {
      // Start break
      setBreakStartTime(currentTime)
      setOnBreak(true)
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const handleShiftEndComplete = async () => {
    if (!currentShift) return

    setIsLoading(true)
    try {
      // End shift with handover notes
      await DataService.endShift(currentShift.id, handoverNotes)

      // Clear shift from store
      setCurrentShift(null)

      // Reset states
      setShowShiftEndedModal(false)
      setHandoverNotes('')
      setProgressNotes('')
      setOnBreak(false)
      setBreakStartTime(null)
      setTotalBreakTime(0)
      setTasksCompleted({
        progressNotes: false,
        medicationReview: false,
        incidentReports: false,
        handoverNotes: false
      })

      toast({
        title: "Shift Ended",
        description: "Your shift has been completed successfully. Thank you for your hard work!",
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing shift:', error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to complete shift. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (!currentUser) return null

  // Wait for store hydration before rendering to prevent flash of wrong state
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Greeting Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 text-lg">
              {format(currentTime, 'EEEE, MMMM d, yyyy')} • {format(currentTime, 'h:mm:ss a')}
            </p>
          </div>

          {/* Clock In/Out Card */}
          <Card className="p-8 relative overflow-hidden">
            {isShiftActive && (
              <motion.div
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${getShiftProgress()}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${getShiftProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            )}

            <div className="space-y-6">
              {!isShiftActive ? (
                // Clock In View
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">
                    Ready to start your shift at Parramatta?
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="flex items-center justify-center gap-2 text-gray-600 px-2">
                      <MapPin className="h-5 w-5 flex-shrink-0" />
                      <span className="text-center whitespace-nowrap">Parramatta - Maxlife Care</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Clock className="h-5 w-5 flex-shrink-0" />
                      <span className="whitespace-nowrap">7:00 AM - 3:00 PM</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Users className="h-5 w-5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Participants List */}
                  {participants.length > 0 && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Participants for This Shift
                      </h3>
                      <div className="space-y-2">
                        {participants.map(participant => (
                          <div
                            key={participant.id}
                            className="flex items-center gap-3 bg-white p-3 rounded-md"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                              {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{participant.name}</p>
                              <p className="text-xs text-gray-500">
                                {participant.age ? `Age ${participant.age}` : 'Age not specified'}
                                {participant.riskLevel && ` • Risk: ${participant.riskLevel}`}
                              </p>
                            </div>
                            {participant.riskLevel && (
                              <Badge variant={
                                participant.riskLevel === 'high' ? 'destructive' :
                                participant.riskLevel === 'medium' ? 'secondary' :
                                'outline'
                              }>
                                {participant.riskLevel}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {participants.length === 0 && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        No participants assigned to this shift
                      </p>
                    </div>
                  )}

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      onClick={handleClockIn}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-6 text-lg h-auto"
                    >
                      <LogIn className="mr-3 h-6 w-6" />
                      Clock In to Start Shift
                    </Button>
                  </motion.div>

                  <p className="text-sm text-gray-500 mt-4">
                    Your location is assigned by your manager
                  </p>
                </div>
              ) : (
                // Active Shift View
                <div className="space-y-6">
                  {/* Shift Status Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-full text-sm mb-4 font-medium">
                      <Activity className="h-4 w-4" />
                      Shift Active
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Parramatta - Maxlife Care</h2>
                  </div>

                  {/* Countdown Timer */}
                  {getTimeRemaining() && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200"
                    >
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Time Remaining in Shift</p>
                        <div className="flex justify-center gap-4 mb-4">
                          <div className="bg-white px-4 py-3 rounded-lg shadow-sm min-w-[80px]">
                            <p className="text-3xl font-bold text-blue-600">{String(getTimeRemaining()!.hours).padStart(2, '0')}</p>
                            <p className="text-xs text-gray-500">Hours</p>
                          </div>
                          <div className="bg-white px-4 py-3 rounded-lg shadow-sm min-w-[80px]">
                            <p className="text-3xl font-bold text-purple-600">{String(getTimeRemaining()!.minutes).padStart(2, '0')}</p>
                            <p className="text-xs text-gray-500">Minutes</p>
                          </div>
                          <div className="bg-white px-4 py-3 rounded-lg shadow-sm min-w-[80px]">
                            <p className="text-3xl font-bold text-pink-600">{String(getTimeRemaining()!.seconds).padStart(2, '0')}</p>
                            <p className="text-xs text-gray-500">Seconds</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                              style={{ width: `${getShiftProgress()}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${getShiftProgress()}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            {getShiftProgress().toFixed(1)}% Complete
                            {shiftStartTime && ` • Started at ${format(shiftStartTime, 'h:mm a')}`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Quick Actions & Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Break Timer */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={onBreak ? "destructive" : "outline"}
                        onClick={handleBreakToggle}
                        className="w-full h-auto py-4 flex flex-col items-center gap-2"
                      >
                        <Coffee className="h-5 w-5" />
                        <span className="text-xs font-semibold">
                          {onBreak ? 'End Break' : 'Start Break'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDuration(getBreakDuration())}
                        </span>
                      </Button>
                    </motion.div>

                    {/* Quick Report */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/quick-report')}
                        className="w-full h-auto py-4 flex flex-col items-center gap-2"
                      >
                        <FileText className="h-5 w-5" />
                        <span className="text-xs font-semibold">Quick Report</span>
                        <span className="text-xs text-gray-500">Voice Note</span>
                      </Button>
                    </motion.div>

                    {/* Medications */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/medications')}
                        className="w-full h-auto py-4 flex flex-col items-center gap-2"
                      >
                        <Pill className="h-5 w-5" />
                        <span className="text-xs font-semibold">Medications</span>
                        <span className="text-xs text-gray-500">Due Soon</span>
                      </Button>
                    </motion.div>

                    {/* Participants */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/setup/participants')}
                        className="w-full h-auto py-4 flex flex-col items-center gap-2"
                      >
                        <Users className="h-5 w-5" />
                        <span className="text-xs font-semibold">Participants</span>
                        <span className="text-xs text-gray-500">{participants.length} Active</span>
                      </Button>
                    </motion.div>
                  </div>

                  {/* Shift Milestones */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      Shift Milestones
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Morning medication round (8:00 AM)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Lunch preparation (12:00 PM)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Afternoon activity (2:00 PM)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Complete progress notes before clock out</span>
                      </div>
                    </div>
                  </div>

                  {/* Clock Out Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      onClick={handleClockOut}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 py-6 h-auto"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Clock Out & End Shift
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>
          </Card>

          {/* Pre-Shift Intelligence */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pre-Shift Intelligence
            </h3>

            <div className="space-y-3" key={`alerts-${alerts.length}-${Date.now()}`}>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <Alert
                    key={`${alert.id}-${alert.timestamp}`}
                    className={`border-l-4 ${
                      alert.severity === 'critical' ? 'border-l-red-500' :
                      alert.severity === 'warning' ? 'border-l-yellow-500' :
                      'border-l-blue-500'
                    }`}
                  >
                    <AlertDescription className="flex items-start gap-3">
                      {alert.type === 'risk' && <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                      }`} />}
                      {alert.type === 'medication' && <Pill className="h-4 w-4 text-blue-500 mt-0.5" />}
                      {alert.type === 'environmental' && <Settings className="h-4 w-4 text-orange-500 mt-0.5" />}
                      <span className="text-sm">{alert.message}</span>
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <Alert className="border-l-4 border-l-green-500">
                  <AlertDescription className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">3 active participants today - All support plans reviewed and current</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Night Shift Reports Alert - Prominent with Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0)',
                    '0 0 0 8px rgba(239, 68, 68, 0.1)',
                    '0 0 0 0 rgba(239, 68, 68, 0)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'loop'
                }}
                className="relative"
              >
                <Alert className="border-l-4 border-l-red-500 bg-red-50 border-red-200">
                  <AlertDescription className="flex items-start gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Bell className="h-5 w-5 text-red-600 mt-0.5" />
                    </motion.div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-red-900">
                        ⚠️ URGENT: 2 reports from night shift require review
                      </span>
                      <p className="text-xs text-red-700 mt-1">
                        Please review handover notes before starting your shift
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            </div>

            {/* Prominent Handover Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Button
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
                onClick={() => router.push('/handover')}
              >
                <FileText className="mr-2 h-5 w-5" />
                View Full Handover & Review Reports
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </Card>

          {/* Additional Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today's Activities</p>
                  <p className="font-semibold">Menu Review at 2 PM</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Thermometer className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weather</p>
                  <p className="font-semibold">28°C - Sunny</p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => setShowStaffList(!showStaffList)}
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Staff on Duty</p>
                    <p className="font-semibold">3 Support Workers</p>
                  </div>
                  <ChevronRight 
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                      showStaffList ? 'rotate-90' : ''
                    }`} 
                  />
                </div>
                
                {showStaffList && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-3 border-t pt-3"
                  >
                    {supportWorkers.map((worker, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border ${
                          worker.status === 'en-route' ? 'bg-blue-50 border-blue-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium relative ${
                            worker.name === 'Bernard Adjei' ? 'bg-primary text-white' : 'bg-gray-300 text-gray-700'
                          }`}>
                            {worker.name.split(' ').map(n => n[0]).join('')}
                            {/* Status Indicator Dot */}
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                              worker.statusColor === 'green' ? 'bg-green-500' :
                              worker.statusColor === 'blue' ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {worker.name}
                                {worker.name === 'Bernard Adjei' && (
                                  <span className="text-xs text-gray-500 ml-1">(You)</span>
                                )}
                              </p>
                            </div>

                            <p className="text-xs text-gray-600 mb-2">{worker.role} • {worker.shift}</p>

                            {/* Status Badge with Animation */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {worker.status === 'on-site' ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {worker.statusText}
                                </Badge>
                              ) : worker.status === 'en-route' ? (
                                <motion.div
                                  animate={{
                                    scale: [1, 1.05, 1],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatType: 'loop'
                                  }}
                                >
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-xs">
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                      className="mr-1"
                                    >
                                      <Navigation className="h-3 w-3" />
                                    </motion.div>
                                    {worker.statusText}
                                  </Badge>
                                </motion.div>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {worker.statusText}
                                </Badge>
                              )}

                              {/* Distance & ETA */}
                              {worker.eta && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className="flex items-center gap-1 text-xs text-blue-600 font-medium"
                                >
                                  <MapPin className="h-3 w-3" />
                                  <span>{worker.distance}</span>
                                  <span className="mx-1">•</span>
                                  <Clock className="h-3 w-3" />
                                  <span>{worker.eta}</span>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </Card>
          </div>

          {/* Demo Mode Indicator */}
          <div className="text-center">
            <Badge variant="secondary" className="px-4 py-2">
              Demo Mode - Simulated Data
            </Badge>
          </div>
        </motion.div>
      </div>

      {/* Clock Out Checklist Modal */}
      <Dialog open={showClockOutModal} onOpenChange={setShowClockOutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Complete Required Tasks
            </DialogTitle>
            <DialogDescription>
              Please complete all required tasks before clocking out of your shift.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {/* Progress Notes - Required */}
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Checkbox
                  id="progressNotes"
                  checked={tasksCompleted.progressNotes}
                  onCheckedChange={(checked) =>
                    setTasksCompleted(prev => ({ ...prev, progressNotes: checked as boolean }))
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="progressNotes" className="text-sm font-semibold text-red-900 cursor-pointer">
                    Progress Notes (Required)
                  </label>
                  <p className="text-xs text-red-700 mt-0.5">
                    Document participant activities and observations
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">Required</Badge>
              </div>

              {/* Optional Tasks */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Checkbox
                  id="medicationReview"
                  checked={tasksCompleted.medicationReview}
                  onCheckedChange={(checked) =>
                    setTasksCompleted(prev => ({ ...prev, medicationReview: checked as boolean }))
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="medicationReview" className="text-sm font-medium cursor-pointer">
                    Medication Administration Records
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verify all medications were administered
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Checkbox
                  id="incidentReports"
                  checked={tasksCompleted.incidentReports}
                  onCheckedChange={(checked) =>
                    setTasksCompleted(prev => ({ ...prev, incidentReports: checked as boolean }))
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="incidentReports" className="text-sm font-medium cursor-pointer">
                    Incident Reports (if applicable)
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Document any incidents or unusual events
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Checkbox
                  id="handoverNotes"
                  checked={tasksCompleted.handoverNotes}
                  onCheckedChange={(checked) =>
                    setTasksCompleted(prev => ({ ...prev, handoverNotes: checked as boolean }))
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="handoverNotes" className="text-sm font-medium cursor-pointer">
                    Handover Notes for Next Shift
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Prepare notes for incoming staff
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowClockOutModal(false)}
            >
              Continue Shift
            </Button>
            <Button
              onClick={async () => {
                setShowClockOutModal(false)
                // Proceed with clock out
                setIsLoading(true)
                try {
                  if (currentShift) {
                    await DataService.endShift(currentShift.id)
                  }
                  setCurrentShift(null) // This will clear from localStorage automatically
                  setOnBreak(false)
                  setBreakStartTime(null)
                  setTotalBreakTime(0)
                  setTasksCompleted({
                    progressNotes: false,
                    medicationReview: false,
                    incidentReports: false,
                    handoverNotes: false
                  })
                  router.push('/dashboard')
                } catch (error) {
                  console.error('Error clocking out:', error)
                  setIsLoading(false)
                }
              }}
              disabled={!tasksCompleted.progressNotes}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Clock Out Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Ended Modal */}
      <Dialog open={showShiftEndedModal} onOpenChange={setShowShiftEndedModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Shift Ended - Complete Handover
            </DialogTitle>
            <DialogDescription>
              Your scheduled shift time has ended. Please complete your handover notes and progress reports before finishing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Shift Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Shift Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-blue-700">Started:</span>
                  <span className="ml-2 font-medium">{shiftStartTime && format(shiftStartTime, 'h:mm a')}</span>
                </div>
                <div>
                  <span className="text-blue-700">Ended:</span>
                  <span className="ml-2 font-medium">{shiftEndTime && format(shiftEndTime, 'h:mm a')}</span>
                </div>
                <div>
                  <span className="text-blue-700">Duration:</span>
                  <span className="ml-2 font-medium">8 hours</span>
                </div>
                <div>
                  <span className="text-blue-700">Break Time:</span>
                  <span className="ml-2 font-medium">{formatDuration(totalBreakTime)}</span>
                </div>
              </div>
            </div>

            {/* Handover Notes - Required */}
            <div>
              <Label htmlFor="handover-notes" className="text-base font-semibold flex items-center gap-2">
                Handover Notes
                <Badge variant="destructive" className="text-xs">Required</Badge>
              </Label>
              <p className="text-sm text-gray-600 mb-2 mt-1">
                Provide important information for the next shift (participant updates, incidents, tasks pending, etc.)
              </p>
              <Textarea
                id="handover-notes"
                placeholder="Example: Sarah had a good day, completed all activities. Medication administered at 2pm. John needs follow-up for appointment tomorrow at 10am..."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            {/* Progress Notes - Optional */}
            <div>
              <Label htmlFor="progress-notes" className="text-base font-semibold flex items-center gap-2">
                Progress Notes
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              </Label>
              <p className="text-sm text-gray-600 mb-2 mt-1">
                Document participant progress, behaviors, achievements, or concerns observed during your shift
              </p>
              <Textarea
                id="progress-notes"
                placeholder="Example: Sarah showed improved communication skills today. Participated actively in group activities..."
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Reminder */}
            <Alert className="border-l-4 border-l-yellow-500">
              <AlertDescription className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <span className="text-sm">
                  All handover notes will be available to the next shift. Ensure all critical information is documented.
                </span>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowShiftEndedModal(false)}
            >
              Continue Shift
            </Button>
            <Button
              onClick={handleShiftEndComplete}
              disabled={!handoverNotes.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Shift & Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ShiftStartPage() {
  return (
    <AuthGuard>
      <ShiftStartContent />
    </AuthGuard>
  )
}