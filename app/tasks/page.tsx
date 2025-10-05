'use client'

import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  ListTodo, Sparkles, Clock, Users, CheckCircle,
  AlertCircle, Calendar, TrendingUp, Plus, Filter,
  Star, Target, Zap, Brain, ChevronRight, Pill,
  FileText, Heart, Activity
} from 'lucide-react'

interface SmartTask {
  id: string
  title: string
  description: string
  type: 'medication' | 'activity' | 'documentation' | 'care' | 'handover'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  participantId?: string
  participantName?: string
  dueTime?: string
  estimatedDuration?: number
  aiSuggested: boolean
  aiReason?: string
  completedAt?: Date
  notes?: string
}

interface ParticipantActivity {
  participantId: string
  participantName: string
  recentActivities: string[]
  upcomingNeeds: string[]
  aiInsights: string
}

export default function SmartTasksPage() {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<SmartTask[]>([])
  const [participantActivities, setParticipantActivities] = useState<ParticipantActivity[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('pending')
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [showAISuggestions, setShowAISuggestions] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)

  useEffect(() => {
    loadSmartTasks()
  }, [])

  const loadSmartTasks = async () => {
    setLoading(true)
    try {
      // Mock AI-powered task data
      const mockTasks: SmartTask[] = [
        {
          id: '1',
          title: 'Morning medication round',
          description: 'Administer morning medications for all participants',
          type: 'medication',
          priority: 'high',
          status: 'pending',
          dueTime: '08:00',
          estimatedDuration: 45,
          aiSuggested: true,
          aiReason: 'Based on your shift schedule and medication times'
        },
        {
          id: '2',
          title: 'Check in with James Mitchell',
          description: 'James has been quiet this morning. Quick wellness check recommended.',
          type: 'care',
          priority: 'high',
          status: 'pending',
          participantId: '1',
          participantName: 'James Mitchell',
          dueTime: '09:30',
          estimatedDuration: 15,
          aiSuggested: true,
          aiReason: 'AI detected unusual behavior pattern from activity logs'
        },
        {
          id: '3',
          title: 'Outdoor activity - Sarah Chen',
          description: 'Sarah enjoys morning walks. Weather is perfect today.',
          type: 'activity',
          priority: 'medium',
          status: 'pending',
          participantId: '2',
          participantName: 'Sarah Chen',
          dueTime: '10:00',
          estimatedDuration: 30,
          aiSuggested: true,
          aiReason: 'Based on Sarah\'s preferences and weather conditions'
        },
        {
          id: '4',
          title: 'Complete daily progress notes',
          description: 'Document observations and activities for morning shift',
          type: 'documentation',
          priority: 'medium',
          status: 'pending',
          dueTime: '14:30',
          estimatedDuration: 20,
          aiSuggested: true,
          aiReason: 'Required before shift end at 15:00'
        },
        {
          id: '5',
          title: 'Prepare handover notes',
          description: 'Share key updates with afternoon shift team',
          type: 'handover',
          priority: 'high',
          status: 'pending',
          dueTime: '14:45',
          estimatedDuration: 15,
          aiSuggested: true,
          aiReason: 'Critical for seamless shift transition'
        },
        {
          id: '6',
          title: 'Lunch preparation assistance',
          description: 'Help Michael with meal preparation as per care plan',
          type: 'care',
          priority: 'medium',
          status: 'in_progress',
          participantId: '3',
          participantName: 'Michael Brown',
          dueTime: '12:00',
          estimatedDuration: 30,
          aiSuggested: false
        }
      ]

      const mockActivities: ParticipantActivity[] = [
        {
          participantId: '1',
          participantName: 'James Mitchell',
          recentActivities: ['Breakfast completed', 'Medication taken', 'Watching TV'],
          upcomingNeeds: ['Physiotherapy at 11 AM', 'Lunch at 12:30 PM'],
          aiInsights: 'James has been less engaged than usual. Consider suggesting his favorite music activity.'
        },
        {
          participantId: '2',
          participantName: 'Sarah Chen',
          recentActivities: ['Morning routine completed', 'Breakfast enjoyed'],
          upcomingNeeds: ['Outdoor activity (preferred)', 'Medication at 2 PM'],
          aiInsights: 'Sarah is showing positive mood indicators. Great time for social activities.'
        }
      ]

      setTasks(mockTasks)
      setParticipantActivities(mockActivities)
    } catch (error) {
      console.error('Error loading smart tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'completed', completedAt: new Date() }
        : task
    ))

    toast({
      title: 'Task completed',
      description: 'Great work! Your workflow is being updated.',
      duration: 2000
    })
  }

  const startTask = async (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'in_progress' }
        : task
    ))

    toast({
      title: 'Task started',
      description: 'Timer started. Good luck!',
      duration: 2000
    })
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.status === selectedFilter)
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === selectedPriority)
    }

    if (!showAISuggestions) {
      filtered = filtered.filter(t => !t.aiSuggested)
    }

    return filtered.sort((a, b) => {
      // Sort by priority first
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Then by due time
      if (a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime)
      }

      return 0
    })
  }

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      aiSuggested: tasks.filter(t => t.aiSuggested && t.status !== 'completed').length
    }
  }

  const getPriorityColor = (priority: SmartTask['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getTypeIcon = (type: SmartTask['type']) => {
    switch (type) {
      case 'medication': return Pill
      case 'activity': return Heart
      case 'documentation': return FileText
      case 'care': return Users
      case 'handover': return Activity
    }
  }

  const stats = getTaskStats()
  const filteredTasks = getFilteredTasks()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <ListTodo className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Tasks</h1>
            <p className="text-gray-600">AI-powered daily workflow and task management</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ListTodo className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">AI Suggested</p>
                <p className="text-2xl font-bold text-purple-900">{stats.aiSuggested}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">AI Workflow Optimization</h3>
              <p className="text-sm text-purple-700">
                Your tasks are intelligently prioritized based on participant needs, shift schedules, and care plans.
                {stats.aiSuggested > 0 && ` ${stats.aiSuggested} AI-suggested tasks are optimized for your current shift.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedFilter('all')}
          size="sm"
        >
          All Tasks
        </Button>
        <Button
          variant={selectedFilter === 'pending' ? 'default' : 'outline'}
          onClick={() => setSelectedFilter('pending')}
          size="sm"
        >
          Pending
        </Button>
        <Button
          variant={selectedFilter === 'in_progress' ? 'default' : 'outline'}
          onClick={() => setSelectedFilter('in_progress')}
          size="sm"
        >
          In Progress
        </Button>
        <Button
          variant={selectedFilter === 'completed' ? 'default' : 'outline'}
          onClick={() => setSelectedFilter('completed')}
          size="sm"
        >
          Completed
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button
          variant={selectedPriority === 'high' ? 'destructive' : 'outline'}
          onClick={() => setSelectedPriority(selectedPriority === 'high' ? 'all' : 'high')}
          size="sm"
        >
          High Priority
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button
          variant={showAISuggestions ? 'default' : 'outline'}
          onClick={() => setShowAISuggestions(!showAISuggestions)}
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          AI Suggestions
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">All tasks completed!</h3>
              <p className="text-sm text-gray-600">Great work! You're all caught up.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const TypeIcon = getTypeIcon(task.type)
            return (
              <Card
                key={task.id}
                className={`${task.aiSuggested ? 'border-l-4 border-l-purple-500' : ''} ${task.status === 'completed' ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="mt-1">
                      {task.status === 'completed' ? (
                        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => completeTask(task.id)}
                        />
                      )}
                    </div>

                    {/* Task Icon */}
                    <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>

                    {/* Task Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through' : ''}`}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        </div>

                        <div className="flex gap-2">
                          <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                            {task.priority}
                          </Badge>
                          {task.aiSuggested && (
                            <Badge className="bg-purple-100 text-purple-700">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* AI Reason */}
                      {task.aiSuggested && task.aiReason && (
                        <div className="flex items-start gap-2 mb-3 p-2 bg-purple-50 rounded-lg">
                          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
                          <p className="text-xs text-purple-700">{task.aiReason}</p>
                        </div>
                      )}

                      {/* Task Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        {task.participantName && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {task.participantName}
                          </div>
                        )}
                        {task.dueTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due at {task.dueTime}
                          </div>
                        )}
                        {task.estimatedDuration && (
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {task.estimatedDuration} mins
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {task.status !== 'completed' && (
                        <div className="flex gap-2">
                          {task.status === 'pending' && (
                            <Button size="sm" onClick={() => startTask(task.id)}>
                              <Zap className="h-3 w-3 mr-1" />
                              Start Task
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <>
                              <Button size="sm" variant="default" onClick={() => completeTask(task.id)}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark Complete
                              </Button>
                              <Badge variant="secondary" className="ml-2">
                                <Activity className="h-3 w-3 mr-1" />
                                In Progress
                              </Badge>
                            </>
                          )}
                        </div>
                      )}

                      {task.status === 'completed' && task.completedAt && (
                        <p className="text-xs text-green-600">
                          ✓ Completed at {format(task.completedAt, 'h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Participant Activity Insights */}
      {participantActivities.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Participant Activity Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {participantActivities.map((activity) => (
              <Card key={activity.participantId} className="border-2 border-blue-100">
                <CardHeader>
                  <CardTitle className="text-lg">{activity.participantName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Recent Activities
                    </h4>
                    <ul className="space-y-1">
                      {activity.recentActivities.map((act, idx) => (
                        <li key={idx} className="text-sm text-gray-600 pl-6">• {act}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Upcoming Needs
                    </h4>
                    <ul className="space-y-1">
                      {activity.upcomingNeeds.map((need, idx) => (
                        <li key={idx} className="text-sm text-gray-600 pl-6">• {need}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-purple-900 mb-1">AI Insight</h4>
                        <p className="text-xs text-purple-700">{activity.aiInsights}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
