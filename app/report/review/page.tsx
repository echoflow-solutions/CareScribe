'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, Send, Edit, Mic, ChevronRight, CheckCircle,
  Calendar, MapPin, User, Brain, Image, Loader2
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { format } from 'date-fns'

function ReportReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentUser } = useStore()
  const [reportType, setReportType] = useState<'both' | 'abc' | 'incident'>('both')
  const [isEditing, setIsEditing] = useState(false)
  const [abcReport, setAbcReport] = useState({
    antecedent: 'Loud, sudden drilling noise from maintenance work in adjacent room. James was in the living room engaged in quiet activity when the noise began without warning.',
    behavior: `James displayed signs of sensory overload including:
• Covering ears with both hands
• Rocking back and forth
• Verbal repetition: "too loud, too loud"
• Pushed over bookshelf after 2-3 minutes of distress`,
    consequence: `Staff response:
• Used calm voice to offer quiet room option
• Requested immediate stop to maintenance work
• Accompanied James to quiet room
• Provided weighted blanket
Result: James calmed within 10 minutes, no injuries`
  })
  const [incidentReport, setIncidentReport] = useState({
    description: 'During a sensory overload episode triggered by loud maintenance drilling, James Mitchell pushed over a bookshelf in the living room. Books scattered across the floor creating a trip hazard.',
    propertyDamage: 'Bookshelf tipped over, multiple books scattered. No structural damage to bookshelf. Estimated cleanup time: 30 minutes.',
    immediateActions: 'Area secured to prevent trips. Maintenance work halted. Participant moved to quiet room for de-escalation.',
    followUp: 'Maintenance coordinator notified. Work order to be created for bookshelf inspection and re-securing.'
  })

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    const type = searchParams.get('type') as 'both' | 'abc' | 'incident'
    if (type) {
      setReportType(type)
    }
  }, [currentUser, router, searchParams])

  const handleSubmit = async () => {
    // Create incident record with facility_id for cross-user synchronization
    const incident = {
      id: Date.now().toString(),
      participantId: '1', // James Mitchell
      participantName: 'James Mitchell',
      type: 'behavioral' as const,
      severity: 'medium' as const,
      timestamp: new Date().toISOString(),
      location: currentUser!.facilityId || 'Living Room - House 3',
      facilityId: currentUser!.facilityId, // CRITICAL: Enables cross-user sync at facility level
      staffId: currentUser!.id,
      staffName: currentUser!.name,
      description: 'Sensory overload due to loud maintenance noise, resulting in property damage',
      antecedent: abcReport.antecedent,
      behavior: abcReport.behavior,
      consequence: abcReport.consequence,
      interventions: [
        {
          id: '1',
          description: 'Moved to quiet room with weighted blanket',
          effectiveness: 'effective' as const,
          timestamp: new Date().toISOString()
        }
      ],
      outcomes: [
        {
          id: '1',
          description: 'James calmed within 10 minutes',
          followUpRequired: true,
          timestamp: new Date().toISOString()
        }
      ],
      photos: ['bookshelf-damage.jpg'],
      reportType: reportType,
      status: 'submitted' as const
    }

    await DataService.createIncident(incident)
    
    // Navigate to submission confirmation
    router.push('/report/submitted')
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Review Your Reports</h1>
            <p className="text-sm text-gray-600">Ready for Submission</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              <Brain className="mr-2 h-3 w-3" />
              AI Generated
            </Badge>
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? 'Done Editing' : 'Edit Reports'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {reportType === 'both' ? (
          <Tabs defaultValue="abc" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="abc">
                <FileText className="mr-2 h-4 w-4" />
                ABC Report
              </TabsTrigger>
              <TabsTrigger value="incident">
                <FileText className="mr-2 h-4 w-4" />
                Incident Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="abc">
              <ABCReportContent
                report={abcReport}
                isEditing={isEditing}
                onChange={setAbcReport}
                currentUser={currentUser}
              />
            </TabsContent>

            <TabsContent value="incident">
              <IncidentReportContent
                report={incidentReport}
                isEditing={isEditing}
                onChange={setIncidentReport}
                currentUser={currentUser}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {reportType === 'abc' ? (
              <ABCReportContent
                report={abcReport}
                isEditing={isEditing}
                onChange={setAbcReport}
                currentUser={currentUser}
              />
            ) : (
              <IncidentReportContent
                report={incidentReport}
                isEditing={isEditing}
                onChange={setIncidentReport}
                currentUser={currentUser}
              />
            )}
          </>
        )}

        {/* AI Insights */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">AI Insights</h3>
              <p className="text-sm text-blue-700 mt-1">
                This incident aligns with established patterns. Consider scheduling maintenance 
                during James's community outings to prevent future sensory overload incidents.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Save as Draft
          </Button>
          <div className="flex gap-4">
            <Button variant="outline">
              <Mic className="mr-2 h-4 w-4" />
              Add Voice Note
            </Button>
            <Button onClick={handleSubmit} size="lg">
              Submit All Reports
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ABCReportContent({ report, isEditing, onChange, currentUser }: any) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Report Header */}
        <div>
          <h2 className="text-xl font-bold">ABC Behavioral Report - James Mitchell</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(), 'MMMM d, yyyy h:mm a')}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              House 3
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {currentUser.name}
            </span>
          </div>
        </div>

        {/* Antecedent */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Antecedent</h3>
          {isEditing ? (
            <Textarea
              value={report.antecedent}
              onChange={(e) => onChange({ ...report, antecedent: e.target.value })}
              className="min-h-[100px]"
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">{report.antecedent}</p>
            </div>
          )}
        </div>

        {/* Behavior */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Behavior</h3>
          {isEditing ? (
            <Textarea
              value={report.behavior}
              onChange={(e) => onChange({ ...report, behavior: e.target.value })}
              className="min-h-[150px]"
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-line">{report.behavior}</p>
            </div>
          )}
        </div>

        {/* Consequence */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Consequence</h3>
          {isEditing ? (
            <Textarea
              value={report.consequence}
              onChange={(e) => onChange({ ...report, consequence: e.target.value })}
              className="min-h-[150px]"
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-line">{report.consequence}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function IncidentReportContent({ report, isEditing, onChange, currentUser }: any) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Report Header */}
        <div>
          <h2 className="text-xl font-bold">Property Incident Report</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(), 'MMMM d, yyyy h:mm a')}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              House 3 - Living Room
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {currentUser.name}
            </span>
          </div>
        </div>

        {/* Incident Description */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Incident Description</h3>
          {isEditing ? (
            <Textarea
              value={report.description}
              onChange={(e) => onChange({ ...report, description: e.target.value })}
              className="min-h-[100px]"
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">{report.description}</p>
            </div>
          )}
        </div>

        {/* Property Damage */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Property Damage Details</h3>
          {isEditing ? (
            <Textarea
              value={report.propertyDamage}
              onChange={(e) => onChange({ ...report, propertyDamage: e.target.value })}
              className="min-h-[80px]"
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">{report.propertyDamage}</p>
            </div>
          )}
        </div>

        {/* Photos */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Documentation Photos</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gray-50">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-xs text-center">Bookshelf Overview</p>
            </Card>
            <Card className="p-4 bg-gray-50">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-xs text-center">Damage Detail</p>
            </Card>
          </div>
        </div>

        {/* Immediate Actions */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Immediate Actions Taken</h3>
          {isEditing ? (
            <Textarea
              value={report.immediateActions}
              onChange={(e) => onChange({ ...report, immediateActions: e.target.value })}
              className="min-h-[80px]"
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">{report.immediateActions}</p>
            </div>
          )}
        </div>

        {/* Follow-up Required */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Follow-up Required</h3>
          {isEditing ? (
            <Textarea
              value={report.followUp}
              onChange={(e) => onChange({ ...report, followUp: e.target.value })}
              className="min-h-[80px]"
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm">{report.followUp}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function ReportReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ReportReviewContent />
    </Suspense>
  )
}