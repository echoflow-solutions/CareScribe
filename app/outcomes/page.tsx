'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, Minus, Target, CheckCircle2,
  Clock, Users, Award, BarChart3, Star, Heart,
  Activity, Calendar, FileText, Plus, Filter,
  Search, ArrowRight, Smile, Brain, Dumbbell,
  Home as HomeIcon, Briefcase, MessageCircle, Shield,
  ThumbsUp, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface ParticipantOutcome {
  id: string
  participantId: string
  participantName: string
  age: number
  ndisNumber: string
  planStartDate: string
  planEndDate: string
  overallProgress: number
  goalsTotal: number
  goalsAchieved: number
  goalsOnTrack: number
  goalsAtRisk: number
  wellbeingScore: number
  satisfactionScore: number
  engagementLevel: 'high' | 'medium' | 'low'
  recentMilestone: string
  areasOfStrength: string[]
  areasForDevelopment: string[]
}

interface Goal {
  id: string
  participantId: string
  category: 'social' | 'physical' | 'independence' | 'employment' | 'wellbeing' | 'communication'
  title: string
  description: string
  targetDate: string
  progress: number
  status: 'achieved' | 'on-track' | 'at-risk' | 'not-started'
  ndisCategory: string
  milestones: {
    title: string
    completed: boolean
    date: string
  }[]
  lastUpdate: string
  notes: string
}

interface OutcomeStats {
  totalParticipants: number
  avgProgress: number
  goalsAchievedThisMonth: number
  avgWellbeingScore: number
  highEngagement: number
  mediumEngagement: number
  lowEngagement: number
  trendup: boolean
  trendPercent: number
}

export default function OutcomesPage() {
  const router = useRouter()
  const { currentUser, hasHydrated } = useStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null)

  // Mock data - Outcome Statistics
  const outcomeStats: OutcomeStats = {
    totalParticipants: 65,
    avgProgress: 73.5,
    goalsAchievedThisMonth: 28,
    avgWellbeingScore: 4.2,
    highEngagement: 45,
    mediumEngagement: 15,
    lowEngagement: 5,
    trendup: true,
    trendPercent: 8.3
  }

  // Mock data - Participants with Outcomes
  const participantOutcomes: ParticipantOutcome[] = [
    {
      id: 'p1',
      participantId: 'NDIS001',
      participantName: 'Aisha Patel',
      age: 28,
      ndisNumber: 'NDIS-43287611',
      planStartDate: '2025-01-15',
      planEndDate: '2026-01-14',
      overallProgress: 85,
      goalsTotal: 8,
      goalsAchieved: 5,
      goalsOnTrack: 2,
      goalsAtRisk: 1,
      wellbeingScore: 4.5,
      satisfactionScore: 4.7,
      engagementLevel: 'high',
      recentMilestone: 'Successfully completed independent living skills course',
      areasOfStrength: ['Social interaction', 'Communication', 'Personal hygiene'],
      areasForDevelopment: ['Budgeting', 'Public transport usage']
    },
    {
      id: 'p2',
      participantId: 'NDIS002',
      participantName: 'Benjamin Harris',
      age: 32,
      ndisNumber: 'NDIS-43287612',
      planStartDate: '2024-11-01',
      planEndDate: '2025-10-31',
      overallProgress: 65,
      goalsTotal: 10,
      goalsAchieved: 4,
      goalsOnTrack: 4,
      goalsAtRisk: 2,
      wellbeingScore: 4.0,
      satisfactionScore: 4.2,
      engagementLevel: 'medium',
      recentMilestone: 'Began part-time supported employment position',
      areasOfStrength: ['Work ethic', 'Punctuality', 'Following routines'],
      areasForDevelopment: ['Stress management', 'Workplace social skills']
    },
    {
      id: 'p3',
      participantId: 'NDIS003',
      participantName: 'Charlotte Smith',
      age: 24,
      ndisNumber: 'NDIS-43287613',
      planStartDate: '2025-03-01',
      planEndDate: '2026-02-28',
      overallProgress: 92,
      goalsTotal: 6,
      goalsAchieved: 5,
      goalsOnTrack: 1,
      goalsAtRisk: 0,
      wellbeingScore: 4.8,
      satisfactionScore: 4.9,
      engagementLevel: 'high',
      recentMilestone: 'Achieved independent medication management',
      areasOfStrength: ['Self-advocacy', 'Goal setting', 'Health management'],
      areasForDevelopment: ['Expand social network']
    },
    {
      id: 'p4',
      participantId: 'NDIS004',
      participantName: 'Daniel Kim',
      age: 19,
      ndisNumber: 'NDIS-43287614',
      planStartDate: '2025-02-10',
      planEndDate: '2026-02-09',
      overallProgress: 48,
      goalsTotal: 12,
      goalsAchieved: 2,
      goalsOnTrack: 5,
      goalsAtRisk: 5,
      wellbeingScore: 3.2,
      satisfactionScore: 3.5,
      engagementLevel: 'low',
      recentMilestone: 'Started attending community art class',
      areasOfStrength: ['Creative expression', 'Following instructions'],
      areasForDevelopment: ['Social confidence', 'Daily living skills', 'Emotional regulation']
    },
    {
      id: 'p5',
      participantId: 'NDIS005',
      participantName: 'Emma Wilson',
      age: 30,
      ndisNumber: 'NDIS-43287615',
      planStartDate: '2024-12-01',
      planEndDate: '2025-11-30',
      overallProgress: 78,
      goalsTotal: 9,
      goalsAchieved: 4,
      goalsOnTrack: 4,
      goalsAtRisk: 1,
      wellbeingScore: 4.3,
      satisfactionScore: 4.5,
      engagementLevel: 'high',
      recentMilestone: 'Moved to independent living apartment',
      areasOfStrength: ['Cooking', 'Household management', 'Problem-solving'],
      areasForDevelopment: ['Community participation', 'Building friendships']
    }
  ]

  // Mock data - Goals for selected participant
  const goals: Goal[] = [
    {
      id: 'g1',
      participantId: 'p1',
      category: 'independence',
      title: 'Independent Use of Public Transport',
      description: 'Travel independently on buses and trains to common destinations',
      targetDate: '2025-12-31',
      progress: 75,
      status: 'on-track',
      ndisCategory: 'Core Supports - Daily Activities',
      milestones: [
        { title: 'Complete travel training program', completed: true, date: '2025-06-15' },
        { title: 'Travel with support worker 5 times', completed: true, date: '2025-07-30' },
        { title: 'Travel independently to 3 destinations', completed: true, date: '2025-09-20' },
        { title: 'Achieve full independence for regular routes', completed: false, date: '2025-12-31' }
      ],
      lastUpdate: '2025-10-01',
      notes: 'Excellent progress. Aisha is now confidently traveling to day program and medical appointments independently.'
    },
    {
      id: 'g2',
      participantId: 'p1',
      category: 'social',
      title: 'Develop Friendship Network',
      description: 'Build meaningful friendships and participate in regular social activities',
      targetDate: '2025-11-30',
      progress: 90,
      status: 'on-track',
      ndisCategory: 'Capacity Building - Social & Community Participation',
      milestones: [
        { title: 'Join community group or club', completed: true, date: '2025-03-01' },
        { title: 'Attend group activities weekly', completed: true, date: '2025-05-15' },
        { title: 'Develop 2-3 friendships', completed: true, date: '2025-08-20' },
        { title: 'Initiate social contact independently', completed: false, date: '2025-11-30' }
      ],
      lastUpdate: '2025-09-28',
      notes: 'Aisha has formed strong connections at her book club and regularly organizes coffee meetings.'
    },
    {
      id: 'g3',
      participantId: 'p1',
      category: 'wellbeing',
      title: 'Manage Personal Budget',
      description: 'Independently manage weekly budget and track expenses',
      targetDate: '2026-01-14',
      progress: 45,
      status: 'at-risk',
      ndisCategory: 'Core Supports - Daily Activities',
      milestones: [
        { title: 'Complete financial literacy workshop', completed: true, date: '2025-07-01' },
        { title: 'Use budgeting app with support', completed: true, date: '2025-08-15' },
        { title: 'Track expenses for 3 months', completed: false, date: '2025-11-30' },
        { title: 'Manage budget independently', completed: false, date: '2026-01-14' }
      ],
      lastUpdate: '2025-09-30',
      notes: 'Some difficulty maintaining consistent expense tracking. Additional support scheduled to develop this skill.'
    },
    {
      id: 'g4',
      participantId: 'p1',
      category: 'physical',
      title: 'Maintain Healthy Lifestyle',
      description: 'Engage in regular physical activity and prepare nutritious meals',
      targetDate: '2025-12-31',
      progress: 88,
      status: 'on-track',
      ndisCategory: 'Core Supports - Daily Activities',
      milestones: [
        { title: 'Join gym or exercise program', completed: true, date: '2025-04-01' },
        { title: 'Attend 3x per week for 3 months', completed: true, date: '2025-07-01' },
        { title: 'Learn 10 healthy recipes', completed: true, date: '2025-09-15' },
        { title: 'Maintain routine independently', completed: false, date: '2025-12-31' }
      ],
      lastUpdate: '2025-10-05',
      notes: 'Excellent commitment to health goals. Aisha attends yoga 3x weekly and meal preps on Sundays.'
    }
  ]

  if (!hasHydrated) {
    return null
  }

  if (!currentUser) {
    router.push('/login')
    return null
  }

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'text-green-600 bg-green-50'
      case 'on-track': return 'text-blue-600 bg-blue-50'
      case 'at-risk': return 'text-orange-600 bg-orange-50'
      case 'not-started': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return MessageCircle
      case 'physical': return Dumbbell
      case 'independence': return HomeIcon
      case 'employment': return Briefcase
      case 'wellbeing': return Heart
      case 'communication': return MessageCircle
      default: return Target
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return 'text-blue-600'
      case 'physical': return 'text-green-600'
      case 'independence': return 'text-purple-600'
      case 'employment': return 'text-orange-600'
      case 'wellbeing': return 'text-pink-600'
      case 'communication': return 'text-indigo-600'
      default: return 'text-gray-600'
    }
  }

  const filteredParticipants = participantOutcomes.filter(p =>
    searchQuery === '' ||
    p.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ndisNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedParticipantData = participantOutcomes.find(p => p.id === selectedParticipant)
  const participantGoals = goals.filter(g => g.participantId === selectedParticipant)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Client Outcomes</h1>
              </div>
              <p className="text-teal-100 text-lg">
                Track participant progress and measure goal achievement
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white border-teal-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg Progress</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{outcomeStats.avgProgress}%</p>
                  </div>
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <Target className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  {outcomeStats.trendup ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-700" />
                      <span className="text-green-700 font-medium">+{outcomeStats.trendPercent}% this month</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-700" />
                      <span className="text-red-700 font-medium">-{outcomeStats.trendPercent}% this month</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-cyan-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Goals Achieved</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{outcomeStats.goalsAchievedThisMonth}</p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <Award className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-100">
                    This month
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-emerald-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Wellbeing Score</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{outcomeStats.avgWellbeingScore}/5</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Smile className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-gray-600 font-medium">Average rating</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">High Engagement</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{outcomeStats.highEngagement}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-gray-600 font-medium">of {outcomeStats.totalParticipants} participants</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="participants">By Participant</TabsTrigger>
              <TabsTrigger value="goals">All Goals</TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
              />
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participant Progress Summary</CardTitle>
                <CardDescription>Overview of all participants' goal achievement and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {participantOutcomes.map((participant) => (
                    <Card key={participant.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{participant.participantName}</h3>
                              <Badge className={getEngagementColor(participant.engagementLevel)}>
                                {participant.engagementLevel} engagement
                              </Badge>
                              <Badge variant="outline">{participant.age} years</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{participant.ndisNumber}</p>
                            <p className="text-sm text-gray-600">
                              Plan Period: {format(new Date(participant.planStartDate), 'MMM dd, yyyy')} -{' '}
                              {format(new Date(participant.planEndDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Overall Progress</p>
                            <p className="text-3xl font-bold text-teal-600">{participant.overallProgress}%</p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 transition-all"
                            style={{ width: `${participant.overallProgress}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{participant.goalsAchieved}</p>
                            <p className="text-xs text-gray-600">Achieved</p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{participant.goalsOnTrack}</p>
                            <p className="text-xs text-gray-600">On Track</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-2xl font-bold text-orange-600">{participant.goalsAtRisk}</p>
                            <p className="text-xs text-gray-600">At Risk</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{participant.wellbeingScore}/5</p>
                            <p className="text-xs text-gray-600">Wellbeing</p>
                          </div>
                        </div>

                        <div className="p-4 bg-teal-50 rounded-lg mb-4">
                          <div className="flex items-start gap-2">
                            <Award className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-teal-800">Recent Milestone</p>
                              <p className="text-sm text-gray-700">{participant.recentMilestone}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Areas of Strength</p>
                            <div className="flex flex-wrap gap-1">
                              {participant.areasOfStrength.map((strength, i) => (
                                <Badge key={i} className="bg-green-100 text-green-800 text-xs">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Areas for Development</p>
                            <div className="flex flex-wrap gap-1">
                              {participant.areasForDevelopment.map((area, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setSelectedParticipant(participant.id)
                              setActiveTab('participants')
                            }}
                          >
                            View Details
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Participant Tab */}
          <TabsContent value="participants" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Participant List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Select Participant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filteredParticipants.map((participant) => (
                      <button
                        key={participant.id}
                        onClick={() => setSelectedParticipant(participant.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-colors",
                          selectedParticipant === participant.id
                            ? "bg-teal-50 border-teal-500"
                            : "hover:bg-gray-50 border-gray-200"
                        )}
                      >
                        <p className="font-medium text-sm">{participant.participantName}</p>
                        <p className="text-xs text-gray-500">{participant.overallProgress}% progress</p>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Participant Details */}
              <div className="lg:col-span-3">
                {selectedParticipantData ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{selectedParticipantData.participantName}</CardTitle>
                            <CardDescription className="mt-2">
                              {selectedParticipantData.ndisNumber} • Age {selectedParticipantData.age}
                            </CardDescription>
                          </div>
                          <Badge className={getEngagementColor(selectedParticipantData.engagementLevel)}>
                            {selectedParticipantData.engagementLevel} engagement
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-2xl font-bold text-teal-600">{selectedParticipantData.overallProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="h-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600"
                              style={{ width: `${selectedParticipantData.overallProgress}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xl font-bold text-green-600">{selectedParticipantData.goalsAchieved}</p>
                            <p className="text-xs text-gray-600">Achieved</p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xl font-bold text-blue-600">{selectedParticipantData.goalsOnTrack}</p>
                            <p className="text-xs text-gray-600">On Track</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-xl font-bold text-orange-600">{selectedParticipantData.goalsAtRisk}</p>
                            <p className="text-xs text-gray-600">At Risk</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-xl font-bold text-purple-600">{selectedParticipantData.wellbeingScore}/5</p>
                            <p className="text-xs text-gray-600">Wellbeing</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Goals for Selected Participant */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Goals</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {participantGoals.map((goal) => {
                          const CategoryIcon = getCategoryIcon(goal.category)
                          return (
                            <Card key={goal.id} className="border-l-4 border-l-teal-500">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CategoryIcon className={cn("h-5 w-5", getCategoryColor(goal.category))} />
                                      <h3 className="font-semibold">{goal.title}</h3>
                                      <Badge className={getStatusColor(goal.status)}>
                                        {goal.status}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{goal.description}</p>
                                    <p className="text-xs text-gray-500">NDIS Category: {goal.ndisCategory}</p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Progress</span>
                                    <span className="text-sm font-bold">{goal.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={cn(
                                        "h-2 rounded-full transition-all",
                                        goal.status === 'achieved' && "bg-green-600",
                                        goal.status === 'on-track' && "bg-blue-600",
                                        goal.status === 'at-risk' && "bg-orange-600",
                                        goal.status === 'not-started' && "bg-gray-400"
                                      )}
                                      style={{ width: `${goal.progress}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <p className="text-sm font-medium mb-2">Milestones</p>
                                  <div className="space-y-2">
                                    {goal.milestones.map((milestone, index) => (
                                      <div key={index} className="flex items-center gap-3 text-sm">
                                        {milestone.completed ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />
                                        )}
                                        <span className={milestone.completed ? 'text-gray-400 line-through' : 'text-gray-900'}>
                                          {milestone.title}
                                        </span>
                                        <span className="text-gray-400 text-xs ml-auto">
                                          {format(new Date(milestone.date), 'MMM dd, yyyy')}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm font-medium mb-1">Latest Update</p>
                                  <p className="text-sm text-gray-700">{goal.notes}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Last updated: {format(new Date(goal.lastUpdate), 'MMM dd, yyyy')}
                                  </p>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}</span>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Update Progress
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Select a participant to view their goals and progress</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* All Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Active Goals</CardTitle>
                <CardDescription>Overview of all goals across participants</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Comprehensive goals view coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
