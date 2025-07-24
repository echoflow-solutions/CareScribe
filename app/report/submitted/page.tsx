'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, Clock, Send, Home, FileText, 
  Users, Wrench, DollarSign, Calendar, Bell
} from 'lucide-react'
import { useStore } from '@/lib/store'
import confetti from 'canvas-confetti'

export default function ReportSubmittedPage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const [showDistribution, setShowDistribution] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    // Celebrate with confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Show distribution after a delay
    setTimeout(() => {
      setShowDistribution(true)
    }, 1500)
  }, [currentUser, router])

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full space-y-6"
      >
        {/* Success Message */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Reports Submitted Successfully ✓</h1>
          <p className="text-gray-600">2:28 PM</p>
        </motion.div>

        {/* Summary Card */}
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">ABC Behavioral Report</p>
              <p className="text-xs text-gray-500">Submitted</p>
            </div>
            <div>
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Property Incident Report</p>
              <p className="text-xs text-gray-500">Submitted</p>
            </div>
            <div>
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Photos attached</p>
              <p className="text-xs text-gray-500">and analyzed</p>
            </div>
            <div>
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Notifications sent</p>
              <p className="text-xs text-gray-500">to 5 recipients</p>
            </div>
          </div>
        </Card>

        {/* Distribution Details */}
        {showDistribution && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold">Report Distribution</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ABC Report Distribution */}
              <Card className="p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  ABC Behavioral Report
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Send className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Immediate:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Tom Anderson (Team Leader) - Full report + alert</li>
                        <li>• Dr. Sarah Kim (Clinical Manager) - Clinical view</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">For Review:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Behavioral Support Team - Pattern analysis</li>
                        <li>• James's Support Plan - Auto-updated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Incident Report Distribution */}
              <Card className="p-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Property Incident Report
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Send className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Immediate:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Tom Anderson (Team Leader) - Full report</li>
                        <li>• Mike Chen (Maintenance) - Damage photos + location</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Next Business Day:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Finance Team - Cost assessment request</li>
                        <li>• Lisa Park (Area Manager) - Summary + photos</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wrench className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Auto-Generated:</p>
                      <p className="text-xs text-gray-600">• Work Order #WO-2847 created</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* What Happens Next */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                What Happens Next
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Now</Badge>
                    <span className="text-gray-700">Team Leader Tom has been notified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">10 min</Badge>
                    <span className="text-gray-700">Clinical team reviews behavioral pattern</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">30 min</Badge>
                    <span className="text-gray-700">Maintenance assesses damage</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">4:00 PM</Badge>
                    <span className="text-gray-700">You'll receive follow-up reminder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Tomorrow</Badge>
                    <span className="text-gray-700">Pattern analysis added to James's profile</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        <Card className="p-6 text-center">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-green-600">3 minutes 12 seconds</p>
              <p className="text-sm text-gray-600">Documentation Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">22 minutes</p>
              <p className="text-sm text-gray-600">Time Saved vs. Manual</p>
            </div>
          </div>
        </Card>

        {/* AI Tip */}
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">AI Tip</p>
              <p className="text-xs text-purple-700">
                Consider implementing quiet activities for James during tomorrow's scheduled maintenance at 10 AM.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={() => router.push('/dashboard')} size="lg">
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
          <Button 
            onClick={() => router.push('/quick-report')} 
            variant="outline"
            size="lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            Document Another
          </Button>
          <Button variant="ghost" size="lg">
            View Submitted Report
          </Button>
        </div>
      </motion.div>
    </div>
  )
}