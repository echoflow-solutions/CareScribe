'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { 
  TrendingUp, TrendingDown, AlertTriangle, Clock, Users,
  Activity, FileText, Shield, Home, Calendar,
  ChevronLeft, ChevronRight, Download, Filter,
  CalendarDays
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { useToast } from '@/components/hooks/use-toast'

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Mock data for charts
const incidentTrend = [
  { month: 'Jan', incidents: 45, behavioral: 28, medical: 12, other: 5 },
  { month: 'Feb', incidents: 52, behavioral: 32, medical: 15, other: 5 },
  { month: 'Mar', incidents: 48, behavioral: 25, medical: 18, other: 5 },
  { month: 'Apr', incidents: 61, behavioral: 38, medical: 20, other: 3 },
  { month: 'May', incidents: 55, behavioral: 30, medical: 22, other: 3 },
  { month: 'Jun', incidents: 58, behavioral: 35, medical: 19, other: 4 }
]

const riskDistribution = [
  { name: 'Low Risk', value: 65, count: 45 },
  { name: 'Medium Risk', value: 25, count: 17 },
  { name: 'High Risk', value: 10, count: 7 }
]

const responseTime = [
  { hour: '00:00', avgMinutes: 8 },
  { hour: '04:00', avgMinutes: 12 },
  { hour: '08:00', avgMinutes: 5 },
  { hour: '12:00', avgMinutes: 6 },
  { hour: '16:00', avgMinutes: 7 },
  { hour: '20:00', avgMinutes: 9 }
]

const facilityPerformance = [
  { facility: 'House 1', incidents: 12, resolved: 11, avgResponse: 6 },
  { facility: 'House 2', incidents: 8, resolved: 8, avgResponse: 5 },
  { facility: 'House 3', incidents: 15, resolved: 13, avgResponse: 7 },
  { facility: 'House 4', incidents: 10, resolved: 9, avgResponse: 8 },
  { facility: 'House 5', incidents: 6, resolved: 6, avgResponse: 4 }
]

const behaviorPatterns = [
  { trigger: 'Loud Noises', frequency: 78, time: '2-4 PM' },
  { trigger: 'Routine Changes', frequency: 45, time: 'Morning' },
  { trigger: 'Crowded Spaces', frequency: 34, time: 'Afternoon' },
  { trigger: 'Medication Changes', frequency: 23, time: 'Evening' },
  { trigger: 'Staff Changes', frequency: 19, time: 'All Day' }
]

export default function AnalyticsPage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('month')
  const [selectedFacility, setSelectedFacility] = useState('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })

  // Export function
  const handleExport = async () => {
    const exportData = {
      dateRange,
      facility: selectedFacility,
      exportDate: new Date().toISOString(),
      metrics,
      incidentTrend,
      riskDistribution,
      responseTime,
      facilityPerformance,
      behaviorPatterns
    }

    // Convert to CSV
    const csvContent = generateCSV(exportData)
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: 'Export Successful',
      description: 'Analytics report has been downloaded'
    })
  }

  const generateCSV = (data: any) => {
    let csv = 'CareScribe Analytics Report\n'
    csv += `Date Range: ${dateRange}\n`
    csv += `Facility: ${selectedFacility}\n`
    csv += `Export Date: ${new Date().toLocaleDateString()}\n\n`
    
    // Metrics
    csv += 'Key Metrics\n'
    csv += 'Metric,Value,Change\n'
    csv += `Total Incidents,${metrics.totalIncidents},${metrics.incidentChange}%\n`
    csv += `Avg Response Time,${metrics.avgResponseTime} min,${metrics.responseChange}%\n`
    csv += `Resolution Rate,${metrics.resolutionRate}%,${metrics.resolutionChange}%\n`
    csv += `Participants at Risk,${metrics.participantsAtRisk},${metrics.riskChange}\n\n`
    
    // Incident Trend
    csv += 'Incident Trend\n'
    csv += 'Month,Total Incidents,Behavioral,Medical,Other\n'
    data.incidentTrend.forEach((item: any) => {
      csv += `${item.month},${item.incidents},${item.behavioral},${item.medical},${item.other}\n`
    })
    csv += '\n'
    
    // Facility Performance
    csv += 'Facility Performance\n'
    csv += 'Facility,Incidents,Resolved,Avg Response Time\n'
    data.facilityPerformance.forEach((item: any) => {
      csv += `${item.facility},${item.incidents},${item.resolved},${item.avgResponse} min\n`
    })
    
    return csv
  }

  // Mock metrics
  const [metrics, setMetrics] = useState({
    totalIncidents: 324,
    incidentChange: 12,
    avgResponseTime: 6.5,
    responseChange: -15,
    resolutionRate: 94,
    resolutionChange: 3,
    participantsAtRisk: 7,
    riskChange: -2
  })

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number' 
  }: { 
    title: string
    value: number
    change: number
    icon: any
    format?: 'number' | 'time' | 'percent'
  }) => {
    const isPositive = change >= 0
    const changeColor = title.includes('Response') ? 
      (isPositive ? 'text-red-600' : 'text-green-600') : 
      (isPositive ? 'text-green-600' : 'text-red-600')
    
    const formatValue = () => {
      switch (format) {
        case 'time':
          return `${value} min`
        case 'percent':
          return `${value}%`
        default:
          return value.toLocaleString()
      }
    }

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-gray-600">
              {title}
            </CardTitle>
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatValue()}</div>
          <div className={`flex items-center text-sm ${changeColor} mt-1`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {Math.abs(change)}% from last {dateRange}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading analytics...</div>
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
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights into your organization's performance
              </p>
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
              <Select value={dateRange} onValueChange={setDateRange}>
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
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowDatePicker(true)}
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <MetricCard
              title="Total Incidents"
              value={metrics.totalIncidents}
              change={metrics.incidentChange}
              icon={FileText}
            />
            <MetricCard
              title="Avg Response Time"
              value={metrics.avgResponseTime}
              change={metrics.responseChange}
              icon={Clock}
              format="time"
            />
            <MetricCard
              title="Resolution Rate"
              value={metrics.resolutionRate}
              change={metrics.resolutionChange}
              icon={Shield}
              format="percent"
            />
            <MetricCard
              title="Participants at Risk"
              value={metrics.participantsAtRisk}
              change={metrics.riskChange}
              icon={AlertTriangle}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Incident Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Incident Trend</CardTitle>
                  <CardDescription>Monthly incident count by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={incidentTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="behavioral" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="medical" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="other" stackId="1" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Participant Risk Distribution</CardTitle>
                  <CardDescription>Current risk levels across all participants</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {riskDistribution.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.count} participants</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Response Time Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
                <CardDescription>Average response time by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={responseTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avgMinutes" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Incident Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Incident Categories</CardTitle>
                  <CardDescription>Distribution of incident types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Behavioral', count: 145, percent: 45, color: 'bg-blue-500' },
                      { type: 'Medical', count: 89, percent: 27, color: 'bg-green-500' },
                      { type: 'Property Damage', count: 52, percent: 16, color: 'bg-yellow-500' },
                      { type: 'Other', count: 38, percent: 12, color: 'bg-purple-500' }
                    ].map((item) => (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.type}</span>
                          <span className="text-sm text-gray-500">{item.count} ({item.percent}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Severity Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Severity Distribution</CardTitle>
                  <CardDescription>Incidents by severity level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { severity: 'Low', count: 180 },
                      { severity: 'Medium', count: 98 },
                      { severity: 'High', count: 46 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="severity" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8">
                        {[
                          <Cell key="cell-0" fill="#10b981" />,
                          <Cell key="cell-1" fill="#f59e0b" />,
                          <Cell key="cell-2" fill="#ef4444" />
                        ]}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Common Behavior Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Common Behavior Patterns</CardTitle>
                <CardDescription>Most frequent behavioral triggers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {behaviorPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">{pattern.trigger}</div>
                        <div className="text-sm text-gray-500">Most common: {pattern.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{pattern.frequency}</div>
                        <div className="text-sm text-gray-500">occurrences</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Risk Level Changes */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Changes</CardTitle>
                  <CardDescription>Participants with changed risk levels this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'James Mitchell', from: 'Medium', to: 'High', change: 'increased' },
                      { name: 'Sarah Chen', from: 'Medium', to: 'Low', change: 'decreased' },
                      { name: 'Michael Brown', from: 'Low', to: 'Medium', change: 'increased' },
                      { name: 'Emma Wilson', from: 'High', to: 'Medium', change: 'decreased' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {item.from} → {item.to}
                          </div>
                        </div>
                        <Badge variant={item.change === 'increased' ? 'destructive' : 'default'}>
                          {item.change === 'increased' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Support Plan Effectiveness */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Plan Effectiveness</CardTitle>
                  <CardDescription>Success rate of intervention strategies</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { strategy: 'Quiet Room', success: 85 },
                      { strategy: 'Deep Pressure', success: 78 },
                      { strategy: 'Music Therapy', success: 72 },
                      { strategy: 'Visual Schedules', success: 68 },
                      { strategy: 'Sensory Breaks', success: 65 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="strategy" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="success" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Medication Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Medication Compliance</CardTitle>
                <CardDescription>Administration compliance by participant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { participant: 'James Mitchell', compliance: 98, doses: '294/300' },
                    { participant: 'Sarah Chen', compliance: 100, doses: '180/180' },
                    { participant: 'Michael Brown', compliance: 95, doses: '171/180' },
                    { participant: 'Emma Wilson', compliance: 92, doses: '276/300' },
                    { participant: 'David Lee', compliance: 99, doses: '356/360' }
                  ].map((item) => (
                    <div key={item.participant} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.participant}</span>
                          <span className="text-sm text-gray-500">{item.doses} doses</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.compliance >= 95 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${item.compliance}%` }}
                          />
                        </div>
                      </div>
                      <span className="ml-4 text-sm font-medium">{item.compliance}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Facility Performance Comparison</CardTitle>
                <CardDescription>Key metrics by facility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Facility</th>
                        <th className="text-center py-2">Incidents</th>
                        <th className="text-center py-2">Resolved</th>
                        <th className="text-center py-2">Avg Response</th>
                        <th className="text-center py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilityPerformance.map((facility) => (
                        <tr key={facility.facility} className="border-b">
                          <td className="py-3 font-medium">{facility.facility}</td>
                          <td className="text-center">{facility.incidents}</td>
                          <td className="text-center">
                            {facility.resolved}/{facility.incidents}
                          </td>
                          <td className="text-center">{facility.avgResponse} min</td>
                          <td className="text-center">
                            <Badge 
                              variant={facility.resolved === facility.incidents ? 'default' : 'secondary'}
                            >
                              {facility.resolved === facility.incidents ? 'Excellent' : 'Good'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Facility Occupancy */}
            <Card>
              <CardHeader>
                <CardTitle>Facility Occupancy Rates</CardTitle>
                <CardDescription>Current capacity utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { facility: 'House 1', occupancy: 87, capacity: 8 },
                    { facility: 'House 2', occupancy: 92, capacity: 6 },
                    { facility: 'House 3', occupancy: 78, capacity: 6 },
                    { facility: 'House 4', occupancy: 95, capacity: 8 },
                    { facility: 'House 5', occupancy: 85, capacity: 10 }
                  ]} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="facility" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="occupancy" fill="#8884d8">
                      {[0, 1, 2, 3, 4].map((index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index % 2 === 0 ? '#8884d8' : '#82ca9d'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Date Range Picker Dialog */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Date Range</DialogTitle>
            <DialogDescription>
              Select a custom date range for your analytics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>From Date</Label>
              <Input 
                type="date" 
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input 
                type="date" 
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDatePicker(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (customDateRange.from && customDateRange.to) {
                setDateRange('custom')
                setShowDatePicker(false)
                toast({
                  title: 'Date Range Applied',
                  description: `Showing data from ${customDateRange.from.toLocaleDateString()} to ${customDateRange.to.toLocaleDateString()}`
                })
              }
            }}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drill-down Dialog */}
      <DrillDownDialog />
    </div>
  )
}

// Drill-down dialog component
function DrillDownDialog() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<any>(null)
  
  // This would be triggered by clicking on chart elements
  // For now, it's a placeholder
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detailed Analysis</DialogTitle>
          <DialogDescription>
            Drill-down view of selected data
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {/* Detailed data would be shown here */}
          <p className="text-gray-500 text-center py-8">
            Click on any chart element to see detailed analysis
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}