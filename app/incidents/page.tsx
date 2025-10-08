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
  AlertTriangle, TrendingDown, TrendingUp, Clock,
  Users, Shield, FileText, Plus, Filter, Search,
  CheckCircle2, XCircle, AlertCircle, Calendar,
  MapPin, User, PhoneCall, FileWarning, Eye,
  ArrowRight, BarChart3, Activity, Thermometer
} from 'lucide-react'
import { format } from 'date-fns'

interface Incident {
  id: string
  incidentNumber: string
  dateTime: string
  reportedBy: string
  reportedAt: string
  category: 'injury' | 'medication' | 'behavioral' | 'environmental' | 'other'
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'reported' | 'investigating' | 'action-required' | 'resolved' | 'closed'
  participant: {
    id: string
    name: string
  }
  location: string
  description: string
  immediateAction: string
  witnesses: string[]
  familyNotified: boolean
  ndisNotified: boolean
  policeCalled: boolean
  ambulanceCalled: boolean
  assignedTo: string | null
  dueDate: string | null
  resolutionNotes: string | null
  preventiveMeasures: string | null
}

interface IncidentStats {
  total: number
  open: number
  resolved: number
  critical: number
  thisMonth: number
  lastMonth: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
}

interface CategoryBreakdown {
  category: string
  count: number
  percentage: number
  severity: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export default function IncidentsPage() {
  const router = useRouter()
  const { currentUser, hasHydrated } = useStore()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data - Incident Statistics
  const incidentStats: IncidentStats = {
    total: 47,
    open: 8,
    resolved: 39,
    critical: 2,
    thisMonth: 12,
    lastMonth: 15,
    trend: 'down',
    trendPercent: 20.0
  }

  // Mock data - Category Breakdown
  const categoryBreakdown: CategoryBreakdown[] = [
    {
      category: 'Behavioral',
      count: 18,
      percentage: 38.3,
      severity: { critical: 1, high: 4, medium: 8, low: 5 }
    },
    {
      category: 'Injury',
      count: 12,
      percentage: 25.5,
      severity: { critical: 1, high: 3, medium: 5, low: 3 }
    },
    {
      category: 'Medication',
      count: 8,
      percentage: 17.0,
      severity: { critical: 0, high: 2, medium: 4, low: 2 }
    },
    {
      category: 'Environmental',
      count: 6,
      percentage: 12.8,
      severity: { critical: 0, high: 1, medium: 2, low: 3 }
    },
    {
      category: 'Other',
      count: 3,
      percentage: 6.4,
      severity: { critical: 0, high: 0, medium: 2, low: 1 }
    }
  ]

  // Mock data - Incidents
  const incidents: Incident[] = [
    {
      id: '1',
      incidentNumber: 'INC-2025-047',
      dateTime: '2025-10-08T14:30:00',
      reportedBy: 'Sarah Johnson',
      reportedAt: '2025-10-08T14:45:00',
      category: 'behavioral',
      severity: 'high',
      status: 'investigating',
      participant: { id: 'p1', name: 'Aisha Patel' },
      location: 'Day Program - Activity Room',
      description: 'Participant became agitated during group activity and threw a chair, narrowly missing another participant. No injuries occurred.',
      immediateAction: 'Participant removed to quiet room for de-escalation. Activity room cleared. All participants checked for safety.',
      witnesses: ['Michael Chen', 'Emma Wilson'],
      familyNotified: true,
      ndisNotified: false,
      policeCalled: false,
      ambulanceCalled: false,
      assignedTo: 'Dr. Michael Chen',
      dueDate: '2025-10-15',
      resolutionNotes: null,
      preventiveMeasures: null
    },
    {
      id: '2',
      incidentNumber: 'INC-2025-046',
      dateTime: '2025-10-07T09:15:00',
      reportedBy: 'James Brown',
      reportedAt: '2025-10-07T09:30:00',
      category: 'injury',
      severity: 'medium',
      status: 'action-required',
      participant: { id: 'p2', name: 'Benjamin Harris' },
      location: 'Residential - Kitchen',
      description: 'Participant sustained minor burn to left hand while assisting with breakfast preparation. Burn approximately 2cm diameter on palm.',
      immediateAction: 'First aid administered immediately - cold running water for 20 minutes, burn gel applied, sterile dressing. Participant comfortable.',
      witnesses: ['Lisa Park'],
      familyNotified: true,
      ndisNotified: false,
      policeCalled: false,
      ambulanceCalled: false,
      assignedTo: 'Sarah Johnson',
      dueDate: '2025-10-10',
      resolutionNotes: null,
      preventiveMeasures: null
    },
    {
      id: '3',
      incidentNumber: 'INC-2025-045',
      dateTime: '2025-10-06T16:45:00',
      reportedBy: 'Emma Wilson',
      reportedAt: '2025-10-06T17:00:00',
      category: 'medication',
      severity: 'critical',
      status: 'resolved',
      participant: { id: 'p3', name: 'Charlotte Smith' },
      location: 'Residential - Main Building',
      description: 'Participant administered incorrect dosage of epilepsy medication - received 200mg instead of prescribed 100mg due to medication chart reading error.',
      immediateAction: 'Contacted on-call GP immediately. Participant monitored closely for adverse effects. Vitals checked every 15 minutes. GP advised observation protocol.',
      witnesses: ['David Lee'],
      familyNotified: true,
      ndisNotified: true,
      policeCalled: false,
      ambulanceCalled: false,
      assignedTo: 'Dr. Michael Chen',
      dueDate: '2025-10-07',
      resolutionNotes: 'Participant showed no adverse effects. GP reviewed and confirmed no further action required. Medication chart system updated with visual dosage indicators.',
      preventiveMeasures: 'Implemented double-check protocol for all epilepsy medications. Updated medication charts with color-coded dosage sections. Scheduled refresher training for all staff on medication administration.'
    },
    {
      id: '4',
      incidentNumber: 'INC-2025-044',
      dateTime: '2025-10-05T11:20:00',
      reportedBy: 'Michael Chen',
      reportedAt: '2025-10-05T11:35:00',
      category: 'environmental',
      severity: 'low',
      status: 'closed',
      participant: { id: 'p4', name: 'Daniel Kim' },
      location: 'Day Program - Garden Area',
      description: 'Participant tripped on uneven paving stone in garden area. No injury sustained but potential hazard identified.',
      immediateAction: 'Area cordoned off with safety cones. Participant checked for injuries - none found. Maintenance team notified.',
      witnesses: ['Sarah Johnson'],
      familyNotified: false,
      ndisNotified: false,
      policeCalled: false,
      ambulanceCalled: false,
      assignedTo: 'Facilities Manager',
      dueDate: '2025-10-06',
      resolutionNotes: 'Paving stone repaired same day. Area inspected and cleared for use. Full garden path inspection completed.',
      preventiveMeasures: 'Scheduled monthly garden path inspections added to maintenance schedule.'
    },
    {
      id: '5',
      incidentNumber: 'INC-2025-043',
      dateTime: '2025-10-04T13:50:00',
      reportedBy: 'Lisa Park',
      reportedAt: '2025-10-04T14:10:00',
      category: 'behavioral',
      severity: 'medium',
      status: 'closed',
      participant: { id: 'p5', name: 'Emma Wilson' },
      location: 'Residential - Participant Room',
      description: 'Participant refused all meals and medication for 24 hours. Expressing distress about family visit cancellation.',
      immediateAction: 'Engaged participant in calm conversation. Contacted family to reschedule visit. Offered alternative activities. GP consulted regarding missed medication.',
      witnesses: ['James Brown', 'Emma Wilson'],
      familyNotified: true,
      ndisNotified: false,
      policeCalled: false,
      ambulanceCalled: false,
      assignedTo: 'Lisa Park',
      dueDate: '2025-10-05',
      resolutionNotes: 'Family rescheduled visit for following day. Participant resumed normal eating and medication routine after video call with family arranged.',
      preventiveMeasures: 'Implemented backup communication plan for family visits. Created visual schedule for participant to track upcoming family contacts.'
    },
    {
      id: '6',
      incidentNumber: 'INC-2025-042',
      dateTime: '2025-10-03T08:30:00',
      reportedBy: 'David Lee',
      reportedAt: '2025-10-03T08:45:00',
      category: 'injury',
      severity: 'high',
      status: 'closed',
      participant: { id: 'p6', name: 'Harper Davis' },
      location: 'Community Outing - Local Park',
      description: 'Participant fell from playground equipment during community outing. Complained of wrist pain and visible swelling observed.',
      immediateAction: 'First aid administered. Ice pack applied. Wrist immobilized with makeshift splint. Ambulance called. Family notified immediately.',
      witnesses: ['Sarah Johnson', 'Michael Chen'],
      familyNotified: true,
      ndisNotified: true,
      policeCalled: false,
      ambulanceCalled: true,
      assignedTo: 'Sarah Johnson',
      dueDate: '2025-10-04',
      resolutionNotes: 'X-ray confirmed hairline fracture. Wrist casted. Follow-up appointment scheduled. Participant in good spirits, pain managed.',
      preventiveMeasures: 'Reviewed playground equipment suitability assessment. Updated community outing safety protocols. Enhanced supervision ratios for playground activities.'
    },
    {
      id: '7',
      incidentNumber: 'INC-2025-041',
      dateTime: '2025-10-02T19:15:00',
      reportedBy: 'Emma Wilson',
      reportedAt: '2025-10-02T19:30:00',
      category: 'other',
      severity: 'low',
      status: 'closed',
      participant: { id: 'p7', name: 'Isabella Nguyen' },
      location: 'Residential - Dining Room',
      description: 'Fire alarm activated during dinner service due to burnt toast in kitchen. All participants evacuated safely.',
      immediateAction: 'Emergency evacuation procedure followed. All participants and staff accounted for at assembly point. Fire service attended and cleared building.',
      witnesses: ['All staff on duty'],
      familyNotified: false,
      ndisNotified: false,
      policeCalled: false,
      ambulanceCalled: false,
      assignedTo: 'Facilities Manager',
      dueDate: '2025-10-03',
      resolutionNotes: 'Fire service confirmed no fire risk. Kitchen ventilation system inspected and cleared. All participants returned safely.',
      preventiveMeasures: 'Kitchen staff retrained on toaster usage. Enhanced kitchen supervision protocols implemented during meal preparation.'
    },
    {
      id: '8',
      incidentNumber: 'INC-2025-040',
      dateTime: '2025-10-01T15:40:00',
      reportedBy: 'James Brown',
      reportedAt: '2025-10-01T16:00:00',
      category: 'medication',
      severity: 'medium',
      status: 'closed',
      participant: { id: 'p8', name: 'Ethan Williams' },
      location: 'Residential - Medication Room',
      description: 'Participant medication delayed by 2 hours due to medication delivery delay from pharmacy.',
      immediateAction: 'Contacted pharmacy to expedite delivery. Contacted participant\'s GP for advice on delayed dose. Participant monitored closely.',
      witnesses: ['Lisa Park'],
      familyNotified: true,
      ndisNotified: false,
      policeCalled: false,
      ambulanceCalled: false,
      assignedTo: 'Dr. Michael Chen',
      dueDate: '2025-10-02',
      resolutionNotes: 'Medication administered as soon as received. GP confirmed no adverse effects from delay. Participant condition stable.',
      preventiveMeasures: 'Implemented backup pharmacy arrangement. Updated medication stock management system to flag low inventory 5 days in advance.'
    }
  ]

  if (!hasHydrated) {
    return null
  }

  if (!currentUser) {
    router.push('/login')
    return null
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'text-gray-600 bg-gray-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'investigating': return 'text-blue-600 bg-blue-50'
      case 'action-required': return 'text-orange-600 bg-orange-50'
      case 'reported': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'injury': return Activity
      case 'medication': return Shield
      case 'behavioral': return Users
      case 'environmental': return MapPin
      default: return FileWarning
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'injury': return 'text-red-600'
      case 'medication': return 'text-purple-600'
      case 'behavioral': return 'text-blue-600'
      case 'environmental': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    // Filter by search query
    if (searchQuery && !incident.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !incident.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !incident.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by severity
    if (filterSeverity !== 'all' && incident.severity !== filterSeverity) {
      return false
    }

    // Filter by status
    if (filterStatus !== 'all' && incident.status !== filterStatus) {
      return false
    }

    // Filter by tab
    if (activeTab === 'open' && (incident.status === 'closed' || incident.status === 'resolved')) {
      return false
    }
    if (activeTab === 'critical' && incident.severity !== 'critical') {
      return false
    }

    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Incident Management</h1>
              </div>
              <p className="text-red-100 text-lg">
                Comprehensive incident tracking and management system
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Report Incident
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white border-red-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Incidents</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{incidentStats.total}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  {incidentStats.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-green-700" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-700" />
                  )}
                  <span className={incidentStats.trend === 'down' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                    {incidentStats.trendPercent}% vs last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-orange-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Open Cases</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{incidentStats.open}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                    Require attention
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-red-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Critical</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{incidentStats.critical}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    Urgent action needed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Resolved</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{incidentStats.resolved}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-green-700 font-medium">{((incidentStats.resolved / incidentStats.total) * 100).toFixed(1)}% resolution rate</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Category Breakdown */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  By Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryBreakdown.map((cat) => {
                  const Icon = getCategoryIcon(cat.category.toLowerCase())
                  return (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", getCategoryColor(cat.category.toLowerCase()))} />
                          <span className="text-sm font-medium">{cat.category}</span>
                        </div>
                        <span className="text-sm font-bold">{cat.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn("h-2 rounded-full", getCategoryColor(cat.category.toLowerCase()).replace('text-', 'bg-'))}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <div className="flex gap-1 text-xs">
                        {cat.severity.critical > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0">
                            {cat.severity.critical} Critical
                          </Badge>
                        )}
                        {cat.severity.high > 0 && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs px-1.5 py-0">
                            {cat.severity.high} High
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Incident List */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="all">All Incidents</TabsTrigger>
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="critical">Critical</TabsTrigger>
                </TabsList>

                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search incidents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
                    />
                  </div>
                </div>
              </div>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredIncidents.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No incidents found matching your filters</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredIncidents.map((incident) => {
                    const CategoryIcon = getCategoryIcon(incident.category)
                    return (
                      <Card key={incident.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="font-mono">
                                  {incident.incidentNumber}
                                </Badge>
                                <Badge className={getSeverityColor(incident.severity)}>
                                  {incident.severity} severity
                                </Badge>
                                <Badge className={getStatusColor(incident.status)}>
                                  {incident.status.replace('-', ' ')}
                                </Badge>
                                <div className="flex items-center gap-1.5 text-gray-500">
                                  <CategoryIcon className={cn("h-4 w-4", getCategoryColor(incident.category))} />
                                  <span className="text-sm capitalize">{incident.category}</span>
                                </div>
                              </div>
                              <h3 className="text-lg font-semibold mb-1">{incident.participant.name}</h3>
                              <p className="text-gray-600">{incident.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Incident:</span>
                              <span className="font-medium">{format(new Date(incident.dateTime), 'MMM dd, yyyy HH:mm')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Location:</span>
                              <span className="font-medium">{incident.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Reported by:</span>
                              <span className="font-medium">{incident.reportedBy}</span>
                            </div>
                          </div>

                          <div className="p-4 bg-blue-50 rounded-lg mb-4">
                            <p className="text-sm font-medium mb-1">Immediate Action Taken</p>
                            <p className="text-sm text-gray-700">{incident.immediateAction}</p>
                          </div>

                          <div className="flex items-center gap-6 mb-4 text-sm">
                            {incident.witnesses.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">{incident.witnesses.length} witness(es)</span>
                              </div>
                            )}
                            {incident.familyNotified && (
                              <div className="flex items-center gap-2">
                                <PhoneCall className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">Family notified</span>
                              </div>
                            )}
                            {incident.ndisNotified && (
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-600">NDIS notified</span>
                              </div>
                            )}
                            {incident.ambulanceCalled && (
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-red-600">Ambulance called</span>
                              </div>
                            )}
                          </div>

                          {incident.resolutionNotes && (
                            <div className="p-4 bg-green-50 rounded-lg mb-4">
                              <p className="text-sm font-medium mb-1 text-green-800">Resolution</p>
                              <p className="text-sm text-gray-700">{incident.resolutionNotes}</p>
                            </div>
                          )}

                          {incident.preventiveMeasures && (
                            <div className="p-4 bg-purple-50 rounded-lg mb-4">
                              <p className="text-sm font-medium mb-1 text-purple-800">Preventive Measures</p>
                              <p className="text-sm text-gray-700">{incident.preventiveMeasures}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4 text-sm">
                              {incident.assignedTo && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">Assigned to:</span>
                                  <span className="font-medium">{incident.assignedTo}</span>
                                </div>
                              )}
                              {incident.dueDate && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">Due:</span>
                                  <span className="font-medium">{format(new Date(incident.dueDate), 'MMM dd, yyyy')}</span>
                                </div>
                              )}
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                              View Full Details
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
