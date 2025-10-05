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

interface WebsterPackSlot {
  id: string
  participantName: string
  sessionTime: 'Morning' | 'Afternoon' | 'Evening' | 'Night'
  medications: {
    name: string
    dosage: string
    pillCount: number
  }[]
  totalPills: number
  status: 'pending' | 'administered' | 'missed' | 'refused'
  scheduledTime: Date
}

// Generate mock medications - consistent for each participant
const generateMedications = (): Medication[] => {
  const medications: Medication[] = []

  // James Mitchell - Risperidone (regular), Sertraline (regular), Ibuprofen (PRN)
  medications.push(
    {
      id: 'med-0-0',
      participantId: 'p-0',
      participantName: 'James Mitchell',
      name: 'Risperidone',
      dosage: '2mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'regular',
      schedule: [
        { time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        { time: '18:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take with food',
      sideEffects: ['Drowsiness', 'Dry mouth'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-0-1',
      participantId: 'p-0',
      participantName: 'James Mitchell',
      name: 'Sertraline',
      dosage: '50mg',
      prescriber: 'Dr. John Smith',
      type: 'regular',
      schedule: [
        { time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take with food',
      sideEffects: ['Nausea', 'Headache'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-0-2',
      participantId: 'p-0',
      participantName: 'James Mitchell',
      name: 'Ibuprofen',
      dosage: '400mg',
      prescriber: 'Dr. John Smith',
      type: 'prn',
      schedule: [],
      instructions: 'As needed for pain or inflammation',
      sideEffects: ['Stomach upset', 'Nausea'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-0-3',
      participantId: 'p-0',
      participantName: 'James Mitchell',
      name: 'Melatonin',
      dosage: '3mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'regular',
      schedule: [
        { time: '00:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take before bed',
      sideEffects: ['Drowsiness'],
      startDate: new Date(2024, 0, 1),
      active: true
    }
  )

  // Sarah Chen - Risperidone (regular), Sertraline (regular), Melatonin (regular), Ondansetron (PRN)
  medications.push(
    {
      id: 'med-1-0',
      participantId: 'p-1',
      participantName: 'Sarah Chen',
      name: 'Risperidone',
      dosage: '2mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'regular',
      schedule: [
        { time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        { time: '00:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take with food',
      sideEffects: ['Drowsiness', 'Dry mouth'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-1-1',
      participantId: 'p-1',
      participantName: 'Sarah Chen',
      name: 'Sertraline',
      dosage: '50mg',
      prescriber: 'Dr. John Smith',
      type: 'regular',
      schedule: [
        { time: '18:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take with food',
      sideEffects: ['Nausea', 'Headache'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-1-2',
      participantId: 'p-1',
      participantName: 'Sarah Chen',
      name: 'Melatonin',
      dosage: '3mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'regular',
      schedule: [
        { time: '00:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take before bed',
      sideEffects: ['Drowsiness'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-1-3',
      participantId: 'p-1',
      participantName: 'Sarah Chen',
      name: 'Ondansetron',
      dosage: '4mg',
      prescriber: 'Dr. John Smith',
      type: 'prn',
      schedule: [],
      instructions: 'As needed for nausea and vomiting',
      sideEffects: ['Headache', 'Constipation'],
      startDate: new Date(2024, 0, 1),
      active: true
    }
  )

  // Michael Brown - Risperidone (regular), Melatonin (regular), Buscopan (PRN)
  medications.push(
    {
      id: 'med-2-0',
      participantId: 'p-2',
      participantName: 'Michael Brown',
      name: 'Risperidone',
      dosage: '2mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'regular',
      schedule: [
        { time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        { time: '18:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take with food',
      sideEffects: ['Drowsiness', 'Dry mouth'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-2-1',
      participantId: 'p-2',
      participantName: 'Michael Brown',
      name: 'Melatonin',
      dosage: '3mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'regular',
      schedule: [
        { time: '00:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take before bed',
      sideEffects: ['Drowsiness'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-2-2',
      participantId: 'p-2',
      participantName: 'Michael Brown',
      name: 'Buscopan',
      dosage: '10mg',
      prescriber: 'Dr. John Smith',
      type: 'prn',
      schedule: [],
      instructions: 'As needed for abdominal cramps',
      sideEffects: ['Dry mouth', 'Blurred vision'],
      startDate: new Date(2024, 0, 1),
      active: true
    }
  )

  // Emma Wilson - Sertraline (regular), Paracetamol (PRN)
  medications.push(
    {
      id: 'med-3-0',
      participantId: 'p-3',
      participantName: 'Emma Wilson',
      name: 'Sertraline',
      dosage: '50mg',
      prescriber: 'Dr. John Smith',
      type: 'regular',
      schedule: [
        { time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        { time: '18:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take with food',
      sideEffects: ['Nausea', 'Headache'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-3-1',
      participantId: 'p-3',
      participantName: 'Emma Wilson',
      name: 'Melatonin',
      dosage: '3mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'regular',
      schedule: [
        { time: '00:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take before bed',
      sideEffects: ['Drowsiness'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-3-2',
      participantId: 'p-3',
      participantName: 'Emma Wilson',
      name: 'Paracetamol',
      dosage: '500mg',
      prescriber: 'Dr. John Smith',
      type: 'prn',
      schedule: [],
      instructions: 'As needed for headache or pain',
      sideEffects: ['Rare: Skin rash'],
      startDate: new Date(2024, 0, 1),
      active: true
    }
  )

  // David Lee - Risperidone (regular), Lorazepam (PRN)
  medications.push(
    {
      id: 'med-4-0',
      participantId: 'p-4',
      participantName: 'David Lee',
      name: 'Risperidone',
      dosage: '2mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'regular',
      schedule: [
        { time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take with food',
      sideEffects: ['Drowsiness', 'Dry mouth'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-4-1',
      participantId: 'p-4',
      participantName: 'David Lee',
      name: 'Lorazepam',
      dosage: '1mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'prn',
      schedule: [],
      instructions: 'As needed for anxiety',
      sideEffects: ['Drowsiness', 'Dizziness'],
      startDate: new Date(2024, 0, 1),
      active: true
    }
  )

  // Lisa Thompson - Risperidone (regular), Sertraline (regular)
  medications.push(
    {
      id: 'med-5-0',
      participantId: 'p-5',
      participantName: 'Lisa Thompson',
      name: 'Risperidone',
      dosage: '2mg',
      prescriber: 'Dr. Sarah Kim',
      type: 'regular',
      schedule: [
        { time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take with food',
      sideEffects: ['Drowsiness', 'Dry mouth'],
      startDate: new Date(2024, 0, 1),
      active: true
    },
    {
      id: 'med-5-1',
      participantId: 'p-5',
      participantName: 'Lisa Thompson',
      name: 'Sertraline',
      dosage: '50mg',
      prescriber: 'Dr. John Smith',
      type: 'regular',
      schedule: [
        { time: '08:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
      ],
      instructions: 'Take with food',
      sideEffects: ['Nausea', 'Headache'],
      startDate: new Date(2024, 0, 1),
      active: true
    }
  )

  return medications
}

// Generate comprehensive administrations including history from previous shifts
const generateAdministrations = (medications: Medication[]): MedicationAdministration[] => {
  const administrations: MedicationAdministration[] = []
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  // Staff members for different shifts
  const staffMembers = [
    { name: 'Bernard Adjei', shift: 'day' },        // 7AM-3PM
    { name: 'Emily Chen', shift: 'evening' },       // 3PM-11PM
    { name: 'Tom Anderson', shift: 'night' }        // 11PM-7AM
  ]

  // Shift times: Morning (8AM), Afternoon (12PM), Evening (6PM), Night (12AM/midnight)
  const shiftSchedules = [
    { time: '08:00', label: 'Morning', staff: 'Bernard Adjei' },
    { time: '12:00', label: 'Afternoon', staff: 'Bernard Adjei' },
    { time: '18:00', label: 'Evening', staff: 'Emily Chen' },
    { time: '00:00', label: 'Night', staff: 'Tom Anderson' }
  ]

  // Generate today's administrations
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

        // Determine staff based on time
        let staffName = 'Bernard Adjei'
        if (hour >= 15 && hour < 23) staffName = 'Emily Chen'
        else if (hour >= 23 || hour < 7) staffName = 'Tom Anderson'

        administrations.push({
          id: `admin-${med.id}-${schedule.time}-today`,
          medicationId: med.id,
          participantId: med.participantId,
          scheduledTime,
          administeredTime: status === 'administered' ? scheduledTime : undefined,
          administeredBy: status === 'administered' ? staffName : undefined,
          status,
          notes: status === 'administered' ? `${schedule.time.startsWith('08') ? 'Given with breakfast' : schedule.time.startsWith('12') ? 'Given with lunch' : schedule.time.startsWith('18') ? 'Given with dinner' : 'Bedtime medication'}` : undefined
        })
      })
    }
  })

  // Generate yesterday's full history (Oct 5, 2025)
  medications.forEach(med => {
    if (med.type === 'regular') {
      // Morning medications - 8:00 AM (Bernard Adjei)
      const morningTime = new Date(yesterday)
      morningTime.setHours(8, 0, 0, 0)
      administrations.push({
        id: `admin-${med.id}-yesterday-morning`,
        medicationId: med.id,
        participantId: med.participantId,
        scheduledTime: morningTime,
        administeredTime: morningTime,
        administeredBy: 'Bernard Adjei',
        status: 'administered',
        notes: 'Given with breakfast'
      })

      // Afternoon medications - 12:00 PM (Bernard Adjei)
      if (Math.random() > 0.3) {
        const afternoonTime = new Date(yesterday)
        afternoonTime.setHours(12, 0, 0, 0)
        administrations.push({
          id: `admin-${med.id}-yesterday-afternoon`,
          medicationId: med.id,
          participantId: med.participantId,
          scheduledTime: afternoonTime,
          administeredTime: afternoonTime,
          administeredBy: 'Bernard Adjei',
          status: 'administered',
          notes: 'Lunch time dose'
        })
      }

      // Evening medications - 6:00 PM (Emily Chen)
      const eveningTime = new Date(yesterday)
      eveningTime.setHours(18, 0, 0, 0)
      administrations.push({
        id: `admin-${med.id}-yesterday-evening`,
        medicationId: med.id,
        participantId: med.participantId,
        scheduledTime: eveningTime,
        administeredTime: eveningTime,
        administeredBy: 'Emily Chen',
        status: 'administered',
        notes: 'Given with evening meal'
      })

      // Night medications - 12:00 AM midnight (Tom Anderson)
      if (med.participantName.includes('James') || med.participantName.includes('Sarah') || med.participantName.includes('Michael')) {
        const nightTime = new Date(today)
        nightTime.setHours(0, 0, 0, 0)
        administrations.push({
          id: `admin-${med.id}-last-night`,
          medicationId: med.id,
          participantId: med.participantId,
          scheduledTime: nightTime,
          administeredTime: nightTime,
          administeredBy: 'Tom Anderson',
          status: 'administered',
          notes: 'Bedtime medication'
        })
      }
    }
  })

  // Generate 2 days ago history (Oct 4, 2025) - partial
  medications.forEach(med => {
    if (med.type === 'regular' && Math.random() > 0.3) {
      // Morning medications
      const morningTime = new Date(twoDaysAgo)
      morningTime.setHours(8, 0, 0, 0)
      administrations.push({
        id: `admin-${med.id}-two-days-morning`,
        medicationId: med.id,
        participantId: med.participantId,
        scheduledTime: morningTime,
        administeredTime: morningTime,
        administeredBy: 'Bernard Adjei',
        status: 'administered',
        notes: 'Morning dose administered'
      })

      // Evening medications
      const eveningTime = new Date(twoDaysAgo)
      eveningTime.setHours(18, 0, 0, 0)
      administrations.push({
        id: `admin-${med.id}-two-days-evening`,
        medicationId: med.id,
        participantId: med.participantId,
        scheduledTime: eveningTime,
        administeredTime: eveningTime,
        administeredBy: 'Emily Chen',
        status: 'administered',
        notes: 'Evening dose given'
      })
    }
  })

  return administrations
}

// Generate Webster Pack slots for today
const generateWebsterPacks = (medications: Medication[]): WebsterPackSlot[] => {
  const websterSlots: WebsterPackSlot[] = []
  const today = new Date()

  // Only use participants from current shift (first 3)
  const shiftParticipants = ['James Mitchell', 'Sarah Chen', 'Michael Brown']

  const sessions = [
    { time: 'Morning' as const, hour: 8, minute: 0 },
    { time: 'Afternoon' as const, hour: 12, minute: 0 },
    { time: 'Evening' as const, hour: 18, minute: 0 },
    { time: 'Night' as const, hour: 22, minute: 0 }
  ]

  shiftParticipants.forEach(participantName => {
    sessions.forEach(session => {
      const scheduledTime = new Date(today)
      scheduledTime.setHours(session.hour, session.minute, 0, 0)

      // Generate medications for this slot
      const slotMedications = []
      const numMeds = Math.floor(Math.random() * 3) + 1 // 1-3 medications per slot

      const medicationPool = [
        { name: 'Risperidone', dosage: '2mg', pillCount: 1 },
        { name: 'Sertraline', dosage: '50mg', pillCount: 1 },
        { name: 'Metformin', dosage: '500mg', pillCount: 2 },
        { name: 'Vitamin D', dosage: '1000IU', pillCount: 1 },
        { name: 'Aspirin', dosage: '100mg', pillCount: 1 }
      ]

      for (let i = 0; i < numMeds; i++) {
        const med = medicationPool[Math.floor(Math.random() * medicationPool.length)]
        slotMedications.push({ ...med })
      }

      const totalPills = slotMedications.reduce((sum, med) => sum + med.pillCount, 0)

      // Determine status based on time
      const isPast = scheduledTime < new Date()
      const status = isPast
        ? Math.random() > 0.15 ? 'administered' : 'missed'
        : 'pending'

      websterSlots.push({
        id: `webster-${participantName}-${session.time}`,
        participantName,
        sessionTime: session.time,
        medications: slotMedications,
        totalPills,
        status,
        scheduledTime
      })
    })
  })

  return websterSlots
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
  const [websterPacks, setWebsterPacks] = useState<WebsterPackSlot[]>([])
  const [lastPharmacySync, setLastPharmacySync] = useState<Date>(new Date(Date.now() - 2 * 60 * 60 * 1000))

  useEffect(() => {
    // Generate mock data
    const meds = generateMedications()
    const admins = generateAdministrations(meds)
    const packs = generateWebsterPacks(meds)
    setMedications(meds)
    setAdministrations(admins)
    setWebsterPacks(packs)

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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return administrations.filter(a =>
      a.status === 'pending' &&
      a.scheduledTime >= today &&
      a.scheduledTime < tomorrow
    ).length
  }

  const getMissedCount = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return administrations.filter(a =>
      a.status === 'missed' &&
      a.scheduledTime >= today &&
      a.scheduledTime < tomorrow
    ).length
  }

  const getComplianceRate = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const now = new Date()

    // Only count doses that were due (scheduled time has passed)
    const dueTodayAdmins = administrations.filter(a =>
      a.scheduledTime >= today &&
      a.scheduledTime < tomorrow &&
      a.scheduledTime < now  // Only doses that were actually due
    )

    const administered = dueTodayAdmins.filter(a => a.status === 'administered').length
    const total = dueTodayAdmins.length

    return total > 0 ? Math.round((administered / total) * 100) : 0
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

  const handleWebsterPackAdmin = (slotId: string) => {
    setWebsterPacks(prev => prev.map(slot =>
      slot.id === slotId
        ? {
            ...slot,
            status: 'administered',
            scheduledTime: new Date()
          }
        : slot
    ))

    const slot = websterPacks.find(s => s.id === slotId)
    if (slot) {
      toast({
        title: 'Webster Pack Administered',
        description: `${slot.sessionTime} medications given to ${slot.participantName}`
      })
    }
  }

  const getSessionIcon = (sessionTime: string) => {
    const now = new Date()
    const hour = now.getHours()

    switch (sessionTime) {
      case 'Morning':
        return hour >= 8 ? '☀️' : '🌅'
      case 'Afternoon':
        return '🌤️'
      case 'Evening':
        return '🌆'
      case 'Night':
        return '🌙'
      default:
        return '💊'
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
                  {(() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const tomorrow = new Date(today)
                    tomorrow.setDate(tomorrow.getDate() + 1)

                    return administrations.filter(a =>
                      a.status === 'administered' &&
                      a.scheduledTime >= today &&
                      a.scheduledTime < tomorrow
                    ).length
                  })()}
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
            <TabsTrigger value="webster">
              <Package className="h-4 w-4 mr-2" />
              Webster Packs
            </TabsTrigger>
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
                    { participant: 'James Mitchell', medication: 'Ibuprofen 400mg', time: '2:45 PM', reason: 'Joint pain complaint', staff: 'Bernard Adjei' },
                    { participant: 'Emma Wilson', medication: 'Paracetamol 500mg', time: '11:30 AM', reason: 'Headache complaint', staff: 'Tom Anderson' },
                    { participant: 'Michael Brown', medication: 'Buscopan 10mg', time: '9:15 AM', reason: 'Abdominal cramps', staff: 'Emily Chen' },
                    { participant: 'David Lee', medication: 'Lorazepam 1mg', time: '7:20 AM', reason: 'Morning anxiety episode', staff: 'Bernard Adjei' },
                    { participant: 'Sarah Chen', medication: 'Ondansetron 4mg', time: 'Yesterday 8:30 PM', reason: 'Nausea after dinner', staff: 'Emily Chen' }
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

          {/* Webster Packs Tab */}
          <TabsContent value="webster" className="space-y-6">
            {/* Pharmacy Sync Status */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Pharmacy Sync Status</div>
                      <div className="text-sm text-gray-500">
                        Last synced: {Math.floor((Date.now() - lastPharmacySync.getTime()) / (1000 * 60 * 60))} hours ago
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Synced</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Today's Webster Pack Sessions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Today's Medication Sessions</h3>
              <p className="text-sm text-gray-500 mb-4">
                Webster pack medications organized by timing slot for current shift participants
              </p>

              {/* Group by session time */}
              {['Morning', 'Afternoon', 'Evening', 'Night'].map(sessionTime => {
                const sessionSlots = websterPacks.filter(slot => slot.sessionTime === sessionTime)
                const sessionScheduledTime = sessionSlots[0]?.scheduledTime

                if (sessionSlots.length === 0) return null

                return (
                  <div key={sessionTime} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{getSessionIcon(sessionTime)}</span>
                      <h4 className="text-lg font-medium">{sessionTime}</h4>
                      <span className="text-sm text-gray-500">
                        {sessionScheduledTime && format(sessionScheduledTime, 'h:mm a')}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {sessionSlots.map(slot => (
                        <Card key={slot.id} className={
                          slot.status === 'administered' ? 'border-green-200 bg-green-50' :
                          slot.status === 'missed' ? 'border-red-200 bg-red-50' :
                          'border-gray-200'
                        }>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{slot.participantName}</CardTitle>
                              {slot.status === 'administered' ? (
                                <Badge className="bg-green-100 text-green-800">Administered</Badge>
                              ) : slot.status === 'missed' ? (
                                <Badge variant="destructive">Missed</Badge>
                              ) : slot.status === 'refused' ? (
                                <Badge className="bg-orange-100 text-orange-800">Refused</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {/* Medications List */}
                              <div className="space-y-2">
                                {slot.medications.map((med, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <Pill className="h-3 w-3 text-gray-400" />
                                      <span>{med.name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {med.dosage}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {med.pillCount} pill{med.pillCount > 1 ? 's' : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Total Pills Count */}
                              <div className="pt-3 border-t">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">
                                    Total Expected Pills:
                                  </span>
                                  <span className="text-lg font-bold text-blue-600">
                                    {slot.totalPills}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Verify pill count before administration
                                </p>
                              </div>

                              {/* Administration Button */}
                              {slot.status === 'pending' && (
                                <Button
                                  className="w-full mt-2"
                                  onClick={() => handleWebsterPackAdmin(slot.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark as Administered
                                </Button>
                              )}

                              {slot.status === 'administered' && (
                                <div className="text-sm text-gray-600 mt-2 p-2 bg-white rounded">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 inline mr-1" />
                                  Given by {currentUser?.name || 'Staff'}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Webster Pack Information */}
            <Card>
              <CardHeader>
                <CardTitle>Webster Pack Information</CardTitle>
                <CardDescription>
                  NDIS medication management system for weekly medication organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Pill Count Verification:</span> Always verify the total pill count matches the expected count before administration to catch pharmacy packing errors.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Session Times:</span> Morning (8:00 AM), Afternoon (12:00 PM), Evening (6:00 PM), Night (10:00 PM)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Current Shift:</span> Only participants in the current shift are displayed.
                    </div>
                  </div>
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
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total Administered (48hrs)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {administrations.filter(a => a.status === 'administered' && a.scheduledTime > new Date(Date.now() - 48 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-sm text-gray-500">Across all shifts</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Last Night Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {administrations.filter(a => a.administeredBy === 'Tom Anderson' && a.scheduledTime > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-sm text-gray-500">By Tom Anderson</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Evening Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {administrations.filter(a => a.administeredBy === 'Emily Chen' && a.scheduledTime > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-sm text-gray-500">By Emily Chen</p>
                </CardContent>
              </Card>
            </div>

            {/* Administration History List */}
            <Card>
              <CardHeader>
                <CardTitle>Administration History</CardTitle>
                <CardDescription>Complete medication administration records from recent shifts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {administrations
                    .filter(a => a.status !== 'pending')
                    .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
                    .slice(0, 30)
                    .map(admin => {
                      const medication = medications.find(m => m.id === admin.medicationId)
                      if (!medication) return null

                      // Determine shift badge color based on staff
                      const getShiftBadge = (staffName?: string) => {
                        if (staffName === 'Tom Anderson') return <Badge className="bg-indigo-100 text-indigo-800">Night Shift</Badge>
                        if (staffName === 'Emily Chen') return <Badge className="bg-purple-100 text-purple-800">Evening Shift</Badge>
                        if (staffName === 'Bernard Adjei') return <Badge className="bg-blue-100 text-blue-800">Day Shift</Badge>
                        return <Badge variant="outline">Unknown</Badge>
                      }

                      return (
                        <div key={admin.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{medication.participantName}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{medication.name} {medication.dosage}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(admin.scheduledTime, 'MMM d, yyyy · h:mm a')}
                              </span>
                              {admin.notes && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span>{admin.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getShiftBadge(admin.administeredBy)}
                            {getStatusBadge(admin.status)}
                            {admin.administeredBy && (
                              <div className="text-right min-w-[100px]">
                                <div className="text-xs font-medium text-gray-700">{admin.administeredBy}</div>
                                <div className="text-xs text-gray-500">
                                  {admin.administeredTime && format(admin.administeredTime, 'h:mm a')}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>

                {administrations.filter(a => a.status !== 'pending').length > 30 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline">
                      Load More History
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
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