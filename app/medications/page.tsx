'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/hooks/use-toast'
import { useStore } from '@/lib/store'
import { format } from 'date-fns'
import { 
  Pill, Clock, Calendar, AlertCircle, CheckCircle2,
  User, Filter, Search, Plus, Edit2, Trash2,
  FileText, TrendingUp, AlertTriangle, ChevronRight,
  History, Activity, Home, Package, Download,
  ExternalLink, ShoppingCart, BarChart3, X
} from 'lucide-react'

interface Medication {
  id: string
  participantId: string
  participantName: string
  name: string
  dosage: string
  prescriber: string
  type: 'regular' | 'prn'
  schedule: {
    time: string
    days: string[]
  }[]
  instructions: string
  sideEffects: string[]
  startDate: Date
  endDate?: Date
  active: boolean
}

interface MedicationAdministration {
  id: string
  medicationId: string
  participantId: string
  scheduledTime: Date
  administeredTime?: Date
  administeredBy?: string
  status: 'pending' | 'administered' | 'missed' | 'refused'
  notes?: string
  reason?: string
}

// Generate mock medications
const generateMedications = (): Medication[] => {
  const participants = [
    'James Mitchell', 'Sarah Chen', 'Michael Brown', 
    'Emma Wilson', 'David Lee', 'Lisa Thompson'
  ]
  const medications: Medication[] = []
  
  const medicationTemplates = [
    { name: 'Risperidone', dosage: '2mg', type: 'regular', prescriber: 'Dr. Sarah Kim' },
    { name: 'Lorazepam', dosage: '1mg', type: 'prn', prescriber: 'Dr. Sarah Kim' },
    { name: 'Sertraline', dosage: '50mg', type: 'regular', prescriber: 'Dr. John Smith' },
    { name: 'Melatonin', dosage: '3mg', type: 'regular', prescriber: 'Dr. Sarah Kim' },
    { name: 'Paracetamol', dosage: '500mg', type: 'prn', prescriber: 'Dr. John Smith' }
  ]

  participants.forEach((participant, pIndex) => {
    // Each participant has 1-3 medications
    const numMeds = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numMeds; i++) {
      const template = medicationTemplates[Math.floor(Math.random() * medicationTemplates.length)]
      medications.push({
        id: `med-${pIndex}-${i}`,
        participantId: `p-${pIndex}`,
        participantName: participant,
        name: template.name,
        dosage: template.dosage,
        prescriber: template.prescriber,
        type: template.type as 'regular' | 'prn',
        schedule: template.type === 'regular' ? [
          { time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          ...(Math.random() > 0.5 ? [{ time: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }] : [])
        ] : [],
        instructions: template.type === 'prn' ? 'As needed for anxiety' : 'Take with food',
        sideEffects: ['Drowsiness', 'Dry mouth'],
        startDate: new Date(2024, 0, 1),
        active: true
      })
    }
  })

  return medications
}

// Generate today's administrations
const generateAdministrations = (medications: Medication[]): MedicationAdministration[] => {
  const administrations: MedicationAdministration[] = []
  const today = new Date()
  
  medications.forEach(med => {
    if (med.type === 'regular') {
      med.schedule.forEach(schedule => {
        const [hour, minute] = schedule.time.split(':').map(Number)
        const scheduledTime = new Date(today)
        scheduledTime.setHours(hour, minute, 0, 0)
        
        const isPast = scheduledTime < new Date()
        const status = isPast 
          ? Math.random() > 0.1 ? 'administered' : 'missed'
          : 'pending'
        
        administrations.push({
          id: `admin-${med.id}-${schedule.time}`,
          medicationId: med.id,
          participantId: med.participantId,
          scheduledTime,
          administeredTime: status === 'administered' ? scheduledTime : undefined,
          administeredBy: status === 'administered' ? 'Sarah Johnson' : undefined,
          status,
          notes: status === 'administered' ? 'Given with breakfast' : undefined
        })
      })
    }
  })
  
  return administrations
}

export default function MedicationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentUser } = useStore()
  const [loading, setLoading] = useState(true)
  const [medications, setMedications] = useState<Medication[]>([])
  const [administrations, setAdministrations] = useState<MedicationAdministration[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<MedicationAdministration | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [refusalReason, setRefusalReason] = useState('')
  const [activeTab, setActiveTab] = useState('administer')
  const [showMARDialog, setShowMARDialog] = useState(false)
  const [showPRNDialog, setShowPRNDialog] = useState(false)
  const [selectedParticipantMAR, setSelectedParticipantMAR] = useState<string | null>(null)
  const [prnReason, setPrnReason] = useState('')
  const [prnMedication, setPrnMedication] = useState<Medication | null>(null)
  const [inventory, setInventory] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    // Generate mock data
    const meds = generateMedications()
    const admins = generateAdministrations(meds)
    setMedications(meds)
    setAdministrations(admins)
    
    // Generate mock inventory
    const mockInventory = new Map<string, number>()
    const uniqueMeds = Array.from(new Set(meds.map(m => m.name)))
    uniqueMeds.forEach(medName => {
      mockInventory.set(medName, Math.floor(Math.random() * 200) + 50)
    })
    setInventory(mockInventory)
    
    setLoading(false)
  }, [])

  const getPendingCount = () => {
    return administrations.filter(a => a.status === 'pending').length
  }

  const getMissedCount = () => {
    return administrations.filter(a => a.status === 'missed').length
  }

  const getComplianceRate = () => {
    const completed = administrations.filter(a => 
      a.status === 'administered' || a.status === 'pending'
    ).length
    const total = administrations.filter(a => 
      a.scheduledTime < new Date()
    ).length
    return total > 0 ? Math.round((completed / total) * 100) : 100
  }

  const handleAdminister = (admin: MedicationAdministration) => {
    setSelectedAdmin(admin)
    setShowAdminDialog(true)
  }

  const submitAdministration = (status: 'administered' | 'refused') => {
    if (!selectedAdmin) return

    const now = new Date()
    setAdministrations(prev => prev.map(a => 
      a.id === selectedAdmin.id
        ? {
            ...a,
            status,
            administeredTime: now,
            administeredBy: currentUser?.name || 'Staff',
            notes: adminNotes,
            reason: status === 'refused' ? refusalReason : undefined
          }
        : a
    ))

    toast({
      title: status === 'administered' ? 'Medication Administered' : 'Medication Refused',
      description: `Recorded for ${medications.find(m => m.id === selectedAdmin.medicationId)?.participantName}`
    })

    setShowAdminDialog(false)
    setSelectedAdmin(null)
    setAdminNotes('')
    setRefusalReason('')
  }

  const getFilteredAdministrations = () => {
    let filtered = administrations

    if (selectedParticipant !== 'all') {
      filtered = filtered.filter(a => a.participantId === selectedParticipant)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(a => a.status === selectedStatus)
    }

    return filtered.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
  }

  const getParticipantMedications = (participantId: string) => {
    return medications.filter(m => m.participantId === participantId && m.active)
  }

  const getStatusBadge = (status: MedicationAdministration['status']) => {
    switch (status) {
      case 'administered':
        return <Badge className="bg-green-100 text-green-800">Administered</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>
      case 'refused':
        return <Badge className="bg-orange-100 text-orange-800">Refused</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading medications...</div>
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
              <h1 className="text-3xl font-bold">Medication Management</h1>
              <p className="text-gray-600 mt-1">Track and administer participant medications</p>
            </div>
            <Button onClick={() => router.push('/setup/participants')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pending Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{getPendingCount()}</div>
                <p className="text-sm text-gray-500">Due for administration</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Administered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {administrations.filter(a => a.status === 'administered').length}
                </div>
                <p className="text-sm text-gray-500">Completed today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Missed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{getMissedCount()}</div>
                <p className="text-sm text-gray-500">Requires follow-up</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getComplianceRate()}%</div>
                <p className="text-sm text-gray-500">Today's compliance</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="administer">
              Administration ({getPendingCount()})
            </TabsTrigger>
            <TabsTrigger value="medications">All Medications</TabsTrigger>
            <TabsTrigger value="prn">PRN Medications</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Administration Tab */}
          <TabsContent value="administer" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Participants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Participants</SelectItem>
                      {Array.from(new Set(medications.map(m => m.participantId))).map(id => {
                        const participant = medications.find(m => m.participantId === id)
                        return (
                          <SelectItem key={id} value={id}>
                            {participant?.participantName}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="administered">Administered</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                      <SelectItem value="refused">Refused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Administration List */}
            <div className="space-y-4">
              {getFilteredAdministrations().map(admin => {
                const medication = medications.find(m => m.id === admin.medicationId)
                if (!medication) return null

                return (
                  <Card key={admin.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {medication.participantName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{medication.participantName}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Pill className="h-3 w-3" />
                                {medication.name} {medication.dosage}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(admin.scheduledTime, 'h:mm a')}
                              </span>
                              {medication.type === 'prn' && (
                                <Badge variant="outline" className="text-xs">PRN</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(admin.status)}
                          {admin.status === 'pending' && (
                            <Button onClick={() => handleAdminister(admin)}>
                              Administer
                            </Button>
                          )}
                          {admin.status === 'administered' && admin.administeredBy && (
                            <div className="text-sm text-gray-500">
                              by {admin.administeredBy} at {format(admin.administeredTime!, 'h:mm a')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {admin.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Notes:</span> {admin.notes}
                        </div>
                      )}
                      
                      {admin.reason && (
                        <div className="mt-3 p-3 bg-orange-50 rounded text-sm">
                          <span className="font-medium">Refusal Reason:</span> {admin.reason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* All Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Medications</CardTitle>
                <CardDescription>All current medications by participant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.from(new Set(medications.map(m => m.participantId))).map(participantId => {
                    const participant = medications.find(m => m.participantId === participantId)
                    const participantMeds = getParticipantMedications(participantId)
                    
                    return (
                      <div key={participantId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {participant?.participantName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{participant?.participantName}</h4>
                              <p className="text-sm text-gray-500">{participantMeds.length} active medications</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedParticipantMAR(participantId)
                              setShowMARDialog(true)
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View MAR
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          {participantMeds.map(med => (
                            <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{med.name}</span>
                                  <Badge variant="outline">{med.dosage}</Badge>
                                  {med.type === 'prn' && (
                                    <Badge className="bg-purple-100 text-purple-800">PRN</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {med.type === 'regular' ? (
                                    <span>
                                      {med.schedule.map(s => `${s.time}`).join(', ')} daily
                                    </span>
                                  ) : (
                                    <span>{med.instructions}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost">
                                  <History className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRN Medications Tab */}
          <TabsContent value="prn" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PRN Medications</CardTitle>
                <CardDescription>As-needed medications available for administration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medications.filter(m => m.type === 'prn' && m.active).map(med => (
                    <div key={med.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {med.participantName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{med.participantName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-purple-50">
                              {med.name} {med.dosage}
                            </Badge>
                            <span className="text-sm text-gray-500">{med.instructions}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Prescribed by {med.prescriber}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setPrnMedication(med)
                            setShowPRNDialog(true)
                          }}
                        >
                          <Pill className="h-4 w-4 mr-2" />
                          Administer PRN
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent PRN Administrations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent PRN Administrations</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { participant: 'James Mitchell', medication: 'Lorazepam 1mg', time: '2:45 PM', reason: 'Anxiety during group activity', staff: 'Sarah Johnson' },
                    { participant: 'Emma Wilson', medication: 'Paracetamol 500mg', time: '11:30 AM', reason: 'Headache complaint', staff: 'Tom Anderson' },
                    { participant: 'Michael Brown', medication: 'Lorazepam 1mg', time: '9:15 AM', reason: 'Pre-appointment anxiety', staff: 'Emily Chen' }
                  ].map((prn, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{prn.participant}</div>
                        <div className="text-sm text-gray-600">
                          {prn.medication} - {prn.reason}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{prn.time}</div>
                        <div className="text-sm text-gray-500">{prn.staff}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Medication Inventory</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Inventory
                </Button>
                <Button>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Order
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total Stock Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,450</div>
                  <p className="text-sm text-gray-500">Across all medications</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Low Stock Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <p className="text-sm text-gray-500">Require reordering</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Expiring Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">2</div>
                  <p className="text-sm text-gray-500">Within 30 days</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Stock Levels</CardTitle>
                <CardDescription>Monitor medication quantities and expiry dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(inventory.entries()).map(([medName, quantity]) => {
                    const isLowStock = quantity < 100
                    const expiryDate = new Date()
                    expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 12) + 1)
                    const isExpiringSoon = expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    
                    return (
                      <div key={medName} className="flex items-center justify-between p-4 border rounded">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded ${
                            isLowStock ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}>
                            <Package className={`h-5 w-5 ${
                              isLowStock ? 'text-yellow-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium">{medName}</div>
                            <div className="text-sm text-gray-500">
                              Expires: {format(expiryDate, 'MMM d, yyyy')}
                              {isExpiringSoon && (
                                <Badge variant="destructive" className="ml-2">Expiring Soon</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{quantity} units</div>
                            <div className="text-sm text-gray-500">
                              {isLowStock ? 'Low Stock' : 'In Stock'}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Usage Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Monthly consumption rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mr-2" />
                  Usage chart would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Administration History</CardTitle>
                <CardDescription>Recent medication administrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {administrations
                    .filter(a => a.status !== 'pending')
                    .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
                    .slice(0, 10)
                    .map(admin => {
                      const medication = medications.find(m => m.id === admin.medicationId)
                      if (!medication) return null

                      return (
                        <div key={admin.id} className="flex items-center justify-between p-4 border rounded">
                          <div>
                            <div className="font-medium">
                              {medication.participantName} - {medication.name} {medication.dosage}
                            </div>
                            <div className="text-sm text-gray-500">
                              Scheduled: {format(admin.scheduledTime, 'MMM d, h:mm a')}
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(admin.status)}
                            {admin.administeredBy && (
                              <div className="text-sm text-gray-500 mt-1">
                                {admin.administeredBy}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Administration Dialog */}
        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Medication Administration</DialogTitle>
              <DialogDescription>
                Record medication administration details
              </DialogDescription>
            </DialogHeader>
            
            {selectedAdmin && medications.find(m => m.id === selectedAdmin.medicationId) && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-gray-50 rounded">
                  <div className="font-medium">
                    {medications.find(m => m.id === selectedAdmin.medicationId)?.participantName}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {medications.find(m => m.id === selectedAdmin.medicationId)?.name} {' '}
                    {medications.find(m => m.id === selectedAdmin.medicationId)?.dosage}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Scheduled: {format(selectedAdmin.scheduledTime, 'h:mm a')}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Administration Notes</Label>
                  <Textarea
                    id="notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Any observations or notes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => submitAdministration('administered')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Administration
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setRefusalReason('')
                      // In a real app, this would open a refusal dialog
                      submitAdministration('refused')
                    }}
                  >
                    Record Refusal
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* MAR Sheet Dialog */}
        <Dialog open={showMARDialog} onOpenChange={setShowMARDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Medication Administration Record (MAR)</DialogTitle>
              <DialogDescription>
                Weekly medication administration record for {
                  selectedParticipantMAR && medications.find(m => m.participantId === selectedParticipantMAR)?.participantName
                }
              </DialogDescription>
            </DialogHeader>
            
            {selectedParticipantMAR && (
              <div className="py-4">
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="font-medium">Week of {format(new Date(), 'MMM d, yyyy')}</h4>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export MAR
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Medication</th>
                        <th className="text-center p-2">Time</th>
                        {[0, 1, 2, 3, 4, 5, 6].map(day => (
                          <th key={day} className="text-center p-2 min-w-[80px]">
                            {format(new Date(Date.now() + day * 24 * 60 * 60 * 1000), 'EEE')}
                            <br />
                            <span className="text-xs font-normal">
                              {format(new Date(Date.now() + day * 24 * 60 * 60 * 1000), 'MMM d')}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getParticipantMedications(selectedParticipantMAR)
                        .filter(med => med.type === 'regular')
                        .map(med => (
                          med.schedule.map((schedule, scheduleIndex) => (
                            <tr key={`${med.id}-${scheduleIndex}`} className="border-b">
                              {scheduleIndex === 0 && (
                                <td rowSpan={med.schedule.length} className="p-2 font-medium">
                                  {med.name} {med.dosage}
                                </td>
                              )}
                              <td className="text-center p-2">{schedule.time}</td>
                              {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                const isToday = day === 0
                                const administered = isToday && Math.random() > 0.2
                                return (
                                  <td key={day} className="text-center p-2">
                                    {isToday ? (
                                      administered ? (
                                        <div className="flex flex-col items-center">
                                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                                          <span className="text-xs text-gray-500">SJ</span>
                                        </div>
                                      ) : (
                                        <div className="w-6 h-6 border-2 border-gray-300 rounded" />
                                      )
                                    ) : (
                                      <div className="w-6 h-6 border-2 border-gray-300 rounded" />
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))
                        ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 space-y-2">
                  <h4 className="font-medium">Legend</h4>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Administered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      <span>Refused</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                      <span>Pending/Not Given</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMARDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PRN Administration Dialog */}
        <Dialog open={showPRNDialog} onOpenChange={setShowPRNDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>PRN Medication Administration</DialogTitle>
              <DialogDescription>
                Record the administration of as-needed medication
              </DialogDescription>
            </DialogHeader>
            
            {prnMedication && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-purple-50 rounded">
                  <div className="font-medium">{prnMedication.participantName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {prnMedication.name} {prnMedication.dosage}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {prnMedication.instructions}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Administration *</Label>
                  <Textarea
                    id="reason"
                    value={prnReason}
                    onChange={(e) => setPrnReason(e.target.value)}
                    placeholder="Describe the reason for administering this PRN medication..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="prn-notes">Additional Notes</Label>
                  <Textarea
                    id="prn-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Any observations or additional notes..."
                    rows={2}
                  />
                </div>

                <div className="p-3 bg-yellow-50 rounded text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-600 inline mr-2" />
                  Last administered: 3 days ago (Max frequency: Every 4 hours)
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPRNDialog(false)
                  setPrnReason('')
                  setAdminNotes('')
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (!prnReason.trim()) {
                    toast({
                      title: 'Reason Required',
                      description: 'Please provide a reason for PRN administration',
                      variant: 'destructive'
                    })
                    return
                  }
                  
                  // Create a new administration record
                  const newAdmin: MedicationAdministration = {
                    id: `prn-${Date.now()}`,
                    medicationId: prnMedication!.id,
                    participantId: prnMedication!.participantId,
                    scheduledTime: new Date(),
                    administeredTime: new Date(),
                    administeredBy: currentUser?.name || 'Staff',
                    status: 'administered',
                    notes: `PRN - Reason: ${prnReason}. ${adminNotes}`.trim(),
                    reason: prnReason
                  }
                  
                  setAdministrations(prev => [...prev, newAdmin])
                  
                  toast({
                    title: 'PRN Medication Administered',
                    description: `${prnMedication!.name} given to ${prnMedication!.participantName}`
                  })
                  
                  setShowPRNDialog(false)
                  setPrnReason('')
                  setAdminNotes('')
                }}
                disabled={!prnReason.trim()}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Administration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}