import { supabase } from './client'
import { Database } from './database.types'
import { 
  User, Participant, Incident, Alert, Organization, 
  RoutingRule, Shift, Role
} from '@/lib/types'

type Tables = Database['public']['Tables']

export class SupabaseService {
  // Check if we should use Supabase
  static isAvailable() {
    return supabase !== null && process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE !== 'true'
  }

  // Organization methods
  static async getOrganization(): Promise<Organization | null> {
    if (!this.isAvailable()) return null
    
    const { data, error } = await supabase!
      .from('organizations')
      .select('*')
      .single()
    
    if (error) {
      console.error('Error fetching organization:', error)
      return null
    }
    
    return data ? {
      id: data.id,
      name: data.name,
      ndisNumber: data.ndis_number,
      facilities: data.facilities_count,
      primaryEmail: data.primary_email,
      timezone: data.timezone,
      createdAt: data.created_at
    } : null
  }

  // User methods
  static async getUsers(): Promise<User[]> {
    if (!this.isAvailable()) return []
    
    const { data, error } = await supabase!
      .from('users')
      .select(`
        *,
        role:roles(*)
      `)
      .order('name')
    
    if (error) {
      console.error('Error fetching users:', error)
      return []
    }
    
    return data.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role ? {
        id: user.role.id,
        name: user.role.name,
        level: user.role.level as 1 | 2 | 3 | 4,
        permissions: user.role.permissions
      } : {
        id: '',
        name: 'Unknown',
        level: 4,
        permissions: []
      },
      facilityId: user.facility_id || undefined,
      avatar: user.avatar || undefined,
      createdAt: user.created_at
    }))
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    if (!this.isAvailable()) return null
    
    const { data, error } = await supabase!
      .from('users')
      .select(`
        *,
        role:roles(*)
      `)
      .eq('email', email)
      .single()
    
    if (error || !data) return null
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role ? {
        id: data.role.id,
        name: data.role.name,
        level: data.role.level as 1 | 2 | 3 | 4,
        permissions: data.role.permissions
      } : {
        id: '',
        name: 'Unknown',
        level: 4,
        permissions: []
      },
      facilityId: data.facility_id || undefined,
      avatar: data.avatar || undefined,
      createdAt: data.created_at
    }
  }

  // Participant methods
  static async getParticipants(facilityId?: string): Promise<Participant[]> {
    if (!this.isAvailable()) return []
    
    let query = supabase!
      .from('participants')
      .select(`
        *,
        support_plan:participant_support_plans(*),
        behavior_patterns:participant_behavior_patterns(*),
        medications:participant_medications(*)
      `)
    
    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }
    
    const { data, error } = await query.order('name')
    
    if (error) {
      console.error('Error fetching participants:', error)
      return []
    }
    
    return data.map(p => ({
      id: p.id,
      name: p.name,
      facility: p.facility_id || '',
      riskLevel: p.risk_level as 'low' | 'medium' | 'high',
      currentStatus: p.current_status as any,
      location: p.current_location || '',
      medications: p.medications.map((m: any) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage || '',
        time: m.time || '',
        type: m.type as 'regular' | 'prn'
      })),
      behaviorPatterns: p.behavior_patterns.map((bp: any) => ({
        id: bp.id,
        trigger: bp.trigger || '',
        behavior: bp.behavior || '',
        frequency: bp.frequency,
        timeOfDay: bp.time_of_day,
        successfulInterventions: bp.successful_interventions || []
      })),
      supportPlan: p.support_plan[0] ? {
        id: p.support_plan[0].id,
        participantId: p.id,
        strategies: p.support_plan[0].strategies || [],
        preferences: p.support_plan[0].preferences || [],
        emergencyContacts: p.emergency_contact_name ? [{
          name: p.emergency_contact_name,
          role: p.emergency_contact_relationship || '',
          phone: p.emergency_contact_phone || ''
        }] : []
      } : {
        id: '',
        participantId: p.id,
        strategies: [],
        preferences: [],
        emergencyContacts: []
      }
    }))
  }

  static async updateParticipantStatus(id: string, status: string, location: string) {
    if (!this.isAvailable()) return
    
    const { error } = await supabase!
      .from('participants')
      .update({ 
        current_status: status,
        current_location: location 
      })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating participant status:', error)
    }
  }

  // Incident methods
  static async getIncidents(facilityId?: string): Promise<Incident[]> {
    if (!this.isAvailable()) return []
    
    let query = supabase!
      .from('incidents')
      .select(`
        *,
        participant:participants(name),
        staff:users(name)
      `)
    
    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching incidents:', error)
      return []
    }
    
    return data.map(i => ({
      id: i.id,
      participantId: i.participant_id || '',
      participantName: i.participant?.name || 'Unknown',
      type: i.type as any,
      severity: i.severity as any,
      timestamp: i.created_at,
      location: i.location || '',
      staffId: i.staff_id || '',
      staffName: i.staff?.name || 'Unknown',
      description: i.description || '',
      antecedent: i.antecedent || '',
      behavior: i.behavior || '',
      consequence: i.consequence || '',
      interventions: i.interventions || [],
      outcomes: i.outcomes || [],
      photos: i.photos || [],
      reportType: i.report_type as any,
      status: i.status as any
    }))
  }

  static async createIncident(incident: Omit<Incident, 'id'>): Promise<void> {
    if (!this.isAvailable()) return
    
    const { error } = await supabase!
      .from('incidents')
      .insert({
        participant_id: incident.participantId,
        facility_id: incident.location, // You might need to adjust this
        staff_id: incident.staffId,
        type: incident.type,
        severity: incident.severity,
        location: incident.location,
        description: incident.description,
        antecedent: incident.antecedent,
        behavior: incident.behavior,
        consequence: incident.consequence,
        interventions: incident.interventions,
        outcomes: incident.outcomes,
        photos: incident.photos,
        report_type: incident.reportType,
        status: incident.status,
        submitted_at: incident.status === 'submitted' ? new Date().toISOString() : null
      })
    
    if (error) {
      console.error('Error creating incident:', error)
      throw error
    }
  }

  // Alert methods
  static async getAlerts(facilityId?: string): Promise<Alert[]> {
    if (!this.isAvailable()) return []
    
    let query = supabase!
      .from('alerts')
      .select('*')
      .eq('acknowledged', false)
    
    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
    
    return data.map(a => ({
      id: a.id,
      type: a.type as any,
      severity: a.severity as any,
      message: a.message,
      timestamp: a.created_at,
      participantId: a.participant_id || undefined,
      acknowledged: a.acknowledged
    }))
  }

  static async acknowledgeAlert(id: string, userId: string): Promise<void> {
    if (!this.isAvailable()) return
    
    const { error } = await supabase!
      .from('alerts')
      .update({ 
        acknowledged: true,
        acknowledged_by: userId,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  // Routing Rules
  static async getRoutingRules(): Promise<RoutingRule[]> {
    if (!this.isAvailable()) return []
    
    const { data, error } = await supabase!
      .from('routing_rules')
      .select('*')
      .eq('enabled', true)
    
    if (error) {
      console.error('Error fetching routing rules:', error)
      return []
    }
    
    return data.map(r => ({
      id: r.id,
      name: r.name,
      conditions: r.conditions || [],
      actions: r.actions || [],
      enabled: r.enabled
    }))
  }

  // Shift methods
  static async getCurrentShift(staffId: string): Promise<Shift | null> {
    if (!this.isAvailable()) return null
    
    const { data, error } = await supabase!
      .from('shifts')
      .select('*')
      .eq('staff_id', staffId)
      .eq('status', 'active')
      .single()
    
    if (error || !data) return null
    
    return {
      id: data.id,
      staffId: data.staff_id || '',
      facilityId: data.facility_id || '',
      startTime: data.start_time,
      endTime: data.end_time || '',
      handoverNotes: data.handover_notes || undefined,
      status: data.status as any
    }
  }

  static async createShift(shift: Omit<Shift, 'id'>): Promise<void> {
    if (!this.isAvailable()) return
    
    const { error } = await supabase!
      .from('shifts')
      .insert({
        staff_id: shift.staffId,
        facility_id: shift.facilityId,
        start_time: shift.startTime,
        end_time: shift.endTime,
        status: shift.status
      })
    
    if (error) {
      console.error('Error creating shift:', error)
      throw error
    }
  }

  // Initialize database check
  static async checkConnection(): Promise<boolean> {
    if (!this.isAvailable()) return false
    
    try {
      const { count, error } = await supabase!
        .from('organizations')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('Supabase connection error:', error)
        return false
      }
      
      console.log('Supabase connected successfully')
      return true
    } catch (error) {
      console.error('Supabase connection failed:', error)
      return false
    }
  }
}