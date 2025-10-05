'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  Heart, Activity, Brain, Coffee, Moon, Smile,
  Frown, Meh, Sun, Cloud, CloudRain, Zap,
  Shield, Users, Phone, MessageSquare, BookOpen,
  Award, TrendingUp, AlertCircle, CheckCircle, X,
  Headphones, Target, Sparkles, Palmtree, Star
} from 'lucide-react'

interface MoodOption {
  emoji: string
  label: string
  value: number
  color: string
}

interface WellnessCheckIn {
  mood: number
  energy: number
  stress: number
  sleep: number
  notes?: string
  timestamp: Date
}

interface WellnessResource {
  id: string
  title: string
  category: 'mental_health' | 'physical_health' | 'work_life_balance' | 'support'
  description: string
  type: 'article' | 'video' | 'helpline' | 'app'
  icon: any
}

export default function WellnessPage() {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [mood, setMood] = useState([5])
  const [energy, setEnergy] = useState([5])
  const [stress, setStress] = useState([5])
  const [sleep, setSleep] = useState([7])
  const [notes, setNotes] = useState('')
  const [checkIns, setCheckIns] = useState<WellnessCheckIn[]>([])

  const moodOptions: MoodOption[] = [
    { emoji: '😔', label: 'Very Low', value: 1, color: 'text-red-600' },
    { emoji: '😕', label: 'Low', value: 2, color: 'text-orange-600' },
    { emoji: '😐', label: 'Neutral', value: 3, color: 'text-yellow-600' },
    { emoji: '😊', label: 'Good', value: 4, color: 'text-green-600' },
    { emoji: '😄', label: 'Excellent', value: 5, color: 'text-green-700' }
  ]

  const wellnessResources: WellnessResource[] = [
    {
      id: '1',
      title: 'Employee Assistance Program (EAP)',
      category: 'support',
      description: 'Free confidential counseling and support services available 24/7',
      type: 'helpline',
      icon: Phone
    },
    {
      id: '2',
      title: 'Mindfulness & Meditation',
      category: 'mental_health',
      description: 'Guided meditation sessions and mindfulness exercises',
      type: 'app',
      icon: Brain
    },
    {
      id: '3',
      title: 'Work-Life Balance Guide',
      category: 'work_life_balance',
      description: 'Tips for managing work stress and maintaining healthy boundaries',
      type: 'article',
      icon: Target
    },
    {
      id: '4',
      title: 'Sleep Improvement Program',
      category: 'physical_health',
      description: 'Evidence-based strategies for better sleep quality',
      type: 'video',
      icon: Moon
    },
    {
      id: '5',
      title: 'Peer Support Network',
      category: 'support',
      description: 'Connect with colleagues for mutual support and understanding',
      type: 'helpline',
      icon: Users
    },
    {
      id: '6',
      title: 'Stress Management Techniques',
      category: 'mental_health',
      description: 'Practical tools to cope with workplace stress',
      type: 'article',
      icon: Shield
    }
  ]

  const submitCheckIn = () => {
    const newCheckIn: WellnessCheckIn = {
      mood: mood[0],
      energy: energy[0],
      stress: stress[0],
      sleep: sleep[0],
      notes,
      timestamp: new Date()
    }

    setCheckIns([newCheckIn, ...checkIns])
    setShowCheckIn(false)

    // Reset form
    setMood([5])
    setEnergy([5])
    setStress([5])
    setSleep([7])
    setNotes('')

    // Alert management if high stress or low mood
    if (stress[0] >= 8 || mood[0] <= 2) {
      toast({
        title: 'Support Available',
        description: 'Your wellness team has been notified and will reach out soon. You\'re not alone.',
        duration: 5000
      })
    } else {
      toast({
        title: 'Check-in Recorded',
        description: 'Thank you for prioritizing your wellbeing!',
        duration: 3000
      })
    }
  }

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return '😔'
    if (value <= 4) return '😐'
    if (value <= 6) return '😊'
    if (value <= 8) return '😄'
    return '🤩'
  }

  const getEnergyIcon = (value: number) => {
    if (value <= 3) return <Coffee className="h-6 w-6 text-red-600" />
    if (value <= 6) return <Sun className="h-6 w-6 text-yellow-600" />
    return <Zap className="h-6 w-6 text-green-600" />
  }

  const getStressColor = (value: number) => {
    if (value <= 3) return 'text-green-600'
    if (value <= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const averageMood = checkIns.length > 0
    ? checkIns.slice(0, 7).reduce((acc, c) => acc + c.mood, 0) / Math.min(checkIns.length, 7)
    : 5

  const averageStress = checkIns.length > 0
    ? checkIns.slice(0, 7).reduce((acc, c) => acc + c.stress, 0) / Math.min(checkIns.length, 7)
    : 5

  const checkInStreak = 7 // Mock data - would calculate actual streak
  const lastCheckIn = checkIns.length > 0 ? checkIns[0] : null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wellness Check</h1>
            <p className="text-gray-600">Your wellbeing matters - we're here to support you</p>
          </div>
        </div>
      </div>

      {/* Wellness Quote */}
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <p className="text-lg italic text-purple-900 mb-2">
            "Taking care of yourself doesn't mean me first, it means me too."
          </p>
          <p className="text-sm text-purple-700">- L.R. Knost</p>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Check-in Streak</p>
                <p className="text-2xl font-bold text-orange-600">{checkInStreak} days</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Mood (7 days)</p>
                <p className="text-2xl">{getMoodEmoji(averageMood)}</p>
              </div>
              <div className="text-2xl font-bold">{averageMood.toFixed(1)}/10</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Stress</p>
                <p className={`text-2xl font-bold ${getStressColor(averageStress)}`}>
                  {averageStress.toFixed(1)}/10
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Support Used</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Check-In Card */}
      <Card className="mb-6 border-2 border-blue-300">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-blue-600" />
            Daily Wellness Check-In
          </CardTitle>
          <CardDescription>
            Take a moment to check in with yourself. Your responses are confidential and help us support you better.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!showCheckIn ? (
            <div className="text-center py-8">
              {lastCheckIn ? (
                <div className="mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Last check-in: {format(lastCheckIn.timestamp, 'MMM dd, h:mm a')}</h3>
                  <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                    <div>
                      <p>Mood: {getMoodEmoji(lastCheckIn.mood)} {lastCheckIn.mood}/10</p>
                    </div>
                    <div>
                      <p>Energy: ⚡ {lastCheckIn.energy}/10</p>
                    </div>
                    <div>
                      <p className={getStressColor(lastCheckIn.stress)}>
                        Stress: {lastCheckIn.stress}/10
                      </p>
                    </div>
                    <div>
                      <p>Sleep: 😴 {lastCheckIn.sleep}hrs</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <Heart className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Start Your Wellness Journey</h3>
                  <p className="text-gray-600">Complete your first check-in today</p>
                </div>
              )}

              <Button size="lg" onClick={() => setShowCheckIn(true)}>
                <Activity className="h-5 w-5 mr-2" />
                {lastCheckIn ? 'New Check-In' : 'Start Check-In'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mood */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">How are you feeling today?</label>
                  <span className="text-4xl">{getMoodEmoji(mood[0])}</span>
                </div>
                <Slider
                  value={mood}
                  onValueChange={setMood}
                  min={1}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>😔 Very Low</span>
                  <span className="font-semibold">{mood[0]}/10</span>
                  <span>🤩 Excellent</span>
                </div>
              </div>

              {/* Energy */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">What's your energy level?</label>
                  <span>{getEnergyIcon(energy[0])}</span>
                </div>
                <Slider
                  value={energy}
                  onValueChange={setEnergy}
                  min={1}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>☕ Exhausted</span>
                  <span className="font-semibold">{energy[0]}/10</span>
                  <span>⚡ Energized</span>
                </div>
              </div>

              {/* Stress */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">How stressed are you feeling?</label>
                  <span className={`text-2xl font-bold ${getStressColor(stress[0])}`}>
                    {stress[0]}/10
                  </span>
                </div>
                <Slider
                  value={stress}
                  onValueChange={setStress}
                  min={1}
                  max={10}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>😌 Relaxed</span>
                  <span className="font-semibold">{stress[0]}/10</span>
                  <span className="text-red-600">😰 Very Stressed</span>
                </div>
                {stress[0] >= 8 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-900">
                        We're here to help. Support resources and your wellness team will be notified.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sleep */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">How many hours did you sleep?</label>
                  <span className="text-2xl">😴 {sleep[0]}hrs</span>
                </div>
                <Slider
                  value={sleep}
                  onValueChange={setSleep}
                  min={0}
                  max={12}
                  step={0.5}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>0 hrs</span>
                  <span className="font-semibold">{sleep[0]} hours</span>
                  <span>12 hrs</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-medium block mb-2">
                  Anything you'd like to share? (Optional)
                </label>
                <Textarea
                  placeholder="How are things going? Any concerns or wins to share..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={submitCheckIn} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Check-In
                </Button>
                <Button variant="outline" onClick={() => setShowCheckIn(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wellness Resources */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Wellness Resources & Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wellnessResources.map((resource) => {
            const ResourceIcon = resource.icon
            return (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ResourceIcon className="h-6 w-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{resource.type}</Badge>
                        <Badge variant="outline">{resource.category.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Emergency Support */}
      <Card className="border-2 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-5 w-5" />
            Need Immediate Support?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start border-red-300 hover:bg-red-100">
              <Phone className="h-4 w-4 mr-2" />
              Call EAP: 1800-XXX-XXX
            </Button>
            <Button variant="outline" className="justify-start border-red-300 hover:bg-red-100">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with Counselor
            </Button>
            <Button variant="outline" className="justify-start border-red-300 hover:bg-red-100">
              <Users className="h-4 w-4 mr-2" />
              Contact Wellness Team
            </Button>
          </div>

          <div className="p-3 bg-white rounded-lg border border-red-200">
            <p className="text-sm text-gray-700">
              <strong>Crisis Support:</strong> If you're experiencing a mental health crisis, please call{' '}
              <a href="tel:1800" className="text-red-600 font-semibold hover:underline">
                Lifeline 13 11 14
              </a>{' '}
              (available 24/7)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wellbeing Tips */}
      {averageStress > 6 && (
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Palmtree className="h-5 w-5" />
              Personalized Wellness Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>Take micro-breaks:</strong> Step away for 2-3 minutes every hour to stretch and breathe deeply.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>Connect with peers:</strong> Your Team Pulse shows 2 colleagues available for a quick chat.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <strong>Practice grounding:</strong> Try the 5-4-3-2-1 technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
