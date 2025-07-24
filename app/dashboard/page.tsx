'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mic, Bell, Home, FileText, BarChart3, Users, 
  Settings, LogOut, ChevronRight, AlertCircle,
  Smile, Frown, Meh, Moon, Camera, Clock, Pill,
  TrendingUp, Shield, Wand2, AlertTriangle
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { format } from 'date-fns'
import { Participant } from '@/lib/types'
import { DemoControls } from '@/components/demo-controls'

export default function DashboardPage() {
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
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    // Support workers need an active shift
    if (currentUser.role.level === 4 && !currentShift) {
      router.push('/shift-start')
      return
    }

    // Load data
    loadDashboardData()

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

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
              time: new Date(),
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
              {/* Alerts */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </Button>
              
              {/* Current time and location */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {format(currentTime, 'h:mm a')}
                {currentShift && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>House 3</span>
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
                    <Card key={participant.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(participant.currentStatus)}
                              <Badge variant="secondary" className={getStatusColor(participant.currentStatus)}>
                                {participant.currentStatus}
                              </Badge>
                              <span className="text-sm text-gray-500">{participant.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Mic className="h-4 w-4" />
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
                            {activity.user} • {format(activity.time, 'h:mm a')}
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
                            {format(new Date(alert.timestamp), 'h:mm a')} - {alert.message}
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
                          {format(new Date(alert.timestamp), 'h:mm a')}
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
      <DemoControls open={showDemoControls} onOpenChange={setShowDemoControls} />
    </div>
  )
}