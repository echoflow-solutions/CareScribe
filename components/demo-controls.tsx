'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/hooks/use-toast'
import { 
  Settings, RefreshCw, Wand2, Users, FileText, 
  Clock, Pill, AlertTriangle, Home, Sparkles,
  Database, Zap
} from 'lucide-react'

interface DemoControlsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoControls({ open, onOpenChange }: DemoControlsProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Demo settings
  const [settings, setSettings] = useState({
    simulateActivity: true,
    activityFrequency: 'medium',
    generateIncidents: true,
    autoResolve: false,
    showTutorials: true
  })

  const handleReset = async (type: string) => {
    setLoading(true)
    
    // Simulate reset action
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast({
      title: `${type} Reset Complete`,
      description: `All ${type.toLowerCase()} data has been reset to demo defaults`
    })
    
    setLoading(false)
  }

  const handleGenerateData = async (type: string) => {
    setLoading(true)
    
    // Simulate data generation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const messages = {
      incident: 'Generated 5 new incident reports with various severities',
      medication: 'Generated medication administration records for the next 24 hours',
      shift: 'Generated shift schedules for the next 7 days',
      participant: 'Added 3 new participant profiles with complete data'
    }
    
    toast({
      title: 'Data Generated',
      description: messages[type as keyof typeof messages]
    })
    
    setLoading(false)
  }

  const quickActions = [
    {
      icon: AlertTriangle,
      label: 'Generate Incident',
      action: () => handleGenerateData('incident'),
      color: 'text-red-600'
    },
    {
      icon: Pill,
      label: 'Generate Med Records',
      action: () => handleGenerateData('medication'),
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      label: 'Generate Shifts',
      action: () => handleGenerateData('shift'),
      color: 'text-green-600'
    },
    {
      icon: Users,
      label: 'Add Participants',
      action: () => handleGenerateData('participant'),
      color: 'text-purple-600'
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Demo Controls
          </DialogTitle>
          <DialogDescription>
            Control demo data and simulate various scenarios for testing
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Quick Actions */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start"
                  onClick={action.action}
                  disabled={loading}
                >
                  <action.icon className={`h-4 w-4 mr-2 ${action.color}`} />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Demo Settings */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Demo Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="simulate-activity">Simulate Real-time Activity</Label>
                  <p className="text-sm text-gray-500">Auto-generate activities and updates</p>
                </div>
                <Switch
                  id="simulate-activity"
                  checked={settings.simulateActivity}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, simulateActivity: checked }))
                  }
                />
              </div>
              
              {settings.simulateActivity && (
                <div className="ml-4">
                  <Label htmlFor="frequency">Activity Frequency</Label>
                  <Select 
                    value={settings.activityFrequency}
                    onValueChange={(value) => 
                      setSettings(prev => ({ ...prev, activityFrequency: value }))
                    }
                  >
                    <SelectTrigger id="frequency" className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Every 30s)</SelectItem>
                      <SelectItem value="medium">Medium (Every 10s)</SelectItem>
                      <SelectItem value="high">High (Every 5s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="generate-incidents">Auto-generate Incidents</Label>
                  <p className="text-sm text-gray-500">Create random incidents periodically</p>
                </div>
                <Switch
                  id="generate-incidents"
                  checked={settings.generateIncidents}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, generateIncidents: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-resolve">Auto-resolve Tasks</Label>
                  <p className="text-sm text-gray-500">Automatically complete pending tasks</p>
                </div>
                <Switch
                  id="auto-resolve"
                  checked={settings.autoResolve}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoResolve: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Reset Options */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Data
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleReset('Reports')}
                disabled={loading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Reset Reports
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReset('Medications')}
                disabled={loading}
              >
                <Pill className="h-4 w-4 mr-2" />
                Reset Medications
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReset('Shifts')}
                disabled={loading}
              >
                <Clock className="h-4 w-4 mr-2" />
                Reset Shifts
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReset('Participants')}
                disabled={loading}
              >
                <Users className="h-4 w-4 mr-2" />
                Reset Participants
              </Button>
            </div>
          </div>

          {/* Demo Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Demo Mode Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This is a demonstration environment. All data is simulated and will reset periodically. 
                Perfect for testing workflows and training staff.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleReset('All')
              onOpenChange(false)
            }}
            disabled={loading}
          >
            <Database className="h-4 w-4 mr-2" />
            Reset All Data
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}