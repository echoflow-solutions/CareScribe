'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/hooks/use-toast'
import { 
  Settings2, ArrowLeft, ArrowRight, Check, X,
  Mail, MessageSquare, Phone, Calendar, Database,
  FileText, Activity, Shield, Link2, Zap,
  CheckCircle2, Clock, AlertCircle
} from 'lucide-react'

type Integration = {
  id: string
  name: string
  category: 'communication' | 'clinical' | 'compliance' | 'productivity'
  icon: any
  status: 'connected' | 'disconnected' | 'pending'
  description: string
  configFields?: Array<{
    name: string
    label: string
    type: 'text' | 'password' | 'select'
    required?: boolean
    options?: string[]
  }>
}

const integrations: Integration[] = [
  // Communication
  {
    id: 'email',
    name: 'Email (SMTP)',
    category: 'communication',
    icon: Mail,
    status: 'connected',
    description: 'Send incident reports and notifications via email',
    configFields: [
      { name: 'smtp_host', label: 'SMTP Host', type: 'text', required: true },
      { name: 'smtp_port', label: 'SMTP Port', type: 'text', required: true },
      { name: 'smtp_user', label: 'Username', type: 'text', required: true },
      { name: 'smtp_pass', label: 'Password', type: 'password', required: true }
    ]
  },
  {
    id: 'sms',
    name: 'SMS (Twilio)',
    category: 'communication',
    icon: MessageSquare,
    status: 'disconnected',
    description: 'Send urgent alerts via SMS',
    configFields: [
      { name: 'account_sid', label: 'Account SID', type: 'text', required: true },
      { name: 'auth_token', label: 'Auth Token', type: 'password', required: true },
      { name: 'from_number', label: 'From Number', type: 'text', required: true }
    ]
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    icon: MessageSquare,
    status: 'disconnected',
    description: 'Post alerts to Teams channels',
    configFields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'text', required: true }
    ]
  },
  // Clinical
  {
    id: 'meditrack',
    name: 'MediTrack',
    category: 'clinical',
    icon: Activity,
    status: 'disconnected',
    description: 'Sync medication administration records',
    configFields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
      { name: 'facility_code', label: 'Facility Code', type: 'text', required: true }
    ]
  },
  {
    id: 'myhealth',
    name: 'My Health Record',
    category: 'clinical',
    icon: FileText,
    status: 'pending',
    description: 'Access participant health records',
    configFields: [
      { name: 'organization_id', label: 'Organization ID', type: 'text', required: true },
      { name: 'certificate', label: 'Certificate Path', type: 'text', required: true }
    ]
  },
  // Compliance
  {
    id: 'ndis_portal',
    name: 'NDIS Portal',
    category: 'compliance',
    icon: Shield,
    status: 'connected',
    description: 'Submit reportable incidents to NDIS',
    configFields: [
      { name: 'provider_id', label: 'Provider ID', type: 'text', required: true },
      { name: 'api_token', label: 'API Token', type: 'password', required: true }
    ]
  },
  {
    id: 'complia',
    name: 'Complia',
    category: 'compliance',
    icon: FileText,
    status: 'disconnected',
    description: 'Quality and compliance management',
    configFields: [
      { name: 'workspace_id', label: 'Workspace ID', type: 'text', required: true },
      { name: 'api_key', label: 'API Key', type: 'password', required: true }
    ]
  },
  // Productivity
  {
    id: 'roster',
    name: 'RosterOn',
    category: 'productivity',
    icon: Calendar,
    status: 'connected',
    description: 'Import staff schedules and shifts',
    configFields: [
      { name: 'api_endpoint', label: 'API Endpoint', type: 'text', required: true },
      { name: 'api_key', label: 'API Key', type: 'password', required: true }
    ]
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'productivity',
    icon: Database,
    status: 'disconnected',
    description: 'Export timesheets and billing data',
    configFields: [
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true }
    ]
  }
]

export default function IntegrationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('communication')
  const [configuring, setConfiguring] = useState<string | null>(null)
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({})
  const [testing, setTesting] = useState<string | null>(null)

  const handleConfigure = (integration: Integration) => {
    setConfiguring(integration.id)
  }

  const handleSaveConfig = (integrationId: string) => {
    // In a real app, this would save to Supabase
    toast({
      title: 'Configuration Saved',
      description: 'Integration settings have been saved'
    })
    setConfiguring(null)
  }

  const handleTestConnection = async (integrationId: string) => {
    setTesting(integrationId)
    
    // Simulate connection test
    setTimeout(() => {
      toast({
        title: 'Connection Successful',
        description: 'Integration is working correctly'
      })
      setTesting(null)
    }, 2000)
  }

  const updateConfig = (integrationId: string, field: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [field]: value
      }
    }))
  }

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'disconnected':
        return <X className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'disconnected':
        return <Badge variant="secondary">Not Connected</Badge>
    }
  }

  const categories = [
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'clinical', label: 'Clinical Systems', icon: Activity },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'productivity', label: 'Productivity', icon: Zap }
  ]

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const totalCount = integrations.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Integrations</h1>
              <p className="text-gray-600">Connect CareScribe with your existing systems</p>
            </div>
          </div>

          {/* Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>
                {connectedCount} of {totalCount} integrations connected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-500">
                    {Math.round((connectedCount / totalCount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(connectedCount / totalCount) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {categories.map(category => {
                    const categoryIntegrations = integrations.filter(i => i.category === category.id)
                    const connected = categoryIntegrations.filter(i => i.status === 'connected').length
                    const Icon = category.icon
                    
                    return (
                      <div key={category.id} className="text-center">
                        <Icon className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                        <div className="text-sm font-medium">{category.label}</div>
                        <div className="text-2xl font-bold">
                          {connected}/{categoryIntegrations.length}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                <category.icon className="h-4 w-4 mr-2" />
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              {integrations
                .filter(i => i.category === category.id)
                .map(integration => {
                  const Icon = integration.icon
                  const isConfiguring = configuring === integration.id
                  const config = configs[integration.id] || {}
                  
                  return (
                    <Card key={integration.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                {integration.name}
                                {getStatusBadge(integration.status)}
                              </CardTitle>
                              <CardDescription>{integration.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {integration.status === 'connected' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestConnection(integration.id)}
                                disabled={testing === integration.id}
                              >
                                {testing === integration.id ? 'Testing...' : 'Test'}
                              </Button>
                            )}
                            <Button
                              variant={integration.status === 'connected' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => handleConfigure(integration)}
                            >
                              {integration.status === 'connected' ? 'Reconfigure' : 'Configure'}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {isConfiguring && (
                        <CardContent>
                          <div className="space-y-4">
                            {integration.configFields?.map(field => (
                              <div key={field.name}>
                                <Label htmlFor={`${integration.id}-${field.name}`}>
                                  {field.label} {field.required && '*'}
                                </Label>
                                <Input
                                  id={`${integration.id}-${field.name}`}
                                  type={field.type}
                                  value={config[field.name] || ''}
                                  onChange={(e) => updateConfig(integration.id, field.name, e.target.value)}
                                  placeholder={field.label}
                                />
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleSaveConfig(integration.id)}
                              >
                                Save Configuration
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setConfiguring(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
            </TabsContent>
          ))}
        </Tabs>

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Integration Support</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Need help setting up integrations? Our support team is available to assist with configuration 
                  and testing. Contact support@carescribe.com.au or call 1300 CARE AI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/setup/routing')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/setup')}
            >
              Save & Exit Setup
            </Button>
            <Button onClick={() => router.push('/dashboard')}>
              Complete Setup
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}