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
  AlertCircle, Clock, Users, FileCheck, GraduationCap,
  ThumbsUp, Activity, BarChart3, FileText, Calendar,
  Award, Shield, Star, ArrowRight, Plus
} from 'lucide-react'
import { format } from 'date-fns'

interface QualityMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
}

interface QualityInitiative {
  id: string
  title: string
  description: string
  owner: string
  startDate: string
  targetDate: string
  status: 'completed' | 'on-track' | 'at-risk' | 'delayed'
  progress: number
  priority: 'high' | 'medium' | 'low'
  category: string
  milestones: {
    title: string
    completed: boolean
    dueDate: string
  }[]
}

interface AuditFinding {
  id: string
  date: string
  auditor: string
  area: string
  finding: string
  severity: 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'resolved'
  correctiveAction: string
  dueDate: string
  assignedTo: string
}

interface TrainingCompliance {
  id: string
  course: string
  required: number
  completed: number
  expiring: number
  expired: number
  compliance: number
}

interface ClientSatisfaction {
  id: string
  month: string
  overall: number
  communication: number
  care_quality: number
  responsiveness: number
  environment: number
  staff: number
  responses: number
}

export default function QualityImprovementPage() {
  const router = useRouter()
  const { currentUser, hasHydrated } = useStore()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - Quality Metrics
  const qualityMetrics: QualityMetric[] = [
    {
      id: '1',
      name: 'Client Satisfaction',
      value: 4.6,
      target: 4.5,
      unit: '/5',
      trend: 'up',
      trendPercent: 5.2,
      status: 'excellent'
    },
    {
      id: '2',
      name: 'Incident Rate',
      value: 2.1,
      target: 3.0,
      unit: 'per 1000',
      trend: 'down',
      trendPercent: 12.5,
      status: 'excellent'
    },
    {
      id: '3',
      name: 'Staff Training Compliance',
      value: 94,
      target: 95,
      unit: '%',
      trend: 'up',
      trendPercent: 2.1,
      status: 'good'
    },
    {
      id: '4',
      name: 'Audit Compliance',
      value: 97,
      target: 98,
      unit: '%',
      trend: 'stable',
      trendPercent: 0,
      status: 'good'
    },
    {
      id: '5',
      name: 'Documentation Timeliness',
      value: 88,
      target: 90,
      unit: '%',
      trend: 'down',
      trendPercent: 3.5,
      status: 'warning'
    },
    {
      id: '6',
      name: 'Medication Error Rate',
      value: 0.8,
      target: 1.0,
      unit: 'per 1000',
      trend: 'down',
      trendPercent: 20.0,
      status: 'excellent'
    }
  ]

  // Mock data - Quality Initiatives
  const qualityInitiatives: QualityInitiative[] = [
    {
      id: '1',
      title: 'Digital Documentation Transformation',
      description: 'Migrate all paper-based processes to digital platform',
      owner: 'Sarah Johnson',
      startDate: '2025-08-01',
      targetDate: '2025-12-31',
      status: 'on-track',
      progress: 65,
      priority: 'high',
      category: 'Process Improvement',
      milestones: [
        { title: 'System selection', completed: true, dueDate: '2025-08-15' },
        { title: 'Staff training', completed: true, dueDate: '2025-09-30' },
        { title: 'Pilot rollout', completed: true, dueDate: '2025-10-15' },
        { title: 'Full deployment', completed: false, dueDate: '2025-11-30' },
        { title: 'Process optimization', completed: false, dueDate: '2025-12-31' }
      ]
    },
    {
      id: '2',
      title: 'Medication Management Enhancement',
      description: 'Implement barcode scanning and automated error detection',
      owner: 'Dr. Michael Chen',
      startDate: '2025-09-01',
      targetDate: '2026-01-31',
      status: 'on-track',
      progress: 45,
      priority: 'high',
      category: 'Safety',
      milestones: [
        { title: 'Requirements gathering', completed: true, dueDate: '2025-09-15' },
        { title: 'System procurement', completed: true, dueDate: '2025-10-01' },
        { title: 'Staff training', completed: false, dueDate: '2025-11-15' },
        { title: 'Pilot implementation', completed: false, dueDate: '2025-12-15' },
        { title: 'Full rollout', completed: false, dueDate: '2026-01-31' }
      ]
    },
    {
      id: '3',
      title: 'Client Feedback System',
      description: 'Develop real-time feedback collection and response system',
      owner: 'Emma Wilson',
      startDate: '2025-07-01',
      targetDate: '2025-10-31',
      status: 'completed',
      progress: 100,
      priority: 'medium',
      category: 'Client Experience',
      milestones: [
        { title: 'Design feedback forms', completed: true, dueDate: '2025-07-15' },
        { title: 'Develop mobile app', completed: true, dueDate: '2025-08-31' },
        { title: 'Train staff', completed: true, dueDate: '2025-09-15' },
        { title: 'Launch system', completed: true, dueDate: '2025-10-01' },
        { title: 'Review results', completed: true, dueDate: '2025-10-31' }
      ]
    },
    {
      id: '4',
      title: 'Staff Wellness Program',
      description: 'Implement comprehensive staff wellbeing and support initiative',
      owner: 'Lisa Park',
      startDate: '2025-09-15',
      targetDate: '2026-03-31',
      status: 'at-risk',
      progress: 25,
      priority: 'medium',
      category: 'Staff Development',
      milestones: [
        { title: 'Needs assessment', completed: true, dueDate: '2025-09-30' },
        { title: 'Program design', completed: false, dueDate: '2025-10-31' },
        { title: 'Resource allocation', completed: false, dueDate: '2025-11-30' },
        { title: 'Pilot program', completed: false, dueDate: '2026-01-31' },
        { title: 'Full implementation', completed: false, dueDate: '2026-03-31' }
      ]
    },
    {
      id: '5',
      title: 'NDIS Compliance Audit Preparation',
      description: 'Comprehensive review and preparation for NDIS quality audit',
      owner: 'James Brown',
      startDate: '2025-10-01',
      targetDate: '2025-12-15',
      status: 'delayed',
      progress: 30,
      priority: 'high',
      category: 'Compliance',
      milestones: [
        { title: 'Gap analysis', completed: true, dueDate: '2025-10-15' },
        { title: 'Documentation review', completed: false, dueDate: '2025-10-31' },
        { title: 'Corrective actions', completed: false, dueDate: '2025-11-15' },
        { title: 'Mock audit', completed: false, dueDate: '2025-11-30' },
        { title: 'Final preparation', completed: false, dueDate: '2025-12-15' }
      ]
    }
  ]

  // Mock data - Audit Findings
  const auditFindings: AuditFinding[] = [
    {
      id: '1',
      date: '2025-09-28',
      auditor: 'External QA Team',
      area: 'Medication Management',
      finding: 'Documentation timestamps not consistently recorded for PRN medications',
      severity: 'medium',
      status: 'in-progress',
      correctiveAction: 'Implement mandatory timestamp fields in medication tracking system',
      dueDate: '2025-10-31',
      assignedTo: 'Dr. Michael Chen'
    },
    {
      id: '2',
      date: '2025-09-25',
      auditor: 'Internal Compliance',
      area: 'Staff Training',
      finding: '3 staff members overdue for annual first aid certification renewal',
      severity: 'high',
      status: 'in-progress',
      correctiveAction: 'Schedule immediate training sessions and implement automated expiry alerts',
      dueDate: '2025-10-15',
      assignedTo: 'HR Department'
    },
    {
      id: '3',
      date: '2025-09-20',
      auditor: 'NDIS Quality Team',
      area: 'Client Files',
      finding: 'Support plans require more specific measurable goals',
      severity: 'medium',
      status: 'open',
      correctiveAction: 'Review and update all support plans with SMART goal framework',
      dueDate: '2025-11-30',
      assignedTo: 'Clinical Team'
    },
    {
      id: '4',
      date: '2025-09-15',
      auditor: 'Internal Compliance',
      area: 'Incident Reporting',
      finding: 'Incident report response times averaging 36 hours, exceeding 24-hour policy',
      severity: 'medium',
      status: 'resolved',
      correctiveAction: 'Implemented on-call manager system for after-hours incident response',
      dueDate: '2025-09-30',
      assignedTo: 'Management Team'
    },
    {
      id: '5',
      date: '2025-09-10',
      auditor: 'External QA Team',
      area: 'Environment Safety',
      finding: 'Fire extinguisher inspection log missing for August',
      severity: 'low',
      status: 'resolved',
      correctiveAction: 'Completed missing inspection and set up monthly reminder system',
      dueDate: '2025-09-15',
      assignedTo: 'Facilities Manager'
    },
    {
      id: '6',
      date: '2025-08-30',
      auditor: 'Internal Compliance',
      area: 'Data Security',
      finding: 'Password policy not enforced on 2 legacy systems',
      severity: 'high',
      status: 'resolved',
      correctiveAction: 'Updated all systems to enforce 90-day password rotation',
      dueDate: '2025-09-15',
      assignedTo: 'IT Department'
    }
  ]

  // Mock data - Training Compliance
  const trainingCompliance: TrainingCompliance[] = [
    { id: '1', course: 'First Aid & CPR', required: 45, completed: 42, expiring: 3, expired: 0, compliance: 93.3 },
    { id: '2', course: 'Manual Handling', required: 45, completed: 44, expiring: 1, expired: 0, compliance: 97.8 },
    { id: '3', course: 'Medication Administration', required: 38, completed: 36, expiring: 1, expired: 1, compliance: 94.7 },
    { id: '4', course: 'Fire Safety', required: 45, completed: 43, expiring: 2, expired: 0, compliance: 95.6 },
    { id: '5', course: 'Infection Control', required: 45, completed: 45, expiring: 0, expired: 0, compliance: 100 },
    { id: '6', course: 'Restrictive Practices', required: 32, completed: 29, expiring: 2, expired: 1, compliance: 90.6 },
    { id: '7', course: 'NDIS Code of Conduct', required: 45, completed: 44, expiring: 1, expired: 0, compliance: 97.8 },
    { id: '8', course: 'Privacy & Confidentiality', required: 45, completed: 43, expiring: 2, expired: 0, compliance: 95.6 }
  ]

  // Mock data - Client Satisfaction
  const clientSatisfaction: ClientSatisfaction[] = [
    {
      id: '1',
      month: '2025-09',
      overall: 4.6,
      communication: 4.7,
      care_quality: 4.8,
      responsiveness: 4.5,
      environment: 4.4,
      staff: 4.7,
      responses: 28
    },
    {
      id: '2',
      month: '2025-08',
      overall: 4.5,
      communication: 4.6,
      care_quality: 4.7,
      responsiveness: 4.4,
      environment: 4.3,
      staff: 4.6,
      responses: 31
    },
    {
      id: '3',
      month: '2025-07',
      overall: 4.3,
      communication: 4.4,
      care_quality: 4.6,
      responsiveness: 4.2,
      environment: 4.1,
      staff: 4.5,
      responses: 27
    }
  ]

  if (!hasHydrated) {
    return null
  }

  if (!currentUser) {
    router.push('/login')
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      case 'completed': return 'text-green-600 bg-green-50'
      case 'on-track': return 'text-blue-600 bg-blue-50'
      case 'at-risk': return 'text-yellow-600 bg-yellow-50'
      case 'delayed': return 'text-red-600 bg-red-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'open': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-blue-500'
      default: return 'border-l-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                  <Target className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Quality Improvement</h1>
              </div>
              <p className="text-purple-100 text-lg">
                Continuous improvement tracking and quality metrics
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Initiative
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Initiatives</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">5</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    1 at risk
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Open Findings</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">3</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    2 high priority
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Training Compliance</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">94%</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-green-700 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>+2.1% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Client Satisfaction</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">4.6/5</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ThumbsUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-green-700 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5.2% this month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
            <TabsTrigger value="audits">Audits</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
                <CardDescription>
                  Track critical quality metrics against targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {qualityMetrics.map((metric) => (
                    <div key={metric.id} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{metric.name}</p>
                          <p className="text-2xl font-bold mt-1">
                            {metric.value}{metric.unit}
                          </p>
                          <p className="text-sm text-gray-500">
                            Target: {metric.target}{metric.unit}
                          </p>
                        </div>
                        <Badge className={getStatusColor(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {metric.trend === 'up' && (
                          <>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">+{metric.trendPercent}%</span>
                          </>
                        )}
                        {metric.trend === 'down' && (
                          <>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">-{metric.trendPercent}%</span>
                          </>
                        )}
                        {metric.trend === 'stable' && (
                          <>
                            <Minus className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-600">No change</span>
                          </>
                        )}
                        <span className="text-gray-500">vs last month</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all",
                            metric.status === 'excellent' && "bg-green-600",
                            metric.status === 'good' && "bg-blue-600",
                            metric.status === 'warning' && "bg-yellow-600",
                            metric.status === 'critical' && "bg-red-600"
                          )}
                          style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Client Feedback System Launched</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Successfully implemented real-time feedback collection across all locations
                      </p>
                      <p className="text-xs text-gray-500 mt-2">October 1, 2025</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Zero Medication Errors This Month</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Achieved perfect medication administration record for September 2025
                      </p>
                      <p className="text-xs text-gray-500 mt-2">September 30, 2025</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">100% Infection Control Training</p>
                      <p className="text-sm text-gray-600 mt-1">
                        All staff completed updated infection control protocols training
                      </p>
                      <p className="text-xs text-gray-500 mt-2">September 28, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Action Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">First Aid Certifications Overdue</p>
                        <Badge variant="destructive" className="text-xs">High</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        3 staff members require immediate certification renewal
                      </p>
                      <p className="text-xs text-red-600 mt-2">Due: October 15, 2025</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">NDIS Audit Preparation Delayed</p>
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Documentation review milestone behind schedule by 1 week
                      </p>
                      <p className="text-xs text-yellow-600 mt-2">Due: October 31, 2025</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Support Plan Goals Need Update</p>
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Review and update client support plans with SMART goals framework
                      </p>
                      <p className="text-xs text-yellow-600 mt-2">Due: November 30, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Initiatives Tab */}
          <TabsContent value="initiatives" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quality Improvement Initiatives
                </CardTitle>
                <CardDescription>
                  Track progress on strategic quality improvement projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualityInitiatives.map((initiative) => (
                  <Card key={initiative.id} className={cn("border-l-4", getPriorityColor(initiative.priority))}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{initiative.title}</h3>
                            <Badge className={getStatusColor(initiative.status)}>
                              {initiative.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {initiative.category}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{initiative.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Owner:</span>
                          <span className="font-medium">{initiative.owner}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Start:</span>
                          <span className="font-medium">{format(new Date(initiative.startDate), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Target:</span>
                          <span className="font-medium">{format(new Date(initiative.targetDate), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-bold">{initiative.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all",
                              initiative.status === 'completed' && "bg-green-600",
                              initiative.status === 'on-track' && "bg-blue-600",
                              initiative.status === 'at-risk' && "bg-yellow-600",
                              initiative.status === 'delayed' && "bg-red-600"
                            )}
                            style={{ width: `${initiative.progress}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Milestones</p>
                        <div className="space-y-2">
                          {initiative.milestones.map((milestone, index) => (
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
                                {format(new Date(milestone.dueDate), 'MMM dd')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button variant="outline" size="sm" className="gap-2">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audits Tab */}
          <TabsContent value="audits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Audit Findings & Corrective Actions
                </CardTitle>
                <CardDescription>
                  Track audit findings and monitor corrective action progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditFindings.map((finding) => (
                    <Card key={finding.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSeverityColor(finding.severity)}>
                                {finding.severity} severity
                              </Badge>
                              <Badge className={getStatusColor(finding.status)}>
                                {finding.status}
                              </Badge>
                            </div>
                            <p className="font-medium text-lg mb-1">{finding.area}</p>
                            <p className="text-gray-600">{finding.finding}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Audit Date:</span>
                            <p className="font-medium">{format(new Date(finding.date), 'MMM dd, yyyy')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Auditor:</span>
                            <p className="font-medium">{finding.auditor}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Due Date:</span>
                            <p className="font-medium">{format(new Date(finding.dueDate), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg mb-3">
                          <p className="text-sm font-medium mb-1">Corrective Action</p>
                          <p className="text-sm text-gray-700">{finding.correctiveAction}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Assigned to:</span>
                            <span className="font-medium">{finding.assignedTo}</span>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            Update Status
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Staff Training Compliance
                </CardTitle>
                <CardDescription>
                  Monitor mandatory training completion and certifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingCompliance.map((course) => (
                    <div key={course.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-lg">{course.course}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Required: {course.required}</span>
                            <span>•</span>
                            <span className="text-green-600">Completed: {course.completed}</span>
                            <span>•</span>
                            <span className="text-yellow-600">Expiring: {course.expiring}</span>
                            {course.expired > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-red-600">Expired: {course.expired}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-2xl font-bold",
                            course.compliance >= 95 && "text-green-600",
                            course.compliance >= 90 && course.compliance < 95 && "text-yellow-600",
                            course.compliance < 90 && "text-red-600"
                          )}>
                            {course.compliance.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">Compliance</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={cn(
                            "h-3 rounded-full transition-all",
                            course.compliance >= 95 && "bg-green-600",
                            course.compliance >= 90 && course.compliance < 95 && "bg-yellow-600",
                            course.compliance < 90 && "bg-red-600"
                          )}
                          style={{ width: `${course.compliance}%` }}
                        />
                      </div>

                      {(course.expiring > 0 || course.expired > 0) && (
                        <div className="mt-3 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-600">
                            Action required: {course.expiring + course.expired} staff need attention
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Satisfaction Tab */}
          <TabsContent value="satisfaction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Client Satisfaction Scores
                </CardTitle>
                <CardDescription>
                  Track client feedback and satisfaction trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {clientSatisfaction.map((month) => (
                    <div key={month.id} className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-lg font-semibold">
                            {format(new Date(month.month + '-01'), 'MMMM yyyy')}
                          </p>
                          <p className="text-sm text-gray-500">{month.responses} responses</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-purple-600">{month.overall}/5</p>
                          <p className="text-sm text-gray-500">Overall Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Communication</span>
                            <span className="text-sm font-bold">{month.communication}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-purple-600 transition-all"
                              style={{ width: `${(month.communication / 5) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Care Quality</span>
                            <span className="text-sm font-bold">{month.care_quality}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-purple-600 transition-all"
                              style={{ width: `${(month.care_quality / 5) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Responsiveness</span>
                            <span className="text-sm font-bold">{month.responsiveness}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-purple-600 transition-all"
                              style={{ width: `${(month.responsiveness / 5) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Environment</span>
                            <span className="text-sm font-bold">{month.environment}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-purple-600 transition-all"
                              style={{ width: `${(month.environment / 5) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Staff Performance</span>
                            <span className="text-sm font-bold">{month.staff}/5</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-purple-600 transition-all"
                              style={{ width: `${(month.staff / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
