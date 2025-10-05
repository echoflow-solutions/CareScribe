'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/components/hooks/use-toast'
import { useStore } from '@/lib/store'
import { SupabaseService } from '@/lib/supabase/service'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns'
import {
  Clock, Calendar as CalendarIcon, Users, AlertCircle,
  ChevronLeft, ChevronRight, Plus, Edit2, Trash2,
  CheckCircle2, Play, Pause, X, FileText, ArrowRight,
  User, Home, Copy, Filter
} from 'lucide-react'

interface Shift {
  id: string
  staffId: string
  staffName: string
  staffRole: string
  facilityId: string
  facilityName: string
  date: Date
  startTime: string
  endTime: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  handoverNotes?: string
  actualStart?: string
  actualEnd?: string
  assignedBy?: string
  coWorkers?: string[]  // Names of other staff working the same shift
}

interface HandoverNote {
  id: string
  fromStaff: string
  toStaff: string
  timestamp: Date
  criticalInfo: string[]
  generalNotes: string
  acknowledged: boolean
}

// Helper to map Supabase shift data to Shift interface
const mapSupabaseShift = (dbShift: any): Shift => ({
  id: dbShift.id,
  staffId: dbShift.staff_id,
  staffName: dbShift.staff_name,
  staffRole: dbShift.staff_role,
  facilityId: dbShift.facility_id,
  facilityName: dbShift.facility_name,
  date: parseISO(dbShift.shift_date),
  startTime: dbShift.start_time.substring(0, 5), // Convert '07:00:00' to '07:00'
  endTime: dbShift.end_time.substring(0, 5),
  status: dbShift.status,
  handoverNotes: dbShift.handover_notes,
  actualStart: dbShift.actual_start_time ? format(parseISO(dbShift.actual_start_time), 'HH:mm') : undefined,
  actualEnd: dbShift.actual_end_time ? format(parseISO(dbShift.actual_end_time), 'HH:mm') : undefined,
  assignedBy: dbShift.assigned_by_name,
  coWorkers: dbShift.co_worker_names || []
})

export default function ShiftsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentUser } = useStore()
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedView, setSelectedView] = useState<'day' | 'week'>('day')
  const [selectedFacility, setSelectedFacility] = useState<string>('all')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [showShiftDialog, setShowShiftDialog] = useState(false)
  const [showHandoverDialog, setShowHandoverDialog] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [activeHandover, setActiveHandover] = useState<Shift | null>(null)
  const [handoverNotes, setHandoverNotes] = useState({
    criticalInfo: [''],
    generalNotes: ''
  })

  useEffect(() => {
    loadShifts()
  }, [selectedDate, selectedFacility])

  const loadShifts = async () => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const startDate = format(addDays(selectedDate, -3), 'yyyy-MM-dd')
      const endDate = format(addDays(selectedDate, 10), 'yyyy-MM-dd')

      // Fetch shifts for a range around the selected date
      const dbShifts = await SupabaseService.getShiftsByDateRange(startDate, endDate)

      // Map to our Shift interface
      const mappedShifts = dbShifts.map(mapSupabaseShift)

      // Filter by facility if selected
      const filteredShifts = selectedFacility === 'all'
        ? mappedShifts
        : mappedShifts.filter(s => s.facilityId === selectedFacility)

      setShifts(filteredShifts)
    } catch (error) {
      console.error('Error loading shifts:', error)
      toast({
        title: 'Error',
        description: 'Failed to load shifts from database',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getShiftsForDate = (date: Date) => {
    return shifts.filter(shift => isSameDay(shift.date, date))
  }

  const getShiftsForWeek = () => {
    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)
    return shifts.filter(shift => 
      shift.date >= weekStart && shift.date <= weekEnd
    )
  }

  const startShift = async (shift: Shift) => {
    try {
      await SupabaseService.clockIn(shift.id, currentUser?.id || '')

      // Update local state
      const now = format(new Date(), 'HH:mm')
      setShifts(prev => prev.map(s =>
        s.id === shift.id
          ? { ...s, status: 'active' as const, actualStart: now }
          : s
      ))

      toast({
        title: 'Shift Started',
        description: `Your shift at ${shift.facilityName} has started`
      })
    } catch (error) {
      console.error('Error starting shift:', error)
      toast({
        title: 'Error',
        description: 'Failed to clock in to shift',
        variant: 'destructive'
      })
    }
  }

  const endShift = (shift: Shift) => {
    setActiveHandover(shift)
    setShowHandoverDialog(true)
  }

  const submitHandover = async () => {
    if (!activeHandover) return

    try {
      // Filter out empty critical info
      const criticalInfo = handoverNotes.criticalInfo.filter(info => info.trim() !== '')

      await SupabaseService.clockOut(
        activeHandover.id,
        currentUser?.id || '',
        handoverNotes.generalNotes,
        criticalInfo.length > 0 ? criticalInfo : undefined
      )

      // Update local state
      const now = format(new Date(), 'HH:mm')
      setShifts(prev => prev.map(s =>
        s.id === activeHandover.id
          ? {
              ...s,
              status: 'completed' as const,
              actualEnd: now,
              handoverNotes: handoverNotes.generalNotes
            }
          : s
      ))

      toast({
        title: 'Shift Completed',
        description: 'Handover notes have been saved'
      })

      setShowHandoverDialog(false)
      setActiveHandover(null)
      setHandoverNotes({ criticalInfo: [''], generalNotes: '' })
    } catch (error) {
      console.error('Error completing shift:', error)
      toast({
        title: 'Error',
        description: 'Failed to clock out from shift',
        variant: 'destructive'
      })
    }
  }

  const addCriticalInfo = () => {
    setHandoverNotes(prev => ({
      ...prev,
      criticalInfo: [...prev.criticalInfo, '']
    }))
  }

  const updateCriticalInfo = (index: number, value: string) => {
    setHandoverNotes(prev => ({
      ...prev,
      criticalInfo: prev.criticalInfo.map((info, i) => i === index ? value : info)
    }))
  }

  const removeCriticalInfo = (index: number) => {
    setHandoverNotes(prev => ({
      ...prev,
      criticalInfo: prev.criticalInfo.filter((_, i) => i !== index)
    }))
  }

  const getShiftsByTime = (shifts: Shift[]) => {
    const morning = shifts.filter(s => s.startTime === '07:00')
    const afternoon = shifts.filter(s => s.startTime === '15:00')
    const night = shifts.filter(s => s.startTime === '23:00')
    return { morning, afternoon, night }
  }

  const getStatusBadge = (status: Shift['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Scheduled</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading shifts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Shift Management</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage staff schedules and handovers</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Facilities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  <SelectItem value="f1">House 1 - Riverside</SelectItem>
                  <SelectItem value="f2">House 2 - Parkview</SelectItem>
                  <SelectItem value="f3">House 3 - Sunshine</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowShiftDialog(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Shift
              </Button>
            </div>
          </div>

          {/* View Toggle and Date Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as 'day' | 'week')}>
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(prev => addDays(prev, -1))}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 hidden sm:block" />
                <span className="font-medium text-sm sm:text-base text-center sm:text-left">
                  {selectedView === 'day' 
                    ? format(selectedDate, 'EEE, MMM d')
                    : `${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d')}`
                  }
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate(prev => addDays(prev, 1))}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
                size="sm"
                className="hidden sm:inline-flex"
              >
                Today
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedView === 'day' ? (
          // Day View
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total Shifts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getShiftsForDate(selectedDate).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Active Now</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {getShiftsForDate(selectedDate).filter(s => s.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Staff on Duty</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(getShiftsForDate(selectedDate).map(s => s.staffId)).size}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Handovers Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">2</div>
                </CardContent>
              </Card>
            </div>

            {/* Shifts by Time */}
            <div className="space-y-6">
              {(() => {
                const todayShifts = getShiftsForDate(selectedDate)
                const { morning, afternoon, night } = getShiftsByTime(todayShifts)
                
                return (
                  <>
                    {/* Morning Shifts */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Morning Shifts (7 AM - 3 PM)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {morning.length === 0 ? (
                            <p className="text-gray-500">No morning shifts scheduled</p>
                          ) : (
                            morning.map(shift => (
                              <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback>
                                        {shift.staffName.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{shift.staffName}</div>
                                      <div className="text-sm text-gray-500">{shift.staffRole}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-12 sm:ml-0">
                                    <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                                    <Home className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium">{shift.facilityName}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 ml-12 sm:ml-0">
                                  {getStatusBadge(shift.status)}
                                  {shift.status === 'scheduled' && isSameDay(shift.date, new Date()) && (
                                    <Button size="sm" onClick={() => startShift(shift)}>
                                      <Play className="h-4 w-4 sm:mr-1" />
                                      <span className="hidden sm:inline">Start</span>
                                    </Button>
                                  )}
                                  {shift.status === 'active' && (
                                    <Button size="sm" variant="destructive" onClick={() => endShift(shift)}>
                                      <Pause className="h-4 w-4 sm:mr-1" />
                                      <span className="hidden sm:inline">End</span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Afternoon Shifts */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Afternoon Shifts (3 PM - 11 PM)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {afternoon.length === 0 ? (
                            <p className="text-gray-500">No afternoon shifts scheduled</p>
                          ) : (
                            afternoon.map(shift => (
                              <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback>
                                        {shift.staffName.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{shift.staffName}</div>
                                      <div className="text-sm text-gray-500">{shift.staffRole}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-12 sm:ml-0">
                                    <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                                    <Home className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium">{shift.facilityName}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 ml-12 sm:ml-0">
                                  {getStatusBadge(shift.status)}
                                  {shift.status === 'scheduled' && isSameDay(shift.date, new Date()) && (
                                    <Button size="sm" onClick={() => startShift(shift)}>
                                      <Play className="h-4 w-4 sm:mr-1" />
                                      <span className="hidden sm:inline">Start</span>
                                    </Button>
                                  )}
                                  {shift.status === 'active' && (
                                    <Button size="sm" variant="destructive" onClick={() => endShift(shift)}>
                                      <Pause className="h-4 w-4 sm:mr-1" />
                                      <span className="hidden sm:inline">End</span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Night Shifts */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Night Shifts (11 PM - 7 AM)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {night.length === 0 ? (
                            <p className="text-gray-500">No night shifts scheduled</p>
                          ) : (
                            night.map(shift => (
                              <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback>
                                        {shift.staffName.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{shift.staffName}</div>
                                      <div className="text-sm text-gray-500">{shift.staffRole}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-12 sm:ml-0">
                                    <ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" />
                                    <Home className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium">{shift.facilityName}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 ml-12 sm:ml-0">
                                  {getStatusBadge(shift.status)}
                                  {shift.status === 'scheduled' && isSameDay(shift.date, new Date()) && (
                                    <Button size="sm" onClick={() => startShift(shift)}>
                                      <Play className="h-4 w-4 sm:mr-1" />
                                      <span className="hidden sm:inline">Start</span>
                                    </Button>
                                  )}
                                  {shift.status === 'active' && (
                                    <Button size="sm" variant="destructive" onClick={() => endShift(shift)}>
                                      <Pause className="h-4 w-4 sm:mr-1" />
                                      <span className="hidden sm:inline">End</span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )
              })()}
            </div>
          </div>
        ) : (
          // Week View
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Time</th>
                      {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                        const date = addDays(startOfWeek(selectedDate), dayOffset)
                        return (
                          <th key={dayOffset} className="text-center py-2 px-4 min-w-[150px]">
                            <div className="font-medium">{format(date, 'EEE')}</div>
                            <div className="text-sm text-gray-500">{format(date, 'MMM d')}</div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {['Morning', 'Afternoon', 'Night'].map((shiftTime, timeIndex) => (
                      <tr key={shiftTime} className="border-b">
                        <td className="py-4 px-4 font-medium">{shiftTime}</td>
                        {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                          const date = addDays(startOfWeek(selectedDate), dayOffset)
                          const dayShifts = getShiftsForDate(date)
                          const { morning, afternoon, night } = getShiftsByTime(dayShifts)
                          const shiftsForTime = timeIndex === 0 ? morning : timeIndex === 1 ? afternoon : night
                          
                          return (
                            <td key={dayOffset} className="py-4 px-4">
                              <div className="space-y-2">
                                {shiftsForTime.map(shift => (
                                  <div
                                    key={shift.id}
                                    className={`p-2 rounded text-xs ${
                                      shift.status === 'active' 
                                        ? 'bg-green-100 text-green-800'
                                        : shift.status === 'completed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    <div className="font-medium">{shift.staffName.split(' ')[0]}</div>
                                    <div>{shift.facilityName.split(' - ')[0]}</div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Handover Dialog */}
        <Dialog open={showHandoverDialog} onOpenChange={setShowHandoverDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Shift Handover</DialogTitle>
              <DialogDescription>
                Complete handover notes for the next shift
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Critical Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Critical Information</Label>
                  <Button onClick={addCriticalInfo} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {handoverNotes.criticalInfo.map((info, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <Input
                      value={info}
                      onChange={(e) => updateCriticalInfo(index, e.target.value)}
                      placeholder="Critical information that must be communicated..."
                    />
                    {handoverNotes.criticalInfo.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeCriticalInfo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* General Notes */}
              <div>
                <Label htmlFor="generalNotes">General Handover Notes</Label>
                <Textarea
                  id="generalNotes"
                  value={handoverNotes.generalNotes}
                  onChange={(e) => setHandoverNotes(prev => ({ ...prev, generalNotes: e.target.value }))}
                  placeholder="Any other information for the incoming shift..."
                  rows={5}
                />
              </div>

              {/* Recent Incidents Summary */}
              <div className="rounded-lg bg-yellow-50 p-4">
                <h4 className="font-medium mb-2">Recent Incidents Summary</h4>
                <ul className="space-y-1 text-sm">
                  <li>• James M. - Behavioral incident at 2:15 PM (resolved)</li>
                  <li>• Sarah C. - Missed afternoon medication (administered late)</li>
                  <li>• No other significant incidents</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHandoverDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitHandover}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Handover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Shift Dialog */}
        <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Shift</DialogTitle>
              <DialogDescription>
                Schedule a new shift for staff members
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="staff">Staff Member</Label>
                <Select>
                  <SelectTrigger id="staff">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s1">Bernard Adjei</SelectItem>
                    <SelectItem value="s2">Tom Anderson</SelectItem>
                    <SelectItem value="s3">Emily Chen</SelectItem>
                    <SelectItem value="s4">Mark Williams</SelectItem>
                    <SelectItem value="s5">Lisa Brown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="facility">Facility</Label>
                <Select>
                  <SelectTrigger id="facility">
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="f1">House 1 - Riverside</SelectItem>
                    <SelectItem value="f2">House 2 - Parkview</SelectItem>
                    <SelectItem value="f3">House 3 - Sunshine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input type="date" id="date" />
                </div>
                <div>
                  <Label htmlFor="shiftType">Shift Type</Label>
                  <Select>
                    <SelectTrigger id="shiftType">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (07:00 - 15:00)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (15:00 - 23:00)</SelectItem>
                      <SelectItem value="night">Night (23:00 - 07:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">Support Worker</SelectItem>
                    <SelectItem value="senior">Senior Support Worker</SelectItem>
                    <SelectItem value="nurse">Registered Nurse</SelectItem>
                    <SelectItem value="team-leader">Team Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any special instructions or notes for this shift..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="recurring" className="rounded" />
                <Label htmlFor="recurring" className="text-sm font-normal">
                  Make this a recurring shift
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShiftDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: 'Shift Added',
                  description: 'New shift has been scheduled successfully'
                })
                setShowShiftDialog(false)
              }}>
                Add Shift
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Shift Swap Dialog */}
        <ShiftSwapDialog />

        {/* Leave Request Dialog */}
        <LeaveRequestDialog />
      </div>
    </div>
  )
}

// Shift Swap Dialog Component
function ShiftSwapDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Shift Swap</DialogTitle>
          <DialogDescription>
            Find someone to cover your shift
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label>Your Shift</Label>
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">March 25, 2024 - Morning Shift</p>
              <p className="text-sm text-gray-600">House 3 - Sunshine (6:00 AM - 2:00 PM)</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="reason">Reason for Swap</Label>
            <Textarea 
              id="reason" 
              placeholder="Please provide a reason for the shift swap..."
              rows={3}
            />
          </div>
          
          <div>
            <Label>Available Staff</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {['Tom Anderson', 'Emily Chen', 'Mark Williams'].map((staff) => (
                <div key={staff} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                  <input type="radio" name="swap" value={staff} />
                  <div className="flex-1">
                    <p className="font-medium">{staff}</p>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast({
              title: 'Swap Request Sent',
              description: 'Your shift swap request has been sent for approval'
            })
            setOpen(false)
          }}>
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Leave Request Dialog Component
function LeaveRequestDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
          <DialogDescription>
            Submit a leave request for approval
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select>
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal Leave</SelectItem>
                <SelectItem value="emergency">Emergency Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input type="date" id="startDate" />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input type="date" id="endDate" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="leaveReason">Reason</Label>
            <Textarea 
              id="leaveReason" 
              placeholder="Please provide details about your leave request..."
              rows={3}
            />
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You have 12 days of annual leave remaining this year.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            toast({
              title: 'Leave Request Submitted',
              description: 'Your leave request has been sent for approval'
            })
            setOpen(false)
          }}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}