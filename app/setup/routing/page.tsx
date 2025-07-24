'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/hooks/use-toast'
import { DataService } from '@/lib/data/service'
import { RoutingRule } from '@/lib/types'
import { 
  Route, Plus, Edit2, Trash2, Bell, Clock, 
  Users, AlertTriangle, ArrowLeft, ArrowRight,
  Zap, Filter, Check, X, Play, Pause,
  Mail, Phone, MessageSquare, Brain, Heart
} from 'lucide-react'

type Condition = {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: string | string[]
}

type Action = {
  type: 'notify' | 'escalate' | 'create_task'
  recipient: string
  method?: 'email' | 'sms' | 'push' | 'all'
  timing: 'immediate' | 'within_30_min' | 'within_1_hour' | 'next_business_day'
  message?: string
}

const conditionFields = [
  { value: 'type', label: 'Incident Type' },
  { value: 'severity', label: 'Severity Level' },
  { value: 'participant_risk', label: 'Participant Risk Level' },
  { value: 'facility', label: 'Facility' },
  { value: 'time_of_day', label: 'Time of Day' },
  { value: 'staff_role', label: 'Reporter Role' }
]

const operators = {
  equals: 'is equal to',
  contains: 'contains',
  greater_than: 'is greater than',
  less_than: 'is less than'
}

const timingOptions = [
  { value: 'immediate', label: 'Immediately' },
  { value: 'within_30_min', label: 'Within 30 minutes' },
  { value: 'within_1_hour', label: 'Within 1 hour' },
  { value: 'next_business_day', label: 'Next business day' }
]

export default function RoutingRulesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<RoutingRule[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null)
  const [saving, setSaving] = useState(false)
  const [testingRule, setTestingRule] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditions: [] as Condition[],
    actions: [] as Action[],
    enabled: true
  })

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const routingRules = await DataService.getRoutingRules()
      setRules(routingRules)
    } catch (error) {
      console.error('Error loading routing rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, {
        field: 'type',
        operator: 'equals',
        value: ''
      }]
    }))
  }

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => 
        i === index ? { ...c, ...updates } : c
      )
    }))
  }

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }))
  }

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, {
        type: 'notify',
        recipient: '',
        method: 'all',
        timing: 'immediate'
      }]
    }))
  }

  const updateAction = (index: number, updates: Partial<Action>) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((a, i) => 
        i === index ? { ...a, ...updates } : a
      )
    }))
  }

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    if (!formData.name) {
      toast({
        title: 'Missing Name',
        description: 'Please provide a name for the routing rule',
        variant: 'destructive'
      })
      return false
    }

    if (formData.conditions.length === 0) {
      toast({
        title: 'No Conditions',
        description: 'Please add at least one condition',
        variant: 'destructive'
      })
      return false
    }

    if (formData.actions.length === 0) {
      toast({
        title: 'No Actions',
        description: 'Please add at least one action',
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
      const rule: RoutingRule = {
        id: editingRule?.id || `rule-${Date.now()}`,
        name: formData.name,
        conditions: formData.conditions,
        actions: formData.actions,
        enabled: formData.enabled
      }

      if (editingRule) {
        await DataService.updateRoutingRule(rule.id, rule)
        setRules(prev => prev.map(r => r.id === rule.id ? rule : r))
        toast({
          title: 'Rule Updated',
          description: `${formData.name} has been updated`
        })
      } else {
        setRules(prev => [...prev, rule])
        toast({
          title: 'Rule Created',
          description: `${formData.name} has been created`
        })
      }

      setShowAddDialog(false)
      setEditingRule(null)
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save routing rule',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (rule: RoutingRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      description: '',
      conditions: rule.conditions as Condition[],
      actions: rule.actions as Action[],
      enabled: rule.enabled
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this routing rule?')) return

    setRules(prev => prev.filter(r => r.id !== id))
    toast({
      title: 'Rule Deleted',
      description: 'The routing rule has been removed'
    })
  }

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    const rule = rules.find(r => r.id === id)
    if (rule) {
      await DataService.updateRoutingRule(id, { ...rule, enabled })
      setRules(prev => prev.map(r => r.id === id ? { ...r, enabled } : r))
    }
  }

  const handleTestRule = async (id: string) => {
    setTestingRule(id)
    
    // Simulate testing
    setTimeout(() => {
      toast({
        title: 'Rule Test Complete',
        description: 'The routing rule would trigger for 3 recent incidents'
      })
      setTestingRule(null)
    }, 2000)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      conditions: [],
      actions: [],
      enabled: true
    })
  }

  const getConditionDisplay = (condition: Condition): string => {
    const field = conditionFields.find(f => f.value === condition.field)?.label || condition.field
    const op = operators[condition.operator]
    const value = Array.isArray(condition.value) ? condition.value.join(', ') : condition.value
    return `${field} ${op} ${value}`
  }

  const getActionDisplay = (action: Action): string => {
    const timing = timingOptions.find(t => t.value === action.timing)?.label || action.timing
    switch (action.type) {
      case 'notify':
        return `Notify ${action.recipient} ${timing}`
      case 'escalate':
        return `Escalate to ${action.recipient} ${timing}`
      case 'create_task':
        return `Create task for ${action.recipient} ${timing}`
      default:
        return 'Unknown action'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading routing rules...</div>
      </div>
    )
  }

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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Route className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Routing Rules</h1>
                <p className="text-gray-600">Configure how incidents are routed and escalated</p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rules.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {rules.filter(r => r.enabled).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {rules.reduce((sum, r) => sum + (r.actions?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Predefined Rules Examples */}
        {rules.length === 0 && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Get Started with Common Rules</CardTitle>
              <CardDescription>
                Here are some recommended routing rules to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setFormData({
                      name: 'Critical Incident Escalation',
                      description: 'Immediately notify management for critical incidents',
                      conditions: [{
                        field: 'severity',
                        operator: 'equals',
                        value: 'high'
                      }],
                      actions: [
                        {
                          type: 'notify',
                          recipient: 'Team Leader',
                          method: 'all',
                          timing: 'immediate'
                        },
                        {
                          type: 'escalate',
                          recipient: 'Area Manager',
                          method: 'all',
                          timing: 'within_30_min'
                        }
                      ],
                      enabled: true
                    })
                    setShowAddDialog(true)
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                  Critical Incident Escalation
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setFormData({
                      name: 'Behavioral Incident Tracking',
                      description: 'Route behavioral incidents to clinical team',
                      conditions: [{
                        field: 'type',
                        operator: 'equals',
                        value: 'behavioral'
                      }],
                      actions: [{
                        type: 'notify',
                        recipient: 'Clinical Manager',
                        method: 'email',
                        timing: 'within_30_min'
                      }],
                      enabled: true
                    })
                    setShowAddDialog(true)
                  }}
                >
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  Behavioral Incident Tracking
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setFormData({
                      name: 'Medical Emergency Response',
                      description: 'Immediate response for medical emergencies',
                      conditions: [{
                        field: 'type',
                        operator: 'equals',
                        value: 'medical'
                      }],
                      actions: [
                        {
                          type: 'notify',
                          recipient: 'All Staff',
                          method: 'all',
                          timing: 'immediate'
                        },
                        {
                          type: 'notify',
                          recipient: 'Nurse',
                          method: 'all',
                          timing: 'immediate'
                        }
                      ],
                      enabled: true
                    })
                    setShowAddDialog(true)
                  }}
                >
                  <Heart className="h-4 w-4 mr-2 text-red-600" />
                  Medical Emergency Response
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rules List */}
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {rule.name}
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {rule.conditions?.length || 0} condition{rule.conditions?.length !== 1 ? 's' : ''}, 
                      {' '}{rule.actions?.length || 0} action{rule.actions?.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => handleToggleEnabled(rule.id, checked)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestRule(rule.id)}
                      disabled={testingRule === rule.id}
                    >
                      {testingRule === rule.id ? (
                        <>Testing...</>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(rule)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Conditions */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      When
                    </h4>
                    <div className="space-y-1 ml-6">
                      {rule.conditions?.map((condition, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {getConditionDisplay(condition as Condition)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Then
                    </h4>
                    <div className="space-y-1 ml-6">
                      {rule.actions?.map((action, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          {action.type === 'notify' && <Bell className="h-3 w-3" />}
                          {action.type === 'escalate' && <AlertTriangle className="h-3 w-3" />}
                          {action.type === 'create_task' && <Zap className="h-3 w-3 text-blue-600" />}
                          {getActionDisplay(action as Action)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Routing Rule' : 'Create New Routing Rule'}
              </DialogTitle>
              <DialogDescription>
                Define conditions and actions for incident routing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div>
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Critical Incident Escalation"
                />
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Conditions (When)</Label>
                  <Button onClick={addCondition} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                
                {formData.conditions.map((condition, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <Select 
                          value={condition.field}
                          onValueChange={(v) => updateCondition(index, { field: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionFields.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select 
                          value={condition.operator}
                          onValueChange={(v) => updateCondition(index, { operator: v as Condition['operator'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(operators).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          value={condition.value as string}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          placeholder="Value"
                        />
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}

                {formData.conditions.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No conditions added yet
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Actions (Then)</Label>
                  <Button onClick={addAction} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Action
                  </Button>
                </div>
                
                {formData.actions.map((action, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Select 
                          value={action.type}
                          onValueChange={(v) => updateAction(index, { type: v as Action['type'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="notify">Notify</SelectItem>
                            <SelectItem value="escalate">Escalate</SelectItem>
                            <SelectItem value="create_task">Create Task</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          value={action.recipient}
                          onChange={(e) => updateAction(index, { recipient: e.target.value })}
                          placeholder="Recipient (e.g., Team Leader)"
                        />
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <Select 
                          value={action.method || 'all'}
                          onValueChange={(v) => updateAction(index, { method: v as Action['method'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            <SelectItem value="email">Email Only</SelectItem>
                            <SelectItem value="sms">SMS Only</SelectItem>
                            <SelectItem value="push">Push Notification Only</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select 
                          value={action.timing}
                          onValueChange={(v) => updateAction(index, { timing: v as Action['timing'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timingOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}

                {formData.actions.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No actions added yet
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingRule(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingRule ? 'Update' : 'Create')} Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/setup/participants')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => router.push('/setup/integrations')}>
            Continue to Integrations
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}