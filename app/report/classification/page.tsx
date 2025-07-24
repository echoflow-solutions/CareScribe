'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, AlertTriangle, Brain, Check, ChevronRight,
  FileCheck, AlertCircle, Sparkles
} from 'lucide-react'
import { useStore } from '@/lib/store'

export default function ReportClassificationPage() {
  const router = useRouter()
  const { currentUser } = useStore()
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [reportDecision, setReportDecision] = useState<'both' | 'abc' | 'incident' | null>(null)

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    // Simulate AI analysis
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsAnalyzing(false)
          setReportDecision('both')
          return 100
        }
        return prev + 10
      })
    }, 200)

    return () => clearInterval(progressInterval)
  }, [currentUser, router])

  const handleDecision = (decision: 'both' | 'abc' | 'incident') => {
    setReportDecision(decision)
    // Store the decision and move to review
    router.push('/report/review?type=' + decision)
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Report Classification</h1>
          <p className="text-gray-600">
            {isAnalyzing ? 'AI is analyzing the incident...' : 'Analysis complete'}
          </p>
        </div>

        {isAnalyzing ? (
          <Card className="p-12">
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="relative">
                  <Brain className="h-20 w-20 text-primary animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-yellow-500 animate-spin" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Progress value={progress} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className={`space-y-2 ${progress >= 33 ? 'opacity-100' : 'opacity-30'}`}>
                    <Check className={`h-5 w-5 mx-auto ${progress >= 33 ? 'text-green-500' : 'text-gray-300'}`} />
                    <p className="text-sm">Analyzing behavior patterns</p>
                  </div>
                  <div className={`space-y-2 ${progress >= 66 ? 'opacity-100' : 'opacity-30'}`}>
                    <Check className={`h-5 w-5 mx-auto ${progress >= 66 ? 'text-green-500' : 'text-gray-300'}`} />
                    <p className="text-sm">Checking incident criteria</p>
                  </div>
                  <div className={`space-y-2 ${progress >= 100 ? 'opacity-100' : 'opacity-30'}`}>
                    <Check className={`h-5 w-5 mx-auto ${progress >= 100 ? 'text-green-500' : 'text-gray-300'}`} />
                    <p className="text-sm">Determining report types</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <Badge className="mb-4" variant="secondary">
                    <Brain className="mr-2 h-3 w-3" />
                    AI Analysis Complete • Confidence: 94%
                  </Badge>
                  <h2 className="text-xl font-semibold">
                    Based on the information provided, CareScribe has determined:
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ABC Report Card */}
                  <Card className="p-6 border-2 border-green-200 bg-green-50">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-lg">✓ ABC Report Required</h3>
                      </div>
                      
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>Clear antecedent (loud noise)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>Observable behavior (sensory response)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>Documented consequence (intervention)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5" />
                          <span>Pattern analysis valuable</span>
                        </li>
                      </ul>
                    </div>
                  </Card>

                  {/* Incident Report Card */}
                  <Card className="p-6 border-2 border-orange-200 bg-orange-50">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <AlertTriangle className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-lg">✓ Incident Report Required</h3>
                      </div>
                      
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>Property damage occurred</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>Safety hazard created</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>Maintenance notification needed</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-orange-600 mt-0.5" />
                          <span>Cost assessment required</span>
                        </li>
                      </ul>
                    </div>
                  </Card>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        Recommendation: Generate BOTH reports from this event
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        This will create:
                      </p>
                      <ol className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>1. ABC Behavioral Report → Clinical Team, Team Leader</li>
                        <li>2. Property Incident Report → Maintenance, Finance, Area Manager</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button 
                size="lg"
                onClick={() => handleDecision('both')}
                className="min-w-[200px]"
              >
                Agree - Generate Both
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => handleDecision('abc')}
              >
                Only ABC
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => handleDecision('incident')}
              >
                Only Incident
              </Button>
              <Button 
                size="lg"
                variant="ghost"
              >
                Let me decide
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}