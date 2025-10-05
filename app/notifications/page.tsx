'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import {
  Bell, BellOff, AlertCircle, Users, Calendar, Pill,
  FileText, Heart, Shield, Zap, MessageSquare, Award,
  CheckCircle, X, Settings, Filter, Star, Clock,
  TrendingUp, Radio, GraduationCap, Trophy, Info,
  ArrowRight, Trash2
} from 'lucide-react'

interface Notification {
  id: string
  type: 'shift' | 'medication' | 'task' | 'team' | 'training' | 'recognition' | 'alert' | 'wellness'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

interface NotificationPreferences {
  shifts: boolean
  medications: boolean
  tasks: boolean
  teamMessages: boolean
  training: boolean
  recognition: boolean
  alerts: boolean
  wellness: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

export default function NotificationsPage() {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | Notification['type']>('all')
  const [showPreferences, setShowPreferences] = useState(false)

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    shifts: true,
    medications: true,
    tasks: true,
    teamMessages: true,
    training: true,
    recognition: true,
    alerts: true,
    wellness: true,
    emailNotifications: true,
    pushNotifications: true
  })

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'alert',
      priority: 'high',
      title: 'Emergency SOS Alert',
      message: 'David Brown requested immediate assistance at Riverside Care',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      actionUrl: '/team-pulse',
      actionLabel: 'Respond'
    },
    {
      id: '2',
      type: 'shift',
      priority: 'high',
      title: 'Shift Starting Soon',
      message: 'Your shift at Sunshine House starts in 30 minutes',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false,
      actionUrl: '/shifts',
      actionLabel: 'View Shift'
    },
    {
      id: '3',
      type: 'medication',
      priority: 'high',
      title: 'Medication Round Due',
      message: '8:00 AM medication round is now due - 12 doses to administer',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: false,
      actionUrl: '/medications',
      actionLabel: 'Start Round'
    },
    {
      id: '4',
      type: 'recognition',
      priority: 'medium',
      title: 'You Received Recognition!',
      message: 'Sarah Williams sent you kudos for excellent participant care',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: false,
      actionUrl: '/performance',
      actionLabel: 'View'
    },
    {
      id: '5',
      type: 'task',
      priority: 'medium',
      title: 'New AI Task Suggestion',
      message: 'Smart Tasks has suggested "Check in with James Mitchell" based on activity patterns',
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
      read: true,
      actionUrl: '/tasks',
      actionLabel: 'View Tasks'
    },
    {
      id: '6',
      type: 'team',
      priority: 'medium',
      title: 'Team Message',
      message: 'Michael Chen: "Team meeting at 2 PM today. Please confirm attendance."',
      timestamp: new Date(Date.now() - 4 * 60 * 60000),
      read: true,
      actionUrl: '/team-pulse',
      actionLabel: 'Reply'
    },
    {
      id: '7',
      type: 'training',
      priority: 'medium',
      title: 'Training Module Due',
      message: 'Emergency Response Procedures training is due in 3 days',
      timestamp: new Date(Date.now() - 6 * 60 * 60000),
      read: true,
      actionUrl: '/training',
      actionLabel: 'Start Training'
    },
    {
      id: '8',
      type: 'wellness',
      priority: 'low',
      title: 'Daily Wellness Check-In',
      message: 'Take a moment to complete your daily wellness check-in',
      timestamp: new Date(Date.now() - 8 * 60 * 60000),
      read: true,
      actionUrl: '/wellness',
      actionLabel: 'Check In'
    }
  ])

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'shift': return Clock
      case 'medication': return Pill
      case 'task': return CheckCircle
      case 'team': return Users
      case 'training': return GraduationCap
      case 'recognition': return Trophy
      case 'alert': return AlertCircle
      case 'wellness': return Heart
    }
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'shift': return 'text-blue-600 bg-blue-100'
      case 'medication': return 'text-green-600 bg-green-100'
      case 'task': return 'text-purple-600 bg-purple-100'
      case 'team': return 'text-indigo-600 bg-indigo-100'
      case 'training': return 'text-orange-600 bg-orange-100'
      case 'recognition': return 'text-yellow-600 bg-yellow-100'
      case 'alert': return 'text-red-600 bg-red-100'
      case 'wellness': return 'text-pink-600 bg-pink-100'
    }
  }

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>
      case 'low':
        return <Badge variant="outline">Low</Badge>
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast({
      title: 'All notifications marked as read',
      duration: 2000
    })
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast({
      title: 'Notification deleted',
      duration: 2000
    })
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    if (selectedFilter === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter(n => n.type === selectedFilter)
    }

    return filtered
  }

  const updatePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
    toast({
      title: 'Preferences updated',
      duration: 2000
    })
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.read).length
  const highPriorityCount = notifications.filter(n => !n.read && n.priority === 'high').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl relative">
              <Bell className="h-6 w-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowPreferences(!showPreferences)}>
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </Button>
          </div>
        </div>

        {/* Stats */}
        {highPriorityCount > 0 && (
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    {highPriorityCount} High Priority {highPriorityCount === 1 ? 'Notification' : 'Notifications'}
                  </h3>
                  <p className="text-sm text-red-700">Requires immediate attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <Card className="mb-6 border-2 border-blue-300">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose which notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Shifts & Schedule</span>
                </div>
                <Switch checked={preferences.shifts} onCheckedChange={() => updatePreference('shifts')} />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Pill className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Medications</span>
                </div>
                <Switch checked={preferences.medications} onCheckedChange={() => updatePreference('medications')} />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Tasks & Reminders</span>
                </div>
                <Switch checked={preferences.tasks} onCheckedChange={() => updatePreference('tasks')} />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">Team Messages</span>
                </div>
                <Switch checked={preferences.teamMessages} onCheckedChange={() => updatePreference('teamMessages')} />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Training & Certifications</span>
                </div>
                <Switch checked={preferences.training} onCheckedChange={() => updatePreference('training')} />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Recognition & Achievements</span>
                </div>
                <Switch checked={preferences.recognition} onCheckedChange={() => updatePreference('recognition')} />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Alerts & Emergencies</span>
                </div>
                <Switch checked={preferences.alerts} onCheckedChange={() => updatePreference('alerts')} />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span className="font-medium">Wellness Check-ins</span>
                </div>
                <Switch checked={preferences.wellness} onCheckedChange={() => updatePreference('wellness')} />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Delivery Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={() => updatePreference('emailNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={() => updatePreference('pushNotifications')}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={selectedFilter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <div className="w-px h-8 bg-gray-300 mx-1" />
        <Button
          variant={selectedFilter === 'alert' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('alert')}
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Alerts
        </Button>
        <Button
          variant={selectedFilter === 'shift' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('shift')}
        >
          <Clock className="h-4 w-4 mr-1" />
          Shifts
        </Button>
        <Button
          variant={selectedFilter === 'medication' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('medication')}
        >
          <Pill className="h-4 w-4 mr-1" />
          Medications
        </Button>
        <Button
          variant={selectedFilter === 'task' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('task')}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Tasks
        </Button>
        <Button
          variant={selectedFilter === 'recognition' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFilter('recognition')}
        >
          <Trophy className="h-4 w-4 mr-1" />
          Recognition
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up! Check back later for updates.</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.type)
            return (
              <Card
                key={notification.id}
                className={`${!notification.read ? 'border-2 border-blue-300 bg-blue-50' : ''} hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${getTypeColor(notification.type)}`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {notification.title}
                            {!notification.read && (
                              <span className="h-2 w-2 bg-blue-600 rounded-full" />
                            )}
                          </h3>
                          <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                        </div>
                        {getPriorityBadge(notification.priority)}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {format(notification.timestamp, 'MMM dd, h:mm a')}
                        </span>

                        <div className="flex items-center gap-2">
                          {notification.actionUrl && (
                            <Button size="sm" onClick={() => markAsRead(notification.id)}>
                              {notification.actionLabel}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
