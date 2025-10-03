'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, Moon, Users, Clock, AlertTriangle, FileText,
  Activity, Pill, CheckCircle, Info, TrendingUp, Shield,
  Calendar, Thermometer, Home, Phone, MessageSquare, Settings
} from 'lucide-react'
import { format } from 'date-fns'

export default function HandoverPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('overview')
  
  // Night shift data
  const nightShift = {
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    startTime: '11:00 PM',
    endTime: '7:00 AM',
    location: 'Parramatta - Maxlife Care',
    shiftLead: 'Emma Williams',
    totalIncidents: 2,
    medicationsGiven: 12,
    participantsSupported: 6
  }
  
  // Night shift staff
  const nightStaff = [
    { 
      name: 'Emma Williams', 
      role: 'Night Shift Lead', 
      hours: '11:00 PM - 7:00 AM',
      activities: ['Completed all medication rounds', 'Managed participant anxiety episode', 'Updated care plans']
    },
    { 
      name: 'James Martinez', 
      role: 'Support Worker', 
      hours: '11:00 PM - 7:00 AM',
      activities: ['Assisted with personal care', 'Monitored sleeping patterns', 'Prepared breakfast']
    },
    { 
      name: 'Aisha Patel', 
      role: 'Support Worker', 
      hours: '11:00 PM - 7:00 AM',
      activities: ['Conducted hourly checks', 'Responded to call bells', 'Documented observations']
    }
  ]
  
  // Incidents from night shift
  const incidents = [
    {
      id: 'INC-001',
      time: '2:15 AM',
      type: 'Behavioral',
      severity: 'Medium',
      participant: 'James M.',
      description: 'Participant experienced anxiety and restlessness. Unable to sleep.',
      actions: 'Provided emotional support, offered warm milk, and used calming techniques. Participant settled by 3:00 AM.',
      reportedBy: 'Emma Williams',
      followUp: 'Monitor sleep patterns tonight. Consider reviewing evening routine.'
    },
    {
      id: 'ABC-001',
      time: '5:30 AM',
      type: 'ABC Report',
      severity: 'Low',
      participant: 'Sarah C.',
      antecedent: 'Woke up earlier than usual, appeared confused about time',
      behavior: 'Attempted to leave room multiple times, mild agitation',
      consequence: 'Staff redirected to common area, provided breakfast early, participant calmed',
      reportedBy: 'James Martinez'
    }
  ]
  
  // Participant notes
  const participantNotes = [
    { name: 'James M.', status: 'stable', note: 'Slept well after initial anxiety. Morning mood positive.' },
    { name: 'Sarah C.', status: 'monitor', note: 'Early rising pattern continues. May need schedule adjustment.' },
    { name: 'Michael B.', status: 'good', note: 'No issues overnight. Took all medications as scheduled.' },
    { name: 'Emma W.', status: 'good', note: 'Slept through the night. Ready for morning activities.' },
    { name: 'David L.', status: 'stable', note: 'Brief restlessness at 1 AM, settled quickly.' },
    { name: 'Lisa T.', status: 'good', note: 'No concerns. Excited about today\'s outing.' }
  ]
  
  // Medication summary
  const medications = [
    { time: '11:30 PM', count: 4, completed: true, notes: 'All participants compliant' },
    { time: '2:00 AM', count: 2, completed: true, notes: 'PRN given to James M. for anxiety' },
    { time: '6:00 AM', count: 6, completed: true, notes: 'Morning medications prepared' }
  ]
  
  // Environmental observations
  const observations = [
    { time: '12:00 AM', type: 'Safety', note: 'All exits secure, alarm system active' },
    { time: '2:00 AM', type: 'Environment', note: 'Heating adjusted in west wing - was too cold' },
    { time: '4:00 AM', type: 'Maintenance', note: 'Kitchen tap dripping - maintenance request submitted' },
    { time: '6:30 AM', type: 'Preparation', note: 'Common areas cleaned and breakfast setup completed' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
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
                <Moon className="h-8 w-8 text-indigo-600" />
                Night Shift Handover
              </h1>
              <p className="text-gray-600 mt-1">
                {format(nightShift.date, 'EEEE, MMMM d, yyyy')} • {nightShift.startTime} - {nightShift.endTime}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Home className="h-4 w-4 mr-2" />
            {nightShift.location}
          </Badge>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Shift Lead</p>
                <p className="text-xl font-bold">{nightShift.shiftLead}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-200" />
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Total Incidents</p>
                <p className="text-xl font-bold">{nightShift.totalIncidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-200" />
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Medications Given</p>
                <p className="text-xl font-bold">{nightShift.medicationsGiven}</p>
              </div>
              <Pill className="h-8 w-8 text-green-200" />
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Participants</p>
                <p className="text-xl font-bold">{nightShift.participantsSupported}</p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </Card>
        </motion.div>

        {/* Tabbed Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="staff">Staff Activity</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Shift Summary
                </h3>
                <div className="prose max-w-none text-gray-700">
                  <p className="mb-4">
                    The night shift proceeded with minimal disruptions. Two incidents were recorded and appropriately managed. 
                    All scheduled medications were administered on time with full compliance.
                  </p>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                    <p className="font-semibold text-amber-800">Key Points for Day Shift:</p>
                    <ul className="mt-2 space-y-1 text-amber-700">
                      <li>• James M. had anxiety episode at 2:15 AM - monitor mood today</li>
                      <li>• Sarah C. continuing early rising pattern - consider schedule review</li>
                      <li>• Kitchen tap needs maintenance attention</li>
                      <li>• All participants ready for morning activities</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-green-600" />
                    Medication Rounds
                  </h4>
                  <div className="space-y-3">
                    {medications.map((round, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{round.time}</span>
                          <Badge variant="outline">{round.count} meds</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {round.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                          <span className="text-sm text-gray-600">{round.notes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Environmental Notes
                  </h4>
                  <div className="space-y-3">
                    {observations.map((obs, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Badge variant="secondary" className="mt-0.5">{obs.type}</Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{obs.time}</p>
                          <p className="text-sm text-gray-600">{obs.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Incidents Tab */}
            <TabsContent value="incidents" className="space-y-4">
              {incidents.map((incident) => (
                <Card key={incident.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant={incident.severity === 'Medium' ? 'default' : 'secondary'}>
                        {incident.type}
                      </Badge>
                      <span className="text-sm text-gray-600">{incident.time}</span>
                      <span className="font-medium">{incident.participant}</span>
                    </div>
                    <Badge variant="outline" className={
                      incident.severity === 'Medium' ? 'border-amber-500 text-amber-700' : 'border-gray-300'
                    }>
                      {incident.severity} Priority
                    </Badge>
                  </div>
                  
                  {incident.type === 'ABC Report' ? (
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800">Antecedent:</p>
                        <p className="text-sm text-blue-700">{incident.antecedent}</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-amber-800">Behavior:</p>
                        <p className="text-sm text-amber-700">{incident.behavior}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-green-800">Consequence:</p>
                        <p className="text-sm text-green-700">{incident.consequence}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Description:</p>
                        <p className="text-sm text-gray-600">{incident.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Actions Taken:</p>
                        <p className="text-sm text-gray-600">{incident.actions}</p>
                      </div>
                      {incident.followUp && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            <span className="font-semibold">Follow-up Required:</span> {incident.followUp}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-sm text-gray-500">Reported by: {incident.reportedBy}</span>
                    <span className="text-sm text-gray-500">Report ID: {incident.id}</span>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Participants Tab */}
            <TabsContent value="participants" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Participant Status Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participantNotes.map((participant, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{participant.name}</h4>
                        <Badge variant={
                          participant.status === 'good' ? 'default' : 
                          participant.status === 'monitor' ? 'secondary' : 'outline'
                        } className={
                          participant.status === 'good' ? 'bg-green-100 text-green-800' :
                          participant.status === 'monitor' ? 'bg-amber-100 text-amber-800' : ''
                        }>
                          {participant.status === 'good' ? 'All Good' :
                           participant.status === 'monitor' ? 'Monitor' : 'Stable'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{participant.note}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Staff Activity Tab */}
            <TabsContent value="staff" className="space-y-4">
              {nightStaff.map((staff, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{staff.name}</h4>
                      <p className="text-gray-600">{staff.role} • {staff.hours}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Shift Completed
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-gray-700">Key Activities:</p>
                    <ul className="space-y-1">
                      {staff.activities.map((activity, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Night Shift Timeline</h3>
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {[
                      { time: '11:00 PM', event: 'Shift started', icon: Clock, color: 'blue' },
                      { time: '11:30 PM', event: 'First medication round completed', icon: Pill, color: 'green' },
                      { time: '12:00 AM', event: 'Security check completed', icon: Shield, color: 'blue' },
                      { time: '2:00 AM', event: 'Heating adjusted in west wing', icon: Thermometer, color: 'orange' },
                      { time: '2:15 AM', event: 'Incident: James M. anxiety episode', icon: AlertTriangle, color: 'amber' },
                      { time: '3:00 AM', event: 'James M. settled and sleeping', icon: CheckCircle, color: 'green' },
                      { time: '4:00 AM', event: 'Maintenance request submitted', icon: Settings, color: 'gray' },
                      { time: '5:30 AM', event: 'ABC Report: Sarah C. early rising', icon: FileText, color: 'amber' },
                      { time: '6:00 AM', event: 'Morning medications prepared', icon: Pill, color: 'green' },
                      { time: '6:30 AM', event: 'Breakfast preparation completed', icon: Activity, color: 'blue' },
                      { time: '7:00 AM', event: 'Shift handover completed', icon: Users, color: 'green' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center
                          ${item.color === 'blue' ? 'bg-blue-100' :
                            item.color === 'green' ? 'bg-green-100' :
                            item.color === 'amber' ? 'bg-amber-100' :
                            item.color === 'orange' ? 'bg-orange-100' :
                            'bg-gray-100'}
                        `}>
                          <item.icon className={`h-6 w-6
                            ${item.color === 'blue' ? 'text-blue-600' :
                              item.color === 'green' ? 'text-green-600' :
                              item.color === 'amber' ? 'text-amber-600' :
                              item.color === 'orange' ? 'text-orange-600' :
                              'text-gray-600'}
                          `} />
                        </div>
                        <div className="flex-1 pt-4">
                          <p className="font-semibold text-gray-900">{item.time}</p>
                          <p className="text-gray-600">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-between items-center"
        >
          <div className="flex gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Night Staff
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Add Day Shift Note
            </Button>
          </div>
          <Button 
            onClick={() => router.push('/shift-start')}
            className="flex items-center gap-2"
          >
            Start Your Shift
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}