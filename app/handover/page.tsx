'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft, BookOpen, AlertTriangle, CheckCircle, Clock, Calendar,
  Filter, Eye, EyeOff, MessageSquare, User, Users, Home, Bell,
  AlertCircle, Info, TrendingUp, FileText, Settings, Pill, Wrench,
  ClipboardCheck, Target, Archive, RefreshCw, Search, X, Check
} from 'lucide-react'
import { format, formatDistanceToNow, isToday, isYesterday, differenceInDays } from 'date-fns'
import { useStore } from '@/lib/store'

// Priority badge colors and icons
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return {
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: AlertTriangle,
        label: '🚨 URGENT'
      }
    case 'action-required':
      return {
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: ClipboardCheck,
        label: '⚡ ACTION REQUIRED'
      }
    case 'info':
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Info,
        label: 'ℹ️ INFO'
      }
    default:
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: MessageSquare,
        label: 'FYI'
      }
  }
}

// Category icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'participant': return Users
    case 'medication': return Pill
    case 'maintenance': return Wrench
    case 'incident': return AlertCircle
    case 'follow-up': return Target
    default: return MessageSquare
  }
}

export default function HandoverPage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNote, setSelectedNote] = useState<string | null>(null)

  // Sample handover notes - demonstrating the problem: notes from different days
  // In real implementation, this would come from Supabase
  const handoverNotes = [
    {
      id: '1',
      title: '⚠️ URGENT: Lisa Thompson - Medical Appointment Saturday',
      content: `Lisa Thompson has a specialist appointment on Saturday morning at 9:00 AM at Westmead Hospital.

ACTION REQUIRED:
- Transport MUST be booked by Friday
- Bring her medication list and NDIS plan
- She needs to fast from midnight (no breakfast)
- Allow 45 minutes travel time

Contact Dr. Sarah Chen's office if any questions: 02 9845 1234

⚠️ This appointment was rescheduled from 3 months ago - DO NOT MISS IT!`,
      category: 'participant',
      priority: 'urgent',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000), // Tuesday afternoon
      createdBy: 'Emma Williams',
      actionRequired: true,
      actionDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Saturday
      targetShift: 'morning',
      isRead: false,
      participantNames: ['Lisa Thompson']
    },
    {
      id: '2',
      title: '🔧 ACTION REQUIRED: Bathroom Leak in West Wing',
      content: `Bathroom in west wing (near Michael's room) has a slow leak under the sink.

Plumber is scheduled for Friday afternoon but may come earlier if available.

ACTION NEEDED:
- Place towels under sink daily
- Check for water damage each shift
- Call Max (plumber) if leak gets worse: 0412 345 678

Maintenance ticket #MT-2547`,
      category: 'maintenance',
      priority: 'action-required',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000), // Wednesday morning
      createdBy: 'James Martinez',
      actionRequired: true,
      targetShift: 'all',
      isRead: false,
      participantNames: []
    },
    {
      id: '3',
      title: '💊 Michael Brown - New Medication Started',
      content: `Dr. Wilson has prescribed new anxiety medication for Michael Brown starting Thursday.

Medication: Sertraline 50mg
Timing: Morning with breakfast
Side effects to watch: Nausea, drowsiness, dry mouth

Please monitor and document:
- Any side effects in first week
- Mood changes
- Sleep patterns

This is in addition to his regular meds. Webster pack has been updated.`,
      category: 'medication',
      priority: 'action-required',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Wednesday night
      createdBy: 'Sarah Johnson',
      actionRequired: true,
      targetShift: 'morning',
      isRead: true,
      participantNames: ['Michael Brown']
    },
    {
      id: '4',
      title: 'ℹ️ Emma Wilson - Early Morning Routine Working Well',
      content: `Update on Emma: The new early morning routine is showing great results!

She's been waking naturally around 5:30 AM and really enjoying the quiet time before breakfast.

Continue:
- Light breakfast at 6:00 AM (she likes toast with honey)
- Morning walk in garden at 6:30 AM
- Regular breakfast with group at 8:00 AM

This has reduced her afternoon agitation significantly. Please maintain this routine.`,
      category: 'participant',
      priority: 'info',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000), // Thursday afternoon
      createdBy: 'Emma Williams',
      actionRequired: false,
      targetShift: 'morning',
      isRead: true,
      participantNames: ['Emma Wilson']
    },
    {
      id: '5',
      title: '📋 FOLLOW-UP: Lisa Thompson Incident from Tuesday',
      content: `Following up on Tuesday's incident where Lisa became upset about noise during quiet time.

Implemented changes:
- Moved her quiet time to the sunroom (quieter)
- Reduced group activities in common room between 2-4 PM
- Lisa responded very positively

FRIDAY FOLLOW-UP REQUIRED:
- Check in with Lisa about the new arrangement
- Document if she seems more relaxed during quiet time
- Report back to team leader by Friday evening

Clinical manager wants update for Monday meeting.`,
      category: 'follow-up',
      priority: 'action-required',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // Thursday night
      createdBy: 'James Martinez',
      actionRequired: true,
      targetShift: 'afternoon',
      targetDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Friday
      isRead: false,
      participantNames: ['Lisa Thompson']
    },
    {
      id: '6',
      title: '🏠 Weekend Activity Plan',
      content: `Weekend activities planned:

SATURDAY:
- 10:00 AM: Trip to local markets (weather permitting)
- 2:00 PM: Movie afternoon (participants chose "The Lion King")
- 5:00 PM: BBQ dinner if weather is nice

SUNDAY:
- 9:00 AM: Gardening club for those interested
- 11:00 AM: Family visits (3 families expected)
- 3:00 PM: Arts and crafts session

Shopping list for BBQ is in kitchen. Markets trip requires 2 staff minimum.`,
      category: 'general',
      priority: 'info',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000), // Friday morning
      createdBy: 'Sarah Johnson',
      actionRequired: false,
      targetShift: 'all',
      isRead: true,
      participantNames: []
    },
    {
      id: '7',
      title: '🍽️ Michael Brown - Updated Dietary Requirements',
      content: `Michael's dietician has updated his meal plan due to cholesterol concerns.

NEW GUIDELINES (starting this weekend):
- Reduce red meat to once per week
- More fish and chicken
- Low-fat dairy products
- More vegetables and whole grains
- Limit fried foods

Kitchen has been informed. Updated meal plan is posted in kitchen.

FYI: Michael is actually excited about trying new healthy recipes!`,
      category: 'participant',
      priority: 'info',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // Friday afternoon
      createdBy: 'Emma Williams',
      actionRequired: false,
      targetShift: 'all',
      isRead: true,
      participantNames: ['Michael Brown']
    },
    {
      id: '8',
      title: '🌙 Quiet Night - All Participants Settled',
      content: `Friday night shift report:

OVERALL: Very quiet night, no incidents.

ALL PARTICIPANTS:
- Everyone sleeping soundly by 11:00 PM
- All medications administered on time
- No emergency calls
- House temperature comfortable

NOTES FOR SATURDAY MORNING:
- Coffee machine is low on beans (enough for tomorrow but order needed)
- Bread delivery arrives at 7:00 AM
- Emma will be up early as usual - remember her toast!
- Lisa's transport for hospital appointment needs confirmation

Have a great Saturday!`,
      category: 'general',
      priority: 'info',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (Friday night)
      createdBy: 'Aisha Patel',
      actionRequired: false,
      targetShift: 'morning',
      isRead: false,
      participantNames: []
    }
  ]

  // Filter and search
  const filteredNotes = handoverNotes.filter(note => {
    // Priority filter
    if (selectedFilter !== 'all' && note.priority !== selectedFilter) return false

    // Unread filter
    if (showUnreadOnly && note.isRead) return false

    // Search filter
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !note.content.toLowerCase().includes(searchTerm.toLowerCase())) return false

    return true
  })

  // Count unread notes by priority
  const unreadCounts = {
    urgent: handoverNotes.filter(n => !n.isRead && n.priority === 'urgent').length,
    actionRequired: handoverNotes.filter(n => !n.isRead && n.priority === 'action-required').length,
    total: handoverNotes.filter(n => !n.isRead).length
  }

  // Mark note as read
  const markAsRead = (noteId: string) => {
    // In real implementation, this would update Supabase
    console.log('Marking note as read:', noteId)
  }

  // Format date display
  const formatNoteDate = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    const days = differenceInDays(new Date(), date)
    if (days <= 7) return `${days} days ago`
    return format(date, 'EEEE, MMM d')
  }

  // Group notes by date
  const notesByDate = filteredNotes.reduce((acc, note) => {
    const dateKey = format(note.createdAt, 'yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(note)
    return acc
  }, {} as Record<string, typeof handoverNotes>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  Handover Communications
                </h1>
                <p className="text-gray-600 mt-1">
                  Digital handover notes - Never miss important information again
                </p>
              </div>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              <Home className="h-4 w-4 mr-2" />
              Parramatta House
            </Badge>
          </div>

          {/* Unread Alerts Banner */}
          {(unreadCounts.urgent > 0 || unreadCounts.actionRequired > 0) && (
            <Alert className="border-red-500 bg-red-50 animate-pulse">
              <Bell className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 font-semibold">
                <div className="flex items-center justify-between">
                  <span>
                    {unreadCounts.urgent > 0 && `${unreadCounts.urgent} URGENT`}
                    {unreadCounts.urgent > 0 && unreadCounts.actionRequired > 0 && ' and '}
                    {unreadCounts.actionRequired > 0 && `${unreadCounts.actionRequired} ACTION REQUIRED`}
                    {' '}unread {(unreadCounts.urgent + unreadCounts.actionRequired) === 1 ? 'note' : 'notes'} requiring your attention!
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setShowUnreadOnly(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Show Unread Only
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Urgent Notes</p>
                <p className="text-2xl font-bold">{unreadCounts.urgent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Action Required</p>
                <p className="text-2xl font-bold">{unreadCounts.actionRequired}</p>
              </div>
              <ClipboardCheck className="h-8 w-8 text-amber-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Unread</p>
                <p className="text-2xl font-bold">{unreadCounts.total}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-200" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Notes</p>
                <p className="text-2xl font-bold">{handoverNotes.length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-200" />
            </div>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  All Notes
                </Button>
                <Button
                  variant={selectedFilter === 'urgent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('urgent')}
                  className={selectedFilter === 'urgent' ? 'bg-red-600' : ''}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Urgent
                </Button>
                <Button
                  variant={selectedFilter === 'action-required' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('action-required')}
                  className={selectedFilter === 'action-required' ? 'bg-amber-600' : ''}
                >
                  <ClipboardCheck className="h-4 w-4 mr-1" />
                  Action Required
                </Button>
                <Button
                  variant={selectedFilter === 'info' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('info')}
                >
                  <Info className="h-4 w-4 mr-1" />
                  Info
                </Button>
                <Button
                  variant={showUnreadOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                >
                  {showUnreadOnly ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                  {showUnreadOnly ? 'Showing Unread' : 'Show Unread Only'}
                </Button>
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search handover notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Timeline View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Handover Timeline - Last 7 Days</h2>
            <Badge variant="outline" className="ml-2">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </Badge>
          </div>

          <div className="relative">
            {/* Notes grouped by date */}
            {Object.keys(notesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map((dateKey, dateIndex) => {
              const notes = notesByDate[dateKey]
              const noteDate = new Date(dateKey)

              return (
                <div key={dateKey} className="mb-8">
                  {/* Date Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatNoteDate(noteDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(noteDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>

                  {/* Notes for this date */}
                  <div className="space-y-4 md:ml-20">
                    <AnimatePresence>
                      {notes.map((note, noteIndex) => {
                        const priorityBadge = getPriorityBadge(note.priority)
                        const CategoryIcon = getCategoryIcon(note.category)

                        return (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: noteIndex * 0.05 }}
                          >
                            <Card className={`
                              p-6 cursor-pointer transition-all hover:shadow-lg
                              ${!note.isRead ? 'border-l-4 border-l-blue-600 bg-blue-50/50' : ''}
                              ${note.priority === 'urgent' ? 'border-2 border-red-300' : ''}
                              ${note.priority === 'action-required' ? 'border-2 border-amber-300' : ''}
                            `}
                            onClick={() => setSelectedNote(note.id === selectedNote ? null : note.id)}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                  {/* Category Icon */}
                                  <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                                    ${note.priority === 'urgent' ? 'bg-red-100' :
                                      note.priority === 'action-required' ? 'bg-amber-100' : 'bg-blue-100'}
                                  `}>
                                    <CategoryIcon className={`h-6 w-6
                                      ${note.priority === 'urgent' ? 'text-red-600' :
                                        note.priority === 'action-required' ? 'text-amber-600' : 'text-blue-600'}
                                    `} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    {/* Title */}
                                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                      {note.title}
                                      {!note.isRead && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                          NEW
                                        </Badge>
                                      )}
                                    </h3>

                                    {/* Metadata */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      <Badge className={priorityBadge.color}>
                                        <priorityBadge.icon className="h-3 w-3 mr-1" />
                                        {priorityBadge.label}
                                      </Badge>

                                      <Badge variant="outline">
                                        <User className="h-3 w-3 mr-1" />
                                        {note.createdBy}
                                      </Badge>

                                      <Badge variant="outline">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {format(note.createdAt, 'h:mm a')}
                                      </Badge>

                                      {note.targetShift && (
                                        <Badge variant="outline" className="bg-purple-50">
                                          <Target className="h-3 w-3 mr-1" />
                                          {note.targetShift.charAt(0).toUpperCase() + note.targetShift.slice(1)} Shift
                                        </Badge>
                                      )}

                                      {note.participantNames && note.participantNames.length > 0 && (
                                        <Badge variant="outline" className="bg-green-50">
                                          <Users className="h-3 w-3 mr-1" />
                                          {note.participantNames.join(', ')}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Content Preview */}
                                    <p className={`
                                      text-gray-700 whitespace-pre-wrap
                                      ${selectedNote === note.id ? '' : 'line-clamp-3'}
                                    `}>
                                      {note.content}
                                    </p>

                                    {/* Action Deadline */}
                                    {note.actionDeadline && (
                                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-amber-800 font-semibold">
                                          <AlertCircle className="h-4 w-4" />
                                          Action Deadline: {format(note.actionDeadline, 'EEEE, MMMM d')} at 9:00 AM
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                  {!note.isRead && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markAsRead(note.id)
                                      }}
                                      className="whitespace-nowrap"
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Mark Read
                                    </Button>
                                  )}
                                  {note.isRead && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Read
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredNotes.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No handover notes found</h3>
              <p className="text-gray-500 mb-4">
                {showUnreadOnly ? 'All notes have been read!' :
                 searchTerm ? 'Try adjusting your search or filters' :
                 'No handover notes match your current filters'}
              </p>
              {(showUnreadOnly || searchTerm || selectedFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setShowUnreadOnly(false)
                    setSearchTerm('')
                    setSelectedFilter('all')
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </Card>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-between items-center"
        >
          <Button
            variant="outline"
            onClick={() => router.push('/shift-start')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shift Start
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              View Archived
            </Button>
            <Button className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Create New Handover Note
            </Button>
          </div>
        </motion.div>

        {/* Help Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Why This Matters:</strong> Unlike the paper book where notes can be missed when staff don't flip back through pages,
              this digital system shows ALL handover notes from the past week in one timeline. Urgent and action-required notes are
              highlighted, and you can't start your shift until you've acknowledged reading the urgent ones. No more missed appointments or forgotten tasks!
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  )
}
