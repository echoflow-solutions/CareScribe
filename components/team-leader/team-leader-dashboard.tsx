'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Users, Clock, MapPin, CheckSquare, XCircle, Eye, AlertTriangle,
  BarChart, PieChart, TrendingUp, TrendingDown, Award, Target,
  UserCheck, Shield, ChevronRight, FileText, Bell
} from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

interface TeamLeaderDashboardProps {
  teamStaff: any[]
  pendingApprovals: any[]
  teamIncidents: any[]
  onApprove: (id: string, type: string) => void
  onReject: (id: string, type: string, reason: string) => void
}

export function TeamLeaderDashboard({
  teamStaff,
  pendingApprovals,
  teamIncidents,
  onApprove,
  onReject
}: TeamLeaderDashboardProps) {
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')

  const handleApprovalClick = (approval: any, action: 'approve' | 'reject') => {
    setSelectedApproval(approval)
    setApprovalAction(action)
    setShowApprovalModal(true)
  }

  const handleConfirmAction = () => {
    if (approvalAction === 'approve') {
      onApprove(selectedApproval.id, selectedApproval.type)
    } else {
      onReject(selectedApproval.id, selectedApproval.type, rejectionReason)
    }
    setShowApprovalModal(false)
    setRejectionReason('')
  }

  return (
    <div className="space-y-6">
      {/* ==================== PHASE 3: PENDING APPROVALS QUEUE ==================== */}
      {pendingApprovals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Pending Approvals
              <Badge variant="destructive" className="ml-2 animate-pulse">
                {pendingApprovals.length}
              </Badge>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {pendingApprovals.map((approval) => (
              <Card key={approval.id} className={`p-4 border-l-4 ${
                approval.priority === 'urgent' ? 'border-l-red-500 bg-red-50/50' :
                approval.priority === 'high' ? 'border-l-orange-500 bg-orange-50/50' :
                'border-l-blue-500'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={approval.priority === 'urgent' ? 'destructive' : 'default'}>
                        {approval.type === 'shift_handover' ? 'Shift Handover' : 'Incident Report'}
                      </Badge>
                      {approval.priority === 'urgent' && (
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {format(approval.timestamp, 'h:mm a')}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">
                      From: {approval.staffName}
                    </p>
                    {approval.participantName && (
                      <p className="text-sm text-gray-600 mb-2">
                        Participant: {approval.participantName}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                      {approval.content}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprovalClick(approval, 'approve')}
                    >
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApprovalClick(approval, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprovalClick(approval, 'approve')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ==================== PHASE 1: TEAM STAFF MANAGEMENT ==================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Team on Duty
            <Badge variant="secondary" className="ml-2">
              {teamStaff.filter(s => s.clockedIn).length} Active
            </Badge>
          </h2>
          <Button variant="outline" size="sm">
            <UserCheck className="h-4 w-4 mr-2" />
            Manage Staff
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teamStaff.map((staff) => (
            <Card key={staff.id} className={`p-4 ${
              staff.clockedIn ? 'border-l-4 border-l-green-500 bg-green-50/30' : 'opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(staff.name)}`}
                      alt={staff.name}
                      className="h-full w-full rounded-full object-cover bg-gray-100"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{staff.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {staff.clockedIn ? (
                        <>
                          <Badge variant="default" className="bg-green-600">
                            <Clock className="h-3 w-3 mr-1" />
                            On Duty
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {staff.shiftStart} - {staff.shiftEnd}
                          </span>
                        </>
                      ) : (
                        <Badge variant="secondary">Off Duty</Badge>
                      )}
                    </div>
                    {staff.clockedIn && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {staff.currentLocation}
                        <span className="text-gray-400 mx-1">•</span>
                        Last active {Math.floor((Date.now() - staff.lastActivity) / 60000)} mins ago
                      </div>
                    )}
                  </div>
                </div>
                {staff.clockedIn && (
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ==================== PHASE 5: TEAM ANALYTICS DASHBOARD ==================== */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Team Performance Analytics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Shift Completion</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">96%</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+4% this week</span>
                </div>
              </div>
              <Award className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Response Time</p>
                <p className="text-2xl font-bold text-green-900 mt-1">3.2m</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>-15s improved</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Incidents Resolved</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">24/26</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-purple-600">
                  <Shield className="h-3 w-3" />
                  <span>92% success rate</span>
                </div>
              </div>
              <PieChart className="h-8 w-8 text-purple-400" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Team Attendance</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">98%</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>Excellent</span>
                </div>
              </div>
              <UserCheck className="h-8 w-8 text-orange-400" />
            </div>
          </Card>
        </div>
      </div>

      {/* ==================== PHASE 4: INCIDENT OVERSIGHT ==================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Recent Incidents Requiring Review
          </h2>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            View All Reports
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {teamIncidents.slice(0, 3).map((incident) => (
            <Card key={incident.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      incident.severity === 'critical' ? 'destructive' :
                      incident.severity === 'medium' ? 'default' :
                      'secondary'
                    }>
                      {incident.severity}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {incident.participantName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(incident.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{incident.description}</p>
                  <p className="text-xs text-gray-500">Reported by: {incident.staffName}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                  <Button size="sm" variant="outline">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} {
                selectedApproval?.type === 'shift_handover' ? 'Shift Handover' : 'Incident Report'
              }
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve'
                ? 'Confirm approval of this submission.'
                : 'Provide a reason for rejection.'}
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="py-4">
              <div className="bg-gray-50 p-3 rounded mb-4">
                <p className="text-sm text-gray-700">{selectedApproval.content}</p>
              </div>
              {approvalAction === 'reject' && (
                <Textarea
                  placeholder="Reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleConfirmAction}
              disabled={approvalAction === 'reject' && !rejectionReason}
            >
              {approvalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
