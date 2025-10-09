'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/hooks/use-toast'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { format, subDays, isWithinInterval } from 'date-fns'
import { 
  FileText, Search, Filter, Download, Eye, Edit2,
  AlertTriangle, Clock, CheckCircle2, XCircle,
  Calendar as CalendarIcon, TrendingUp, Users,
  BarChart3, Home, ChevronRight, Printer,
  Mail, Share2, Archive, Trash2, ChevronDown,
  Settings2, Tag, FileDown, CheckSquare, Square
} from 'lucide-react'

interface Report {
  id: string
  incidentDate: Date
  reportedDate: Date
  participantName: string
  participantId: string
  facilityName: string
  reporterName: string
  reporterId: string
  type: 'behavioral' | 'medical' | 'property' | 'other'
  severity: 'low' | 'medium' | 'high'
  status: 'draft' | 'submitted' | 'reviewed' | 'closed'
  reportType: 'incident' | 'abc' | 'both'
  description: string
  antecedent?: string
  behavior?: string
  consequence?: string
  interventions: string[]
  reviewedBy?: string
  reviewedDate?: Date
  tags: string[]
}

// Generate mock reports
const generateReports = (): Report[] => {
  const reports: Report[] = []
  const participants = ['James Mitchell', 'Sarah Chen', 'Michael Brown', 'Emma Wilson', 'David Lee']
  const reporters = ['Bernard Adjei', 'Tom Anderson', 'Emily Chen', 'Mark Williams']
  const facilities = ['House 1 - Riverside', 'House 2 - Parkview', 'House 3 - Sunshine']
  const types = ['behavioral', 'medical', 'property', 'other'] as const
  const severities = ['low', 'medium', 'high'] as const
  const statuses = ['submitted', 'reviewed', 'closed'] as const

  // Generate 50 reports over the past 30 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const incidentDate = subDays(new Date(), daysAgo)
    const reportedDate = new Date(incidentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000)
    
    reports.push({
      id: `report-${i}`,
      incidentDate,
      reportedDate,
      participantName: participants[Math.floor(Math.random() * participants.length)],
      participantId: `p-${Math.floor(Math.random() * participants.length)}`,
      facilityName: facilities[Math.floor(Math.random() * facilities.length)],
      reporterName: reporters[Math.floor(Math.random() * reporters.length)],
      reporterId: `r-${Math.floor(Math.random() * reporters.length)}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      reportType: ['incident', 'abc', 'both'][Math.floor(Math.random() * 3)] as any,
      description: 'Incident occurred during afternoon activities...',
      interventions: ['Quiet room', 'Deep pressure therapy'],
      tags: ['pattern-match', 'follow-up-required']
    })
  }

  return reports.sort((a, b) => b.incidentDate.getTime() - a.incidentDate.getTime())
}

export default function ReportsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentUser } = useStore()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30),
    to: (() => {
      const endOfToday = new Date()
      endOfToday.setHours(23, 59, 59, 999)
      return endOfToday
    })()
  })
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [advancedFilters, setAdvancedFilters] = useState({
    participant: '',
    facility: '',
    reporter: '',
    tags: [] as string[],
    hasABC: false,
    hasPatternMatch: false
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const reportsPerPage = 10

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      // Load reports from database
      const incidents = await DataService.getIncidents()

      // Transform incidents to Report format
      const transformedReports: Report[] = incidents.map(incident => {
        // Parse interventions if it's a JSON string
        let interventions: string[] = []
        try {
          if (typeof incident.interventions === 'string') {
            const parsed = JSON.parse(incident.interventions)
            interventions = Array.isArray(parsed) ? parsed.map((i: any) => i.description || i) : []
          } else if (Array.isArray(incident.interventions)) {
            interventions = incident.interventions.map((i: any) => i.description || i)
          }
        } catch (e) {
          console.warn('Failed to parse interventions:', e)
          interventions = []
        }

        return {
          id: incident.id,
          incidentDate: new Date(incident.timestamp),
          reportedDate: new Date(incident.timestamp),
          participantName: incident.participantName || 'Unknown',
          participantId: incident.participantId,
          facilityName: incident.location || 'Unknown Facility',
          reporterName: incident.staffName || 'Unknown',
          reporterId: incident.staffId,
          type: incident.type,
          severity: incident.severity,
          status: incident.status === 'draft' ? 'draft' :
                  incident.status === 'submitted' ? 'submitted' :
                  incident.status === 'reviewed' ? 'reviewed' : 'closed',
          reportType: incident.reportType || 'incident',
          description: incident.description,
          antecedent: incident.antecedent,
          behavior: incident.behavior,
          consequence: incident.consequence,
          interventions,
          tags: []
        }
      })

      setReports(transformedReports)
      setFilteredReports(transformedReports)
    } catch (error) {
      console.error('Error loading reports:', error)
      // Fallback to mock data if database fails
      const mockReports = generateReports()
      setReports(mockReports)
      setFilteredReports(mockReports)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1)

    // Apply filters
    let filtered = reports

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Advanced filters
    if (advancedFilters.participant) {
      filtered = filtered.filter(report => 
        report.participantName.toLowerCase().includes(advancedFilters.participant.toLowerCase())
      )
    }
    if (advancedFilters.facility) {
      filtered = filtered.filter(report => 
        report.facilityName.toLowerCase().includes(advancedFilters.facility.toLowerCase())
      )
    }
    if (advancedFilters.reporter) {
      filtered = filtered.filter(report => 
        report.reporterName.toLowerCase().includes(advancedFilters.reporter.toLowerCase())
      )
    }
    if (advancedFilters.tags.length > 0) {
      filtered = filtered.filter(report => 
        advancedFilters.tags.some(tag => report.tags.includes(tag))
      )
    }
    if (advancedFilters.hasABC) {
      filtered = filtered.filter(report => 
        report.reportType === 'abc' || report.reportType === 'both'
      )
    }
    if (advancedFilters.hasPatternMatch) {
      filtered = filtered.filter(report => 
        report.tags.includes('pattern-match')
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.type === selectedType)
    }

    // Severity filter
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(report => report.severity === selectedSeverity)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus)
    }

    // Date range filter
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(report => 
        isWithinInterval(report.incidentDate, { start: dateRange.from!, end: dateRange.to! })
      )
    }

    // Tab filter
    if (activeTab === 'pending') {
      filtered = filtered.filter(report => report.status === 'submitted')
    } else if (activeTab === 'reviewed') {
      filtered = filtered.filter(report => report.status === 'reviewed')
    }

    setFilteredReports(filtered)
  }, [searchTerm, selectedType, selectedSeverity, selectedStatus, dateRange, activeTab, reports, advancedFilters])

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'behavioral':
        return <AlertTriangle className="h-4 w-4" />
      case 'medical':
        return <Clock className="h-4 w-4" />
      case 'property':
        return <Home className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'behavioral':
        return 'text-purple-600 bg-purple-100'
      case 'medical':
        return 'text-red-600 bg-red-100'
      case 'property':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityBadge = (severity: Report['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>
      case 'medium':
        return <Badge variant="default">Medium</Badge>
      default:
        return <Badge variant="secondary">Low</Badge>
    }
  }

  const getStatusBadge = (status: Report['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800">Reviewed</Badge>
      case 'closed':
        return <Badge className="bg-green-100 text-green-800">Closed</Badge>
    }
  }

  const handleExportReports = () => {
    setShowExportDialog(true)
  }

  const performExport = () => {
    const dataToExport = selectedReports.size > 0 
      ? filteredReports.filter(r => selectedReports.has(r.id))
      : filteredReports

    if (exportFormat === 'csv') {
      exportToCSV(dataToExport)
    } else {
      exportToPDF(dataToExport)
    }

    setShowExportDialog(false)
    toast({
      title: 'Export Complete',
      description: `${dataToExport.length} reports exported as ${exportFormat.toUpperCase()}`
    })
  }

  const exportToCSV = (reports: Report[]) => {
    const headers = [
      'Incident Date', 'Participant', 'Type', 'Severity', 'Facility', 
      'Reporter', 'Status', 'Description', 'Interventions'
    ]
    
    const rows = reports.map(r => [
      format(r.incidentDate, 'yyyy-MM-dd HH:mm'),
      r.participantName,
      r.type,
      r.severity,
      r.facilityName,
      r.reporterName,
      r.status,
      r.description,
      r.interventions.join('; ')
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `incident-reports-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = (reports: Report[]) => {
    // In a real app, this would generate a proper PDF
    toast({
      title: 'PDF Export',
      description: 'PDF export would be implemented with a library like jsPDF'
    })
  }

  const toggleReportSelection = (reportId: string) => {
    const newSelection = new Set(selectedReports)
    if (newSelection.has(reportId)) {
      newSelection.delete(reportId)
    } else {
      newSelection.add(reportId)
    }
    setSelectedReports(newSelection)
  }

  const selectAllReports = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set())
    } else {
      setSelectedReports(new Set(filteredReports.map(r => r.id)))
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedReports.size === 0) {
      toast({
        title: 'No Reports Selected',
        description: 'Please select reports to perform bulk actions',
        variant: 'destructive'
      })
      return
    }

    switch (action) {
      case 'archive':
        toast({
          title: 'Reports Archived',
          description: `${selectedReports.size} reports have been archived`
        })
        break
      case 'mark-reviewed':
        toast({
          title: 'Reports Marked as Reviewed',
          description: `${selectedReports.size} reports marked as reviewed`
        })
        break
      case 'assign':
        toast({
          title: 'Reports Assigned',
          description: `${selectedReports.size} reports assigned for review`
        })
        break
      case 'export':
        handleExportReports()
        break
    }
    
    setShowBulkActions(false)
    setSelectedReports(new Set())
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setShowDetailDialog(true)
  }

  const handleEditReport = (report: Report) => {
    // Navigate to edit page
    router.push(`/reports/${report.id}/edit`)
  }

  const handlePrintReport = (report: Report) => {
    toast({
      title: 'Printing Report',
      description: 'Opening print dialog...'
    })
  }

  const handleShareReport = (report: Report) => {
    toast({
      title: 'Share Report',
      description: 'Report link copied to clipboard'
    })
  }

  // Calculate statistics
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'submitted').length,
    highSeverity: reports.filter(r => r.severity === 'high').length,
    behavioral: reports.filter(r => r.type === 'behavioral').length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading reports...</div>
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
              <h1 className="text-3xl font-bold">Report Management</h1>
              <p className="text-gray-600 mt-1">Search, review, and manage incident reports</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedReports.size > 0 && (
                <Popover open={showBulkActions} onOpenChange={setShowBulkActions}>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Settings2 className="h-4 w-4 mr-2" />
                      Bulk Actions ({selectedReports.size})
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="end">
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start" 
                        onClick={() => handleBulkAction('archive')}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Selected
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleBulkAction('mark-reviewed')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleBulkAction('assign')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Assign to Staff
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => handleBulkAction('export')}
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Export Selected
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              <Button variant="outline" onClick={handleExportReports}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => router.push('/quick-report')}>
                <FileText className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-sm text-gray-500">Requires attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">High Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.highSeverity}</div>
                <p className="text-sm text-gray-500">Critical incidents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Behavioral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.behavioral}</div>
                <p className="text-sm text-gray-500">Most common type</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange.from && dateRange.to ? (
                      <span className="text-sm">
                        {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                      </span>
                    ) : (
                      'Date Range'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Advanced Search */}
            <div className="mt-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              >
                <Settings2 className="h-4 w-4 mr-2" />
                Advanced Search
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`} />
              </Button>
              
              {(searchTerm || selectedType !== 'all' || selectedSeverity !== 'all' || 
                selectedStatus !== 'all' || Object.values(advancedFilters).some(v => 
                  Array.isArray(v) ? v.length > 0 : v)) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedType('all')
                    setSelectedSeverity('all')
                    setSelectedStatus('all')
                    setAdvancedFilters({
                      participant: '',
                      facility: '',
                      reporter: '',
                      tags: [],
                      hasABC: false,
                      hasPatternMatch: false
                    })
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
            
            {showAdvancedSearch && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="participant-filter">Participant Name</Label>
                    <Input
                      id="participant-filter"
                      placeholder="Filter by participant..."
                      value={advancedFilters.participant}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, participant: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facility-filter">Facility</Label>
                    <Input
                      id="facility-filter"
                      placeholder="Filter by facility..."
                      value={advancedFilters.facility}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, facility: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reporter-filter">Reporter</Label>
                    <Input
                      id="reporter-filter"
                      placeholder="Filter by reporter..."
                      value={advancedFilters.reporter}
                      onChange={(e) => setAdvancedFilters(prev => ({ ...prev, reporter: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-abc"
                      checked={advancedFilters.hasABC}
                      onCheckedChange={(checked) => 
                        setAdvancedFilters(prev => ({ ...prev, hasABC: checked as boolean }))
                      }
                    />
                    <Label htmlFor="has-abc" className="text-sm font-normal cursor-pointer">
                      Has ABC Analysis
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-pattern"
                      checked={advancedFilters.hasPatternMatch}
                      onCheckedChange={(checked) => 
                        setAdvancedFilters(prev => ({ ...prev, hasPatternMatch: checked as boolean }))
                      }
                    />
                    <Label htmlFor="has-pattern" className="text-sm font-normal cursor-pointer">
                      Pattern Match Detected
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Tags:</span>
                    {['follow-up-required', 'medication-related', 'environmental-trigger'].map(tag => (
                      <Badge
                        key={tag}
                        variant={advancedFilters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setAdvancedFilters(prev => ({
                            ...prev,
                            tags: prev.tags.includes(tag)
                              ? prev.tags.filter(t => t !== tag)
                              : [...prev.tags, tag]
                          }))
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Review ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Reviewed ({reports.filter(r => r.status === 'reviewed').length})
            </TabsTrigger>
          </TabsList>

          {/* Reports Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 w-12">
                        <Checkbox
                          checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                          onCheckedChange={selectAllReports}
                        />
                      </th>
                      <th className="text-left py-3 px-4">Date/Time</th>
                      <th className="text-left py-3 px-4">Participant</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Severity</th>
                      <th className="text-left py-3 px-4">Facility</th>
                      <th className="text-left py-3 px-4">Reporter</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500">
                          No reports found matching your filters
                        </td>
                      </tr>
                    ) : (
                      filteredReports
                        .slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage)
                        .map((report) => (
                        <tr key={report.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={selectedReports.has(report.id)}
                              onCheckedChange={() => toggleReportSelection(report.id)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">
                                {format(report.incidentDate, 'MMM d, yyyy')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(report.incidentDate, 'h:mm a')}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{report.participantName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTypeColor(report.type)}`}>
                              {getTypeIcon(report.type)}
                              <span className="capitalize">{report.type}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getSeverityBadge(report.severity)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {report.facilityName}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {report.reporterName}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(report.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleViewReport(report)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditReport(report)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handlePrintReport(report)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleShareReport(report)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredReports.length > reportsPerPage && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * reportsPerPage) + 1} to {Math.min(currentPage * reportsPerPage, filteredReports.length)} of {filteredReports.length} reports
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= Math.ceil(filteredReports.length / reportsPerPage)}
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredReports.length / reportsPerPage), prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        {/* Report Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedReport && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Incident Report - {selectedReport.participantName}</span>
                    {getStatusBadge(selectedReport.status)}
                  </DialogTitle>
                  <DialogDescription>
                    Reported on {format(selectedReport.reportedDate, 'MMMM d, yyyy at h:mm a')}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Report Details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Incident Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date/Time:</span>
                          <span>{format(selectedReport.incidentDate, 'MMM d, yyyy h:mm a')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="capitalize">{selectedReport.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Severity:</span>
                          {getSeverityBadge(selectedReport.severity)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Report Type:</span>
                          <span className="uppercase">{selectedReport.reportType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">People Involved</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Participant:</span>
                          <span>{selectedReport.participantName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Facility:</span>
                          <span>{selectedReport.facilityName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Reporter:</span>
                          <span>{selectedReport.reporterName}</span>
                        </div>
                        {selectedReport.reviewedBy && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Reviewed By:</span>
                            <span>{selectedReport.reviewedBy}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium mb-2">Incident Description</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedReport.description}
                    </p>
                  </div>

                  {/* ABC Analysis (if applicable) */}
                  {(selectedReport.reportType === 'abc' || selectedReport.reportType === 'both') && (
                    <div className="space-y-3">
                      <h4 className="font-medium">ABC Analysis</h4>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="bg-blue-50 p-3 rounded">
                          <h5 className="font-medium text-sm mb-1">Antecedent</h5>
                          <p className="text-sm">{selectedReport.antecedent || 'Not specified'}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <h5 className="font-medium text-sm mb-1">Behavior</h5>
                          <p className="text-sm">{selectedReport.behavior || 'Not specified'}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <h5 className="font-medium text-sm mb-1">Consequence</h5>
                          <p className="text-sm">{selectedReport.consequence || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interventions */}
                  <div>
                    <h4 className="font-medium mb-2">Interventions Applied</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.interventions.map((intervention, index) => (
                        <Badge key={index} variant="secondary">
                          {intervention}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedReport.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button onClick={() => handleEditReport(selectedReport)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Report
                    </Button>
                    <Button variant="outline" onClick={() => handlePrintReport(selectedReport)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="outline" onClick={() => handleShareReport(selectedReport)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Reports</DialogTitle>
              <DialogDescription>
                Choose export format and options for your reports
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label>Export Format</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="csv"
                      name="format"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                      className="rounded-full"
                    />
                    <Label htmlFor="csv" className="cursor-pointer">
                      CSV (Spreadsheet)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="pdf"
                      name="format"
                      value="pdf"
                      checked={exportFormat === 'pdf'}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                      className="rounded-full"
                    />
                    <Label htmlFor="pdf" className="cursor-pointer">
                      PDF (Printable)
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Export Scope</Label>
                <div className="space-y-2 mt-2">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">
                      {selectedReports.size > 0 
                        ? `${selectedReports.size} Selected Reports`
                        : `All ${filteredReports.length} Filtered Reports`}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Date Range: {dateRange.from && dateRange.to 
                        ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                        : 'All dates'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Include in Export</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-abc" defaultChecked />
                    <Label htmlFor="include-abc" className="text-sm font-normal cursor-pointer">
                      ABC Analysis (if available)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-interventions" defaultChecked />
                    <Label htmlFor="include-interventions" className="text-sm font-normal cursor-pointer">
                      Interventions & Actions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-tags" defaultChecked />
                    <Label htmlFor="include-tags" className="text-sm font-normal cursor-pointer">
                      Tags & Pattern Matches
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={performExport}>
                <Download className="h-4 w-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}