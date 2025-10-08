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
  Calendar, Users, Clock, MapPin, AlertTriangle,
  CheckCircle2, XCircle, Plus, ChevronLeft, ChevronRight,
  Download, Upload, Settings, User, Award, AlertCircle,
  TrendingUp, Phone, Mail, Edit, Copy, Trash2
} from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'

interface StaffMember {
  id: string
  name: string
  role: string
  qualifications: string[]
  maxHoursPerWeek: number
  weekHours: number
  availability: string[]
  phone: string
  email: string
  status: 'active' | 'on-leave' | 'unavailable'
}

interface Shift {
  id: string
  staffId: string | null
  staffName: string | null
  date: string
  startTime: string
  endTime: string
  location: string
  position: string
  requiredQualifications: string[]
  status: 'filled' | 'vacant' | 'pending' | 'cancelled'
  participants: number
  notes: string
}

interface Location {
  id: string
  name: string
  address: string
  capacity: number
  activeParticipants: number
  requiredStaff: number
}

interface RosterStats {
  totalShifts: number
  filledShifts: number
  vacantShifts: number
  pendingShifts: number
  totalStaff: number
  activeStaff: number
  avgOccupancy: number
  coverageRate: number
}

export default function RosterPage() {
  const router = useRouter()
  const { currentUser, hasHydrated } = useStore()
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'week' | 'staff'>('week')

  // Mock data - Locations
  const locations: Location[] = [
    {
      id: 'loc1',
      name: 'Main Residential Facility',
      address: '123 Care Street, Sydney NSW 2000',
      capacity: 20,
      activeParticipants: 18,
      requiredStaff: 6
    },
    {
      id: 'loc2',
      name: 'Day Program Center',
      address: '456 Support Avenue, Sydney NSW 2001',
      capacity: 30,
      activeParticipants: 25,
      requiredStaff: 8
    },
    {
      id: 'loc3',
      name: 'Satellite House - North',
      address: '789 Community Drive, Sydney NSW 2002',
      capacity: 12,
      activeParticipants: 10,
      requiredStaff: 4
    },
    {
      id: 'loc4',
      name: 'Satellite House - South',
      address: '321 Harmony Lane, Sydney NSW 2003',
      capacity: 12,
      activeParticipants: 12,
      requiredStaff: 4
    }
  ]

  // Mock data - Staff
  const staff: StaffMember[] = [
    {
      id: 's1',
      name: 'Sarah Johnson',
      role: 'Team Leader',
      qualifications: ['First Aid', 'Medication Admin', 'Behavior Support'],
      maxHoursPerWeek: 38,
      weekHours: 38,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      phone: '0400 123 456',
      email: 'sarah.j@carescribe.com',
      status: 'active'
    },
    {
      id: 's2',
      name: 'Michael Chen',
      role: 'Senior Support Worker',
      qualifications: ['First Aid', 'Medication Admin', 'Manual Handling'],
      maxHoursPerWeek: 38,
      weekHours: 36,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      phone: '0400 123 457',
      email: 'michael.c@carescribe.com',
      status: 'active'
    },
    {
      id: 's3',
      name: 'Emma Wilson',
      role: 'Support Worker',
      qualifications: ['First Aid', 'Manual Handling'],
      maxHoursPerWeek: 38,
      weekHours: 30,
      availability: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      phone: '0400 123 458',
      email: 'emma.w@carescribe.com',
      status: 'active'
    },
    {
      id: 's4',
      name: 'James Brown',
      role: 'Support Worker',
      qualifications: ['First Aid'],
      maxHoursPerWeek: 20,
      weekHours: 16,
      availability: ['Saturday', 'Sunday'],
      phone: '0400 123 459',
      email: 'james.b@carescribe.com',
      status: 'active'
    },
    {
      id: 's5',
      name: 'Lisa Park',
      role: 'Team Leader',
      qualifications: ['First Aid', 'Medication Admin', 'Behavior Support', 'Restrictive Practices'],
      maxHoursPerWeek: 38,
      weekHours: 0,
      availability: [],
      phone: '0400 123 460',
      email: 'lisa.p@carescribe.com',
      status: 'on-leave'
    },
    {
      id: 's6',
      name: 'David Lee',
      role: 'Senior Support Worker',
      qualifications: ['First Aid', 'Medication Admin'],
      maxHoursPerWeek: 38,
      weekHours: 38,
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      phone: '0400 123 461',
      email: 'david.l@carescribe.com',
      status: 'active'
    },
    {
      id: 's7',
      name: 'Sophie Martinez',
      role: 'Support Worker',
      qualifications: ['First Aid', 'Manual Handling'],
      maxHoursPerWeek: 30,
      weekHours: 24,
      availability: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      phone: '0400 123 462',
      email: 'sophie.m@carescribe.com',
      status: 'active'
    },
    {
      id: 's8',
      name: 'Alex Thompson',
      role: 'Support Worker',
      qualifications: ['First Aid'],
      maxHoursPerWeek: 25,
      weekHours: 20,
      availability: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
      phone: '0400 123 463',
      email: 'alex.t@carescribe.com',
      status: 'active'
    }
  ]

  // Generate week dates
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Mock data - Shifts for the week
  const shifts: Shift[] = [
    // Monday
    { id: 'sh1', staffId: 's1', staffName: 'Sarah Johnson', date: format(weekDays[0], 'yyyy-MM-dd'), startTime: '07:00', endTime: '15:00', location: 'Main Residential Facility', position: 'Team Leader', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 6, notes: 'Morning medication rounds' },
    { id: 'sh2', staffId: 's2', staffName: 'Michael Chen', date: format(weekDays[0], 'yyyy-MM-dd'), startTime: '15:00', endTime: '23:00', location: 'Main Residential Facility', position: 'Senior Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh3', staffId: 's6', staffName: 'David Lee', date: format(weekDays[0], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Day Program Center', position: 'Senior Support Worker', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 8, notes: 'Community outing planned' },
    { id: 'sh4', staffId: 's7', staffName: 'Sophie Martinez', date: format(weekDays[0], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Satellite House - North', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 4, notes: '' },
    { id: 'sh5', staffId: null, staffName: null, date: format(weekDays[0], 'yyyy-MM-dd'), startTime: '23:00', endTime: '07:00', location: 'Main Residential Facility', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'vacant', participants: 6, notes: 'Overnight sleep-over shift' },

    // Tuesday
    { id: 'sh6', staffId: 's1', staffName: 'Sarah Johnson', date: format(weekDays[1], 'yyyy-MM-dd'), startTime: '07:00', endTime: '15:00', location: 'Main Residential Facility', position: 'Team Leader', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh7', staffId: 's3', staffName: 'Emma Wilson', date: format(weekDays[1], 'yyyy-MM-dd'), startTime: '15:00', endTime: '23:00', location: 'Main Residential Facility', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh8', staffId: 's2', staffName: 'Michael Chen', date: format(weekDays[1], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Day Program Center', position: 'Senior Support Worker', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 8, notes: '' },
    { id: 'sh9', staffId: 's6', staffName: 'David Lee', date: format(weekDays[1], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Satellite House - South', position: 'Senior Support Worker', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 4, notes: '' },

    // Wednesday
    { id: 'sh10', staffId: 's1', staffName: 'Sarah Johnson', date: format(weekDays[2], 'yyyy-MM-dd'), startTime: '07:00', endTime: '15:00', location: 'Main Residential Facility', position: 'Team Leader', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh11', staffId: null, staffName: null, date: format(weekDays[2], 'yyyy-MM-dd'), startTime: '15:00', endTime: '23:00', location: 'Main Residential Facility', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'vacant', participants: 6, notes: 'URGENT: Coverage needed' },
    { id: 'sh12', staffId: 's6', staffName: 'David Lee', date: format(weekDays[2], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Day Program Center', position: 'Senior Support Worker', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 8, notes: '' },
    { id: 'sh13', staffId: 's7', staffName: 'Sophie Martinez', date: format(weekDays[2], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Satellite House - North', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 4, notes: '' },

    // Thursday
    { id: 'sh14', staffId: 's2', staffName: 'Michael Chen', date: format(weekDays[3], 'yyyy-MM-dd'), startTime: '07:00', endTime: '15:00', location: 'Main Residential Facility', position: 'Senior Support Worker', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh15', staffId: 's3', staffName: 'Emma Wilson', date: format(weekDays[3], 'yyyy-MM-dd'), startTime: '15:00', endTime: '23:00', location: 'Main Residential Facility', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh16', staffId: 's6', staffName: 'David Lee', date: format(weekDays[3], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Day Program Center', position: 'Senior Support Worker', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 8, notes: '' },
    { id: 'sh17', staffId: 's8', staffName: 'Alex Thompson', date: format(weekDays[3], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Satellite House - South', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 4, notes: '' },

    // Friday
    { id: 'sh18', staffId: 's1', staffName: 'Sarah Johnson', date: format(weekDays[4], 'yyyy-MM-dd'), startTime: '07:00', endTime: '15:00', location: 'Main Residential Facility', position: 'Team Leader', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh19', staffId: 's2', staffName: 'Michael Chen', date: format(weekDays[4], 'yyyy-MM-dd'), startTime: '15:00', endTime: '23:00', location: 'Main Residential Facility', position: 'Senior Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh20', staffId: 's6', staffName: 'David Lee', date: format(weekDays[4], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Day Program Center', position: 'Senior Support Worker', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 8, notes: 'Weekend handover' },
    { id: 'sh21', staffId: 's8', staffName: 'Alex Thompson', date: format(weekDays[4], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Satellite House - North', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 4, notes: '' },

    // Saturday
    { id: 'sh22', staffId: 's4', staffName: 'James Brown', date: format(weekDays[5], 'yyyy-MM-dd'), startTime: '07:00', endTime: '15:00', location: 'Main Residential Facility', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh23', staffId: 's3', staffName: 'Emma Wilson', date: format(weekDays[5], 'yyyy-MM-dd'), startTime: '15:00', endTime: '23:00', location: 'Main Residential Facility', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh24', staffId: 's2', staffName: 'Michael Chen', date: format(weekDays[5], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Day Program Center', position: 'Senior Support Worker', requiredQualifications: ['Medication Admin'], status: 'filled', participants: 6, notes: 'Reduced weekend program' },
    { id: 'sh25', staffId: 's8', staffName: 'Alex Thompson', date: format(weekDays[5], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Satellite House - South', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 4, notes: '' },

    // Sunday
    { id: 'sh26', staffId: 's4', staffName: 'James Brown', date: format(weekDays[6], 'yyyy-MM-dd'), startTime: '07:00', endTime: '15:00', location: 'Main Residential Facility', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh27', staffId: 's3', staffName: 'Emma Wilson', date: format(weekDays[6], 'yyyy-MM-dd'), startTime: '15:00', endTime: '23:00', location: 'Main Residential Facility', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 6, notes: '' },
    { id: 'sh28', staffId: null, staffName: null, date: format(weekDays[6], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Day Program Center', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'vacant', participants: 5, notes: '' },
    { id: 'sh29', staffId: 's7', staffName: 'Sophie Martinez', date: format(weekDays[6], 'yyyy-MM-dd'), startTime: '09:00', endTime: '17:00', location: 'Satellite House - North', position: 'Support Worker', requiredQualifications: ['First Aid'], status: 'filled', participants: 4, notes: '' }
  ]

  // Calculate stats
  const rosterStats: RosterStats = {
    totalShifts: shifts.length,
    filledShifts: shifts.filter(s => s.status === 'filled').length,
    vacantShifts: shifts.filter(s => s.status === 'vacant').length,
    pendingShifts: shifts.filter(s => s.status === 'pending').length,
    totalStaff: staff.length,
    activeStaff: staff.filter(s => s.status === 'active').length,
    avgOccupancy: 85.5,
    coverageRate: (shifts.filter(s => s.status === 'filled').length / shifts.length) * 100
  }

  // Filter shifts by location
  const filteredShifts = selectedLocation === 'all'
    ? shifts
    : shifts.filter(s => s.location === selectedLocation)

  if (!hasHydrated) {
    return null
  }

  if (!currentUser) {
    router.push('/login')
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'text-green-600 bg-green-50'
      case 'vacant': return 'text-red-600 bg-red-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'cancelled': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'on-leave': return 'text-orange-600 bg-orange-50'
      case 'unavailable': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                  <Calendar className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Roster Management</h1>
              </div>
              <p className="text-indigo-100 text-lg">
                Multi-location staff scheduling and workforce management
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="lg" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button variant="secondary" size="lg" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="secondary" size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Shift
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white border-indigo-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Shifts</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{rosterStats.totalShifts}</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                    This week
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Coverage Rate</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{rosterStats.coverageRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-700" />
                  <span className="text-green-700 font-medium">{rosterStats.filledShifts} filled</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-orange-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Vacant Shifts</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{rosterStats.vacantShifts}</p>
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg",
                    rosterStats.vacantShifts > 0 ? "bg-orange-100" : "bg-green-100"
                  )}>
                    {rosterStats.vacantShifts > 0 ? (
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  {rosterStats.vacantShifts > 0 ? (
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                      Require coverage
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Fully staffed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Staff</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{rosterStats.activeStaff}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm">
                  <span className="text-gray-600 font-medium">of {rosterStats.totalStaff} total</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'staff')} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="week">Week View</TabsTrigger>
              <TabsTrigger value="staff">Staff View</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              {/* Week Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {format(weekStart, 'MMM dd')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Week View */}
          <TabsContent value="week" className="space-y-6">
            {weekDays.map((day, index) => {
              const dayShifts = filteredShifts.filter(s => s.date === format(day, 'yyyy-MM-dd'))
              const vacantCount = dayShifts.filter(s => s.status === 'vacant').length

              return (
                <Card key={index} className={cn(
                  "overflow-hidden",
                  vacantCount > 0 && "border-l-4 border-l-red-500"
                )}>
                  {/* Day Header */}
                  <CardHeader className={cn(
                    "pb-4",
                    vacantCount > 0 ? "bg-red-50" : "bg-gray-50"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {format(day, 'EEEE')}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-0.5">{format(day, 'MMMM dd, yyyy')}</p>
                        </div>
                        {vacantCount > 0 && (
                          <Badge variant="destructive" className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {vacantCount} Vacant Shift{vacantCount !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Shifts</div>
                        <div className="text-2xl font-bold text-gray-900">{dayShifts.length}</div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Shifts as List */}
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {dayShifts.map(shift => (
                        <div
                          key={shift.id}
                          className={cn(
                            "p-5 hover:bg-gray-50 transition-colors",
                            shift.status === 'vacant' && "bg-red-50/30"
                          )}
                        >
                          <div className="flex items-center gap-6">
                            {/* Time Block */}
                            <div className="flex-shrink-0 w-32">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-bold text-sm text-gray-900">
                                  {shift.startTime} - {shift.endTime}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {parseInt(shift.endTime.split(':')[0]) - parseInt(shift.startTime.split(':')[0])} hours
                              </div>
                            </div>

                            {/* Location & Position */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">{shift.location}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5" />
                                  <span>{shift.position}</span>
                                </div>
                                {shift.participants > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{shift.participants} participants</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Staff Assignment */}
                            <div className="flex-shrink-0 w-64">
                              {shift.staffName ? (
                                <div className="flex items-center gap-3 bg-green-50 px-4 py-2.5 rounded-lg border border-green-200">
                                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-green-900">{shift.staffName}</div>
                                    <div className="text-xs text-green-700">Assigned</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 bg-red-50 px-4 py-2.5 rounded-lg border border-red-200">
                                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm font-bold text-red-900">VACANT</div>
                                    <div className="text-xs text-red-700">Needs coverage</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-shrink-0">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1.5" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Copy className="h-4 w-4 mr-1.5" />
                                Copy
                              </Button>
                            </div>
                          </div>

                          {/* Notes */}
                          {shift.notes && (
                            <div className="mt-3 ml-[152px] p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-xs text-blue-900">
                                <span className="font-semibold">Note: </span>
                                {shift.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* Staff View */}
          <TabsContent value="staff" className="space-y-4">
            {staff.map(member => {
              const memberShifts = shifts.filter(s => s.staffId === member.id)
              const utilizationPercent = (member.weekHours / member.maxHoursPerWeek) * 100

              return (
                <Card key={member.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>

                        {/* Name & Role */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                            <Badge className={getStaffStatusColor(member.status)}>
                              {member.status === 'active' ? 'Active' : member.status === 'on-leave' ? 'On Leave' : 'Unavailable'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Badge variant="outline" className="font-medium">{member.role}</Badge>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {member.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hours Summary */}
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Weekly Hours</div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {member.weekHours}<span className="text-xl text-gray-400">/{member.maxHoursPerWeek}</span>
                        </div>
                        <div className="w-40 bg-gray-200 rounded-full h-3">
                          <div
                            className={cn(
                              "h-3 rounded-full transition-all",
                              utilizationPercent < 80 && "bg-yellow-500",
                              utilizationPercent >= 80 && utilizationPercent < 100 && "bg-green-500",
                              utilizationPercent >= 100 && "bg-red-500"
                            )}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {utilizationPercent.toFixed(0)}% utilized
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Qualifications */}
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-gray-700 mb-3">Qualifications</div>
                      <div className="flex flex-wrap gap-2">
                        {member.qualifications.map((qual, i) => (
                          <Badge key={i} variant="secondary" className="px-3 py-1.5">
                            <Award className="h-3.5 w-3.5 mr-1.5" />
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {member.status === 'active' && (
                      <>
                        {/* Availability */}
                        <div className="mb-6">
                          <div className="text-sm font-semibold text-gray-700 mb-3">Availability</div>
                          <div className="flex gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                              <Badge
                                key={day}
                                variant={member.availability.includes(day) ? "default" : "outline"}
                                className={cn(
                                  "px-3 py-1.5 font-medium",
                                  member.availability.includes(day) && "bg-blue-500"
                                )}
                              >
                                {day.substring(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Week Schedule */}
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-3">This Week's Schedule</div>
                          <div className="grid grid-cols-7 gap-3">
                            {weekDays.map((day, index) => {
                              const dayShift = memberShifts.find(s => s.date === format(day, 'yyyy-MM-dd'))
                              return (
                                <div
                                  key={index}
                                  className={cn(
                                    "rounded-lg border-2 p-3 text-center transition-all",
                                    dayShift
                                      ? "bg-blue-50 border-blue-300 shadow-sm"
                                      : "bg-gray-50 border-gray-200"
                                  )}
                                >
                                  <div className="font-bold text-sm text-gray-900 mb-2">
                                    {format(day, 'EEE')}
                                  </div>
                                  <div className="text-xs text-gray-500 mb-2">
                                    {format(day, 'MMM dd')}
                                  </div>
                                  {dayShift ? (
                                    <div className="space-y-1">
                                      <div className="font-bold text-xs text-blue-700">
                                        {dayShift.startTime}
                                      </div>
                                      <div className="text-xs text-gray-400">to</div>
                                      <div className="font-bold text-xs text-blue-700">
                                        {dayShift.endTime}
                                      </div>
                                      <div className="mt-2 pt-2 border-t border-blue-200">
                                        <div className="text-xs font-medium text-gray-700 line-clamp-2" title={dayShift.location}>
                                          {dayShift.location.split('-')[0].trim()}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="py-6 text-gray-400 font-medium text-sm">
                                      Off
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    {member.status === 'on-leave' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                        <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-orange-900">Currently on Leave</p>
                        <p className="text-xs text-orange-700 mt-1">Not available for scheduling</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
