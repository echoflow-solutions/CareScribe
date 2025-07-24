'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, Clock, Users, AlertTriangle, Calendar,
  Thermometer, Pill, Wrench, FileText, Play
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { DataService } from '@/lib/data/service'
import { format } from 'date-fns'

export default function ShiftStartPage() {
  const router = useRouter()
  const { currentUser, currentShift, setCurrentShift } = useStore()
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    // Load alerts
    loadAlerts()

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [currentUser, router])

  const loadAlerts = async () => {
    const alertData = await DataService.getAlerts()
    setAlerts(alertData.filter(a => !a.acknowledged))
  }

  const handleStartShift = async () => {
    setIsLoading(true)
    try {
      const shift = {
        id: `shift-${Date.now()}`,
        staffId: currentUser!.id,
        facilityId: '650e8400-e29b-41d4-a716-446655440003', // House 3 UUID
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
        status: 'active' as const
      }
      
      await DataService.startShift(shift)
      setCurrentShift(shift)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error starting shift:', error)
      setIsLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Greeting Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 text-lg">
              {format(currentTime, 'EEEE, MMMM d, yyyy')} • {format(currentTime, 'h:mm a')}
            </p>
          </div>

          {/* Shift Start Card */}
          <Card className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Starting your shift at House 3?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <MapPin className="h-5 w-5" />
                    <span>House 3 - Sunshine Support</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span>7:00 AM - 3:00 PM</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>6 active participants</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button size="lg" onClick={handleStartShift} disabled={isLoading}>
                    <Play className="mr-2 h-4 w-4" />
                    Yes, Start My Shift
                  </Button>
                  <Button size="lg" variant="outline">
                    Different Location ▼
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Pre-Shift Intelligence */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pre-Shift Intelligence
            </h3>
            
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className="border-l-4 border-l-yellow-500">
                  <AlertDescription className="flex items-start gap-3">
                    {alert.type === 'risk' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    {alert.type === 'medication' && <Pill className="h-4 w-4 text-blue-500 mt-0.5" />}
                    {alert.type === 'environmental' && <Wrench className="h-4 w-4 text-orange-500 mt-0.5" />}
                    <span>{alert.message}</span>
                  </AlertDescription>
                </Alert>
              ))}
              
              <Alert className="border-l-4 border-l-blue-500">
                <AlertDescription className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span>2 reports from night shift require review</span>
                </AlertDescription>
              </Alert>
            </div>

            <Button variant="link" className="mt-4 p-0">
              View Full Handover →
            </Button>
          </Card>

          {/* Additional Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today's Activities</p>
                  <p className="font-semibold">Menu Review at 2 PM</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Thermometer className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weather</p>
                  <p className="font-semibold">28°C - Sunny</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Staff on Duty</p>
                  <p className="font-semibold">3 Support Workers</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Demo Mode Indicator */}
          <div className="text-center">
            <Badge variant="secondary" className="px-4 py-2">
              Demo Mode - Simulated Data
            </Badge>
          </div>
        </motion.div>
      </div>
    </div>
  )
}