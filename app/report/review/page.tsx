'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Send, Loader2, User, MapPin, Clock, AlertCircle, Heart, Users, FileText, CheckCircle2, Sparkles } from 'lucide-react'
import { useToast } from '@/components/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { AIGeneratedField } from '@/components/AIGeneratedField'

interface ReportData {
  user_id: string
  facility_id?: string
  participant_id?: string | null

  // Participant Details
  participant_first_name: string
  participant_last_name: string
  participant_full_name: string

  // Incident Classification
  type: string
  severity: string

  // Time and Location
  incident_date: string
  incident_time: string
  location: string
  location_area: string

  // People Involved
  witnesses: string[]

  // Incident Details (ABC Format)
  description: string
  antecedent: string
  behavior: string
  consequence: string

  // Medical Information
  injuries: string
  injury_details: string
  first_aid_provided: string
  medical_attention: string
  medication_given: string

  // Response and Support
  support_provided: string
  immediate_actions: string

  // Contributing Factors
  environmental_factors: string
  contributing_factors: string

  // Participant State
  participant_communication: string
  participant_emotional_state: string

  // Impact Assessment
  property_damage: string
  impact_on_others: string

  // Follow-up
  follow_up_required: string
  notification_required: string

  // Legacy/Additional
  interventions?: any[]
  outcomes?: any[]
  photos?: any[]
  report_type: string
  conversation_transcript: string
  draft_id?: string

  // AI-generated field tracking
  aiGenerated?: Record<string, boolean>
}

export default function ReportReviewPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentUser } = useStore()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [approvedFields, setApprovedFields] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Load report data from sessionStorage
    const savedData = sessionStorage.getItem('pending_report')
    if (savedData) {
      setReportData(JSON.parse(savedData))
    } else {
      // No report data found, redirect back
      router.push('/quick-report')
    }
  }, [router])

  const handleFieldChange = (field: keyof ReportData, value: any) => {
    if (!reportData) return
    const updated = { ...reportData, [field]: value }

    // If first or last name changed, update the full name
    if (field === 'participant_first_name' || field === 'participant_last_name') {
      const firstName = field === 'participant_first_name' ? value : reportData.participant_first_name
      const lastName = field === 'participant_last_name' ? value : reportData.participant_last_name
      updated.participant_full_name = `${firstName} ${lastName}`.trim()
    }

    setReportData(updated)
  }

  const handleWitnessChange = (value: string) => {
    if (!reportData) return
    const witnessArray = value.split(',').map(w => w.trim()).filter(w => w)
    handleFieldChange('witnesses', witnessArray)
  }

  const handleSaveDraft = async () => {
    if (!reportData) return

    setIsSaving(true)
    try {
      toast({
        title: 'Draft Saved',
        description: 'Your report has been saved as a draft',
      })
    } catch (error) {
      console.error('Error saving draft:', error)
      toast({
        title: 'Error',
        description: 'Failed to save draft',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!reportData) return

    setIsSubmitting(true)
    try {
      console.log('[Report Review] Submitting report to database')

      const saveResponse = await fetch('/api/reports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: reportData.user_id,
          facility_id: reportData.facility_id,
          participant_id: reportData.participant_id,
          participant_name: reportData.participant_full_name || `${reportData.participant_first_name} ${reportData.participant_last_name}`.trim(),
          participant_first_name: reportData.participant_first_name,
          participant_last_name: reportData.participant_last_name,
          type: reportData.type,
          severity: reportData.severity,
          location: reportData.location,
          description: reportData.description,
          antecedent: reportData.antecedent,
          behavior: reportData.behavior,
          consequence: reportData.consequence,
          interventions: reportData.interventions || [],
          outcomes: reportData.outcomes || [],
          photos: reportData.photos || [],
          report_type: reportData.report_type,
          conversation_transcript: reportData.conversation_transcript
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || 'Failed to save report')
      }

      const saveData = await saveResponse.json()
      console.log('[Report Review] Report saved successfully:', saveData.report.id)

      // Delete the draft if exists
      if (reportData.draft_id) {
        try {
          await fetch(`/api/drafts/delete?id=${reportData.draft_id}`, { method: 'DELETE' })
        } catch (error) {
          console.warn('[Report Review] Could not delete draft (non-critical):', error)
        }
      }

      // Clear all draft storage (both session and local storage)
      sessionStorage.removeItem('pending_report')
      localStorage.removeItem('draft_report_backup')

      // Show success toast
      toast({
        title: '✅ Report Submitted Successfully!',
        description: `Incident report #${saveData.report.id.substring(0, 8)} has been saved to the database`,
        duration: 5000,
      })

      // Wait a moment before redirecting to let the user see the toast
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Redirect to reports page
      router.push('/reports')

    } catch (error: any) {
      console.error('Error submitting report:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review & Edit Incident Report</h1>
        <p className="text-gray-600">Review the AI-extracted information and make any necessary edits before submitting</p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            AI-Extracted
          </Badge>
          <Badge variant={reportData.severity === 'high' ? 'destructive' : reportData.severity === 'medium' ? 'default' : 'secondary'}>
            {reportData.severity.toUpperCase()} Risk
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Participant Information */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <CardTitle>Participant Information</CardTitle>
            </div>
            <CardDescription>Details about the participant involved</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={reportData.participant_first_name}
                  onChange={(e) => handleFieldChange('participant_first_name', e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={reportData.participant_last_name}
                  onChange={(e) => handleFieldChange('participant_last_name', e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="communication">Communication / Expression</Label>
              <Textarea
                id="communication"
                value={reportData.participant_communication}
                onChange={(e) => handleFieldChange('participant_communication', e.target.value)}
                rows={2}
                placeholder="How the participant communicated or expressed themselves"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotional_state">Emotional State</Label>
              <Textarea
                id="emotional_state"
                value={reportData.participant_emotional_state}
                onChange={(e) => handleFieldChange('participant_emotional_state', e.target.value)}
                rows={2}
                placeholder="Participant's emotional state before, during, and after the incident"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Incident Classification */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle>Incident Classification</CardTitle>
            </div>
            <CardDescription>Type and severity of the incident</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Incident Type *</Label>
                <Select
                  value={reportData.type}
                  onValueChange={(value) => handleFieldChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="property">Property Damage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity / Risk Level *</Label>
                <Select
                  value={reportData.severity}
                  onValueChange={(value) => handleFieldChange('severity', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Time and Location */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <CardTitle>When & Where</CardTitle>
            </div>
            <CardDescription>Date, time, and location details</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incident_date">Date of Incident *</Label>
                <Input
                  id="incident_date"
                  type="date"
                  value={reportData.incident_date}
                  onChange={(e) => handleFieldChange('incident_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident_time">Time of Incident</Label>
                <Input
                  id="incident_time"
                  value={reportData.incident_time}
                  onChange={(e) => handleFieldChange('incident_time', e.target.value)}
                  placeholder="e.g., 2:30 PM or Afternoon"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Specific Location *</Label>
              <Textarea
                id="location"
                value={reportData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                rows={2}
                placeholder="e.g., Living room near the TV, Bedroom 2, Kitchen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_area">General Area</Label>
              <Select
                value={reportData.location_area}
                onValueChange={(value) => handleFieldChange('location_area', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="living room">Living Room</SelectItem>
                  <SelectItem value="dining room">Dining Room</SelectItem>
                  <SelectItem value="hallway">Hallway</SelectItem>
                  <SelectItem value="outdoor">Outdoor Area</SelectItem>
                  <SelectItem value="garden">Garden</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="community">Community Setting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: People Involved */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle>People Involved</CardTitle>
            </div>
            <CardDescription>Witnesses and other people present</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="witnesses">Witnesses</Label>
              <Input
                id="witnesses"
                value={reportData.witnesses.join(', ')}
                onChange={(e) => handleWitnessChange(e.target.value)}
                placeholder="Enter witness names separated by commas"
              />
              <p className="text-xs text-gray-500">Separate multiple witnesses with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact_others">Impact on Other Participants/Staff</Label>
              <Textarea
                id="impact_others"
                value={reportData.impact_on_others}
                onChange={(e) => handleFieldChange('impact_on_others', e.target.value)}
                rows={2}
                placeholder="How did this incident affect others present?"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Incident Details (ABC Format) */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-600" />
              <CardTitle>Incident Details (ABC Format)</CardTitle>
            </div>
            <CardDescription>Antecedent, Behavior, Consequence format for behavior documentation</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="antecedent">A - Antecedent (What led to the incident?)</Label>
              <Textarea
                id="antecedent"
                value={reportData.antecedent}
                onChange={(e) => handleFieldChange('antecedent', e.target.value)}
                rows={3}
                placeholder="What was happening before the incident? What triggered it? Environmental factors, mood, activities..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="behavior">B - Behavior (What happened?)</Label>
              <Textarea
                id="behavior"
                value={reportData.behavior}
                onChange={(e) => handleFieldChange('behavior', e.target.value)}
                rows={3}
                placeholder="Describe the specific behaviors observed during the incident..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consequence">C - Consequence (What happened after?)</Label>
              <Textarea
                id="consequence"
                value={reportData.consequence}
                onChange={(e) => handleFieldChange('consequence', e.target.value)}
                rows={3}
                placeholder="What happened immediately after? How did the participant respond? How was the situation resolved?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Comprehensive Incident Description</Label>
              <Textarea
                id="description"
                value={reportData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={6}
                placeholder="Full narrative description of the incident..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Medical Information */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              <CardTitle>Medical Information</CardTitle>
            </div>
            <CardDescription>Injuries, first aid, and medical attention</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="injuries">Injuries</Label>
              <Input
                id="injuries"
                value={reportData.injuries}
                onChange={(e) => handleFieldChange('injuries', e.target.value)}
                placeholder="Any injuries sustained? (e.g., 'No injuries reported', 'Minor bruise on left arm')"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="injury_details">Injury Details</Label>
              <Textarea
                id="injury_details"
                value={reportData.injury_details}
                onChange={(e) => handleFieldChange('injury_details', e.target.value)}
                rows={2}
                placeholder="Detailed description of any injuries"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_aid">First Aid Provided</Label>
                <Input
                  id="first_aid"
                  value={reportData.first_aid_provided}
                  onChange={(e) => handleFieldChange('first_aid_provided', e.target.value)}
                  placeholder="e.g., 'Yes - ice pack applied' or 'No'"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_attention">Medical Attention Required</Label>
                <Input
                  id="medical_attention"
                  value={reportData.medical_attention}
                  onChange={(e) => handleFieldChange('medical_attention', e.target.value)}
                  placeholder="e.g., 'Not required' or 'Doctor consulted'"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medication">Medication Given</Label>
              <Input
                id="medication"
                value={reportData.medication_given}
                onChange={(e) => handleFieldChange('medication_given', e.target.value)}
                placeholder="Any medication administered (including PRN)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Response and Actions */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              <CardTitle>Response & Actions Taken</CardTitle>
            </div>
            <CardDescription>Immediate support and interventions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <AIGeneratedField
              label="Immediate Actions Taken"
              value={reportData.immediate_actions}
              onValueChange={(value) => handleFieldChange('immediate_actions', value)}
              onApprove={() => setApprovedFields(prev => ({ ...prev, immediate_actions: true }))}
              isApproved={approvedFields.immediate_actions || false}
              isAiGenerated={reportData.aiGenerated?.immediate_actions || false}
              rows={5}
              placeholder="What actions were taken immediately during/after the incident?"
            />

            <AIGeneratedField
              label="Support Provided"
              value={reportData.support_provided}
              onValueChange={(value) => handleFieldChange('support_provided', value)}
              onApprove={() => setApprovedFields(prev => ({ ...prev, support_provided: true }))}
              isApproved={approvedFields.support_provided || false}
              isAiGenerated={reportData.aiGenerated?.support_provided || false}
              rows={5}
              placeholder="What support was provided to the participant?"
            />
          </CardContent>
        </Card>

        {/* Section 8: Contributing Factors */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              <CardTitle>Contributing Factors & Analysis</CardTitle>
            </div>
            <CardDescription>Environmental and contextual factors</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <AIGeneratedField
              label="Environmental Factors"
              value={reportData.environmental_factors}
              onValueChange={(value) => handleFieldChange('environmental_factors', value)}
              onApprove={() => setApprovedFields(prev => ({ ...prev, environmental_factors: true }))}
              isApproved={approvedFields.environmental_factors || false}
              isAiGenerated={reportData.aiGenerated?.environmental_factors || false}
              rows={3}
              placeholder="Temperature, noise level, crowding, lighting, time of day, etc."
            />

            <AIGeneratedField
              label="Contributing Factors / Root Causes"
              value={reportData.contributing_factors}
              onValueChange={(value) => handleFieldChange('contributing_factors', value)}
              onApprove={() => setApprovedFields(prev => ({ ...prev, contributing_factors: true }))}
              isApproved={approvedFields.contributing_factors || false}
              isAiGenerated={reportData.aiGenerated?.contributing_factors || false}
              rows={4}
              placeholder="What underlying factors may have contributed to this incident? Patterns, triggers, etc."
            />

            <AIGeneratedField
              label="Property Damage"
              value={reportData.property_damage}
              onValueChange={(value) => handleFieldChange('property_damage', value)}
              onApprove={() => setApprovedFields(prev => ({ ...prev, property_damage: true }))}
              isApproved={approvedFields.property_damage || false}
              isAiGenerated={reportData.aiGenerated?.property_damage || false}
              type="input"
              placeholder="Any damage to property or equipment?"
            />
          </CardContent>
        </Card>

        {/* Section 9: Follow-up */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600" />
              <CardTitle>Follow-up Actions</CardTitle>
            </div>
            <CardDescription>Required notifications and follow-up steps</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <AIGeneratedField
              label="Follow-up Required"
              value={reportData.follow_up_required}
              onValueChange={(value) => handleFieldChange('follow_up_required', value)}
              onApprove={() => setApprovedFields(prev => ({ ...prev, follow_up_required: true }))}
              isApproved={approvedFields.follow_up_required || false}
              isAiGenerated={reportData.aiGenerated?.follow_up_required || false}
              rows={4}
              placeholder="What follow-up actions are needed? Behavior plan review, additional support, assessments..."
            />

            <AIGeneratedField
              label="Notifications Required"
              value={reportData.notification_required}
              onValueChange={(value) => handleFieldChange('notification_required', value)}
              onApprove={() => setApprovedFields(prev => ({ ...prev, notification_required: true }))}
              isApproved={approvedFields.notification_required || false}
              isAiGenerated={reportData.aiGenerated?.notification_required || false}
              rows={3}
              placeholder="Who needs to be notified? Family, NDIS coordinator, team leader, etc."
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving || isSubmitting}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isSaving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">
              All information has been intelligently extracted by AI. Please review and edit as needed before submitting.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
