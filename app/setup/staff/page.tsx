'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/hooks/use-toast'
import { DataService } from '@/lib/data/service'
import { User, Role } from '@/lib/types'
import { 
  Users, Plus, Edit2, Trash2, Mail, Phone, UserCheck,
  Shield, Search, Filter, ArrowLeft, ArrowRight, 
  Upload, Send, Crown, UserCog, UserPlus, Award
} from 'lucide-react'

const roleIcons = {
  1: Crown,    // Executive
  2: UserCog,  // Manager
  3: Shield,   // Team Leader
  4: Users     // Support Worker
}

const roleColors = {
  1: 'purple',
  2: 'blue',
  3: 'green',
  4: 'gray'
}

export default function StaffSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedFacility, setSelectedFacility] = useState<string>('all')

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    facilityId: '',
    status: 'active'
  })

  // Bulk invite data
  const [bulkEmails, setBulkEmails] = useState('')

  useEffect(() => {
    loadStaffData()
  }, [])

  const loadStaffData = async () => {
    try {
      const users = await DataService.getUsers()
      setStaff(users)
      
      // Extract unique roles
      const uniqueRoles = users
        .map(u => u.role)
        .filter((role, index, self) => 
          index === self.findIndex(r => r.id === role.id)
        )
        .sort((a, b) => a.level - b.level)
      
      setRoles(uniqueRoles)
    } catch (error) {
      console.error('Error loading staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    const required = ['name', 'email', 'roleId']
    const missing = required.filter(field => !formData[field as keyof typeof formData])
    
    if (missing.length > 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return false
    }
    
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
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
      if (editingUser) {
        // Update existing user
        setStaff(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { ...u, ...formData, role: roles.find(r => r.id === formData.roleId)! }
            : u
        ))
        toast({
          title: 'Staff Updated',
          description: `${formData.name} has been updated successfully`
        })
      } else {
        // Add new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          ...formData,
          role: roles.find(r => r.id === formData.roleId)!,
          createdAt: new Date().toISOString()
        }
        setStaff(prev => [...prev, newUser])
        toast({
          title: 'Staff Added',
          description: `${formData.name} has been added successfully`
        })
      }
      
      setShowAddDialog(false)
      setEditingUser(null)
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save staff member',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleBulkInvite = async () => {
    const emails = bulkEmails
      .split(/[\n,]/)
      .map(e => e.trim())
      .filter(e => e && e.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
    
    if (emails.length === 0) {
      toast({
        title: 'No Valid Emails',
        description: 'Please enter valid email addresses',
        variant: 'destructive'
      })
      return
    }
    
    setSaving(true)
    try {
      // In a real app, this would send invites
      toast({
        title: 'Invitations Sent',
        description: `${emails.length} invitation${emails.length > 1 ? 's' : ''} sent successfully`
      })
      setShowBulkDialog(false)
      setBulkEmails('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitations',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: '',
      roleId: user.role.id,
      facilityId: user.facilityId || '',
      status: 'active'
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return
    
    setStaff(prev => prev.filter(u => u.id !== id))
    toast({
      title: 'Staff Removed',
      description: 'The staff member has been removed'
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      roleId: '',
      facilityId: '',
      status: 'active'
    })
  }

  const filteredStaff = staff.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role.id === selectedRole
    const matchesFacility = selectedFacility === 'all' || user.facilityId === selectedFacility
    
    return matchesSearch && matchesRole && matchesFacility
  })

  const staffByRole = roles.map(role => ({
    role,
    count: staff.filter(u => u.role.id === role.id).length
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading staff...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Staff Accounts</h1>
                <p className="text-gray-600">Manage your team members and their access</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBulkDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Invite
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {staffByRole.map(({ role, count }) => {
            const Icon = roleIcons[role.level as keyof typeof roleIcons]
            return (
              <Card key={role.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {role.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{count}</div>
                  <p className="text-sm text-gray-500">Level {role.level}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Facilities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Facilities</SelectItem>
                  <SelectItem value="650e8400-e29b-41d4-a716-446655440001">House 1</SelectItem>
                  <SelectItem value="650e8400-e29b-41d4-a716-446655440002">House 2</SelectItem>
                  <SelectItem value="650e8400-e29b-41d4-a716-446655440003">House 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredStaff.map((user) => {
                const Icon = roleIcons[user.role.level as keyof typeof roleIcons]
                
                return (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {user.role.name}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update the staff member information'
                  : 'Enter the details for the new staff member'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Smith"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.smith@organization.com.au"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="0400 123 456"
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={formData.roleId} 
                  onValueChange={(v) => handleInputChange('roleId', v)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => {
                      const Icon = roleIcons[role.level as keyof typeof roleIcons]
                      return (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {role.name} (Level {role.level})
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="facility">Facility</Label>
                <Select 
                  value={formData.facilityId} 
                  onValueChange={(v) => handleInputChange('facilityId', v)}
                >
                  <SelectTrigger id="facility">
                    <SelectValue placeholder="Select a facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific facility</SelectItem>
                    <SelectItem value="650e8400-e29b-41d4-a716-446655440001">House 1 - Riverside</SelectItem>
                    <SelectItem value="650e8400-e29b-41d4-a716-446655440002">House 2 - Parkview</SelectItem>
                    <SelectItem value="650e8400-e29b-41d4-a716-446655440003">House 3 - Sunshine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingUser(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingUser ? 'Update' : 'Add')} Staff Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Invite Dialog */}
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Invite Staff</DialogTitle>
              <DialogDescription>
                Enter email addresses to send invitations. One per line or comma-separated.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Label htmlFor="emails">Email Addresses</Label>
              <textarea
                id="emails"
                className="w-full h-32 p-3 border rounded-md"
                placeholder="john@example.com&#10;jane@example.com&#10;bob@example.com"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-2">
                Invitations will be sent to join your organization
              </p>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowBulkDialog(false)
                  setBulkEmails('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleBulkInvite} disabled={saving}>
                <Send className="h-4 w-4 mr-2" />
                {saving ? 'Sending...' : 'Send Invitations'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/setup/facilities')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => router.push('/setup/participants')}>
            Continue to Participants
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}