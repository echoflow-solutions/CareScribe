'use client'

import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Newspaper, Sparkles, Sun, Calendar, Users, AlertCircle,
  CheckCircle, TrendingUp, MessageSquare, Clock, Heart,
  Brain, Target, Zap, Star, Award, Activity, Pill,
  FileText, MapPin, Info, ChevronRight
} from 'lucide-react'

interface DailyBriefing {
  id: string
  date: Date
  shiftType: string
  shiftTime: string
  location: string
  summary: string
  keyPriorities: string[]
  participantHighlights: ParticipantHighlight[]
  criticalAlerts: Alert[]
  medicationSummary: MedicationSummary
  teamUpdates: string[]
  weatherInfo: WeatherInfo
  aiInsights: AIInsight[]
  motivationalQuote: string
}

interface ParticipantHighlight {
  participantId: string
  participantName: string
  status: 'stable' | 'attention_needed' | 'excellent'
  todaysFocus: string[]
  recentChanges?: string
  moodTrend: 'positive' | 'neutral' | 'concerning'
}

interface Alert {
  type: 'critical' | 'important' | 'info'
  title: string
  description: string
  actionRequired?: string
}

interface MedicationSummary {
  totalDoses: number
  criticalMedications: number
  prnAvailable: number
  scheduledTimes: string[]
}

interface WeatherInfo {
  temperature: string
  condition: string
  recommendation: string
}

interface AIInsight {
  category: string
  insight: string
  confidence: 'high' | 'medium'
  icon: any
}

export default function TodaysBriefingPage() {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    loadTodaysBriefing()
  }, [selectedDate])

  const loadTodaysBriefing = async () => {
    setLoading(true)
    try {
      // Mock AI-generated briefing data
      const mockBriefing: DailyBriefing = {
        id: '1',
        date: selectedDate,
        shiftType: 'Morning Shift',
        shiftTime: '7:00 AM - 3:00 PM',
        location: 'Sunshine House',
        summary: 'Good morning! Your shift today includes 4 participants with 2 scheduled activities and 12 medication administrations. Weather is perfect for outdoor activities.',
        keyPriorities: [
          'Morning medication round at 8:00 AM (12 doses)',
          'James Mitchell physiotherapy session at 11:00 AM',
          'Team meeting at 2:00 PM',
          'Complete handover notes before 2:45 PM'
        ],
        participantHighlights: [
          {
            participantId: '1',
            participantName: 'James Mitchell',
            status: 'attention_needed',
            todaysFocus: ['Physiotherapy at 11 AM', 'Encourage social interaction', 'Monitor mood'],
            recentChanges: 'Has been quieter than usual this week',
            moodTrend: 'concerning'
          },
          {
            participantId: '2',
            participantName: 'Sarah Chen',
            status: 'excellent',
            todaysFocus: ['Morning walk preferred', 'Medication at 2 PM', 'Art activity'],
            moodTrend: 'positive'
          },
          {
            participantId: '3',
            participantName: 'Michael Brown',
            status: 'stable',
            todaysFocus: ['Meal preparation assistance', 'Medication compliance', 'Quiet activities'],
            moodTrend: 'neutral'
          },
          {
            participantId: '4',
            participantName: 'Emma Wilson',
            status: 'excellent',
            todaysFocus: ['Independent activities', 'Social time with peers', 'Evening PRN if needed'],
            moodTrend: 'positive'
          }
        ],
        criticalAlerts: [
          {
            type: 'important',
            title: 'James Mitchell - Wellness Check',
            description: 'AI detected unusual behavior pattern. Extra attention recommended.',
            actionRequired: 'Complete wellness check by 10 AM'
          },
          {
            type: 'info',
            title: 'Team Meeting',
            description: 'Monthly team meeting scheduled at 2:00 PM today.',
            actionRequired: 'Confirm attendance'
          }
        ],
        medicationSummary: {
          totalDoses: 12,
          criticalMedications: 3,
          prnAvailable: 5,
          scheduledTimes: ['8:00 AM', '12:00 PM', '2:00 PM']
        },
        teamUpdates: [
          'New PRN protocol for anxiety management - check updated care plans',
          'Fire drill scheduled for next week - review emergency procedures',
          'Great feedback from families on last week\'s activities!'
        ],
        weatherInfo: {
          temperature: '22°C',
          condition: 'Sunny',
          recommendation: 'Perfect for outdoor activities! Sarah Chen enjoys morning walks.'
        },
        aiInsights: [
          {
            category: 'Participant Wellbeing',
            insight: 'James Mitchell\'s activity level has decreased 30% this week. Consider engaging him with his favorite music therapy.',
            confidence: 'high',
            icon: Heart
          },
          {
            category: 'Workflow Optimization',
            insight: 'Morning medication round can be optimized by starting with Building A participants first, saving 15 minutes.',
            confidence: 'high',
            icon: Zap
          },
          {
            category: 'Team Collaboration',
            insight: 'Michael Chen will be covering afternoon shift - he prefers detailed handover notes for participant mood changes.',
            confidence: 'medium',
            icon: Users
          }
        ],
        motivationalQuote: '"The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi'
      }

      setBriefing(mockBriefing)
    } catch (error) {
      console.error('Error loading briefing:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: ParticipantHighlight['status']) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200'
      case 'stable': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'attention_needed': return 'bg-orange-100 text-orange-700 border-orange-200'
    }
  }

  const getStatusIcon = (status: ParticipantHighlight['status']) => {
    switch (status) {
      case 'excellent': return Star
      case 'stable': return CheckCircle
      case 'attention_needed': return AlertCircle
    }
  }

  const getMoodIcon = (mood: ParticipantHighlight['moodTrend']) => {
    switch (mood) {
      case 'positive': return '😊'
      case 'neutral': return '😐'
      case 'concerning': return '😟'
    }
  }

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'important': return 'border-orange-500 bg-orange-50'
      case 'info': return 'border-blue-500 bg-blue-50'
    }
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return AlertCircle
      case 'important': return Info
      case 'info': return MessageSquare
    }
  }

  if (loading || !briefing) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Generating your personalized briefing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
            <Newspaper className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Today's Briefing</h1>
            <p className="text-gray-600">AI-powered daily summary and insights</p>
          </div>
        </div>

        {/* Date and Shift Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{format(briefing.date, 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Shift</p>
                    <p className="font-semibold">{briefing.shiftTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{briefing.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="mb-6 border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-gray-700">{briefing.summary}</p>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {briefing.criticalAlerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Critical Alerts
          </h2>
          <div className="space-y-3">
            {briefing.criticalAlerts.map((alert, idx) => {
              const AlertIcon = getAlertIcon(alert.type)
              return (
                <Card key={idx} className={`border-2 ${getAlertColor(alert.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertIcon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{alert.title}</h3>
                        <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                        {alert.actionRequired && (
                          <Badge variant="secondary">
                            <Target className="h-3 w-3 mr-1" />
                            {alert.actionRequired}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Key Priorities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Key Priorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {briefing.keyPriorities.map((priority, idx) => (
                <li key={idx} className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                  <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-700 pt-0.5">{priority}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Medication Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-green-600" />
              Medication Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{briefing.medicationSummary.totalDoses}</p>
                <p className="text-xs text-gray-600">Total Doses</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{briefing.medicationSummary.criticalMedications}</p>
                <p className="text-xs text-gray-600">Critical</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{briefing.medicationSummary.prnAvailable}</p>
                <p className="text-xs text-gray-600">PRN</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Scheduled Times:</p>
              <div className="flex gap-2">
                {briefing.medicationSummary.scheduledTimes.map((time, idx) => (
                  <Badge key={idx} variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {time}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participant Highlights */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Participant Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {briefing.participantHighlights.map((participant) => {
            const StatusIcon = getStatusIcon(participant.status)
            return (
              <Card key={participant.participantId} className={`border-2 ${getStatusColor(participant.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{participant.participantName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={getStatusColor(participant.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {participant.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-lg">{getMoodIcon(participant.moodTrend)}</span>
                      </div>
                    </div>
                  </div>

                  {participant.recentChanges && (
                    <div className="mb-3 p-2 bg-white/50 rounded border">
                      <p className="text-sm text-gray-700">
                        <Info className="h-3 w-3 inline mr-1" />
                        {participant.recentChanges}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold mb-2">Today's Focus:</p>
                    <ul className="space-y-1">
                      {participant.todaysFocus.map((focus, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600" />
                          {focus}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* AI Insights */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Insights
        </h2>
        <div className="space-y-3">
          {briefing.aiInsights.map((insight, idx) => {
            const InsightIcon = insight.icon
            return (
              <Card key={idx} className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <InsightIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-purple-900">{insight.category}</h3>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {insight.confidence} confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-700">{insight.insight}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Team Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Team Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {briefing.teamUpdates.map((update, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                  {update}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Weather Info */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-600" />
              Weather & Outdoor Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{briefing.weatherInfo.temperature}</p>
                <p className="text-sm text-gray-600">{briefing.weatherInfo.condition}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{briefing.weatherInfo.recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Quote */}
      <Card className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-200">
        <CardContent className="p-6 text-center">
          <Star className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
          <p className="text-lg italic text-indigo-900 mb-2">{briefing.motivationalQuote}</p>
          <p className="text-sm text-indigo-700">Have a wonderful shift! 🌟</p>
        </CardContent>
      </Card>
    </div>
  )
}
