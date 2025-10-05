'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/hooks/use-toast'
import { DataService } from '@/lib/data/service'
import { Participant, Medication, BehaviorPattern } from '@/lib/types'
import { 
  UserPlus, Plus, Edit2, Trash2, Heart, Shield, 
  AlertTriangle, Search, Filter, ArrowLeft, ArrowRight,
  Calendar, Phone, Pill, Brain, FileText, User,
  Activity, Clock, CheckCircle2, Home
} from 'lucide-react'

const riskColors = {
  low: 'green',
  medium: 'yellow',
  high: 'red'
}

const statusColors = {
  calm: 'green',
  happy: 'blue',
  anxious: 'yellow',
  agitated: 'orange',
  resting: 'gray'
}

export default function ParticipantsSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFacility, setSelectedFacility] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')

  // Form data
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    dateOfBirth: '',
    ndisNumber: '',
    facility: '',
    riskLevel: 'low' as 'low' | 'medium' | 'high',
    profileImage: '',
    // Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    secondaryContactName: '',
    secondaryContactPhone: '',
    secondaryContactRelation: '',
    // Medical
    primaryDiagnosis: '',
    secondaryDiagnoses: '',
    allergies: '',
    dietaryRequirements: '',
    mobilityNeeds: '',
    communicationNeeds: '',
    // Support
    supportStrategies: [] as string[],
    preferences: [] as string[],
    goals: [] as string[],
    // Medications
    medications: [] as Omit<Medication, 'id'>[],
    // Behavior
    behaviorPatterns: [] as Omit<BehaviorPattern, 'id'>[]
  })

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    try {
      const data = await DataService.getParticipants()
      setParticipants(data)
    } catch (error) {
      console.error('Error loading participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: '',
        dosage: '',
        time: '',
        type: 'regular' as const
      }]
    }))
  }

  const updateMedication = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }))
  }

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const addBehaviorPattern = () => {
    setFormData(prev => ({
      ...prev,
      behaviorPatterns: [...prev.behaviorPatterns, {
        trigger: '',
        behavior: '',
        frequency: 0,
        timeOfDay: '',
        successfulInterventions: []
      }]
    }))
  }

  const updateBehaviorPattern = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      behaviorPatterns: prev.behaviorPatterns.map((bp, i) => 
        i === index ? { ...bp, [field]: value } : bp
      )
    }))
  }

  const removeBehaviorPattern = (index: number) => {
    setFormData(prev => ({
      ...prev,
      behaviorPatterns: prev.behaviorPatterns.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const required = ['name', 'dateOfBirth', 'facility', 'emergencyContactName', 'emergencyContactPhone']
    const missing = required.filter(field => !formData[field as keyof typeof formData])
    
    if (missing.length > 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return false
    }
    
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setSaving(true)
    try {
      const newParticipant: Participant = {
        id: editingParticipant?.id || `participant-${Date.now()}`,
        name: formData.name,
        facility: formData.facility,
        riskLevel: formData.riskLevel,
        currentStatus: 'calm',
        location: 'Unknown',
        medications: formData.medications.map((med, i) => ({
          ...med,
          id: `med-${Date.now()}-${i}`
        })),
        behaviorPatterns: formData.behaviorPatterns.map((bp, i) => ({
          ...bp,
          id: `bp-${Date.now()}-${i}`
        })),
        supportPlan: {
          id: `sp-${Date.now()}`,
          participantId: editingParticipant?.id || `participant-${Date.now()}`,
          strategies: formData.supportStrategies,
          preferences: formData.preferences,
          emergencyContacts: [
            {
              name: formData.emergencyContactName,
              role: formData.emergencyContactRelation,
              phone: formData.emergencyContactPhone
            },
            ...(formData.secondaryContactName ? [{
              name: formData.secondaryContactName,
              role: formData.secondaryContactRelation,
              phone: formData.secondaryContactPhone
            }] : [])
          ]
        }
      }

      if (editingParticipant) {
        setParticipants(prev => prev.map(p => 
          p.id === editingParticipant.id ? newParticipant : p
        ))
        toast({
          title: 'Participant Updated',
          description: `${formData.name}'s profile has been updated`
        })
      } else {
        setParticipants(prev => [...prev, newParticipant])
        toast({
          title: 'Participant Added',
          description: `${formData.name} has been added successfully`
        })
      }
      
      setShowAddDialog(false)
      setEditingParticipant(null)
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save participant',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant)
    setFormData({
      name: participant.name,
      dateOfBirth: '',
      ndisNumber: '',
      facility: participant.facility,
      riskLevel: participant.riskLevel,
      profileImage: '',
      emergencyContactName: participant.supportPlan.emergencyContacts[0]?.name || '',
      emergencyContactPhone: participant.supportPlan.emergencyContacts[0]?.phone || '',
      emergencyContactRelation: participant.supportPlan.emergencyContacts[0]?.role || '',
      secondaryContactName: participant.supportPlan.emergencyContacts[1]?.name || '',
      secondaryContactPhone: participant.supportPlan.emergencyContacts[1]?.phone || '',
      secondaryContactRelation: participant.supportPlan.emergencyContacts[1]?.role || '',
      primaryDiagnosis: '',
      secondaryDiagnoses: '',
      allergies: '',
      dietaryRequirements: '',
      mobilityNeeds: '',
      communicationNeeds: '',
      supportStrategies: participant.supportPlan.strategies,
      preferences: participant.supportPlan.preferences,
      goals: [],
      medications: participant.medications.map(({ id, ...med }) => med),
      behaviorPatterns: participant.behaviorPatterns.map(({ id, ...bp }) => bp)
    })
    setShowAddDialog(true)
    setActiveTab('basic')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return
    
    setParticipants(prev => prev.filter(p => p.id !== id))
    toast({
      title: 'Participant Removed',
      description: 'The participant has been removed'
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      dateOfBirth: '',
      ndisNumber: '',
      facility: '',
      riskLevel: 'low',
      profileImage: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      secondaryContactName: '',
      secondaryContactPhone: '',
      secondaryContactRelation: '',
      primaryDiagnosis: '',
      secondaryDiagnoses: '',
      allergies: '',
      dietaryRequirements: '',
      mobilityNeeds: '',
      communicationNeeds: '',
      supportStrategies: [],
      preferences: [],
      goals: [],
      medications: [],
      behaviorPatterns: []
    })
    setActiveTab('basic')
  }

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFacility = selectedFacility === 'all' || p.facility === selectedFacility
    const matchesRisk = selectedRisk === 'all' || p.riskLevel === selectedRisk
    
    return matchesSearch && matchesFacility && matchesRisk
  })

  const participantsByRisk = {
    low: participants.filter(p => p.riskLevel === 'low').length,
    medium: participants.filter(p => p.riskLevel === 'medium').length,
    high: participants.filter(p => p.riskLevel === 'high').length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading participants...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => router.push('/setup')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Setup
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Participants</h1>
                <p className="text-gray-600">Manage participant profiles and support plans</p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Participant
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{participants.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Low Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {participantsByRisk.low}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Medium Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {participantsByRisk.medium}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                High Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {participantsByRisk.high}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Facilities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  <SelectItem value="650e8400-e29b-41d4-a716-446655440001">House 1</SelectItem>
                  <SelectItem value="650e8400-e29b-41d4-a716-446655440002">House 2</SelectItem>
                  <SelectItem value="650e8400-e29b-41d4-a716-446655440003">House 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants Grid - Enhanced with Rich Information */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredParticipants.map((participant) => (
            <Card
              key={participant.id}
              className={`hover:shadow-xl transition-all border-l-4 ${
                participant.riskLevel === 'high' ? 'border-l-red-500' :
                participant.riskLevel === 'medium' ? 'border-l-yellow-500' :
                'border-l-green-500'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-16 w-16 border-2 border-gray-200">
                        <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full border-2 border-white ${
                        participant.currentStatus === 'happy' ? 'bg-green-500' :
                        participant.currentStatus === 'calm' ? 'bg-blue-500' :
                        participant.currentStatus === 'anxious' ? 'bg-yellow-500' :
                        participant.currentStatus === 'agitated' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} title={participant.currentStatus} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold truncate mb-1">{participant.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        {participant.age && <span>{participant.age} years old</span>}
                        {participant.age && participant.ndisNumber && <span>•</span>}
                        {participant.ndisNumber && <span className="truncate">NDIS {participant.ndisNumber?.slice(-4)}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={participant.riskLevel === 'high' ? 'destructive' :
                                  participant.riskLevel === 'medium' ? 'default' : 'secondary'}
                          className="text-xs px-2.5 py-0.5"
                        >
                          {participant.riskLevel} risk
                        </Badge>
                        <Badge variant="outline" className="text-xs px-2.5 py-0.5 capitalize">
                          {participant.currentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      onClick={() => handleEdit(participant)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9"
                      onClick={() => handleDelete(participant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {/* Location */}
                <div className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50 px-3 py-2.5 rounded-lg">
                  <Home className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span className="truncate font-medium">{participant.location || 'Location not set'}</span>
                </div>

                {/* Quick Stats - Only show if they exist */}
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  {participant.medications.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-medium">{participant.medications.length} medication{participant.medications.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {participant.behaviorPatterns.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-purple-600" />
                      <span className="font-medium">{participant.behaviorPatterns.length} pattern{participant.behaviorPatterns.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {participant.supportPlan.strategies.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-green-600" />
                      <span className="font-medium">{participant.supportPlan.strategies.length} strateg{participant.supportPlan.strategies.length !== 1 ? 'ies' : 'y'}</span>
                    </div>
                  )}
                </div>

                {/* Medication Preview */}
                {participant.medications.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 px-3 py-2.5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Next Medication</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{participant.medications[0].name}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{participant.medications[0].dosage} at {participant.medications[0].time}</div>
                  </div>
                )}

                {/* Behavior Alert */}
                {participant.behaviorPatterns.length > 0 && participant.riskLevel !== 'low' && (
                  <div className={`border px-3 py-2.5 rounded-lg ${
                    participant.riskLevel === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle className={`h-4 w-4 ${
                        participant.riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                      <span className={`text-xs font-semibold uppercase tracking-wide ${
                        participant.riskLevel === 'high' ? 'text-red-700' : 'text-yellow-700'
                      }`}>Trigger Alert</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{participant.behaviorPatterns[0].trigger}</div>
                    {participant.behaviorPatterns[0].timeOfDay && (
                      <div className="text-xs text-gray-600 mt-0.5">Common at: {participant.behaviorPatterns[0].timeOfDay}</div>
                    )}
                  </div>
                )}

                {/* Emergency Contact */}
                {participant.supportPlan.emergencyContacts.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Emergency Contact</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {participant.supportPlan.emergencyContacts[0].name}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {participant.supportPlan.emergencyContacts[0].role} • {participant.supportPlan.emergencyContacts[0].phone}
                    </div>
                  </div>
                )}

                {/* Support Plan Preview */}
                {participant.supportPlan.preferences.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 px-3 py-2.5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Heart className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Key Preference</span>
                    </div>
                    <div className="text-sm text-gray-800 line-clamp-2 leading-relaxed">
                      {participant.supportPlan.preferences[0]}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
              </DialogTitle>
              <DialogDescription>
                Complete all sections to create a comprehensive participant profile
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contacts</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="support">Support Plan</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="ndisNumber">NDIS Number</Label>
                    <Input
                      id="ndisNumber"
                      value={formData.ndisNumber}
                      onChange={(e) => handleInputChange('ndisNumber', e.target.value)}
                      placeholder="4301234567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facility">Facility *</Label>
                    <Select 
                      value={formData.facility} 
                      onValueChange={(v) => handleInputChange('facility', v)}
                    >
                      <SelectTrigger id="facility">
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="650e8400-e29b-41d4-a716-446655440001">House 1 - Riverside</SelectItem>
                        <SelectItem value="650e8400-e29b-41d4-a716-446655440002">House 2 - Parkview</SelectItem>
                        <SelectItem value="650e8400-e29b-41d4-a716-446655440003">House 3 - Sunshine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="riskLevel">Risk Level</Label>
                  <Select 
                    value={formData.riskLevel} 
                    onValueChange={(v) => handleInputChange('riskLevel', v)}
                  >
                    <SelectTrigger id="riskLevel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Emergency Contacts */}
              <TabsContent value="contact" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Primary Emergency Contact *</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="emergencyContactName">Name *</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Phone *</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                        placeholder="0400 123 456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactRelation">Relationship *</Label>
                      <Input
                        id="emergencyContactRelation"
                        value={formData.emergencyContactRelation}
                        onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                        placeholder="Mother"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Secondary Emergency Contact</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="secondaryContactName">Name</Label>
                      <Input
                        id="secondaryContactName"
                        value={formData.secondaryContactName}
                        onChange={(e) => handleInputChange('secondaryContactName', e.target.value)}
                        placeholder="Bob Smith"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryContactPhone">Phone</Label>
                      <Input
                        id="secondaryContactPhone"
                        value={formData.secondaryContactPhone}
                        onChange={(e) => handleInputChange('secondaryContactPhone', e.target.value)}
                        placeholder="0400 234 567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryContactRelation">Relationship</Label>
                      <Input
                        id="secondaryContactRelation"
                        value={formData.secondaryContactRelation}
                        onChange={(e) => handleInputChange('secondaryContactRelation', e.target.value)}
                        placeholder="Brother"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Medical Information */}
              <TabsContent value="medical" className="space-y-4">
                <div>
                  <Label htmlFor="primaryDiagnosis">Primary Diagnosis</Label>
                  <Input
                    id="primaryDiagnosis"
                    value={formData.primaryDiagnosis}
                    onChange={(e) => handleInputChange('primaryDiagnosis', e.target.value)}
                    placeholder="e.g., Autism Spectrum Disorder"
                  />
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    placeholder="List any allergies..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="dietaryRequirements">Dietary Requirements</Label>
                  <Textarea
                    id="dietaryRequirements"
                    value={formData.dietaryRequirements}
                    onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                    placeholder="Any special dietary needs..."
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Medications</h3>
                    <Button onClick={addMedication} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Medication
                    </Button>
                  </div>
                  
                  {formData.medications.map((med, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <Label>Medication Name</Label>
                          <Input
                            value={med.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="Medication name"
                          />
                        </div>
                        <div>
                          <Label>Dosage</Label>
                          <Input
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="e.g., 10mg"
                          />
                        </div>
                        <div>
                          <Label>Time</Label>
                          <Input
                            value={med.time}
                            onChange={(e) => updateMedication(index, 'time', e.target.value)}
                            placeholder="e.g., 8:00 AM"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select 
                            value={med.type} 
                            onValueChange={(v) => updateMedication(index, 'type', v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Regular</SelectItem>
                              <SelectItem value="prn">PRN</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMedication(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Support Plan */}
              <TabsContent value="support" className="space-y-4">
                <div>
                  <Label>Support Strategies</Label>
                  <Textarea
                    value={formData.supportStrategies.join('\n')}
                    onChange={(e) => handleInputChange('supportStrategies', e.target.value.split('\n').filter(Boolean))}
                    placeholder="Enter support strategies (one per line)..."
                    rows={5}
                  />
                </div>

                <div>
                  <Label>Preferences</Label>
                  <Textarea
                    value={formData.preferences.join('\n')}
                    onChange={(e) => handleInputChange('preferences', e.target.value.split('\n').filter(Boolean))}
                    placeholder="Enter participant preferences (one per line)..."
                    rows={5}
                  />
                </div>

                <div>
                  <Label>Goals</Label>
                  <Textarea
                    value={formData.goals.join('\n')}
                    onChange={(e) => handleInputChange('goals', e.target.value.split('\n').filter(Boolean))}
                    placeholder="Enter participant goals (one per line)..."
                    rows={5}
                  />
                </div>
              </TabsContent>

              {/* Behavior Patterns */}
              <TabsContent value="behavior" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Behavior Patterns</h3>
                    <Button onClick={addBehaviorPattern} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Pattern
                    </Button>
                  </div>
                  
                  {formData.behaviorPatterns.map((pattern, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Trigger</Label>
                          <Input
                            value={pattern.trigger}
                            onChange={(e) => updateBehaviorPattern(index, 'trigger', e.target.value)}
                            placeholder="What triggers this behavior?"
                          />
                        </div>
                        <div>
                          <Label>Time of Day</Label>
                          <Input
                            value={pattern.timeOfDay}
                            onChange={(e) => updateBehaviorPattern(index, 'timeOfDay', e.target.value)}
                            placeholder="e.g., Afternoon"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Behavior Description</Label>
                        <Textarea
                          value={pattern.behavior}
                          onChange={(e) => updateBehaviorPattern(index, 'behavior', e.target.value)}
                          placeholder="Describe the behavior..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Successful Interventions</Label>
                        <Textarea
                          value={pattern.successfulInterventions.join('\n')}
                          onChange={(e) => updateBehaviorPattern(index, 'successfulInterventions', 
                            e.target.value.split('\n').filter(Boolean)
                          )}
                          placeholder="Enter interventions (one per line)..."
                          rows={3}
                        />
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeBehaviorPattern(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingParticipant(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingParticipant ? 'Update' : 'Add')} Participant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/setup/staff')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => router.push('/setup/routing')}>
            Continue to Routing Rules
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}