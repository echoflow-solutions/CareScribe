'use client'

import { useState } from 'react'
import { format, addDays, differenceInDays } from 'date-fns'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import {
  GraduationCap, Award, CheckCircle, Clock, AlertCircle,
  BookOpen, Video, FileText, Shield, Users, Heart,
  Pill, Brain, Target, TrendingUp, Play, Star,
  Calendar, ChevronRight, Lock, Unlock, Download
} from 'lucide-react'

interface Certification {
  id: string
  name: string
  provider: string
  status: 'active' | 'expiring_soon' | 'expired'
  issueDate: Date
  expiryDate: Date
  certificateUrl?: string
}

interface TrainingModule {
  id: string
  title: string
  category: 'mandatory' | 'recommended' | 'optional'
  type: 'video' | 'interactive' | 'document' | 'quiz'
  duration: number
  status: 'completed' | 'in_progress' | 'not_started'
  progress?: number
  dueDate?: Date
  completedDate?: Date
}

interface Policy {
  id: string
  title: string
  version: string
  requiresAcknowledgment: boolean
  acknowledged: boolean
  acknowledgedDate?: Date
  updatedDate: Date
}

export default function TrainingPage() {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [selectedView, setSelectedView] = useState<'certifications' | 'training' | 'policies'>('certifications')

  const certifications: Certification[] = [
    {
      id: '1',
      name: 'First Aid Certificate',
      provider: 'St John Ambulance',
      status: 'active',
      issueDate: new Date('2024-01-15'),
      expiryDate: new Date('2025-01-15'),
      certificateUrl: '#'
    },
    {
      id: '2',
      name: 'CPR Certification',
      provider: 'Australian Resuscitation Council',
      status: 'expiring_soon',
      issueDate: new Date('2024-02-01'),
      expiryDate: new Date('2025-02-01'),
      certificateUrl: '#'
    },
    {
      id: '3',
      name: 'Medication Management',
      provider: 'NDIS Quality and Safeguards Commission',
      status: 'active',
      issueDate: new Date('2024-03-10'),
      expiryDate: new Date('2026-03-10')
    },
    {
      id: '4',
      name: 'Manual Handling',
      provider: 'WorkSafe Victoria',
      status: 'active',
      issueDate: new Date('2024-04-20'),
      expiryDate: new Date('2025-04-20')
    },
    {
      id: '5',
      name: 'Infection Control',
      provider: 'Australian Department of Health',
      status: 'expiring_soon',
      issueDate: new Date('2023-12-01'),
      expiryDate: new Date('2024-12-01')
    }
  ]

  const trainingModules: TrainingModule[] = [
    {
      id: '1',
      title: 'Understanding Autism Spectrum Disorder',
      category: 'mandatory',
      type: 'video',
      duration: 45,
      status: 'in_progress',
      progress: 65,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Positive Behavior Support Strategies',
      category: 'mandatory',
      type: 'interactive',
      duration: 60,
      status: 'completed',
      completedDate: new Date('2024-09-15')
    },
    {
      id: '3',
      title: 'Medication Administration Safety',
      category: 'mandatory',
      type: 'video',
      duration: 30,
      status: 'not_started',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      title: 'Person-Centered Care Approach',
      category: 'recommended',
      type: 'document',
      duration: 20,
      status: 'completed',
      completedDate: new Date('2024-08-22')
    },
    {
      id: '5',
      title: 'Emergency Response Procedures',
      category: 'mandatory',
      type: 'quiz',
      duration: 15,
      status: 'not_started',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '6',
      title: 'Cultural Competency in Care',
      category: 'recommended',
      type: 'video',
      duration: 40,
      status: 'not_started'
    }
  ]

  const policies: Policy[] = [
    {
      id: '1',
      title: 'Incident Reporting Policy',
      version: '2.1',
      requiresAcknowledgment: true,
      acknowledged: true,
      acknowledgedDate: new Date('2024-09-01'),
      updatedDate: new Date('2024-09-01')
    },
    {
      id: '2',
      title: 'Privacy and Confidentiality Policy',
      version: '3.0',
      requiresAcknowledgment: true,
      acknowledged: false,
      updatedDate: new Date('2024-10-01')
    },
    {
      id: '3',
      title: 'Medication Management Policy',
      version: '1.8',
      requiresAcknowledgment: true,
      acknowledged: true,
      acknowledgedDate: new Date('2024-08-15'),
      updatedDate: new Date('2024-08-15')
    },
    {
      id: '4',
      title: 'Workplace Health and Safety',
      version: '2.5',
      requiresAcknowledgment: true,
      acknowledged: true,
      acknowledgedDate: new Date('2024-07-10'),
      updatedDate: new Date('2024-07-10')
    }
  ]

  const getCertificationStatus = (cert: Certification) => {
    const daysUntilExpiry = differenceInDays(cert.expiryDate, new Date())

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600 bg-red-100 border-red-300', icon: AlertCircle }
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring_soon', color: 'text-orange-600 bg-orange-100 border-orange-300', icon: Clock }
    } else {
      return { status: 'active', color: 'text-green-600 bg-green-100 border-green-300', icon: CheckCircle }
    }
  }

  const getModuleCategoryColor = (category: TrainingModule['category']) => {
    switch (category) {
      case 'mandatory': return 'bg-red-100 text-red-700 border-red-300'
      case 'recommended': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'optional': return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getModuleIcon = (type: TrainingModule['type']) => {
    switch (type) {
      case 'video': return Video
      case 'interactive': return Brain
      case 'document': return FileText
      case 'quiz': return Target
    }
  }

  const acknowledgePolicy = (policyId: string) => {
    toast({
      title: 'Policy Acknowledged',
      description: 'Thank you for reviewing and acknowledging this policy',
      duration: 2000
    })
  }

  const startTraining = (moduleId: string) => {
    toast({
      title: 'Training Started',
      description: 'Opening training module...',
      duration: 2000
    })
  }

  const completionRate = Math.round(
    (trainingModules.filter(m => m.status === 'completed').length / trainingModules.length) * 100
  )

  const activeCerts = certifications.filter(c => getCertificationStatus(c).status === 'active').length
  const expiringCerts = certifications.filter(c => getCertificationStatus(c).status === 'expiring_soon').length
  const pendingPolicies = policies.filter(p => p.requiresAcknowledgment && !p.acknowledged).length
  const mandatoryModules = trainingModules.filter(m => m.category === 'mandatory' && m.status !== 'completed').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training & Certifications</h1>
            <p className="text-gray-600">Professional development and compliance tracking</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Certifications</p>
                <p className="text-2xl font-bold text-green-600">{activeCerts}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={expiringCerts > 0 ? 'border-2 border-orange-300' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{expiringCerts}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={mandatoryModules > 0 ? 'border-2 border-red-300' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mandatory Training</p>
                <p className="text-2xl font-bold text-red-600">{mandatoryModules}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(expiringCerts > 0 || pendingPolicies > 0 || mandatoryModules > 0) && (
        <div className="mb-6 space-y-3">
          {expiringCerts > 0 && (
            <Card className="border-2 border-orange-300 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Certifications Expiring Soon</h3>
                    <p className="text-sm text-orange-700">
                      You have {expiringCerts} certification(s) expiring within 30 days. Please arrange renewal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {mandatoryModules > 0 && (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">Mandatory Training Required</h3>
                    <p className="text-sm text-red-700">
                      Complete {mandatoryModules} mandatory training module(s) to maintain compliance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {pendingPolicies > 0 && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Policy Acknowledgment Required</h3>
                    <p className="text-sm text-blue-700">
                      Review and acknowledge {pendingPolicies} updated policy document(s).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedView === 'certifications' ? 'default' : 'outline'}
          onClick={() => setSelectedView('certifications')}
        >
          <Award className="h-4 w-4 mr-2" />
          Certifications
        </Button>
        <Button
          variant={selectedView === 'training' ? 'default' : 'outline'}
          onClick={() => setSelectedView('training')}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Training Modules
        </Button>
        <Button
          variant={selectedView === 'policies' ? 'default' : 'outline'}
          onClick={() => setSelectedView('policies')}
        >
          <Shield className="h-4 w-4 mr-2" />
          Policies
          {pendingPolicies > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingPolicies}
            </Badge>
          )}
        </Button>
      </div>

      {/* Certifications View */}
      {selectedView === 'certifications' && (
        <div className="space-y-4">
          {certifications.map((cert) => {
            const statusInfo = getCertificationStatus(cert)
            const StatusIcon = statusInfo.icon
            const daysUntilExpiry = differenceInDays(cert.expiryDate, new Date())

            return (
              <Card key={cert.id} className={`border-2 ${statusInfo.color}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${statusInfo.color}`}>
                        <StatusIcon className="h-6 w-6" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{cert.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{cert.provider}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Issued:</span> {format(cert.issueDate, 'MMM dd, yyyy')}
                          </div>
                          <div>
                            <span className="font-medium">Expires:</span> {format(cert.expiryDate, 'MMM dd, yyyy')}
                          </div>
                          <div>
                            <span className="font-medium">
                              {daysUntilExpiry >= 0 ? `${daysUntilExpiry} days remaining` : `Expired ${Math.abs(daysUntilExpiry)} days ago`}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {cert.certificateUrl && (
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Download Certificate
                            </Button>
                          )}
                          {statusInfo.status === 'expiring_soon' && (
                            <Button size="sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule Renewal
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <Badge variant="secondary" className={statusInfo.color}>
                      {statusInfo.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Training Modules View */}
      {selectedView === 'training' && (
        <div className="space-y-4">
          {trainingModules.map((module) => {
            const ModuleIcon = getModuleIcon(module.type)

            return (
              <Card key={module.id} className={module.category === 'mandatory' ? 'border-2 border-red-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${module.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <ModuleIcon className={`h-6 w-6 ${module.status === 'completed' ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getModuleCategoryColor(module.category)}>
                              {module.category}
                            </Badge>
                            <span className="text-sm text-gray-600">{module.duration} minutes</span>
                          </div>
                        </div>
                        <Badge variant={module.status === 'completed' ? 'default' : 'secondary'}>
                          {module.status === 'completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {module.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {module.status === 'in_progress' && module.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-semibold">{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>
                      )}

                      {module.dueDate && module.status !== 'completed' && (
                        <div className="mb-3 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Due: {format(module.dueDate, 'MMM dd, yyyy')}
                          {differenceInDays(module.dueDate, new Date()) <= 7 && (
                            <Badge variant="destructive" className="ml-2">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      )}

                      {module.completedDate && (
                        <div className="mb-3 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Completed on {format(module.completedDate, 'MMM dd, yyyy')}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {module.status === 'not_started' && (
                          <Button size="sm" onClick={() => startTraining(module.id)}>
                            <Play className="h-3 w-3 mr-1" />
                            Start Training
                          </Button>
                        )}
                        {module.status === 'in_progress' && (
                          <Button size="sm" onClick={() => startTraining(module.id)}>
                            <Play className="h-3 w-3 mr-1" />
                            Continue Training
                          </Button>
                        )}
                        {module.status === 'completed' && (
                          <Button size="sm" variant="outline" onClick={() => startTraining(module.id)}>
                            <Star className="h-3 w-3 mr-1" />
                            Review Module
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Policies View */}
      {selectedView === 'policies' && (
        <div className="space-y-4">
          {policies.map((policy) => (
            <Card
              key={policy.id}
              className={!policy.acknowledged && policy.requiresAcknowledgment ? 'border-2 border-blue-300 bg-blue-50' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${policy.acknowledged ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {policy.acknowledged ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-blue-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{policy.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Version {policy.version}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Updated:</span> {format(policy.updatedDate, 'MMM dd, yyyy')}
                        </div>
                        {policy.acknowledgedDate && (
                          <div>
                            <span className="font-medium">Acknowledged:</span> {format(policy.acknowledgedDate, 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          View Policy
                        </Button>
                        {!policy.acknowledged && policy.requiresAcknowledgment && (
                          <Button size="sm" onClick={() => acknowledgePolicy(policy.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {policy.acknowledged ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Acknowledged
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Action Required
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
