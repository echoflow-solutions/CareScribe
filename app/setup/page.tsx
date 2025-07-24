'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { 
  Building2, Users, UserPlus, Route, Settings2, CheckCircle2, 
  Circle, ArrowRight, ArrowLeft, Home 
} from 'lucide-react'
import Link from 'next/link'

const setupSteps = [
  {
    id: 'organization',
    title: 'Organization Profile',
    description: 'Set up your organization details and NDIS registration',
    icon: Building2,
    href: '/setup/organization',
    completed: false
  },
  {
    id: 'facilities',
    title: 'Facilities',
    description: 'Add your facilities and service locations',
    icon: Home,
    href: '/setup/facilities',
    completed: false
  },
  {
    id: 'staff',
    title: 'Staff Accounts',
    description: 'Create accounts for your team members',
    icon: Users,
    href: '/setup/staff',
    completed: false
  },
  {
    id: 'participants',
    title: 'Participants',
    description: 'Add participant profiles and support plans',
    icon: UserPlus,
    href: '/setup/participants',
    completed: false
  },
  {
    id: 'routing',
    title: 'Routing Rules',
    description: 'Configure incident routing and notifications',
    icon: Route,
    href: '/setup/routing',
    completed: false
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with your existing systems',
    icon: Settings2,
    href: '/setup/integrations',
    completed: false
  }
]

export default function SetupPage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const [organization, setOrganization] = useState<any>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSetupStatus()
  }, [])

  const loadSetupStatus = async () => {
    try {
      const org = await DataService.getOrganization()
      setOrganization(org)
      
      // Check which steps are completed based on data
      const completed: string[] = []
      
      if (org) {
        completed.push('organization')
        
        // Check facilities
        const users = await DataService.getUsers()
        const facilities = new Set(users.map(u => u.facilityId).filter(Boolean))
        if (facilities.size > 0) {
          completed.push('facilities')
        }
        
        // Check staff
        if (users.length > 5) { // More than demo accounts
          completed.push('staff')
        }
        
        // Check participants
        const participants = await DataService.getParticipants()
        if (participants.length > 0) {
          completed.push('participants')
        }
        
        // Check routing rules
        const rules = await DataService.getRoutingRules()
        if (rules.length > 0) {
          completed.push('routing')
        }
      }
      
      setCompletedSteps(completed)
    } catch (error) {
      console.error('Error loading setup status:', error)
    } finally {
      setLoading(false)
    }
  }

  const progress = (completedSteps.length / setupSteps.length) * 100

  const getStepStatus = (stepId: string) => {
    const stepIndex = setupSteps.findIndex(s => s.id === stepId)
    const completedIndex = completedSteps.indexOf(stepId)
    
    if (completedIndex !== -1) return 'completed'
    
    // First uncompleted step is current
    const firstIncomplete = setupSteps.find(s => !completedSteps.includes(s.id))
    if (firstIncomplete?.id === stepId) return 'current'
    
    return 'pending'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading setup status...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CareScribe Setup
          </h1>
          <p className="text-gray-600 mt-2">
            {organization ? 
              `Welcome back! Continue setting up ${organization.name}` : 
              'Let\'s get your organization set up in CareScribe'
            }
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Setup Progress</CardTitle>
            <CardDescription>
              {completedSteps.length} of {setupSteps.length} steps completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
            {progress === 100 && (
              <p className="text-green-600 mt-4 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Setup complete! Your organization is ready to use CareScribe.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {setupSteps.map((step) => {
            const status = getStepStatus(step.id)
            const Icon = step.icon
            
            return (
              <Card 
                key={step.id}
                className={`relative transition-all cursor-pointer hover:shadow-lg ${
                  status === 'current' ? 'ring-2 ring-blue-500' : ''
                } ${
                  status === 'pending' ? 'opacity-75' : ''
                }`}
                onClick={() => router.push(step.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${
                      status === 'completed' ? 'bg-green-100' :
                      status === 'current' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        status === 'completed' ? 'text-green-600' :
                        status === 'current' ? 'text-blue-600' :
                        'text-gray-400'
                      }`} />
                    </div>
                    {status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : status === 'current' ? (
                      <Circle className="h-5 w-5 text-blue-600 fill-blue-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <CardTitle className="mt-4">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    variant={status === 'current' ? 'default' : 'outline'}
                    disabled={status === 'pending' && completedSteps.length < setupSteps.findIndex(s => s.id === step.id)}
                  >
                    {status === 'completed' ? 'Review' : 
                     status === 'current' ? 'Continue Setup' : 
                     'Start'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        {progress === 100 && (
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle>🎉 Setup Complete!</CardTitle>
              <CardDescription>
                Your organization is fully configured. Here are some next steps:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/quick-report')}
                >
                  Create First Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/setup/staff')}
                >
                  Invite Team Members
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}