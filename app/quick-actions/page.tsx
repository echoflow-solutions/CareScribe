'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  Zap, AlertTriangle, Camera, Phone, FileText, Heart,
  Shield, Users, Clock, CheckCircle, MapPin, Activity,
  PhoneCall, Mail, Radio, Navigation, Video, Mic,
  Ambulance, Info, X, Save, Send
} from 'lucide-react'

interface EmergencyContact {
  name: string
  role: string
  phone: string
  availability: string
}

interface WelfareCheck {
  participantId: string
  participantName: string
  status: 'safe' | 'needs_attention' | 'emergency'
  notes?: string
  checkedAt: Date
}

export default function QuickActionsPage() {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [showSOSDialog, setShowSOSDialog] = useState(false)
  const [showIncidentDialog, setShowIncidentDialog] = useState(false)
  const [showWelfareDialog, setShowWelfareDialog] = useState(false)
  const [sosReason, setSosReason] = useState('')
  const [incidentDescription, setIncidentDescription] = useState('')
  const [welfareChecks, setWelfareChecks] = useState<WelfareCheck[]>([])
  const [isSOSActive, setIsSOSActive] = useState(false)

  const emergencyContacts: EmergencyContact[] = [
    { name: 'Sarah Williams', role: 'Team Leader', phone: '+61 412 345 678', availability: '24/7' },
    { name: 'Emergency Services', role: '000', phone: '000', availability: 'Always' },
    { name: 'Dr. Michael Chen', role: 'On-Call Doctor', phone: '+61 423 456 789', availability: '24/7' },
    { name: 'Area Manager', role: 'Lisa Taylor', phone: '+61 434 567 890', availability: 'Business hours' },
  ]

  const triggerSOS = async () => {
    setIsSOSActive(true)

    // Simulate emergency alert
    toast({
      title: '🚨 SOS ACTIVATED',
      description: 'Emergency alert sent to all team members and management',
      variant: 'destructive',
      duration: 5000
    })

    // Simulate getting location
    setTimeout(() => {
      toast({
        title: 'Location Shared',
        description: 'Your current location has been sent to the team',
        duration: 3000
      })
    }, 1000)

    // Auto-call team leader after 3 seconds
    setTimeout(() => {
      toast({
        title: 'Calling Team Leader',
        description: 'Connecting to Sarah Williams...',
        duration: 3000
      })
    }, 3000)
  }

  const cancelSOS = () => {
    setIsSOSActive(false)
    setSosReason('')
    setShowSOSDialog(false)

    toast({
      title: 'SOS Cancelled',
      description: 'Emergency alert has been cancelled',
      duration: 2000
    })
  }

  const quickIncidentReport = () => {
    if (!incidentDescription.trim()) return

    toast({
      title: 'Incident Reported',
      description: 'Quick incident report submitted. Follow up with full report when safe.',
      duration: 3000
    })

    setIncidentDescription('')
    setShowIncidentDialog(false)
  }

  const captureIncidentPhoto = () => {
    toast({
      title: 'Camera Opening',
      description: 'Photo will be automatically attached to incident report',
      duration: 2000
    })
  }

  const recordVoiceNote = () => {
    toast({
      title: 'Voice Recording Started',
      description: 'Speak clearly. Recording will auto-save.',
      duration: 2000
    })
  }

  const performWelfareCheck = (participantName: string, status: WelfareCheck['status']) => {
    const newCheck: WelfareCheck = {
      participantId: Date.now().toString(),
      participantName,
      status,
      checkedAt: new Date()
    }

    setWelfareChecks([newCheck, ...welfareChecks])

    const statusMessages = {
      safe: `${participantName} marked as safe`,
      needs_attention: `${participantName} needs attention - team notified`,
      emergency: `🚨 EMERGENCY - ${participantName} requires immediate help!`
    }

    toast({
      title: 'Welfare Check Recorded',
      description: statusMessages[status],
      variant: status === 'emergency' ? 'destructive' : 'default',
      duration: 3000
    })
  }

  const getStatusColor = (status: WelfareCheck['status']) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-700 border-green-300'
      case 'needs_attention': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'emergency': return 'bg-red-100 text-red-700 border-red-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quick Actions Hub</h1>
            <p className="text-gray-600">Emergency features and rapid response tools</p>
          </div>
        </div>
      </div>

      {/* SOS Alert Banner (when active) */}
      {isSOSActive && (
        <Card className="mb-6 border-4 border-red-500 bg-red-50 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-900">🚨 SOS ACTIVE</h2>
                  <p className="text-red-700">Emergency team has been notified and is responding</p>
                  <p className="text-sm text-red-600 mt-1">Location: Sunshine House | Time: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <Button variant="outline" size="lg" onClick={cancelSOS}>
                <X className="h-4 w-4 mr-2" />
                Cancel SOS
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Emergency Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* SOS Button */}
        <Card className="border-4 border-red-300 hover:border-red-500 transition-all cursor-pointer hover:shadow-xl">
          <CardContent className="p-6" onClick={() => !isSOSActive && setShowSOSDialog(true)}>
            <div className="text-center">
              <div className="mx-auto mb-4 h-24 w-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Emergency SOS</h2>
              <p className="text-gray-600 mb-4">Immediate emergency assistance required</p>
              <Badge variant="destructive" className="text-sm">
                Alerts all team members + Management
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Incident Report */}
        <Card className="border-4 border-orange-300 hover:border-orange-500 transition-all cursor-pointer hover:shadow-xl">
          <CardContent className="p-6" onClick={() => setShowIncidentDialog(true)}>
            <div className="text-center">
              <div className="mx-auto mb-4 h-24 w-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <FileText className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-orange-600 mb-2">Quick Incident Report</h2>
              <p className="text-gray-600 mb-4">Rapid incident documentation</p>
              <Badge className="bg-orange-100 text-orange-700 text-sm">
                Voice + Photo + Text
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Rapid access to common emergency and safety features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={captureIncidentPhoto}
            >
              <Camera className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Photo Capture</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={recordVoiceNote}
            >
              <Mic className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Voice Note</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setShowWelfareDialog(true)}
            >
              <Heart className="h-6 w-6 text-pink-600" />
              <span className="text-sm">Welfare Check</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Navigation className="h-6 w-6 text-green-600" />
              <span className="text-sm">Share Location</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Video className="h-6 w-6 text-red-600" />
              <span className="text-sm">Video Call</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Radio className="h-6 w-6 text-indigo-600" />
              <span className="text-sm">Team Alert</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Shield className="h-6 w-6 text-gray-600" />
              <span className="text-sm">Safety Protocol</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              <Ambulance className="h-6 w-6 text-red-600" />
              <span className="text-sm">Call 000</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>Quick access to emergency personnel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emergencyContacts.map((contact, idx) => (
              <Card key={idx} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.role}</p>
                      <p className="text-sm font-mono text-blue-600 mt-1">{contact.phone}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {contact.availability}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Welfare Checks */}
      {welfareChecks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Recent Welfare Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {welfareChecks.slice(0, 5).map((check, idx) => (
                <div key={idx} className={`p-3 border-2 rounded-lg ${getStatusColor(check.status)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{check.participantName}</h4>
                      <p className="text-sm">{check.status.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{check.checkedAt.toLocaleTimeString()}</p>
                      <Badge variant="secondary" className="mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Recorded
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SOS Dialog */}
      {showSOSDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-4 border-red-500">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Activate Emergency SOS
              </CardTitle>
              <CardDescription className="text-red-700">
                This will immediately alert all team members and management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Emergency Type (Optional)</label>
                <Textarea
                  placeholder="Brief description of emergency..."
                  value={sosReason}
                  onChange={(e) => setSosReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  <Info className="h-4 w-4 inline mr-1" />
                  Your location will be automatically shared with the emergency team
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  className="flex-1 h-12 text-lg"
                  onClick={triggerSOS}
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  ACTIVATE SOS
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSOSDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Incident Dialog */}
      {showIncidentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-2 border-orange-500">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Quick Incident Report
              </CardTitle>
              <CardDescription className="text-orange-700">
                Rapid documentation - expand later when safe
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What happened?</label>
                <Textarea
                  placeholder="Brief description of incident..."
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Note
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={quickIncidentReport}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Quick Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowIncidentDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Welfare Check Dialog */}
      {showWelfareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-2 border-pink-500">
            <CardHeader className="bg-pink-50">
              <CardTitle className="text-pink-900 flex items-center gap-2">
                <Heart className="h-6 w-6" />
                Quick Welfare Check
              </CardTitle>
              <CardDescription className="text-pink-700">
                Record participant safety status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Participant</label>
                <div className="space-y-2">
                  {['James Mitchell', 'Sarah Chen', 'Michael Brown', 'Emma Wilson'].map((name) => (
                    <Card key={name} className="border-2 hover:border-pink-500 cursor-pointer">
                      <CardContent className="p-3">
                        <h4 className="font-semibold mb-2">{name}</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
                            onClick={() => {
                              performWelfareCheck(name, 'safe')
                              setShowWelfareDialog(false)
                            }}
                          >
                            Safe
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-orange-500 text-orange-700 hover:bg-orange-50"
                            onClick={() => {
                              performWelfareCheck(name, 'needs_attention')
                              setShowWelfareDialog(false)
                            }}
                          >
                            Needs Attention
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-500 text-red-700 hover:bg-red-50"
                            onClick={() => {
                              performWelfareCheck(name, 'emergency')
                              setShowWelfareDialog(false)
                            }}
                          >
                            Emergency
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowWelfareDialog(false)}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
