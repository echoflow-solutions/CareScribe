'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useStore } from '@/lib/store'
import { SupabaseService } from '@/lib/supabase/service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import {
  Radio, Users, MessageSquare, AlertCircle, Send,
  CheckCircle, Clock, MapPin, Phone, Heart, Zap,
  Activity, Shield, HelpCircle, ChevronRight
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  status: 'online' | 'on_shift' | 'break' | 'offline'
  location?: string
  lastSeen: Date
  shiftEnd?: string
  currentParticipant?: string
}

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: 'text' | 'help_request' | 'update'
  priority?: 'normal' | 'urgent'
}

interface HelpRequest {
  id: string
  staffId: string
  staffName: string
  type: 'assistance' | 'emergency' | 'question'
  description: string
  location: string
  status: 'pending' | 'acknowledged' | 'resolved'
  createdAt: Date
  respondedBy?: string
}

export default function TeamPulsePage() {
  const { currentUser } = useStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedView, setSelectedView] = useState<'team' | 'chat' | 'help'>('team')
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [helpType, setHelpType] = useState<'assistance' | 'emergency' | 'question'>('assistance')
  const [helpDescription, setHelpDescription] = useState('')

  useEffect(() => {
    loadTeamData()
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadTeamData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadTeamData = async () => {
    setLoading(true)
    try {
      // Load team member statuses
      await loadTeamMembers()

      // Load recent messages
      await loadMessages()

      // Load active help requests
      await loadHelpRequests()
    } catch (error) {
      console.error('Error loading team data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTeamMembers = async () => {
    // Mock data for now - will connect to Supabase
    const mockTeam: TeamMember[] = [
      {
        id: '1',
        name: 'Emma Johnson',
        role: 'Support Worker',
        status: 'on_shift',
        location: 'Sunshine House',
        lastSeen: new Date(),
        shiftEnd: '15:00',
        currentParticipant: 'James Mitchell'
      },
      {
        id: '2',
        name: 'Michael Chen',
        role: 'Support Worker',
        status: 'online',
        location: 'Melbourne Central',
        lastSeen: new Date(Date.now() - 5 * 60000),
        shiftEnd: '15:00'
      },
      {
        id: '3',
        name: 'Sarah Williams',
        role: 'Team Leader',
        status: 'online',
        location: 'Office',
        lastSeen: new Date(),
      },
      {
        id: '4',
        name: 'David Brown',
        role: 'Support Worker',
        status: 'break',
        location: 'Riverside Care',
        lastSeen: new Date(Date.now() - 15 * 60000),
        shiftEnd: '23:00'
      },
      {
        id: '5',
        name: 'Lisa Taylor',
        role: 'Support Worker',
        status: 'offline',
        location: 'Not on shift',
        lastSeen: new Date(Date.now() - 2 * 60 * 60000),
      }
    ]
    setTeamMembers(mockTeam)
  }

  const loadMessages = async () => {
    // Mock data for now - will connect to Supabase
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: '1',
        senderName: 'Emma Johnson',
        content: 'James is having a great day! He participated in all morning activities.',
        timestamp: new Date(Date.now() - 10 * 60000),
        type: 'update'
      },
      {
        id: '2',
        senderId: '3',
        senderName: 'Sarah Williams',
        content: 'Team meeting at 2 PM today. Please confirm attendance.',
        timestamp: new Date(Date.now() - 30 * 60000),
        type: 'text',
        priority: 'urgent'
      },
      {
        id: '3',
        senderId: '2',
        senderName: 'Michael Chen',
        content: 'Medication round completed for afternoon shift.',
        timestamp: new Date(Date.now() - 45 * 60000),
        type: 'update'
      }
    ]
    setMessages(mockMessages)
  }

  const loadHelpRequests = async () => {
    // Mock data for now - will connect to Supabase
    const mockRequests: HelpRequest[] = [
      {
        id: '1',
        staffId: '4',
        staffName: 'David Brown',
        type: 'assistance',
        description: 'Need help with meal preparation for 3 participants',
        location: 'Riverside Care - Kitchen',
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 60000)
      }
    ]
    setHelpRequests(mockRequests)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages([message, ...messages])
    setNewMessage('')

    toast({
      title: 'Message sent',
      description: 'Your message has been shared with the team'
    })
  }

  const sendHelpRequest = async () => {
    if (!helpDescription.trim() || !currentUser) return

    const request: HelpRequest = {
      id: Date.now().toString(),
      staffId: currentUser.id,
      staffName: currentUser.name,
      type: helpType,
      description: helpDescription,
      location: 'Current location', // Would get from GPS or facility
      status: 'pending',
      createdAt: new Date()
    }

    setHelpRequests([request, ...helpRequests])
    setHelpDescription('')
    setShowHelpDialog(false)

    toast({
      title: 'Help request sent',
      description: 'Your team has been notified',
      variant: helpType === 'emergency' ? 'destructive' : 'default'
    })
  }

  const acknowledgeHelp = async (requestId: string) => {
    setHelpRequests(prev => prev.map(req =>
      req.id === requestId
        ? { ...req, status: 'acknowledged', respondedBy: currentUser?.name }
        : req
    ))

    toast({
      title: 'Help acknowledged',
      description: 'The team member has been notified you\'re coming'
    })
  }

  const resolveHelp = async (requestId: string) => {
    setHelpRequests(prev => prev.map(req =>
      req.id === requestId
        ? { ...req, status: 'resolved' }
        : req
    ))

    toast({
      title: 'Request resolved',
      description: 'Great work helping your team!'
    })
  }

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'on_shift': return 'bg-blue-500'
      case 'break': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
    }
  }

  const getStatusText = (status: TeamMember['status']) => {
    switch (status) {
      case 'online': return 'Available'
      case 'on_shift': return 'On Shift'
      case 'break': return 'On Break'
      case 'offline': return 'Offline'
    }
  }

  const getHelpTypeIcon = (type: HelpRequest['type']) => {
    switch (type) {
      case 'emergency': return AlertCircle
      case 'assistance': return Users
      case 'question': return HelpCircle
    }
  }

  const getHelpTypeColor = (type: HelpRequest['type']) => {
    switch (type) {
      case 'emergency': return 'text-red-600'
      case 'assistance': return 'text-blue-600'
      case 'question': return 'text-purple-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Pulse</h1>
            <p className="text-gray-600">Real-time collaboration and team support</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Shift</p>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'on_shift').length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'online').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Help Requests</p>
                <p className="text-2xl font-bold">{helpRequests.filter(r => r.status === 'pending').length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedView === 'team' ? 'default' : 'outline'}
          onClick={() => setSelectedView('team')}
        >
          <Users className="h-4 w-4 mr-2" />
          Team Status
        </Button>
        <Button
          variant={selectedView === 'chat' ? 'default' : 'outline'}
          onClick={() => setSelectedView('chat')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Team Chat
        </Button>
        <Button
          variant={selectedView === 'help' ? 'default' : 'outline'}
          onClick={() => setSelectedView('help')}
        >
          <Shield className="h-4 w-4 mr-2" />
          Help Requests
          {helpRequests.filter(r => r.status === 'pending').length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {helpRequests.filter(r => r.status === 'pending').length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Team Status View */}
      {selectedView === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <Badge variant="secondary">{getStatusText(member.status)}</Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{member.role}</p>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {member.location}
                      </div>

                      {member.currentParticipant && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-3 w-3" />
                          With {member.currentParticipant}
                        </div>
                      )}

                      {member.shiftEnd && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-3 w-3" />
                          Shift ends at {member.shiftEnd}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-600">
                        <Activity className="h-3 w-3" />
                        Last seen {format(member.lastSeen, 'h:mm a')}
                      </div>
                    </div>

                    {member.status === 'on_shift' && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Team Chat View */}
      {selectedView === 'chat' && (
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
              <CardDescription>Share updates and communicate with your team</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Message Input */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {message.senderName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.senderName}</span>
                        <span className="text-xs text-gray-500">{format(message.timestamp, 'h:mm a')}</span>
                        {message.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Help Requests View */}
      {selectedView === 'help' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Help Requests</h2>
            <Button onClick={() => setShowHelpDialog(!showHelpDialog)}>
              <Zap className="h-4 w-4 mr-2" />
              Request Help
            </Button>
          </div>

          {/* Help Request Form */}
          {showHelpDialog && (
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle>Request Help from Team</CardTitle>
                <CardDescription>Let your team know you need assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type of Help</label>
                  <div className="flex gap-2">
                    <Button
                      variant={helpType === 'assistance' ? 'default' : 'outline'}
                      onClick={() => setHelpType('assistance')}
                      className="flex-1"
                    >
                      Assistance
                    </Button>
                    <Button
                      variant={helpType === 'question' ? 'default' : 'outline'}
                      onClick={() => setHelpType('question')}
                      className="flex-1"
                    >
                      Question
                    </Button>
                    <Button
                      variant={helpType === 'emergency' ? 'destructive' : 'outline'}
                      onClick={() => setHelpType('emergency')}
                      className="flex-1"
                    >
                      Emergency
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Describe what you need help with..."
                    value={helpDescription}
                    onChange={(e) => setHelpDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={sendHelpRequest} className="flex-1">
                    Send Request
                  </Button>
                  <Button variant="outline" onClick={() => setShowHelpDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Requests List */}
          <div className="space-y-3">
            {helpRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No active help requests</h3>
                  <p className="text-sm text-gray-600">Your team is running smoothly!</p>
                </CardContent>
              </Card>
            ) : (
              helpRequests.map((request) => {
                const Icon = getHelpTypeIcon(request.type)
                return (
                  <Card key={request.id} className={request.type === 'emergency' ? 'border-2 border-red-500' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${request.type === 'emergency' ? 'bg-red-100' : 'bg-blue-100'}`}>
                          <Icon className={`h-6 w-6 ${getHelpTypeColor(request.type)}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{request.staffName}</h3>
                            <Badge variant={request.status === 'pending' ? 'destructive' : 'secondary'}>
                              {request.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-700 mb-2">{request.description}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {request.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(request.createdAt, 'h:mm a')}
                            </div>
                          </div>

                          {request.status === 'pending' && request.staffId !== currentUser?.id && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => acknowledgeHelp(request.id)}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                I'll Help
                              </Button>
                              <Button size="sm" variant="outline">
                                <Phone className="h-3 w-3 mr-1" />
                                Call
                              </Button>
                            </div>
                          )}

                          {request.status === 'acknowledged' && (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{request.respondedBy} is responding</Badge>
                              {request.staffId === currentUser?.id && (
                                <Button size="sm" onClick={() => resolveHelp(request.id)}>
                                  Mark Resolved
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
