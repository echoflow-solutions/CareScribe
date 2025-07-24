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
import { useToast } from '@/components/hooks/use-toast'
import { DataService } from '@/lib/data/service'
import { 
  Home, Plus, Edit2, Trash2, Users, MapPin, 
  Phone, Mail, ArrowLeft, ArrowRight, Save,
  Building, Bed, Activity
} from 'lucide-react'

interface Facility {
  id: string
  name: string
  code: string
  type: 'residential' | 'community' | 'respite' | 'dayprogram'
  address: string
  city: string
  state: string
  postcode: string
  phone: string
  email: string
  capacity: number
  currentOccupancy: number
  manager: string
  status: 'active' | 'inactive'
}

const facilityTypes = {
  residential: { label: 'Residential Home', icon: Home, color: 'blue' },
  community: { label: 'Community Hub', icon: Building, color: 'green' },
  respite: { label: 'Respite Center', icon: Bed, color: 'purple' },
  dayprogram: { label: 'Day Program', icon: Activity, color: 'orange' }
}

export default function FacilitiesSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [saving, setSaving] = useState(false)

  // Form data for add/edit
  const [formData, setFormData] = useState<Partial<Facility>>({
    name: '',
    code: '',
    type: 'residential',
    address: '',
    city: '',
    state: 'NSW',
    postcode: '',
    phone: '',
    email: '',
    capacity: 6,
    manager: '',
    status: 'active'
  })

  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    try {
      // In a real app, this would load from Supabase
      // For demo, we'll use the existing facility data
      const demoFacilities: Facility[] = [
        {
          id: '650e8400-e29b-41d4-a716-446655440001',
          name: 'House 1 - Riverside',
          code: 'H1',
          type: 'residential',
          address: '123 River Street',
          city: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          phone: '02 1234 5678',
          email: 'riverside@sunshinesupport.com.au',
          capacity: 8,
          currentOccupancy: 6,
          manager: 'John Smith',
          status: 'active'
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440002',
          name: 'House 2 - Parkview',
          code: 'H2',
          type: 'residential',
          address: '456 Park Avenue',
          city: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          phone: '02 2345 6789',
          email: 'parkview@sunshinesupport.com.au',
          capacity: 6,
          currentOccupancy: 5,
          manager: 'Jane Doe',
          status: 'active'
        },
        {
          id: '650e8400-e29b-41d4-a716-446655440006',
          name: 'Community Hub North',
          code: 'CHN',
          type: 'community',
          address: '987 Community Lane',
          city: 'Sydney',
          state: 'NSW',
          postcode: '2000',
          phone: '02 3456 7890',
          email: 'hubnorth@sunshinesupport.com.au',
          capacity: 20,
          currentOccupancy: 15,
          manager: 'Sarah Williams',
          status: 'active'
        }
      ]
      
      setFacilities(demoFacilities)
    } catch (error) {
      console.error('Error loading facilities:', error)
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
    const required = ['name', 'code', 'type', 'address', 'city', 'postcode', 'phone', 'email', 'capacity']
    const missing = required.filter(field => !formData[field as keyof typeof formData])
    
    if (missing.length > 0) {
      toast({
        title: 'Missing Information',
        description: `Please fill in all required fields`,
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
      if (editingFacility) {
        // Update existing facility
        setFacilities(prev => prev.map(f => 
          f.id === editingFacility.id 
            ? { ...f, ...formData, currentOccupancy: f.currentOccupancy }
            : f
        ))
        toast({
          title: 'Facility Updated',
          description: `${formData.name} has been updated successfully`
        })
      } else {
        // Add new facility
        const newFacility: Facility = {
          ...formData as Facility,
          id: `650e8400-e29b-41d4-a716-${Date.now()}`,
          currentOccupancy: 0
        }
        setFacilities(prev => [...prev, newFacility])
        toast({
          title: 'Facility Added',
          description: `${formData.name} has been added successfully`
        })
      }
      
      setShowAddDialog(false)
      setEditingFacility(null)
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save facility',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility)
    setFormData(facility)
    setShowAddDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this facility?')) return
    
    setFacilities(prev => prev.filter(f => f.id !== id))
    toast({
      title: 'Facility Deleted',
      description: 'The facility has been removed'
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'residential',
      address: '',
      city: '',
      state: 'NSW',
      postcode: '',
      phone: '',
      email: '',
      capacity: 6,
      manager: '',
      status: 'active'
    })
  }

  const handleContinue = () => {
    if (facilities.length === 0) {
      toast({
        title: 'No Facilities',
        description: 'Please add at least one facility before continuing',
        variant: 'destructive'
      })
      return
    }
    router.push('/setup/staff')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading facilities...</div>
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
                <Home className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Facilities</h1>
                <p className="text-gray-600">Manage your service locations</p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Facility
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{facilities.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {facilities.reduce((sum, f) => sum + f.capacity, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {facilities.reduce((sum, f) => sum + f.currentOccupancy, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {facilities.length > 0 
                  ? Math.round((facilities.reduce((sum, f) => sum + f.currentOccupancy, 0) / 
                      facilities.reduce((sum, f) => sum + f.capacity, 0)) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Facilities List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => {
            const typeInfo = facilityTypes[facility.type]
            const Icon = typeInfo.icon
            
            return (
              <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${typeInfo.color}-100`}>
                        <Icon className={`h-5 w-5 text-${typeInfo.color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{facility.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{facility.code}</Badge>
                          <Badge 
                            variant={facility.status === 'active' ? 'default' : 'secondary'}
                          >
                            {facility.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(facility)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(facility.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{facility.address}, {facility.city} {facility.postcode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{facility.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{facility.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {facility.currentOccupancy}/{facility.capacity}</span>
                  </div>
                  {facility.manager && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-gray-500">Manager:</span>
                      <span className="text-sm font-medium ml-2">{facility.manager}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFacility ? 'Edit Facility' : 'Add New Facility'}
              </DialogTitle>
              <DialogDescription>
                {editingFacility 
                  ? 'Update the facility information below'
                  : 'Enter the details for the new facility'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Facility Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., House 1 - Riverside"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Facility Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="e.g., H1"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Facility Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => handleInputChange('type', v)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(facilityTypes).map(([value, info]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <info.icon className="h-4 w-4" />
                          {info.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Sydney"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={(v) => handleInputChange('state', v)}
                  >
                    <SelectTrigger id="state">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NSW">NSW</SelectItem>
                      <SelectItem value="VIC">VIC</SelectItem>
                      <SelectItem value="QLD">QLD</SelectItem>
                      <SelectItem value="WA">WA</SelectItem>
                      <SelectItem value="SA">SA</SelectItem>
                      <SelectItem value="TAS">TAS</SelectItem>
                      <SelectItem value="ACT">ACT</SelectItem>
                      <SelectItem value="NT">NT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    placeholder="2000"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="02 1234 5678"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="facility@organization.com.au"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <Label htmlFor="manager">Facility Manager</Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => handleInputChange('manager', e.target.value)}
                    placeholder="Manager name"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingFacility(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (editingFacility ? 'Update' : 'Add')} Facility
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/setup/organization')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleContinue}>
            Continue to Staff
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}