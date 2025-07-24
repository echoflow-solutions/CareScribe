'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/hooks/use-toast'
import { DataService } from '@/lib/data/service'
import { 
  Building2, Mail, Phone, Globe, MapPin, Clock, 
  FileText, Shield, ArrowLeft, ArrowRight, Save,
  Check, AlertCircle
} from 'lucide-react'

const timezones = [
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Hobart',
  'Australia/Darwin'
]

export default function OrganizationSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    abn: '',
    ndisNumber: '',
    primaryEmail: '',
    primaryPhone: '',
    website: '',
    address: '',
    city: '',
    state: 'NSW',
    postcode: '',
    timezone: 'Australia/Sydney',
    description: '',
    // Compliance
    registrationDate: '',
    certificationLevel: '',
    insuranceProvider: '',
    insuranceNumber: '',
    // Preferences
    incidentReportingDeadline: '24',
    requirePhotoEvidence: 'optional',
    enableVoiceReporting: true,
    enableAIClassification: true,
    defaultEscalationTime: '30'
  })

  useEffect(() => {
    loadOrganizationData()
  }, [])

  const loadOrganizationData = async () => {
    try {
      const org = await DataService.getOrganization()
      if (org) {
        setFormData(prev => ({
          ...prev,
          name: org.name,
          ndisNumber: org.ndisNumber,
          primaryEmail: org.primaryEmail,
          timezone: org.timezone
        }))
      }
    } catch (error) {
      console.error('Error loading organization:', error)
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

  const validateForm = () => {
    const required = ['name', 'abn', 'ndisNumber', 'primaryEmail', 'primaryPhone', 'address', 'city', 'postcode']
    const missing = required.filter(field => !formData[field as keyof typeof formData])
    
    if (missing.length > 0) {
      toast({
        title: 'Missing Information',
        description: `Please fill in all required fields: ${missing.join(', ')}`,
        variant: 'destructive'
      })
      return false
    }
    
    // Validate email
    if (!formData.primaryEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      })
      return false
    }
    
    // Validate ABN (11 digits)
    if (!formData.abn.match(/^\d{11}$/)) {
      toast({
        title: 'Invalid ABN',
        description: 'ABN must be 11 digits',
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
      // In a real app, this would save to Supabase
      await DataService.updateOrganization({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: formData.name,
        ndisNumber: formData.ndisNumber,
        facilities: 12, // From seed data
        primaryEmail: formData.primaryEmail,
        timezone: formData.timezone,
        createdAt: new Date().toISOString()
      })
      
      toast({
        title: 'Organization Updated',
        description: 'Your organization profile has been saved successfully'
      })
      
      // Navigate to next step
      router.push('/setup/facilities')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save organization details',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading organization details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Organization Profile</h1>
              <p className="text-gray-600">Set up your organization details and preferences</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Basic information about your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Sunshine Support Services"
                    />
                  </div>
                  <div>
                    <Label htmlFor="abn">ABN *</Label>
                    <Input
                      id="abn"
                      value={formData.abn}
                      onChange={(e) => handleInputChange('abn', e.target.value)}
                      placeholder="12345678901"
                      maxLength={11}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ndisNumber">NDIS Registration Number *</Label>
                  <Input
                    id="ndisNumber"
                    value={formData.ndisNumber}
                    onChange={(e) => handleInputChange('ndisNumber', e.target.value)}
                    placeholder="4-123-4567-8"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="primaryEmail">Primary Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="primaryEmail"
                        type="email"
                        value={formData.primaryEmail}
                        onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                        placeholder="admin@organization.com.au"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="primaryPhone">Primary Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="primaryPhone"
                        value={formData.primaryPhone}
                        onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                        placeholder="1300 123 456"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.organization.com.au"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Sydney"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(v) => handleInputChange('state', v)}>
                      <SelectTrigger id="state">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NSW">NSW</SelectItem>
                        <SelectItem value="VIC">VIC</SelectItem>
                        <SelectItem value="QLD">QLD</SelectItem>
                        <SelectItem value="WA">WA</SelectItem>
                        <SelectItem value="SA">SA</SelectItem>
                        <SelectItem value="TAS">TAS</SelectItem>
                        <SelectItem value="ACT">ACT</SelectItem>
                        <SelectItem value="NT">NT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handleInputChange('postcode', e.target.value)}
                      placeholder="2000"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(v) => handleInputChange('timezone', v)}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {tz}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Organization Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of your organization and services..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Information</CardTitle>
                <CardDescription>
                  NDIS registration and insurance details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="registrationDate">NDIS Registration Date</Label>
                    <Input
                      id="registrationDate"
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => handleInputChange('registrationDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificationLevel">Certification Level</Label>
                    <Select 
                      value={formData.certificationLevel} 
                      onValueChange={(v) => handleInputChange('certificationLevel', v)}
                    >
                      <SelectTrigger id="certificationLevel">
                        <SelectValue placeholder="Select certification level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verification">Verification</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                      placeholder="Insurance company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceNumber">Policy Number</Label>
                    <Input
                      id="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                      placeholder="Policy number"
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Compliance Status</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        All compliance documents will be securely stored and monitored for expiry dates.
                        You'll receive notifications before any documents expire.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Configure how CareScribe works for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="incidentReportingDeadline">
                      Incident Reporting Deadline (hours)
                    </Label>
                    <Select 
                      value={formData.incidentReportingDeadline} 
                      onValueChange={(v) => handleInputChange('incidentReportingDeadline', v)}
                    >
                      <SelectTrigger id="incidentReportingDeadline">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                        <SelectItem value="72">72 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Time limit for staff to submit incident reports after occurrence
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="requirePhotoEvidence">Photo Evidence Requirement</Label>
                    <Select 
                      value={formData.requirePhotoEvidence} 
                      onValueChange={(v) => handleInputChange('requirePhotoEvidence', v)}
                    >
                      <SelectTrigger id="requirePhotoEvidence">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never Required</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="injuries">Required for Injuries</SelectItem>
                        <SelectItem value="always">Always Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="defaultEscalationTime">
                      Default Escalation Time (minutes)
                    </Label>
                    <Select 
                      value={formData.defaultEscalationTime} 
                      onValueChange={(v) => handleInputChange('defaultEscalationTime', v)}
                    >
                      <SelectTrigger id="defaultEscalationTime">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Time before unacknowledged critical incidents are escalated
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Features</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.enableVoiceReporting}
                          onChange={(e) => handleInputChange('enableVoiceReporting', e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span>Enable Voice Reporting</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.enableAIClassification}
                          onChange={(e) => handleInputChange('enableAIClassification', e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span>Enable AI Report Classification</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Recommended Settings</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your current settings follow NDIS best practices for incident reporting and management.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/setup')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Setup
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                Save & Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}