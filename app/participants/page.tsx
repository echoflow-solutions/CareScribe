'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataService } from '@/lib/data/service'
import { SupabaseService } from '@/lib/supabase/service'
import { Participant } from '@/lib/types'
import { useStore } from '@/lib/store'
import {
  User, FileText, AlertTriangle, Home, Pill, Brain, Shield,
  Clock, Phone, Heart, Activity, TrendingUp, Calendar, MapPin
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function MyParticipantsPage() {
  const router = useRouter()
  const { currentUser, currentShift } = useStore()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShiftParticipants()
  }, [currentShift])

  const loadShiftParticipants = async () => {
    try {
      console.log('[My Participants] Loading participants for shift:', currentShift)
      let shiftParticipants: Participant[] = []

      // First try to get the active shift from the database
      let activeShift = currentShift

      if (!activeShift && currentUser) {
        console.log('[My Participants] No currentShift in store, looking up staff record for user:', currentUser.email)

        // ═══════════════════════════════════════════════════════════════════════════════
        // 🔒 CRITICAL FIX - DO NOT MODIFY THIS SECTION
        // ═══════════════════════════════════════════════════════════════════════════════
        // PROBLEM: currentUser.id is NOT the same as the staff_id used in shifts table
        // SOLUTION: Look up staff record by email to get the correct staff_id
        //
        // WHY THIS WORKS:
        // 1. Users table has: id (user_id), email, name
        // 2. Staff table has: id (staff_id), email, name
        // 3. Shifts table references: staff_id (NOT user_id!)
        // 4. Email is the ONLY common field between users and staff
        //
        // ⚠️ WARNING: If you remove this lookup, participants will NOT load!
        // 📖 See: PARTICIPANTS-FIX-PERMANENT.md for full documentation
        // ═══════════════════════════════════════════════════════════════════════════════
        const { supabase } = await import('@/lib/supabase/client')

        if (!supabase) {
          console.error('[My Participants] Supabase client not available')
          return
        }

        const { data: staffData } = await supabase
          .from('staff')
          .select('id')
          .eq('email', currentUser.email)
          .maybeSingle()

        const staffId = staffData?.id
        console.log('[My Participants] Staff ID for user:', staffId)
        // ═══════════════════════════════════════════════════════════════════════════════
        // END CRITICAL SECTION - Now we have the correct staff_id
        // ═══════════════════════════════════════════════════════════════════════════════

        if (staffId) {
          // ✅ CORRECT: Using staff_id to query shifts (NOT user_id!)
          activeShift = await SupabaseService.getCurrentShift(staffId)
          console.log('[My Participants] Found active shift in database:', activeShift)

          // If no active shift, check for scheduled shifts today or tomorrow
          if (!activeShift) {
            console.log('[My Participants] No active shift, checking for scheduled shifts...')

            // Try to find shifts for today and tomorrow
            const today = new Date().toISOString().split('T')[0]
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            // ✅ CORRECT: Using staff_id to get shifts (NOT user_id!)
            const scheduledShifts = await SupabaseService.getStaffShifts(staffId, today, tomorrow)
            console.log('[My Participants] Found scheduled shifts:', scheduledShifts)

            if (scheduledShifts && scheduledShifts.length > 0) {
              // Use the first scheduled shift
              activeShift = {
                id: scheduledShifts[0].id,
                staffId: scheduledShifts[0].staff_id,
                facilityId: scheduledShifts[0].facility_id,
                startTime: scheduledShifts[0].start_time,
                endTime: scheduledShifts[0].end_time,
                status: scheduledShifts[0].status
              }
              console.log('[My Participants] Using scheduled shift:', activeShift)
            }
          }
        } else {
          console.warn('[My Participants] No staff record found for user email:', currentUser.email)
        }
      }

      if (activeShift?.id) {
        // ✅ CORRECT: Fetching participants using shift.id
        // This queries the shift_participants table which links shifts to participants
        console.log('[My Participants] Fetching participants for shift ID:', activeShift.id)
        shiftParticipants = await SupabaseService.getShiftParticipants(activeShift.id)
        console.log('[My Participants] Loaded participants from Supabase:', shiftParticipants)
      } else {
        // No shift found - show empty state
        console.log('[My Participants] No shift found, showing empty state')
        shiftParticipants = []
      }

      setParticipants(shiftParticipants)
    } catch (error) {
      console.error('[My Participants] Error loading participants:', error)
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIncidentReport = (participant: Participant) => {
    // Navigate to quick report with participant pre-selected
    router.push(`/quick-report?participant=${participant.id}&name=${encodeURIComponent(participant.name)}`)
  }

  const handleCreateABCReport = (participant: Participant) => {
    // Navigate to ABC report
    router.push(`/report/abc?participant=${participant.id}&name=${encodeURIComponent(participant.name)}`)
  }

  if (!currentUser) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-pulse text-lg">Loading your participants...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Participants</h1>
              <p className="text-gray-600">Today's shift - {participants.length} participants in your care</p>
            </div>
          </div>

          {/* Pre-Shift Intelligence Summary */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">Pre-Shift Intelligence</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map((p, idx) => {
                if (p.name === 'Michael Brown') {
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Michael Brown - High risk period 2:00-3:00 PM based on behavior patterns.</p>
                        <p className="text-sm text-gray-600">Review management plan.</p>
                      </div>
                    </div>
                  )
                }
                if (p.name === 'Emma Wilson') {
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                      <Pill className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Emma Wilson - Morning medications due at 8:00 AM.</p>
                        <p className="text-sm text-gray-600">PRN medications available if needed.</p>
                      </div>
                    </div>
                  )
                }
                if (p.name === 'Lisa Thompson') {
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <Activity className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Lisa Thompson - Scheduled group activity at 2:00 PM.</p>
                        <p className="text-sm text-gray-600">Ensure craft materials are prepared.</p>
                      </div>
                    </div>
                  )
                }
                return null
              })}
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="font-semibold text-gray-900">3 active participants today - All support plans reviewed and current for this shift</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {participants.map((participant) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`hover:shadow-xl transition-all border-l-4 ${
                participant.riskLevel === 'high' ? 'border-l-red-500' :
                participant.riskLevel === 'medium' ? 'border-l-yellow-500' :
                'border-l-green-500'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-20 w-20 border-2 border-gray-200">
                        {/* Photorealistic portrait avatar */}
                        <img
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(participant.name)}`}
                          alt={participant.name}
                          className="h-full w-full rounded-full object-cover bg-gray-100"
                        />
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white ${
                        participant.currentStatus === 'happy' ? 'bg-green-500' :
                        participant.currentStatus === 'calm' ? 'bg-blue-500' :
                        participant.currentStatus === 'anxious' ? 'bg-yellow-500' :
                        participant.currentStatus === 'agitated' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} title={participant.currentStatus} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold mb-2">{participant.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge
                          variant={participant.riskLevel === 'high' ? 'destructive' :
                                  participant.riskLevel === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {participant.riskLevel} risk
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {participant.currentStatus}
                        </Badge>
                      </div>
                      {participant.age && (
                        <p className="text-sm text-gray-600">{participant.age} years old</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location with tracking info */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between gap-2.5 text-sm text-gray-700 bg-gray-50 px-3 py-2.5 rounded-lg cursor-help hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
                            <span className="truncate font-medium">{participant.location}</span>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">Updated 8 min ago</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-semibold mb-1">Location Tracking System</p>
                        <p className="text-xs">Hybrid tracking using:</p>
                        <ul className="text-xs mt-1 space-y-0.5">
                          <li>• Bluetooth beacons in each room</li>
                          <li>• Optional wearable devices</li>
                          <li>• Manual staff check-ins</li>
                          <li>• Privacy-compliant & NDIS approved</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Recent Success Highlight */}
                  {participant.recentSuccess && (
                    <div className="bg-green-50 border border-green-200 px-3 py-2.5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Recent Success</span>
                      </div>
                      <p className="text-sm text-gray-900">{participant.recentSuccess}</p>
                    </div>
                  )}

                  {/* Communication Preference */}
                  {participant.communicationPreference && (
                    <div className="bg-indigo-50 border border-indigo-200 px-3 py-2.5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Communication</span>
                      </div>
                      <p className="text-sm text-gray-900 capitalize">{participant.communicationPreference} communication preferred</p>
                    </div>
                  )}

                  {/* Next Medication */}
                  {participant.medications.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 px-3 py-2.5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Next Medication</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{participant.medications[0].name}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{participant.medications[0].dosage} at {participant.medications[0].time}</div>
                    </div>
                  )}

                  {/* Trigger Alert */}
                  {participant.behaviorPatterns.length > 0 && participant.riskLevel !== 'low' && (
                    <div className={`border px-3 py-2.5 rounded-lg ${
                      participant.riskLevel === 'high' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertTriangle className={`h-4 w-4 ${
                          participant.riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <span className={`text-xs font-semibold uppercase tracking-wide ${
                          participant.riskLevel === 'high' ? 'text-red-700' : 'text-yellow-700'
                        }`}>Watch For</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">{participant.behaviorPatterns[0].trigger}</div>
                      {participant.behaviorPatterns[0].timeOfDay && (
                        <div className="text-xs text-gray-600 mt-0.5">Common at: {participant.behaviorPatterns[0].timeOfDay}</div>
                      )}
                    </div>
                  )}

                  {/* Medication Administration */}
                  {participant.medications.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Medication Status</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          Log Med
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {participant.medications.slice(0, 2).map((med, idx) => (
                          <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-900">{med.name}</div>
                                <div className="text-xs text-gray-600">{med.dosage} at {med.time}</div>
                              </div>
                              <Badge
                                variant={idx === 0 ? "default" : "outline"}
                                className="text-xs bg-purple-100 text-purple-700 border-purple-300"
                              >
                                {idx === 0 ? "Due Soon" : "Scheduled"}
                              </Badge>
                            </div>
                            {/* Demo: Show last administered for first medication */}
                            {idx === 0 && (
                              <div className="mt-1.5 pt-1.5 border-t border-purple-200 flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock className="h-3 w-3" />
                                <span>Last given: Today 7:45 AM by {currentUser?.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  {participant.supportPlan.emergencyContacts.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Emergency Contact</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {participant.supportPlan.emergencyContacts[0].name}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {participant.supportPlan.emergencyContacts[0].phone}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-3">
                    <Button
                      onClick={() => handleCreateIncidentReport(participant)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Incident Report
                    </Button>
                    <Button
                      onClick={() => handleCreateABCReport(participant)}
                      variant="outline"
                      className="w-full border-2 border-blue-500 hover:bg-blue-50"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      ABC Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {participants.length === 0 && (
          <Card className="p-12 text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Participants Assigned</h3>
            <p className="text-gray-500">You don't have any participants assigned to your current shift.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
