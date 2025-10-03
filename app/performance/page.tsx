'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { 
  Trophy, TrendingUp, TrendingDown, Clock, Target, Award,
  Users, Star, AlertCircle, CheckCircle2, XCircle,
  Calendar, Filter, Download, ChevronUp, ChevronDown,
  Zap, Shield, FileText, MessageSquare, ChevronRight
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'

// Mock data for performance metrics
const staffPerformance = [
  {
    id: '1',
    name: 'Bernard Adjei',
    role: 'Support Worker',
    facility: 'House 3',
    metrics: {
      responseTime: 5.2,
      reportQuality: 94,
      completionRate: 98,
      trainingProgress: 100,
      incidentRate: 2.1,
      satisfaction: 4.8
    },
    trend: 'up',
    rank: 1
  },
  {
    id: '2',
    name: 'Tom Anderson',
    role: 'Team Leader',
    facility: 'House 3',
    metrics: {
      responseTime: 4.8,
      reportQuality: 96,
      completionRate: 99,
      trainingProgress: 100,
      incidentRate: 1.8,
      satisfaction: 4.9
    },
    trend: 'up',
    rank: 2
  },
  {
    id: '3',
    name: 'Emily Chen',
    role: 'Support Worker',
    facility: 'House 1',
    metrics: {
      responseTime: 6.1,
      reportQuality: 89,
      completionRate: 95,
      trainingProgress: 85,
      incidentRate: 2.5,
      satisfaction: 4.6
    },
    trend: 'stable',
    rank: 5
  },
  {
    id: '4',
    name: 'Mark Williams',
    role: 'Support Worker',
    facility: 'House 2',
    metrics: {
      responseTime: 5.8,
      reportQuality: 91,
      completionRate: 96,
      trainingProgress: 90,
      incidentRate: 2.3,
      satisfaction: 4.7
    },
    trend: 'up',
    rank: 3
  },
  {
    id: '5',
    name: 'Lisa Brown',
    role: 'Nurse',
    facility: 'House 1',
    metrics: {
      responseTime: 4.5,
      reportQuality: 98,
      completionRate: 100,
      trainingProgress: 100,
      incidentRate: 1.2,
      satisfaction: 5.0
    },
    trend: 'up',
    rank: 4
  }
]

const teamPerformance = [
  { month: 'Jan', House1: 88, House2: 85, House3: 92 },
  { month: 'Feb', House1: 90, House2: 87, House3: 93 },
  { month: 'Mar', House1: 89, House2: 89, House3: 94 },
  { month: 'Apr', House1: 91, House2: 90, House3: 95 },
  { month: 'May', House1: 92, House2: 91, House3: 96 },
  { month: 'Jun', House1: 93, House2: 92, House3: 97 }
]

const kpiData = [
  { name: 'Response Time', value: 5.4, target: 5.0, unit: 'min' },
  { name: 'Report Quality', value: 93, target: 90, unit: '%' },
  { name: 'Completion Rate', value: 97, target: 95, unit: '%' },
  { name: 'Training Progress', value: 92, target: 100, unit: '%' },
  { name: 'Satisfaction', value: 4.7, target: 4.5, unit: '/5' }
]

const trainingModules = [
  { name: 'Incident Reporting', completed: 45, total: 50, percentage: 90 },
  { name: 'Medication Management', completed: 48, total: 50, percentage: 96 },
  { name: 'Behavioral Support', completed: 42, total: 50, percentage: 84 },
  { name: 'Emergency Response', completed: 50, total: 50, percentage: 100 },
  { name: 'Communication Skills', completed: 38, total: 50, percentage: 76 }
]

const performanceDistribution = [
  { rating: 'Exceptional', count: 8, percentage: 16 },
  { rating: 'Exceeds', count: 18, percentage: 36 },
  { rating: 'Meets', count: 20, percentage: 40 },
  { rating: 'Needs Improvement', count: 4, percentage: 8 }
]

export default function PerformancePage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const [loading, setLoading] = useState(true)
  const [selectedFacility, setSelectedFacility] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const getPerformanceColor = (value: number, target: number) => {
    const ratio = value / target
    if (ratio >= 1) return 'text-green-600'
    if (ratio >= 0.9) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (trend: string) => {
    switch (trend) {
      case 'up':
        return (
          <Badge className="bg-green-100 text-green-800">
            <TrendingUp className="h-3 w-3 mr-1" />
            Improving
          </Badge>
        )
      case 'down':
        return (
          <Badge className="bg-red-100 text-red-800">
            <TrendingDown className="h-3 w-3 mr-1" />
            Declining
          </Badge>
        )
      default:
        return <Badge variant="secondary">Stable</Badge>
    }
  }

  const RadarChartData = selectedStaff ? [
    { metric: 'Response Time', value: (10 - selectedStaff.metrics.responseTime) * 10 },
    { metric: 'Report Quality', value: selectedStaff.metrics.reportQuality },
    { metric: 'Completion Rate', value: selectedStaff.metrics.completionRate },
    { metric: 'Training', value: selectedStaff.metrics.trainingProgress },
    { metric: 'Satisfaction', value: selectedStaff.metrics.satisfaction * 20 }
  ] : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading performance metrics...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Performance Metrics</h1>
              <p className="text-gray-600 mt-1">Track staff and facility performance indicators</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Facilities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  <SelectItem value="house1">House 1</SelectItem>
                  <SelectItem value="house2">House 2</SelectItem>
                  <SelectItem value="house3">House 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* KPI Overview */}
          <div className="grid gap-4 md:grid-cols-5 mb-8">
            {kpiData.map((kpi, index) => {
              const isAchieved = kpi.unit === 'min' ? kpi.value <= kpi.target : kpi.value >= kpi.target
              return (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{kpi.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className={`text-2xl font-bold ${getPerformanceColor(kpi.value, kpi.target)}`}>
                          {kpi.value}{kpi.unit}
                        </div>
                        <p className="text-sm text-gray-500">Target: {kpi.target}{kpi.unit}</p>
                      </div>
                      {isAchieved ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="individual">Individual Performance</TabsTrigger>
            <TabsTrigger value="teams">Team Comparison</TabsTrigger>
            <TabsTrigger value="training">Training & Development</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Performance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                  <CardDescription>Staff performance rating breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={performanceDistribution}>
                      <RadialBar dataKey="percentage" cornerRadius={10} fill="#8884d8">
                        {performanceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index]} />
                        ))}
                      </RadialBar>
                      <Tooltip />
                      <Legend />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {performanceDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index] }}
                          />
                          <span className="text-sm">{item.rating}</span>
                        </div>
                        <span className="text-sm font-medium">{item.count} staff ({item.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance Trends</CardTitle>
                  <CardDescription>6-month performance comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={teamPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[80, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="House1" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="House2" stroke="#82ca9d" strokeWidth={2} />
                      <Line type="monotone" dataKey="House3" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Top Performers
                </CardTitle>
                <CardDescription>Recognition for outstanding performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffPerformance.slice(0, 3).map((staff, index) => (
                    <motion.div
                      key={staff.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-500' :
                          'text-amber-700'
                        }`}>
                          #{index + 1}
                        </div>
                        <Avatar>
                          <AvatarFallback>
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-gray-500">{staff.role} - {staff.facility}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Overall Score</div>
                          <div className="text-2xl font-bold">{Math.round(
                            (staff.metrics.reportQuality + 
                             staff.metrics.completionRate + 
                             staff.metrics.satisfaction * 20) / 3
                          )}%</div>
                        </div>
                        <Award className={`h-8 w-8 ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-500' :
                          'text-amber-700'
                        }`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual Performance Tab */}
          <TabsContent value="individual" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Staff List */}
              <Card>
                <CardHeader>
                  <CardTitle>Staff Performance</CardTitle>
                  <CardDescription>Click on a staff member to view detailed metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {staffPerformance.map((staff) => (
                      <div
                        key={staff.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedStaff?.id === staff.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedStaff(staff)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {staff.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-sm text-gray-500">{staff.role} - {staff.facility}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getPerformanceBadge(staff.trend)}
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Individual Metrics */}
              {selectedStaff ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedStaff.name}'s Performance</CardTitle>
                    <CardDescription>Detailed performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={RadarChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar name="Performance" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Response Time</span>
                        <span className="text-sm">{selectedStaff.metrics.responseTime} min</span>
                      </div>
                      <Progress value={(10 - selectedStaff.metrics.responseTime) * 10} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Report Quality</span>
                        <span className="text-sm">{selectedStaff.metrics.reportQuality}%</span>
                      </div>
                      <Progress value={selectedStaff.metrics.reportQuality} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Completion Rate</span>
                        <span className="text-sm">{selectedStaff.metrics.completionRate}%</span>
                      </div>
                      <Progress value={selectedStaff.metrics.completionRate} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Training Progress</span>
                        <span className="text-sm">{selectedStaff.metrics.trainingProgress}%</span>
                      </div>
                      <Progress value={selectedStaff.metrics.trainingProgress} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Satisfaction Rating</span>
                        <span className="text-sm">{selectedStaff.metrics.satisfaction}/5</span>
                      </div>
                      <Progress value={selectedStaff.metrics.satisfaction * 20} />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-[500px]">
                    <div className="text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a staff member to view their performance metrics</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Performance Improvement Recommendations */}
            {selectedStaff && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights & Recommendations</CardTitle>
                  <CardDescription>AI-generated suggestions for improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {selectedStaff.metrics.responseTime > 5.5 && (
                      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <Clock className="h-5 w-5 text-yellow-600 mb-2" />
                        <h4 className="font-medium mb-1">Response Time</h4>
                        <p className="text-sm text-gray-600">
                          Consider time management training. Current avg: {selectedStaff.metrics.responseTime}min (Target: 5min)
                        </p>
                      </div>
                    )}
                    {selectedStaff.metrics.trainingProgress < 100 && (
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <Target className="h-5 w-5 text-blue-600 mb-2" />
                        <h4 className="font-medium mb-1">Training Completion</h4>
                        <p className="text-sm text-gray-600">
                          {100 - selectedStaff.metrics.trainingProgress}% of mandatory training pending completion
                        </p>
                      </div>
                    )}
                    {selectedStaff.metrics.reportQuality < 95 && (
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <FileText className="h-5 w-5 text-purple-600 mb-2" />
                        <h4 className="font-medium mb-1">Report Quality</h4>
                        <p className="text-sm text-gray-600">
                          Schedule report writing workshop. Focus on detail and accuracy
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Team Comparison Tab */}
          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Facility Performance Comparison</CardTitle>
                <CardDescription>Key metrics by facility</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={[
                    { facility: 'House 1', responseTime: 5.5, reportQuality: 91, completion: 95, satisfaction: 4.6 },
                    { facility: 'House 2', responseTime: 5.8, reportQuality: 89, completion: 94, satisfaction: 4.5 },
                    { facility: 'House 3', responseTime: 5.0, reportQuality: 95, completion: 98, satisfaction: 4.8 },
                    { facility: 'Community Hub', responseTime: 6.2, reportQuality: 88, completion: 92, satisfaction: 4.4 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="facility" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="responseTime" fill="#8884d8" name="Avg Response (min)" />
                    <Bar dataKey="reportQuality" fill="#82ca9d" name="Report Quality (%)" />
                    <Bar dataKey="completion" fill="#ffc658" name="Completion Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Rankings */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Best Performing Teams</CardTitle>
                  <CardDescription>Top facilities by overall score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'House 3 - Sunshine', score: 97, change: '+3%' },
                      { name: 'House 1 - Riverside', score: 93, change: '+1%' },
                      { name: 'House 2 - Parkview', score: 89, change: '+2%' },
                      { name: 'Community Hub North', score: 86, change: '-1%' }
                    ].map((team, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={`text-lg font-bold ${
                            index === 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{team.name}</div>
                            <div className="text-sm text-gray-500">Overall Score: {team.score}%</div>
                          </div>
                        </div>
                        <Badge variant={team.change.startsWith('+') ? 'default' : 'destructive'}>
                          {team.change}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Areas</CardTitle>
                  <CardDescription>Teams needing additional support</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { facility: 'Community Hub North', issue: 'Response Time', value: '6.2 min', target: '5.0 min' },
                      { facility: 'House 2 - Parkview', issue: 'Report Quality', value: '89%', target: '90%' },
                      { facility: 'House 1 - Riverside', issue: 'Training Completion', value: '85%', target: '100%' }
                    ].map((item, index) => (
                      <div key={index} className="p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{item.facility}</div>
                            <div className="text-sm text-gray-600 mt-1">{item.issue}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-red-600">{item.value}</div>
                            <div className="text-xs text-gray-500">Target: {item.target}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Training & Development Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Training Module Completion</CardTitle>
                  <CardDescription>Organization-wide training progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trainingModules.map((module, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{module.name}</span>
                          <span className="text-sm text-gray-500">
                            {module.completed}/{module.total} staff
                          </span>
                        </div>
                        <Progress value={module.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Training Sessions</CardTitle>
                  <CardDescription>Scheduled development programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { title: 'Advanced Behavioral Support', date: 'Jul 28', enrolled: 12, capacity: 20 },
                      { title: 'Medication Management Refresher', date: 'Aug 2', enrolled: 18, capacity: 20 },
                      { title: 'Emergency Response Training', date: 'Aug 5', enrolled: 15, capacity: 25 },
                      { title: 'Report Writing Excellence', date: 'Aug 10', enrolled: 8, capacity: 15 }
                    ].map((session, index) => (
                      <div key={index} className="p-3 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{session.title}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {session.date}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {session.enrolled}/{session.capacity}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">Enrolled</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skill Development Matrix */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Development Matrix</CardTitle>
                <CardDescription>Core competency levels across the organization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { skill: 'Incident Reporting', beginner: 5, intermediate: 25, advanced: 20 },
                    { skill: 'Behavioral Support', beginner: 8, intermediate: 27, advanced: 15 },
                    { skill: 'Medical Care', beginner: 12, intermediate: 20, advanced: 18 },
                    { skill: 'Communication', beginner: 3, intermediate: 22, advanced: 25 },
                    { skill: 'Emergency Response', beginner: 6, intermediate: 19, advanced: 25 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beginner" stackId="a" fill="#ef4444" />
                    <Bar dataKey="intermediate" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="advanced" stackId="a" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}