'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { 
  Shield, CheckCircle2, XCircle, AlertTriangle, FileCheck,
  TrendingUp, TrendingDown, Calendar, Clock, Users,
  FileText, Download, Filter, RefreshCw, Info,
  Activity, Target, Award, AlertCircle, ChevronRight
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { motion } from 'framer-motion'

// Mock compliance data
const complianceMetrics = {
  overall: 94,
  documentation: 96,
  training: 92,
  medication: 98,
  incidents: 89,
  policies: 95
}

const complianceHistory = [
  { month: 'Jan', score: 88, target: 95 },
  { month: 'Feb', score: 90, target: 95 },
  { month: 'Mar', score: 91, target: 95 },
  { month: 'Apr', score: 93, target: 95 },
  { month: 'May', score: 94, target: 95 },
  { month: 'Jun', score: 94, target: 95 }
]

const auditItems = [
  {
    id: '1',
    category: 'Documentation',
    item: 'Incident reports filed within 24 hours',
    status: 'compliant',
    score: 98,
    lastChecked: new Date(2024, 5, 20)
  },
  {
    id: '2',
    category: 'Training',
    item: 'Staff certifications up to date',
    status: 'warning',
    score: 85,
    lastChecked: new Date(2024, 5, 18),
    issues: ['5 staff members have expiring certifications']
  },
  {
    id: '3',
    category: 'Medication',
    item: 'MAR sheets completed accurately',
    status: 'compliant',
    score: 99,
    lastChecked: new Date(2024, 5, 21)
  },
  {
    id: '4',
    category: 'Policies',
    item: 'Privacy and confidentiality protocols',
    status: 'compliant',
    score: 100,
    lastChecked: new Date(2024, 5, 15)
  },
  {
    id: '5',
    category: 'Incidents',
    item: 'Behavioral intervention documentation',
    status: 'non-compliant',
    score: 78,
    lastChecked: new Date(2024, 5, 19),
    issues: ['Missing ABC analysis in 22% of reports', 'Incomplete intervention tracking']
  }
]

const upcomingAudits = [
  { name: 'NDIS Quality and Safeguards Review', date: new Date(2024, 6, 15), type: 'External' },
  { name: 'Medication Management Audit', date: new Date(2024, 6, 5), type: 'Internal' },
  { name: 'Staff Training Compliance Check', date: new Date(2024, 6, 10), type: 'Internal' },
  { name: 'Incident Reporting Process Review', date: new Date(2024, 6, 20), type: 'External' }
]

const policyDocuments = [
  { name: 'NDIS Practice Standards', version: '2.1', lastUpdated: new Date(2024, 3, 1), status: 'current' },
  { name: 'Medication Administration Policy', version: '1.5', lastUpdated: new Date(2024, 4, 15), status: 'current' },
  { name: 'Incident Reporting Procedures', version: '3.0', lastUpdated: new Date(2024, 2, 20), status: 'review' },
  { name: 'Staff Training Requirements', version: '2.0', lastUpdated: new Date(2024, 5, 1), status: 'current' }
]

export default function CompliancePage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const [loading, setLoading] = useState(true)
  const [selectedFacility, setSelectedFacility] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<any>(null)
  const [complianceData, setComplianceData] = useState<any>({})

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setComplianceData({
        metrics: complianceMetrics,
        history: complianceHistory,
        audits: auditItems,
        upcoming: upcomingAudits,
        policies: policyDocuments
      })
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'non-compliant':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getComplianceLevel = (score: number) => {
    if (score >= 95) return { label: 'Excellent', color: 'text-green-600' }
    if (score >= 90) return { label: 'Good', color: 'text-blue-600' }
    if (score >= 80) return { label: 'Fair', color: 'text-yellow-600' }
    return { label: 'Needs Improvement', color: 'text-red-600' }
  }

  const pieData = Object.entries(complianceMetrics)
    .filter(([key]) => key !== 'overall')
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }))

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading compliance data...</div>
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
              <h1 className="text-3xl font-bold">Compliance Monitoring</h1>
              <p className="text-gray-600 mt-1">Track NDIS quality standards and regulatory compliance</p>
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

          {/* Overall Compliance Score */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Overall Compliance Score</h2>
                  <p className="text-gray-600 mt-1">Based on NDIS Quality and Safeguards Framework</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-blue-600">{complianceMetrics.overall}%</div>
                  <div className={`text-lg font-medium ${getComplianceLevel(complianceMetrics.overall).color}`}>
                    {getComplianceLevel(complianceMetrics.overall).label}
                  </div>
                </div>
              </div>
              <Progress value={complianceMetrics.overall} className="mt-4 h-3" />
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-6 mb-8">
            {Object.entries(complianceMetrics)
              .filter(([key]) => key !== 'overall')
              .map(([key, value]) => (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm capitalize">{key}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${value >= 95 ? 'text-green-600' : value >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {value}%
                    </div>
                    <Progress value={value} className="mt-2 h-1" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audits">Audit Results</TabsTrigger>
            <TabsTrigger value="policies">Policies & Standards</TabsTrigger>
            <TabsTrigger value="training">Training Compliance</TabsTrigger>
            <TabsTrigger value="actions">Action Items</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Compliance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Trend</CardTitle>
                  <CardDescription>6-month compliance score progression</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={complianceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[80, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Compliance Score"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        name="Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance by Category</CardTitle>
                  <CardDescription>Performance across key areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Critical Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Critical Compliance Issues
                </CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditItems
                    .filter(item => item.status !== 'compliant')
                    .map(item => (
                      <Alert key={item.id} className="border-l-4 border-l-yellow-500">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">{item.item}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {item.category} - Score: {item.score}%
                              </div>
                              {item.issues && (
                                <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                                  {item.issues.map((issue, idx) => (
                                    <li key={idx}>{issue}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Audits */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Audits & Reviews</CardTitle>
                <CardDescription>Scheduled compliance assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAudits.map((audit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          audit.type === 'External' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <FileCheck className={`h-5 w-5 ${
                            audit.type === 'External' ? 'text-purple-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium">{audit.name}</div>
                          <div className="text-sm text-gray-500">
                            {format(audit.date, 'MMMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <Badge variant={audit.type === 'External' ? 'default' : 'secondary'}>
                        {audit.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Results Tab */}
          <TabsContent value="audits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Results</CardTitle>
                <CardDescription>Detailed compliance assessment by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditItems.map(item => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{item.item}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Category: {item.category} • Last checked: {format(item.lastChecked, 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold">{item.score}%</div>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAudit(item)
                              setShowAuditDialog(true)
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      <Progress value={item.score} className="h-2" />
                      {item.issues && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="list-disc list-inside text-sm">
                              {item.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audit History Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Score History</CardTitle>
                <CardDescription>Performance trends by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { category: 'Documentation', Q1: 92, Q2: 94, Q3: 96, Q4: 96 },
                    { category: 'Training', Q1: 88, Q2: 90, Q3: 91, Q4: 92 },
                    { category: 'Medication', Q1: 96, Q2: 97, Q3: 98, Q4: 98 },
                    { category: 'Incidents', Q1: 85, Q2: 87, Q3: 88, Q4: 89 },
                    { category: 'Policies', Q1: 93, Q2: 94, Q3: 95, Q4: 95 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Q1" fill="#e0e7ff" />
                    <Bar dataKey="Q2" fill="#c7d2fe" />
                    <Bar dataKey="Q3" fill="#a5b4fc" />
                    <Bar dataKey="Q4" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies & Standards Tab */}
          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Documents</CardTitle>
                <CardDescription>Current policies and compliance standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policyDocuments.map((policy, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{policy.name}</div>
                          <div className="text-sm text-gray-500">
                            Version {policy.version} • Updated {format(policy.lastUpdated, 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={policy.status === 'current' ? 'default' : 'secondary'}>
                          {policy.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* NDIS Standards Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>NDIS Practice Standards Compliance</CardTitle>
                <CardDescription>Core module requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { module: 'Rights and Responsibilities', compliance: 98 },
                    { module: 'Governance and Operational Management', compliance: 95 },
                    { module: 'Provision of Supports', compliance: 96 },
                    { module: 'Support Provision Environment', compliance: 94 }
                  ].map((standard, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{standard.module}</span>
                        <span className="text-sm font-bold">{standard.compliance}%</span>
                      </div>
                      <Progress value={standard.compliance} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Compliance Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Training Completion Status</CardTitle>
                  <CardDescription>Staff compliance with mandatory training</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { training: 'NDIS Worker Orientation', completed: 48, total: 50 },
                      { training: 'Medication Management', completed: 45, total: 50 },
                      { training: 'Manual Handling', completed: 47, total: 50 },
                      { training: 'First Aid & CPR', completed: 44, total: 50 },
                      { training: 'Positive Behavior Support', completed: 42, total: 50 }
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{item.training}</span>
                          <span className="text-sm text-gray-500">
                            {item.completed}/{item.total} staff
                          </span>
                        </div>
                        <Progress value={(item.completed / item.total) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certification Expiry Alerts</CardTitle>
                  <CardDescription>Upcoming certification renewals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { staff: 'Bernard Adjei', cert: 'First Aid', expires: 15 },
                      { staff: 'Tom Anderson', cert: 'Medication Admin', expires: 22 },
                      { staff: 'Emily Chen', cert: 'Manual Handling', expires: 30 },
                      { staff: 'Mark Williams', cert: 'CPR', expires: 45 },
                      { staff: 'Lisa Brown', cert: 'NDIS Orientation', expires: 60 }
                    ].map((alert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">{alert.staff}</div>
                          <div className="text-sm text-gray-500">{alert.cert}</div>
                        </div>
                        <Badge 
                          variant={alert.expires <= 30 ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          Expires in {alert.expires} days
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Training Compliance by Facility */}
            <Card>
              <CardHeader>
                <CardTitle>Training Compliance by Facility</CardTitle>
                <CardDescription>Percentage of staff with up-to-date training</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { facility: 'House 1', compliance: 92 },
                    { facility: 'House 2', compliance: 88 },
                    { facility: 'House 3', compliance: 95 },
                    { facility: 'Community Hub', compliance: 90 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="facility" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Bar dataKey="compliance" fill="#3b82f6">
                      {[92, 88, 95, 90].map((value, index) => (
                        <Cell key={`cell-${index}`} fill={value >= 95 ? '#10b981' : value >= 90 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Items Tab */}
          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Action Plan</CardTitle>
                <CardDescription>Prioritized tasks to improve compliance scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      priority: 'high',
                      task: 'Complete ABC analysis for all behavioral incidents',
                      category: 'Documentation',
                      dueDate: new Date(2024, 6, 1),
                      assigned: 'Team Leaders',
                      status: 'in-progress'
                    },
                    {
                      priority: 'high',
                      task: 'Update 5 expiring staff certifications',
                      category: 'Training',
                      dueDate: new Date(2024, 6, 15),
                      assigned: 'HR Team',
                      status: 'pending'
                    },
                    {
                      priority: 'medium',
                      task: 'Review and update incident reporting procedures',
                      category: 'Policies',
                      dueDate: new Date(2024, 6, 30),
                      assigned: 'Quality Team',
                      status: 'pending'
                    },
                    {
                      priority: 'medium',
                      task: 'Conduct internal medication audit',
                      category: 'Medication',
                      dueDate: new Date(2024, 6, 5),
                      assigned: 'Nursing Staff',
                      status: 'scheduled'
                    }
                  ].map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox />
                          <div>
                            <div className="font-medium">{action.task}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {action.category} • Due {format(action.dueDate, 'MMM d, yyyy')} • Assigned to {action.assigned}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={action.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {action.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {action.status}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Improvement Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Recommendations</CardTitle>
                <CardDescription>Suggested improvements based on compliance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      icon: FileText,
                      title: 'Implement automated incident report reminders',
                      description: 'Reduce late reporting by 40% with automated notifications',
                      impact: 'High'
                    },
                    {
                      icon: Users,
                      title: 'Schedule monthly compliance training sessions',
                      description: 'Proactive training to maintain certification currency',
                      impact: 'Medium'
                    },
                    {
                      icon: Activity,
                      title: 'Deploy real-time compliance dashboard',
                      description: 'Enable facility managers to track compliance metrics daily',
                      impact: 'High'
                    },
                    {
                      icon: Shield,
                      title: 'Establish peer review process for documentation',
                      description: 'Improve documentation quality through collaborative review',
                      impact: 'Medium'
                    }
                  ].map((recommendation, index) => {
                    const Icon = recommendation.icon
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{recommendation.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{recommendation.description}</div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {recommendation.impact} Impact
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Audit Detail Dialog */}
        <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
          <DialogContent className="max-w-2xl">
            {selectedAudit && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedAudit.item}</DialogTitle>
                  <DialogDescription>
                    Detailed audit findings and corrective actions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm text-gray-500">Category</Label>
                      <p className="font-medium">{selectedAudit.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Last Audited</Label>
                      <p className="font-medium">{format(selectedAudit.lastChecked, 'MMMM d, yyyy')}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Compliance Score</Label>
                      <p className="font-medium">{selectedAudit.score}%</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Status</Label>
                      <Badge className={getStatusColor(selectedAudit.status)}>
                        {selectedAudit.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedAudit.issues && (
                    <div>
                      <Label className="text-sm text-gray-500">Identified Issues</Label>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {selectedAudit.issues.map((issue: string, idx: number) => (
                          <li key={idx} className="text-sm">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm text-gray-500">Corrective Actions</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">Implement additional staff training on documentation requirements</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm">Review and update standard operating procedures</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm">Schedule follow-up audit in 30 days</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAuditDialog(false)}>
                    Close
                  </Button>
                  <Button>
                    Create Action Plan
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}