'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Mic, Bell, Home, FileText, BarChart3, Users, 
  Settings, LogOut, ChevronRight, AlertCircle,
  Smile, Frown, Meh, Moon, Camera, Clock, Pill,
  TrendingUp, Shield, Wand2, AlertTriangle,
  X, AlertOctagon, HeartHandshake, UserCheck,
  Siren, BellOff, CheckCircle, Activity,
  Calendar, MapPin, Phone, Mail, Heart,
  Stethoscope, ClipboardList, MessageSquare,
  MicOff, Pause, Play, Square, Send
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { format } from 'date-fns'
import { Participant } from '@/lib/types'
import { DemoControls } from '@/components/demo-controls'
import { AuthGuard } from '@/components/auth/auth-guard'

function DashboardContent() {
  const router = useRouter()
  const { currentUser, currentShift } = useStore()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedView, setSelectedView] = useState('overview')
  const [liveUpdates, setLiveUpdates] = useState<boolean>(true)
  const [realtimeStats, setRealtimeStats] = useState({
    activeStaff: 12,
    participantsPresent: 45,
    pendingTasks: 8,
    incidentsToday: 3
  })
  const [showDemoControls, setShowDemoControls] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  
  // Participant detail modal state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [showParticipantModal, setShowParticipantModal] = useState(false)
  
  // Voice recording state
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [recordingParticipant, setRecordingParticipant] = useState<Participant | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [voiceNotes, setVoiceNotes] = useState<Array<{
    id: string
    participantId: string
    participantName: string
    duration: number
    timestamp: Date
    transcription?: string
  }>>([])
  
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'critical' | 'medication' | 'incident' | 'wellness' | 'task' | 'system'
    priority: 'urgent' | 'high' | 'medium' | 'low'
    title: string
    message: string
    time: Date
    read: boolean
    actionRequired?: boolean
    participant?: string
  }>>([
    {
      id: '1',
      type: 'critical',
      priority: 'urgent',
      title: 'Critical Incident Alert',
      message: 'James M. experiencing severe anxiety - immediate response required',
      time: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      actionRequired: true,
      participant: 'James Mitchell'
    },
    {
      id: '2',
      type: 'medication',
      priority: 'high',
      title: 'Medication Due Now',
      message: 'Sarah C. - Risperidone 2mg due immediately',
      time: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      actionRequired: true,
      participant: 'Sarah Chen'
    },
    {
      id: '3',
      type: 'wellness',
      priority: 'medium',
      title: 'Wellness Check Required',
      message: 'Michael B. has not been seen for 2 hours - please check',
      time: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      participant: 'Michael Brown'
    },
    {
      id: '4',
      type: 'incident',
      priority: 'high',
      title: 'Incident Follow-up',
      message: 'Previous ABC report for Emma W. requires documentation',
      time: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      participant: 'Emma Wilson'
    },
    {
      id: '5',
      type: 'task',
      priority: 'medium',
      title: 'Daily Task Reminder',
      message: 'Menu review scheduled at 2:00 PM today',
      time: new Date(Date.now() - 45 * 60 * 1000),
      read: true
    },
    {
      id: '6',
      type: 'system',
      priority: 'low',
      title: 'Shift Change Alert',
      message: 'Emma Williams starting shift at 3:00 PM',
      time: new Date(Date.now() - 60 * 60 * 1000),
      read: true
    }
  ])
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string
    type: 'medication' | 'incident' | 'note' | 'shift'
    message: string
    time: Date
    user: string
  }>>([
    {
      id: '1',
      type: 'medication',
      message: 'Administered Risperidone to Sarah Chen',
      time: new Date(Date.now() - 5 * 60 * 1000),
      user: 'Tom Anderson'
    },
    {
      id: '2',
      type: 'incident',
      message: 'Reported behavioral incident - James Mitchell',
      time: new Date(Date.now() - 15 * 60 * 1000),
      user: 'Emily Chen'
    }
  ])

  useEffect(() => {
    // Support workers need an active shift
    if (currentUser && currentUser.role.level === 4 && !currentShift) {
      router.push('/shift-start')
      return
    }

    // Load data
    loadDashboardData()

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate real-time updates
    let updateInterval: NodeJS.Timeout
    if (liveUpdates) {
      updateInterval = setInterval(() => {
        // Simulate random stat changes
        setRealtimeStats(prev => ({
          activeStaff: prev.activeStaff + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.8 ? 1 : 0),
          participantsPresent: prev.participantsPresent,
          pendingTasks: Math.max(0, prev.pendingTasks + (Math.random() > 0.7 ? 1 : -1)),
          incidentsToday: prev.incidentsToday + (Math.random() > 0.95 ? 1 : 0)
        }))

        // Simulate new activity (10% chance)
        if (Math.random() > 0.9) {
          const activities = [
            { type: 'medication' as const, messages: ['administered medication', 'PRN medication given'] },
            { type: 'incident' as const, messages: ['reported incident', 'behavioral incident occurred'] },
            { type: 'note' as const, messages: ['added progress note', 'updated care plan'] },
            { type: 'shift' as const, messages: ['started shift', 'completed handover'] }
          ]
          
          const activity = activities[Math.floor(Math.random() * activities.length)]
          const participants = ['James Mitchell', 'Sarah Chen', 'Michael Brown', 'Emma Wilson']
          const staff = ['Tom Anderson', 'Emily Chen', 'Mark Williams', 'Lisa Brown']
          
          setRecentActivity(prev => [{
            id: Date.now().toString(),
            type: activity.type,
            message: `${activity.messages[Math.floor(Math.random() * activity.messages.length)]} - ${participants[Math.floor(Math.random() * participants.length)]}`,
            time: new Date(),
            user: staff[Math.floor(Math.random() * staff.length)]
          }, ...prev].slice(0, 10))

          // 20% chance of new alert
          if (Math.random() > 0.8) {
            const newAlert = {
              id: Date.now().toString(),
              type: activity.type,
              title: activity.type === 'medication' ? 'Medication Due' : 'Action Required',
              message: `New ${activity.type} requiring attention`,
              timestamp: new Date().toISOString(),
              acknowledged: false
            }
            setAlerts(prev => [newAlert, ...prev])
          }
        }
      }, 5000) // Update every 5 seconds
    }

    return () => {
      clearInterval(timer)
      if (updateInterval) clearInterval(updateInterval)
    }
  }, [currentUser, currentShift, router])

  // Handle click outside notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const loadDashboardData = async () => {
    const [participantData, alertData] = await Promise.all([
      DataService.getParticipants(),
      DataService.getAlerts()
    ])
    setParticipants(participantData)
    setAlerts(alertData.filter(a => !a.acknowledged))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'happy': return <Smile className="h-5 w-5 text-green-500" />
      case 'anxious': return <Frown className="h-5 w-5 text-yellow-500" />
      case 'calm': return <Meh className="h-5 w-5 text-blue-500" />
      case 'resting': return <Moon className="h-5 w-5 text-gray-500" />
      default: return <Meh className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'happy': return 'bg-green-100 text-green-800'
      case 'anxious': return 'bg-yellow-100 text-yellow-800'
      case 'calm': return 'bg-blue-100 text-blue-800'
      case 'resting': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFacilityName = (facilityId: string) => {
    // Map facility UUIDs to readable names
    const facilityMap: { [key: string]: string } = {
      '650e8400-e29b-41d4-a716-446655440003': 'Parramatta - Maxlife Care',
      '650e8400-e29b-41d4-a716-446655440001': 'Clyde - Maxlife Care',
      '650e8400-e29b-41d4-a716-446655440002': 'Strathfield - Maxlife Care',
      '650e8400-e29b-41d4-a716-446655440004': 'Rouse Hill - Maxlife Care',
      '650e8400-e29b-41d4-a716-446655440005': 'Blacktown - Maxlife Care'
    }
    return facilityMap[facilityId] || 'Unknown Facility'
  }

  const handleQuickReport = () => {
    router.push('/quick-report')
  }

  if (!currentUser) return null
  
  // Support workers need a shift, others don't
  if (currentUser.role.level === 4 && !currentShift) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {currentUser.name}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>
                
                {/* Notifications Panel */}
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl border overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Bell className="h-5 w-5" />
                          Notifications
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 h-8 w-8"
                          onClick={() => setShowNotifications(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="opacity-90">
                          {notifications.filter(n => !n.read).length} unread
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 h-7 px-2"
                          onClick={() => {
                            setNotifications(notifications.map(n => ({ ...n, read: true })))
                          }}
                        >
                          Mark all read
                        </Button>
                      </div>
                    </div>
                    
                    {/* Notification List */}
                    <div className="overflow-y-auto max-h-[500px]">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <BellOff className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-blue-50/50' : ''
                              }`}
                              onClick={() => {
                                setNotifications(notifications.map(n => 
                                  n.id === notification.id ? { ...n, read: true } : n
                                ))
                              }}
                            >
                              <div className="flex gap-3">
                                {/* Icon */}
                                <div className={`
                                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                  ${notification.type === 'critical' ? 'bg-red-100' :
                                    notification.type === 'medication' ? 'bg-blue-100' :
                                    notification.type === 'incident' ? 'bg-amber-100' :
                                    notification.type === 'wellness' ? 'bg-green-100' :
                                    notification.type === 'task' ? 'bg-purple-100' :
                                    'bg-gray-100'}
                                `}>
                                  {notification.type === 'critical' ? (
                                    <AlertOctagon className={`h-5 w-5 ${
                                      notification.priority === 'urgent' ? 'text-red-600 animate-pulse' : 'text-red-500'
                                    }`} />
                                  ) : notification.type === 'medication' ? (
                                    <Pill className="h-5 w-5 text-blue-600" />
                                  ) : notification.type === 'incident' ? (
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                  ) : notification.type === 'wellness' ? (
                                    <HeartHandshake className="h-5 w-5 text-green-600" />
                                  ) : notification.type === 'task' ? (
                                    <CheckCircle className="h-5 w-5 text-purple-600" />
                                  ) : (
                                    <Activity className="h-5 w-5 text-gray-600" />
                                  )}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 text-sm">
                                        {notification.title}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-0.5">
                                        {notification.message}
                                      </p>
                                      {notification.participant && (
                                        <div className="flex items-center gap-2 mt-2">
                                          <Badge variant="outline" className="text-xs">
                                            <UserCheck className="h-3 w-3 mr-1" />
                                            {notification.participant}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                    {notification.priority === 'urgent' && (
                                      <Badge variant="destructive" className="flex-shrink-0 animate-pulse">
                                        <Siren className="h-3 w-3 mr-1" />
                                        Urgent
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">
                                      {(() => {
                                        try {
                                          const date = notification.time instanceof Date ? notification.time : new Date(notification.time);
                                          if (isNaN(date.getTime())) {
                                            return 'Just now';
                                          }
                                          return format(date, 'h:mm a');
                                        } catch (error) {
                                          return 'Just now';
                                        }
                                      })()}
                                    </span>
                                    {notification.actionRequired && !notification.read && (
                                      <Button size="sm" className="h-7 text-xs">
                                        Take Action
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="border-t p-3 bg-gray-50">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-center text-sm"
                        onClick={() => {
                          setShowNotifications(false)
                          router.push('/notifications')
                        }}
                      >
                        View All Notifications
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Current time and location */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {(() => {
                  try {
                    return format(currentTime, 'h:mm:ss a');
                  } catch (error) {
                    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
                  }
                })()}
                {currentShift && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>{getFacilityName(currentShift.facilityId)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="">
        <div className="p-6">
          {selectedView === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Current Status */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Current Status - All Participants</h2>
                <div className="grid grid-cols-1 gap-3">
                  {participants.map((participant) => (
                    <Card 
                      key={participant.id} 
                      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/30 group"
                      onClick={() => {
                        setSelectedParticipant(participant)
                        setShowParticipantModal(true)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12 ring-2 ring-gray-100 group-hover:ring-primary/20 transition-all">
                            <AvatarFallback className="text-lg font-semibold">
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-lg">{participant.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(participant.currentStatus)}
                              <Badge variant="secondary" className={`${getStatusColor(participant.currentStatus)} font-medium`}>
                                {participant.currentStatus}
                              </Badge>
                              <span className="text-sm text-gray-500">{participant.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            className="font-semibold shadow-sm hover:shadow-md transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedParticipant(participant)
                              setShowParticipantModal(true)
                            }}
                          >
                            <span className="mr-2">View</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="default"
                            className="shadow-sm hover:shadow-md transition-all hover:bg-primary hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              setRecordingParticipant(participant)
                              setShowVoiceModal(true)
                            }}
                          >
                            <Mic className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Real-Time Stats */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">📊 Live Dashboard</h2>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${liveUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-600">{liveUpdates ? 'Live' : 'Paused'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLiveUpdates(!liveUpdates)}
                    >
                      {liveUpdates ? 'Pause' : 'Resume'}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card className="p-4 hover-scale transition-smooth animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Staff</p>
                        <p className="text-2xl font-bold transition-all duration-300">{realtimeStats.activeStaff}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500 opacity-20" />
                    </div>
                  </Card>
                  <Card className="p-4 hover-scale transition-smooth animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Participants</p>
                        <p className="text-2xl font-bold transition-all duration-300">{realtimeStats.participantsPresent}</p>
                      </div>
                      <Home className="h-8 w-8 text-green-500 opacity-20" />
                    </div>
                  </Card>
                  <Card className="p-4 hover-scale transition-smooth animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Tasks</p>
                        <p className="text-2xl font-bold transition-all duration-300">{realtimeStats.pendingTasks}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500 opacity-20" />
                    </div>
                  </Card>
                  <Card className="p-4 hover-scale transition-smooth animate-slide-in-bottom" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Incidents Today</p>
                        <p className="text-2xl font-bold transition-all duration-300">{realtimeStats.incidentsToday}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500 opacity-20" />
                    </div>
                  </Card>
                </div>
              </div>

              {/* Real-Time Activity Feed */}
              <div>
                <h2 className="text-lg font-semibold mb-4">🔴 Live Activity Feed</h2>
                <Card className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 animate-fade-in">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'medication' ? 'bg-blue-100' :
                          activity.type === 'incident' ? 'bg-red-100' :
                          activity.type === 'note' ? 'bg-green-100' :
                          'bg-gray-100'
                        }`}>
                          {activity.type === 'medication' && <Pill className="h-4 w-4 text-blue-600" />}
                          {activity.type === 'incident' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          {activity.type === 'note' && <FileText className="h-4 w-4 text-green-600" />}
                          {activity.type === 'shift' && <Clock className="h-4 w-4 text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-gray-500">
                            {activity.user} • {(() => {
                              try {
                                const date = activity.time instanceof Date ? activity.time : new Date(activity.time);
                                if (isNaN(date.getTime())) {
                                  return 'Just now';
                                }
                                return format(date, 'h:mm a');
                              } catch (error) {
                                return 'Just now';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Real-Time Alerts */}
              <div>
                <h2 className="text-lg font-semibold mb-4">⚡ Real-Time Alerts</h2>
                <Card className="p-4">
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Alert key={alert.id} className="border-0 p-0">
                        <AlertDescription className="flex items-center justify-between">
                          <span className="text-sm">
                            {(() => {
                              try {
                                const date = new Date(alert.timestamp);
                                if (isNaN(date.getTime())) {
                                  return 'Now';
                                }
                                return format(date, 'h:mm a');
                              } catch (error) {
                                return 'Now';
                              }
                            })()} - {alert.message}
                          </span>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </AlertDescription>
                      </Alert>
                    ))}
                    {alerts.length === 0 && (
                      <p className="text-sm text-gray-500">No active alerts</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-3 gap-4">
                  <Card 
                    className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover-scale animate-scale-in"
                    onClick={handleQuickReport}
                    style={{ animationDelay: '0.1s' }}
                  >
                    <Mic className="h-8 w-8 mx-auto mb-2 text-primary transition-transform duration-300 hover:scale-110" />
                    <p className="font-medium">Voice Report</p>
                  </Card>
                  <Card 
                    className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover-scale animate-scale-in"
                    onClick={() => router.push('/report/manual')}
                    style={{ animationDelay: '0.2s' }}
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary transition-transform duration-300 hover:scale-110" />
                    <p className="font-medium">Manual Report</p>
                  </Card>
                  <Card 
                    className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover-scale animate-scale-in"
                    style={{ animationDelay: '0.3s' }}
                  >
                    <Camera className="h-8 w-8 mx-auto mb-2 text-primary transition-transform duration-300 hover:scale-110" />
                    <p className="font-medium">Photo Document</p>
                  </Card>
                </div>
              </div>

              {/* Recent Reports */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Your Recent Reports</h2>
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">9:45 AM - Medication administered (Sarah C.)</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">8:30 AM - Morning routine completed (All)</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">8:00 AM - Shift handover acknowledged</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {selectedView === 'active' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold">Active Alerts & Tasks</h2>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        alert.severity === 'critical' ? 'bg-red-100' :
                        alert.severity === 'warning' ? 'bg-yellow-100' :
                        'bg-blue-100'
                      }`}>
                        <AlertCircle className={`h-5 w-5 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{alert.message}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {(() => {
                            try {
                              const date = new Date(alert.timestamp);
                              if (isNaN(date.getTime())) {
                                return 'Now';
                              }
                              return format(date, 'h:mm a');
                            } catch (error) {
                              return 'Now';
                            }
                          })()}
                        </p>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm">Acknowledge</Button>
                          <Button size="sm" variant="outline">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Other views would be implemented similarly */}
        </div>
      </main>
      
      {/* Demo Controls */}
      {/* Participant Detail Modal */}
      <Dialog open={showParticipantModal} onOpenChange={setShowParticipantModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              {selectedParticipant && (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-white">
                      {selectedParticipant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedParticipant.name}</span>
                  <Badge 
                    variant={selectedParticipant.riskLevel === 'high' ? 'destructive' : 
                            selectedParticipant.riskLevel === 'medium' ? 'default' : 'secondary'}
                  >
                    {selectedParticipant.riskLevel} risk
                  </Badge>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              View detailed information about {selectedParticipant?.name || 'this participant'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedParticipant && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="incidents">Incidents</TabsTrigger>
                <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] mt-4">
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary" />
                        Personal Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Status:</span>
                          <Badge variant="outline">{selectedParticipant.currentStatus}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedParticipant.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Facility:</span>
                          <span className="font-medium">{getFacilityName(selectedParticipant.facility)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primary Contact:</span>
                          <span className="font-medium">
                            {selectedParticipant.emergencyContact?.name || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Today's Activity
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Last seen: 15 minutes ago</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Medications: All taken on schedule</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Mood: Stable and engaged</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  {/* Recent Voice Notes */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Mic className="h-5 w-5 text-primary" />
                      Recent Voice Notes
                    </h4>
                    {voiceNotes.filter(note => note.participantId === selectedParticipant.id).length > 0 ? (
                      <div className="space-y-2">
                        {voiceNotes
                          .filter(note => note.participantId === selectedParticipant.id)
                          .slice(0, 3)
                          .map(note => (
                            <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Mic className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Voice Note</p>
                                  <p className="text-xs text-gray-500">
                                    {(() => {
                                      try {
                                        const date = note.timestamp instanceof Date ? note.timestamp : new Date(note.timestamp);
                                        if (isNaN(date.getTime())) {
                                          return 'Just now';
                                        }
                                        return format(date, 'h:mm a');
                                      } catch (error) {
                                        return 'Just now';
                                      }
                                    })()} • {note.duration}s
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No voice notes recorded yet</p>
                    )}
                  </Card>
                </TabsContent>
                
                {/* Health Tab */}
                <TabsContent value="health" className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      Current Medications
                    </h4>
                    <div className="space-y-3">
                      {selectedParticipant.medications && selectedParticipant.medications.length > 0 ? (
                        selectedParticipant.medications.map((med, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{med.name}</p>
                                <p className="text-sm text-gray-600">{med.dosage} • {med.time}</p>
                              </div>
                              <Badge variant={med.type === 'regular' ? 'default' : 'secondary'}>
                                {med.type}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No medications recorded</p>
                      )}
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      Health Conditions
                    </h4>
                    <div className="space-y-2">
                      {selectedParticipant.conditions && selectedParticipant.conditions.length > 0 ? (
                        selectedParticipant.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm">{condition}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No health conditions recorded</p>
                      )}
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Incidents Tab */}
                <TabsContent value="incidents" className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Recent Incidents
                    </h4>
                    <p className="text-sm text-gray-500">No recent incidents recorded</p>
                  </Card>
                </TabsContent>
                
                {/* Care Plan Tab */}
                <TabsContent value="care-plan" className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Daily Care Requirements
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Personal Care</p>
                          <p className="text-sm text-gray-600">Assistance with morning routine</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Medication Management</p>
                          <p className="text-sm text-gray-600">Supervised medication at 8 AM, 2 PM, 8 PM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Social Activities</p>
                          <p className="text-sm text-gray-600">Group activities and community engagement</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Staff Notes
                    </h4>
                    <div className="space-y-3">
                      <div className="border-l-4 border-blue-400 pl-4">
                        <p className="text-sm font-medium">2 hours ago</p>
                        <p className="text-sm text-gray-600">Participated well in morning activities. Good mood.</p>
                        <p className="text-xs text-gray-500 mt-1">- Bernard Adjei</p>
                      </div>
                      <div className="border-l-4 border-green-400 pl-4">
                        <p className="text-sm font-medium">Yesterday</p>
                        <p className="text-sm text-gray-600">Had a great day. Enjoyed the music therapy session.</p>
                        <p className="text-xs text-gray-500 mt-1">- Emma Williams</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Voice Recording Modal */}
      <Dialog open={showVoiceModal} onOpenChange={setShowVoiceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Voice Note</DialogTitle>
            <DialogDescription>
              {recordingParticipant && `Recording note for ${recordingParticipant.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* Recording Animation */}
            <div className="flex justify-center">
              <div className={`relative w-32 h-32 ${isRecording ? 'animate-pulse' : ''}`}>
                <div className="absolute inset-0 bg-primary/20 rounded-full"></div>
                <div className="absolute inset-4 bg-primary/40 rounded-full"></div>
                <div className="absolute inset-8 bg-primary rounded-full flex items-center justify-center">
                  {isRecording ? (
                    <Mic className="h-8 w-8 text-white" />
                  ) : (
                    <MicOff className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Recording Time */}
            <div className="text-center">
              <p className="text-3xl font-mono font-bold text-gray-900">
                {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
                {(recordingTime % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isRecording ? 'Recording...' : 'Press record to start'}
              </p>
            </div>
            
            {/* Recording Controls */}
            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16"
                  onClick={() => {
                    setIsRecording(true)
                    // Start recording timer
                    const interval = setInterval(() => {
                      setRecordingTime(prev => prev + 1)
                    }, 1000)
                    // Store interval ID for cleanup
                    ;(window as any).recordingInterval = interval
                  }}
                >
                  <Play className="h-6 w-6" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-16 w-16"
                    onClick={() => {
                      setIsRecording(false)
                      clearInterval((window as any).recordingInterval)
                    }}
                  >
                    <Pause className="h-6 w-6" />
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    className="rounded-full h-16 w-16"
                    onClick={() => {
                      setIsRecording(false)
                      clearInterval((window as any).recordingInterval)
                      
                      // Save voice note
                      if (recordingParticipant && recordingTime > 0) {
                        const newNote = {
                          id: `voice-${Date.now()}`,
                          participantId: recordingParticipant.id,
                          participantName: recordingParticipant.name,
                          duration: recordingTime,
                          timestamp: new Date(),
                          transcription: 'Voice note recorded successfully'
                        }
                        setVoiceNotes(prev => [newNote, ...prev])
                        
                        // Show success message
                        setNotifications(prev => [{
                          id: `notif-${Date.now()}`,
                          type: 'system' as const,
                          priority: 'low' as const,
                          title: 'Voice Note Saved',
                          message: `${recordingTime}s voice note saved for ${recordingParticipant.name}`,
                          time: new Date(),
                          read: false
                        }, ...prev])
                      }
                      
                      // Reset
                      setRecordingTime(0)
                      setShowVoiceModal(false)
                    }}
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Quick Actions */}
            {!isRecording && recordingTime === 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">Quick note templates:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Auto-generate note
                      const newNote = {
                        id: `voice-${Date.now()}`,
                        participantId: recordingParticipant!.id,
                        participantName: recordingParticipant!.name,
                        duration: 5,
                        timestamp: new Date(),
                        transcription: 'Participant is stable and in good spirits'
                      }
                      setVoiceNotes(prev => [newNote, ...prev])
                      setShowVoiceModal(false)
                    }}
                  >
                    All good
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newNote = {
                        id: `voice-${Date.now()}`,
                        participantId: recordingParticipant!.id,
                        participantName: recordingParticipant!.name,
                        duration: 5,
                        timestamp: new Date(),
                        transcription: 'Needs attention - showing signs of distress'
                      }
                      setVoiceNotes(prev => [newNote, ...prev])
                      setShowVoiceModal(false)
                    }}
                  >
                    Needs attention
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newNote = {
                        id: `voice-${Date.now()}`,
                        participantId: recordingParticipant!.id,
                        participantName: recordingParticipant!.name,
                        duration: 5,
                        timestamp: new Date(),
                        transcription: 'Medication administered successfully'
                      }
                      setVoiceNotes(prev => [newNote, ...prev])
                      setShowVoiceModal(false)
                    }}
                  >
                    Medication given
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DemoControls open={showDemoControls} onOpenChange={setShowDemoControls} />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}