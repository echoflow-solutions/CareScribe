import { supabase } from './client'
import { Database } from './database.types'
import {
  User, Participant, Incident, Alert, Organization,
  RoutingRule, Shift, Role, WebsterPack, WebsterPackSlot,
  MedicationDiscrepancy, PharmacyIntegration, PharmacySyncLog,
  BillingRecord, ReportEscalation, EscalationEvent, CompletedStage,
  Document, AuditLog, AnalyticsSummary, ParticipantStats, StaffStats
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
      .limit(1)

    if (error) {
      console.error('Error fetching organization:', error)
      return null
    }

    const org = data?.[0]
    return org ? {
      id: org.id,
      name: org.name,
      ndisNumber: org.ndis_number,
      facilities: org.facilities_count,
      primaryEmail: org.primary_email,
      timezone: org.timezone,
      createdAt: org.created_at
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

  // Get or create staff record for a user
  static async getOrCreateStaffRecord(userId: string, userName: string, userEmail: string, userRole: string = 'Support Worker'): Promise<{ id: string } | null> {
    if (!this.isAvailable()) return null

    // First try to find existing staff record
    const { data: existingStaff, error: findError } = await supabase!
      .from('staff')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingStaff) {
      console.log('✅ [SupabaseService] Found existing staff record:', existingStaff.id)
      return existingStaff
    }

    // If no staff record exists, create one
    console.log('ℹ️ [SupabaseService] Creating new staff record for user:', userName)
    const { data: newStaff, error: createError } = await supabase!
      .from('staff')
      .insert({
        user_id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
        status: 'active'
      })
      .select('id')
      .single()

    if (createError) {
      console.error('❌ [SupabaseService] Error creating staff record:', createError)
      return null
    }

    console.log('✅ [SupabaseService] Created new staff record:', newStaff.id)
    return newStaff
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
      password: data.password || undefined, // Include password for authentication
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

    // Only filter by facility_id if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (facilityId && uuidRegex.test(facilityId)) {
      query = query.eq('facility_id', facilityId)
    }

    const { data, error } = await query.order('name')
    
    if (error) {
      console.error('Error fetching participants:', error)
      return []
    }
    
    return data.map(p => {
      // Calculate age from date of birth
      const age = p.date_of_birth ?
        Math.floor((new Date().getTime() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) :
        undefined

      return {
        id: p.id,
        name: p.name,
        facility: p.facility_id || '',
        facilityId: p.facility_id,
        dateOfBirth: p.date_of_birth,
        age,
        ndisNumber: p.ndis_number,
        profileImage: p.profile_image,
        riskLevel: p.risk_level as 'low' | 'medium' | 'high',
        currentStatus: p.current_status as any,
        location: p.current_location || '',
        medications: p.medications?.map((m: any) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage || '',
          time: m.time || '',
          type: m.type as 'regular' | 'prn'
        })) || [],
        conditions: p.conditions || [],
        behaviorPatterns: p.behavior_patterns?.map((bp: any) => ({
          id: bp.id,
          trigger: bp.trigger || '',
          behavior: bp.behavior || '',
          frequency: bp.frequency || 0,
          timeOfDay: bp.time_of_day,
          successfulInterventions: bp.successful_interventions || []
        })) || [],
        supportPlan: p.support_plan && p.support_plan.length > 0 ? {
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
        },
        emergencyContact: p.emergency_contact_name ? {
          name: p.emergency_contact_name,
          role: p.emergency_contact_relationship || '',
          phone: p.emergency_contact_phone || ''
        } : undefined,
        // Additional enrichment fields (can be enhanced later with real calculations)
        recentIncidents: 0,
        onShift: false,
        mood: 'neutral' as const
      }
    })
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

  // Get participants assigned to a specific shift
  static async getShiftParticipants(shiftId: string): Promise<Participant[]> {
    if (!this.isAvailable()) return []

    // Validate shift ID is a proper UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shiftId)) {
      // Silent return for demo/local shift IDs (e.g., "clock-user123")
      return []
    }

    const { data, error } = await supabase!
      .from('shift_participants')
      .select(`
        participant:participants(
          *,
          support_plan:participant_support_plans(*),
          behavior_patterns:participant_behavior_patterns(*),
          medications:participant_medications(*)
        )
      `)
      .eq('shift_id', shiftId)

    if (error) {
      console.error('Error fetching shift participants:', error)
      return []
    }

    return data
      .filter(sp => sp.participant !== null)
      .map(sp => {
        const p = sp.participant as any
        // Calculate age from date of birth
        const age = p.date_of_birth ?
          Math.floor((new Date().getTime() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) :
          undefined

        return {
          id: p.id,
          name: p.name,
          facility: p.facility_id || '',
          facilityId: p.facility_id,
          dateOfBirth: p.date_of_birth,
          age,
          ndisNumber: p.ndis_number,
          profileImage: p.profile_image,
          riskLevel: p.risk_level as 'low' | 'medium' | 'high',
          currentStatus: p.current_status as any,
          location: p.current_location || '',
          medications: p.medications?.map((m: any) => ({
            id: m.id,
            name: m.name,
            dosage: m.dosage || '',
            time: m.time || '',
            type: m.type as 'regular' | 'prn'
          })) || [],
          conditions: p.conditions || [],
          behaviorPatterns: p.behavior_patterns?.map((bp: any) => ({
            id: bp.id,
            trigger: bp.trigger || '',
            behavior: bp.behavior || '',
            frequency: bp.frequency || 0,
            timeOfDay: bp.time_of_day,
            successfulInterventions: bp.successful_interventions || []
          })) || [],
          supportPlan: p.support_plan && p.support_plan.length > 0 ? {
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
          },
          emergencyContact: p.emergency_contact_name ? {
            name: p.emergency_contact_name,
            role: p.emergency_contact_relationship || '',
            phone: p.emergency_contact_phone || ''
          } : undefined,
          recentIncidents: 0,
          onShift: true,
          mood: 'neutral' as const
        }
      })
  }

  // Incident methods
  static async getIncidents(facilityId?: string): Promise<Incident[]> {
    if (!this.isAvailable()) return []

    // Simplified query without joins to avoid relationship errors
    let query = supabase!
      .from('incidents')
      .select('*')

    // Only filter by facility_id if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (facilityId && uuidRegex.test(facilityId)) {
      query = query.eq('facility_id', facilityId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching incidents:', error)
      return []
    }

    // Fetch participants and users separately to get names
    const participantIds = [...new Set(data.map(i => i.participant_id).filter(Boolean))]
    const staffIds = [...new Set(data.map(i => i.staff_id).filter(Boolean))]

    const participantsMap = new Map<string, string>()
    const staffMap = new Map<string, string>()

    if (participantIds.length > 0) {
      const { data: participants } = await supabase!
        .from('participants')
        .select('id, name')
        .in('id', participantIds)
      participants?.forEach(p => participantsMap.set(p.id, p.name))
    }

    if (staffIds.length > 0) {
      const { data: staff } = await supabase!
        .from('users')
        .select('id, name')
        .in('id', staffIds)
      staff?.forEach(s => staffMap.set(s.id, s.name))
    }

    return data.map(i => ({
      id: i.id,
      participantId: i.participant_id || '',
      participantName: participantsMap.get(i.participant_id) || 'Unknown',
      type: i.type as any,
      severity: i.severity as any,
      timestamp: i.created_at,
      location: i.location || '',
      staffId: i.staff_id || '',
      staffName: staffMap.get(i.staff_id) || 'Unknown',
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

    // Only filter by facility_id if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (facilityId && uuidRegex.test(facilityId)) {
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
  static async getCurrentShift(userId: string): Promise<Shift | null> {
    if (!this.isAvailable()) return null

    // System uses user_clock_status table for shift management, not shifts table
    // This function is kept for backward compatibility but returns null
    // Actual shift state is managed client-side using Zustand store
    return null
  }

  static async createShift(shift: Omit<Shift, 'id'>, userName?: string, userEmail?: string, userRole?: string): Promise<Shift> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available')
    }

    // Look up staff record by user_id to get the actual staff_id
    const { data: staffRecord, error: staffError } = await supabase!
      .from('staff')
      .select('id, name, role')
      .eq('user_id', shift.staffId)
      .single()

    if (staffError || !staffRecord) {
      console.error('❌ Staff record not found for user_id:', shift.staffId, staffError)
      throw new Error('Staff record not found for this user')
    }

    console.log('✅ Found staff record:', staffRecord.id, 'for user:', shift.staffId)

    // Parse the ISO timestamps
    const startDate = new Date(shift.startTime)
    const endDate = new Date(shift.endTime)

    // Extract date and time components for database schema
    const shiftDate = startDate.toISOString().split('T')[0] // "2025-10-06"
    const startTime = startDate.toTimeString().split(' ')[0] // "07:00:00"
    const endTime = endDate.toTimeString().split(' ')[0] // "15:00:00"

    // Determine shift type based on start hour
    const startHour = startDate.getHours()
    let shiftType: 'morning' | 'afternoon' | 'night' = 'morning'
    if (startHour >= 14 && startHour < 22) shiftType = 'afternoon'
    else if (startHour >= 22 || startHour < 6) shiftType = 'night'

    // Use the staff record ID (not user ID) as staff_id
    const { data, error} = await supabase!
      .from('shifts')
      .insert({
        staff_id: staffRecord.id, // Use staff record ID
        staff_name: staffRecord.name || userName || 'Support Worker',
        staff_role: staffRecord.role || userRole || 'Support Worker',
        facility_id: shift.facilityId,
        facility_name: 'Parramatta - Maxlife Care',
        shift_date: shiftDate,
        start_time: startTime,
        end_time: endTime,
        shift_type: shiftType,
        actual_start_time: shift.startTime,
        clocked_in_by: staffRecord.id,
        status: shift.status,
        handover_notes: shift.handoverNotes
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase shift creation error:', error)
      throw error
    }

    console.log('✅ Shift created in Supabase:', data.id)

    return {
      id: data.id,
      staffId: shift.staffId, // Return original user ID for UI consistency
      facilityId: data.facility_id || '',
      startTime: data.actual_start_time || data.start_time,
      endTime: data.actual_end_time || data.end_time,
      handoverNotes: data.handover_notes || undefined,
      status: data.status as any
    }
  }

  static async updateShift(shiftId: string, updates: Partial<Shift>): Promise<void> {
    if (!this.isAvailable()) return

    // Validate shift ID is a proper UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shiftId)) {
      // Silent return for demo/local shift IDs
      console.log('[SupabaseService] Skipping updateShift for non-UUID shift ID:', shiftId)
      return
    }

    const updateData: any = {}
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.handoverNotes !== undefined) updateData.handover_notes = updates.handoverNotes

    const { error } = await supabase!
      .from('shifts')
      .update(updateData)
      .eq('id', shiftId)

    if (error) {
      console.error('Error updating shift:', error)
      throw error
    }
  }

  static async endShift(shiftId: string, handoverNotes?: string): Promise<void> {
    if (!this.isAvailable()) return

    // Validate shift ID is a proper UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shiftId)) {
      // Silent return for demo/local shift IDs (e.g., "clock-user123")
      console.log('[SupabaseService] Skipping endShift for non-UUID shift ID:', shiftId)
      return
    }

    // First check if shift exists
    const { data: existingShift, error: fetchError} = await supabase!
      .from('shifts')
      .select('id, status')
      .eq('id', shiftId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching shift:', fetchError)
      throw fetchError
    }

    // If shift doesn't exist, just return (it's already gone)
    if (!existingShift) {
      console.warn(`Shift ${shiftId} not found in database - already ended or doesn't exist`)
      return
    }

    // If shift already completed, just return
    if (existingShift.status === 'completed') {
      console.warn(`Shift ${shiftId} is already completed`)
      return
    }

    // Update the shift
    const { error } = await supabase!
      .from('shifts')
      .update({
        status: 'completed',
        actual_end_time: new Date().toISOString(),
        handover_notes: handoverNotes
      })
      .eq('id', shiftId)

    if (error) {
      console.error('Error ending shift:', error)
      throw error
    }
  }

  // ============================================================================
  // COMPREHENSIVE SHIFT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get shifts by date range
   */
  static async getShiftsByDateRange(startDate: string, endDate: string, staffId?: string) {
    if (!this.isAvailable()) return []

    let query = supabase!
      .from('shifts')
      .select('*')
      .gte('shift_date', startDate)
      .lte('shift_date', endDate)

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    const { data, error } = await query.order('shift_date').order('start_time')

    if (error) {
      console.error('Error fetching shifts by date range:', error)
      return []
    }

    return data
  }

  /**
   * Get shifts for a specific date
   */
  static async getShiftsByDate(date: string, facilityId?: string) {
    if (!this.isAvailable()) return []

    let query = supabase!
      .from('shifts')
      .select('*')
      .eq('shift_date', date)

    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }

    const { data, error } = await query.order('start_time')

    if (error) {
      console.error('Error fetching shifts by date:', error)
      return []
    }

    return data
  }

  /**
   * Get shifts for a specific staff member
   */
  static async getStaffShifts(staffId: string, startDate?: string, endDate?: string) {
    if (!this.isAvailable()) return []

    let query = supabase!
      .from('shifts')
      .select('*')
      .eq('staff_id', staffId)

    if (startDate) {
      query = query.gte('shift_date', startDate)
    }

    if (endDate) {
      query = query.lte('shift_date', endDate)
    }

    const { data, error } = await query.order('shift_date').order('start_time')

    if (error) {
      console.error('Error fetching staff shifts:', error)
      return []
    }

    return data
  }

  /**
   * Update shift handover notes
   */
  static async updateShiftHandover(shiftId: string, handoverNotes: string, criticalInfo?: string[]) {
    if (!this.isAvailable()) return

    // Validate shift ID is a proper UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shiftId)) {
      // Silent return for demo/local shift IDs
      console.log('[SupabaseService] Skipping updateShiftHandover for non-UUID shift ID:', shiftId)
      return
    }

    const { error } = await supabase!
      .from('shifts')
      .update({
        handover_notes: handoverNotes,
        handover_critical_info: criticalInfo
      })
      .eq('id', shiftId)

    if (error) {
      console.error('Error updating handover:', error)
      throw error
    }
  }

  /**
   * Create a new shift
   */
  static async createNewShift(shiftData: {
    staffId: string
    staffName: string
    staffRole: string
    facilityId: string
    facilityName: string
    shiftDate: string
    startTime: string
    endTime: string
    shiftType: 'morning' | 'afternoon' | 'night'
    assignedBy?: string
    assignedByName?: string
  }) {
    if (!this.isAvailable()) return null

    const { data, error } = await supabase!
      .from('shifts')
      .insert({
        staff_id: shiftData.staffId,
        staff_name: shiftData.staffName,
        staff_role: shiftData.staffRole,
        facility_id: shiftData.facilityId,
        facility_name: shiftData.facilityName,
        shift_date: shiftData.shiftDate,
        start_time: shiftData.startTime,
        end_time: shiftData.endTime,
        shift_type: shiftData.shiftType,
        status: 'scheduled',
        assigned_by: shiftData.assignedBy,
        assigned_by_name: shiftData.assignedByName
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating shift:', error)
      throw error
    }

    return data
  }

  /**
   * Cancel a shift
   */
  static async cancelShift(shiftId: string) {
    if (!this.isAvailable()) return

    // Validate shift ID is a proper UUID before querying
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(shiftId)) {
      // Silent return for demo/local shift IDs
      console.log('[SupabaseService] Skipping cancelShift for non-UUID shift ID:', shiftId)
      return
    }

    const { error } = await supabase!
      .from('shifts')
      .update({ status: 'cancelled' })
      .eq('id', shiftId)

    if (error) {
      console.error('Error cancelling shift:', error)
      throw error
    }
  }

  /**
   * Get all facilities
   */
  static async getFacilities() {
    if (!this.isAvailable()) return []

    const { data, error } = await supabase!
      .from('facilities')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching facilities:', error)
      return []
    }

    return data
  }

  /**
   * Get all staff
   */
  static async getStaff() {
    if (!this.isAvailable()) return []

    const { data, error } = await supabase!
      .from('staff')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching staff:', error)
      return []
    }

    return data
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

  // ============================================================================
  // Webster Pack & Medication Management Methods
  // ============================================================================

  /**
   * Get Webster packs for a participant
   */
  static async getWebsterPacks(participantId: string, weekStarting?: string): Promise<WebsterPack[]> {
    if (!this.isAvailable()) return []

    let query = supabase!
      .from('webster_packs')
      .select('*')
      .eq('participant_id', participantId)

    if (weekStarting) {
      query = query.eq('week_starting', weekStarting)
    }

    const { data, error } = await query.order('week_starting', { ascending: false })

    if (error) {
      console.error('Error fetching Webster packs:', error)
      return []
    }

    return data.map(wp => ({
      id: wp.id,
      participantId: wp.participant_id,
      pharmacyId: wp.pharmacy_id,
      packNumber: wp.pack_number,
      weekStarting: wp.week_starting,
      weekEnding: wp.week_ending,
      preparedDate: wp.prepared_date,
      expectedPillCount: wp.expected_pill_count,
      actualPillCount: wp.actual_pill_count || undefined,
      status: wp.status as any,
      receivedDate: wp.received_date || undefined,
      receivedBy: wp.received_by || undefined,
      verifiedDate: wp.verified_date || undefined,
      verifiedBy: wp.verified_by || undefined,
      verificationNotes: wp.verification_notes || undefined,
      discrepancyReported: wp.discrepancy_reported,
      fhirMedicationRequestId: wp.fhir_medication_request_id || undefined,
      createdAt: wp.created_at,
      updatedAt: wp.updated_at
    }))
  }

  /**
   * Get Webster pack slots (medications) for a specific pack
   */
  static async getWebsterPackSlots(websterPackId: string): Promise<WebsterPackSlot[]> {
    if (!this.isAvailable()) return []

    const { data, error } = await supabase!
      .from('webster_pack_slots')
      .select('*')
      .eq('webster_pack_id', websterPackId)
      .order('slot_date')
      .order('timing_slot_name')

    if (error) {
      console.error('Error fetching Webster pack slots:', error)
      return []
    }

    return data.map(wps => ({
      id: wps.id,
      websterPackId: wps.webster_pack_id,
      medicationId: wps.medication_id || undefined,
      dayOfWeek: wps.day_of_week,
      slotDate: wps.slot_date,
      timingSlotId: wps.timing_slot_id,
      timingSlotName: wps.timing_slot_name as any,
      expectedPillCount: wps.expected_pill_count,
      actualPillCount: wps.actual_pill_count || undefined,
      medicationName: wps.medication_name,
      dosage: wps.dosage,
      pillDescription: wps.pill_description || undefined,
      administrationStatus: wps.administration_status as any,
      administeredAt: wps.administered_at || undefined,
      administeredBy: wps.administered_by || undefined,
      verificationRequired: wps.verification_required,
      verifiedBy: wps.verified_by || undefined,
      notes: wps.notes || undefined,
      createdAt: wps.created_at,
      updatedAt: wps.updated_at
    }))
  }

  /**
   * Get today's Webster pack slots for current shift participants
   */
  static async getTodayWebsterPackSlots(participantIds: string[]): Promise<WebsterPackSlot[]> {
    if (!this.isAvailable()) return []
    if (participantIds.length === 0) return []

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

    const { data, error } = await supabase!
      .from('webster_pack_slots')
      .select(`
        *,
        webster_pack:webster_packs(participant_id)
      `)
      .eq('slot_date', today)
      .in('webster_pack.participant_id', participantIds)

    if (error) {
      console.error('Error fetching today\'s Webster pack slots:', error)
      return []
    }

    return data.map(wps => ({
      id: wps.id,
      websterPackId: wps.webster_pack_id,
      medicationId: wps.medication_id || undefined,
      dayOfWeek: wps.day_of_week,
      slotDate: wps.slot_date,
      timingSlotId: wps.timing_slot_id,
      timingSlotName: wps.timing_slot_name as any,
      expectedPillCount: wps.expected_pill_count,
      actualPillCount: wps.actual_pill_count || undefined,
      medicationName: wps.medication_name,
      dosage: wps.dosage,
      pillDescription: wps.pill_description || undefined,
      administrationStatus: wps.administration_status as any,
      administeredAt: wps.administered_at || undefined,
      administeredBy: wps.administered_by || undefined,
      verificationRequired: wps.verification_required,
      verifiedBy: wps.verified_by || undefined,
      notes: wps.notes || undefined,
      createdAt: wps.created_at,
      updatedAt: wps.updated_at
    }))
  }

  /**
   * Mark a Webster pack slot as administered
   */
  static async administerWebsterPackSlot(
    slotId: string,
    userId: string,
    actualPillCount: number,
    notes?: string
  ): Promise<void> {
    if (!this.isAvailable()) return

    const { error } = await supabase!
      .from('webster_pack_slots')
      .update({
        administration_status: 'administered',
        administered_at: new Date().toISOString(),
        administered_by: userId,
        actual_pill_count: actualPillCount,
        notes: notes || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', slotId)

    if (error) {
      console.error('Error administering Webster pack slot:', error)
      throw error
    }
  }

  /**
   * Create a new Webster pack
   */
  static async createWebsterPack(pack: Omit<WebsterPack, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebsterPack> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available')
    }

    const { data, error } = await supabase!
      .from('webster_packs')
      .insert({
        participant_id: pack.participantId,
        pharmacy_id: pack.pharmacyId,
        pack_number: pack.packNumber,
        week_starting: pack.weekStarting,
        week_ending: pack.weekEnding,
        prepared_date: pack.preparedDate,
        expected_pill_count: pack.expectedPillCount,
        actual_pill_count: pack.actualPillCount,
        status: pack.status,
        received_date: pack.receivedDate,
        received_by: pack.receivedBy,
        verified_date: pack.verifiedDate,
        verified_by: pack.verifiedBy,
        verification_notes: pack.verificationNotes,
        discrepancy_reported: pack.discrepancyReported,
        fhir_medication_request_id: pack.fhirMedicationRequestId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating Webster pack:', error)
      throw error
    }

    return {
      id: data.id,
      participantId: data.participant_id,
      pharmacyId: data.pharmacy_id,
      packNumber: data.pack_number,
      weekStarting: data.week_starting,
      weekEnding: data.week_ending,
      preparedDate: data.prepared_date,
      expectedPillCount: data.expected_pill_count,
      actualPillCount: data.actual_pill_count || undefined,
      status: data.status as any,
      receivedDate: data.received_date || undefined,
      receivedBy: data.received_by || undefined,
      verifiedDate: data.verified_date || undefined,
      verifiedBy: data.verified_by || undefined,
      verificationNotes: data.verification_notes || undefined,
      discrepancyReported: data.discrepancy_reported,
      fhirMedicationRequestId: data.fhir_medication_request_id || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Report a medication discrepancy
   */
  static async reportMedicationDiscrepancy(
    discrepancy: Omit<MedicationDiscrepancy, 'id' | 'createdAt'>
  ): Promise<void> {
    if (!this.isAvailable()) return

    const { error } = await supabase!
      .from('medication_discrepancies')
      .insert({
        webster_pack_id: discrepancy.websterPackId,
        webster_pack_slot_id: discrepancy.websterPackSlotId,
        discrepancy_type: discrepancy.discrepancyType,
        expected_medication: discrepancy.expectedMedication,
        expected_count: discrepancy.expectedCount,
        actual_medication: discrepancy.actualMedication,
        actual_count: discrepancy.actualCount,
        description: discrepancy.description,
        severity: discrepancy.severity,
        reported_by: discrepancy.reportedBy,
        reported_at: discrepancy.reportedAt,
        pharmacy_notified: discrepancy.pharmacyNotified,
        pharmacy_notified_at: discrepancy.pharmacyNotifiedAt,
        resolved: discrepancy.resolved,
        resolved_at: discrepancy.resolvedAt,
        resolved_by: discrepancy.resolvedBy,
        resolution_notes: discrepancy.resolutionNotes,
        pharmacy_response: discrepancy.pharmacyResponse
      })

    if (error) {
      console.error('Error reporting medication discrepancy:', error)
      throw error
    }

    // Also update the Webster pack to mark discrepancy_reported
    await supabase!
      .from('webster_packs')
      .update({ discrepancy_reported: true })
      .eq('id', discrepancy.websterPackId)
  }

  /**
   * Get pharmacy integrations for a facility
   */
  static async getPharmacyIntegrations(facilityId: string): Promise<PharmacyIntegration[]> {
    if (!this.isAvailable()) return []

    const { data, error } = await supabase!
      .from('pharmacy_integrations')
      .select('*')
      .eq('facility_id', facilityId)
      .order('pharmacy_name')

    if (error) {
      console.error('Error fetching pharmacy integrations:', error)
      return []
    }

    return data.map(pi => ({
      id: pi.id,
      facilityId: pi.facility_id,
      pharmacyName: pi.pharmacy_name,
      pharmacyId: pi.pharmacy_id,
      pharmacyAddress: pi.pharmacy_address || undefined,
      pharmacyPhone: pi.pharmacy_phone || undefined,
      pharmacyEmail: pi.pharmacy_email || undefined,
      fhirEndpointUrl: pi.fhir_endpoint_url || undefined,
      fhirApiKeyEncrypted: pi.fhir_api_key_encrypted || undefined,
      integrationType: pi.integration_type as any,
      syncEnabled: pi.sync_enabled,
      lastSyncAt: pi.last_sync_at || undefined,
      lastSyncStatus: pi.last_sync_status as any || undefined,
      syncFrequencyHours: pi.sync_frequency_hours,
      autoVerifyPacks: pi.auto_verify_packs,
      notes: pi.notes || undefined,
      createdAt: pi.created_at,
      updatedAt: pi.updated_at
    }))
  }

  /**
   * Trigger a pharmacy sync
   */
  static async triggerPharmacySync(
    pharmacyIntegrationId: string,
    userId: string
  ): Promise<PharmacySyncLog> {
    if (!this.isAvailable()) {
      throw new Error('Supabase not available')
    }

    const syncStartTime = new Date().toISOString()

    // Create sync log entry
    const { data, error } = await supabase!
      .from('pharmacy_sync_log')
      .insert({
        pharmacy_integration_id: pharmacyIntegrationId,
        sync_started_at: syncStartTime,
        sync_status: 'success', // In real implementation, this would be determined by actual sync
        medications_synced: 0,
        webster_packs_synced: 0,
        errors_encountered: 0,
        initiated_by: userId
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating sync log:', error)
      throw error
    }

    // Update pharmacy integration last sync time
    await supabase!
      .from('pharmacy_integrations')
      .update({
        last_sync_at: syncStartTime,
        last_sync_status: 'success',
        updated_at: new Date().toISOString()
      })
      .eq('id', pharmacyIntegrationId)

    return {
      id: data.id,
      pharmacyIntegrationId: data.pharmacy_integration_id,
      syncStartedAt: data.sync_started_at,
      syncCompletedAt: data.sync_completed_at || undefined,
      syncStatus: data.sync_status as any,
      medicationsSynced: data.medications_synced,
      websterPacksSynced: data.webster_packs_synced,
      errorsEncountered: data.errors_encountered,
      errorDetails: data.error_details || undefined,
      syncDetails: data.sync_details || undefined,
      initiatedBy: data.initiated_by || undefined,
      createdAt: data.created_at
    }
  }

  /**
   * Get unresolved medication discrepancies
   */
  static async getUnresolvedDiscrepancies(facilityId?: string): Promise<MedicationDiscrepancy[]> {
    if (!this.isAvailable()) return []

    let query = supabase!
      .from('medication_discrepancies')
      .select(`
        *,
        webster_pack:webster_packs(participant_id, pack_number)
      `)
      .eq('resolved', false)

    const { data, error } = await query.order('reported_at', { ascending: false })

    if (error) {
      console.error('Error fetching medication discrepancies:', error)
      return []
    }

    return data.map(md => ({
      id: md.id,
      websterPackId: md.webster_pack_id,
      websterPackSlotId: md.webster_pack_slot_id || undefined,
      discrepancyType: md.discrepancy_type as any,
      expectedMedication: md.expected_medication || undefined,
      expectedCount: md.expected_count || undefined,
      actualMedication: md.actual_medication || undefined,
      actualCount: md.actual_count || undefined,
      description: md.description,
      severity: md.severity as any,
      reportedBy: md.reported_by || undefined,
      reportedAt: md.reported_at,
      pharmacyNotified: md.pharmacy_notified,
      pharmacyNotifiedAt: md.pharmacy_notified_at || undefined,
      resolved: md.resolved,
      resolvedAt: md.resolved_at || undefined,
      resolvedBy: md.resolved_by || undefined,
      resolutionNotes: md.resolution_notes || undefined,
      pharmacyResponse: md.pharmacy_response || undefined,
      createdAt: md.created_at
    }))
  }

  // ===================================================================
  // Simple User Clock Status Methods
  // ===================================================================

  /**
   * Get user's current clock status
   */
  static async getClockStatus(userId: string): Promise<{ isClockedIn: boolean; clockInTime: string | null } | null> {
    if (!this.isAvailable()) return null

    const { data, error } = await supabase!
      .from('user_clock_status')
      .select('is_clocked_in, clock_in_time')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching clock status:', error)
      return null
    }

    if (!data) {
      return { isClockedIn: false, clockInTime: null }
    }

    return {
      isClockedIn: data.is_clocked_in,
      clockInTime: data.clock_in_time
    }
  }

  /**
   * Clock in a user
   */
  static async clockIn(userId: string): Promise<boolean> {
    if (!this.isAvailable()) return false

    const now = new Date().toISOString()

    // Use upsert to either create or update the record
    const { error } = await supabase!
      .from('user_clock_status')
      .upsert({
        user_id: userId,
        is_clocked_in: true,
        clock_in_time: now,
        clock_out_time: null
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error clocking in:', error)
      return false
    }

    return true
  }

  /**
   * Clock out a user
   */
  static async clockOut(userId: string): Promise<boolean> {
    if (!this.isAvailable()) return false

    const now = new Date().toISOString()

    const { error } = await supabase!
      .from('user_clock_status')
      .update({
        is_clocked_in: false,
        clock_out_time: now
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error clocking out:', error)
      return false
    }

    return true
  }

  /**
   * Save shift handover notes
   */
  static async saveShiftHandoverNotes(
    userId: string,
    clockInTime: string,
    clockOutTime: string,
    durationHours: number,
    breakTimeSeconds: number,
    handoverNotes: string,
    progressNotes: string | null
  ): Promise<boolean> {
    if (!this.isAvailable()) return false

    const shiftDate = new Date(clockInTime).toISOString().split('T')[0]

    const { error } = await supabase!
      .from('shift_handover_notes')
      .insert({
        user_id: userId,
        shift_date: shiftDate,
        clock_in_time: clockInTime,
        clock_out_time: clockOutTime,
        duration_hours: durationHours,
        break_time_seconds: breakTimeSeconds,
        handover_notes: handoverNotes,
        progress_notes: progressNotes
      })

    if (error) {
      console.error('Error saving shift handover notes:', error)
      return false
    }

    return true
  }

  // ===========================
  // Billing & Invoice Methods
  // ===========================

  /**
   * Get all billing records for a facility
   */
  static async getBillingRecords(facilityId?: string): Promise<BillingRecord[]> {
    if (!this.isAvailable()) return []

    let query = supabase!
      .from('billing_records')
      .select('*')
      .order('created_at', { ascending: false })

    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching billing records:', error)
      return []
    }

    return data.map(record => ({
      id: record.id,
      billingId: record.billing_id,
      reportId: record.report_id,
      reportType: record.report_type as 'incident' | 'abc' | 'combined',
      participantId: record.participant_id,
      participantName: record.participant_name,
      facilityId: record.facility_id,
      dateOfService: record.date_of_service,
      amount: record.amount,
      serviceCode: record.service_code || undefined,
      description: record.description,
      status: record.status as 'pending' | 'submitted' | 'approved' | 'paid' | 'disputed' | 'cancelled',
      submittedAt: record.submitted_at || undefined,
      submittedBy: record.submitted_by || undefined,
      submittedTo: record.submitted_to || undefined,
      approvedAt: record.approved_at || undefined,
      approvedBy: record.approved_by || undefined,
      paidAt: record.paid_at || undefined,
      notes: record.notes || undefined,
      invoiceNumber: record.invoice_number || undefined,
      paymentReference: record.payment_reference || undefined,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }))
  }

  /**
   * Create a new billing record
   */
  static async createBillingRecord(billingRecord: Omit<BillingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    if (!this.isAvailable()) return null

    const { data, error } = await supabase!
      .from('billing_records')
      .insert({
        billing_id: billingRecord.billingId,
        report_id: billingRecord.reportId,
        report_type: billingRecord.reportType,
        participant_id: billingRecord.participantId,
        participant_name: billingRecord.participantName,
        facility_id: billingRecord.facilityId,
        date_of_service: billingRecord.dateOfService,
        amount: billingRecord.amount,
        service_code: billingRecord.serviceCode,
        description: billingRecord.description,
        status: billingRecord.status
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating billing record:', error)
      return null
    }

    return data.id
  }

  /**
   * Update billing record status
   */
  static async updateBillingRecordStatus(
    recordId: string,
    status: 'pending' | 'submitted' | 'approved' | 'paid' | 'disputed' | 'cancelled',
    additionalData?: {
      submittedAt?: string
      submittedBy?: string
      approvedAt?: string
      approvedBy?: string
      paidAt?: string
      invoiceNumber?: string
      paymentReference?: string
    }
  ): Promise<boolean> {
    if (!this.isAvailable()) return false

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (additionalData) {
      if (additionalData.submittedAt) updateData.submitted_at = additionalData.submittedAt
      if (additionalData.submittedBy) updateData.submitted_by = additionalData.submittedBy
      if (additionalData.approvedAt) updateData.approved_at = additionalData.approvedAt
      if (additionalData.approvedBy) updateData.approved_by = additionalData.approvedBy
      if (additionalData.paidAt) updateData.paid_at = additionalData.paidAt
      if (additionalData.invoiceNumber) updateData.invoice_number = additionalData.invoiceNumber
      if (additionalData.paymentReference) updateData.payment_reference = additionalData.paymentReference
    }

    const { error } = await supabase!
      .from('billing_records')
      .update(updateData)
      .eq('id', recordId)

    if (error) {
      console.error('Error updating billing record:', error)
      return false
    }

    return true
  }

  // ===========================
  // Report Escalation Methods
  // ===========================

  /**
   * Get all report escalations for a facility
   */
  static async getReportEscalations(facilityId?: string): Promise<ReportEscalation[]> {
    if (!this.isAvailable()) return []

    let query = supabase!
      .from('report_escalations')
      .select('*')
      .order('created_at', { ascending: false })

    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching report escalations:', error)
      return []
    }

    return data.map(escalation => ({
      id: escalation.id,
      reportId: escalation.report_id,
      reportType: escalation.report_type as 'incident' | 'abc',
      participantId: escalation.participant_id,
      participantName: escalation.participant_name,
      facilityId: escalation.facility_id,
      currentStage: escalation.current_stage,
      priority: escalation.priority as 'low' | 'medium' | 'high' | 'critical',
      assignedTo: escalation.assigned_to || undefined,
      assignedToName: escalation.assigned_to_name || undefined,
      dueDate: escalation.due_date || undefined,
      completedStages: escalation.completed_stages || [],
      timeline: escalation.timeline || [],
      status: escalation.status as 'in_progress' | 'completed' | 'escalated' | 'on_hold',
      createdAt: escalation.created_at,
      updatedAt: escalation.updated_at
    }))
  }

  /**
   * Create a new report escalation
   */
  static async createReportEscalation(escalation: Omit<ReportEscalation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    if (!this.isAvailable()) return null

    const { data, error } = await supabase!
      .from('report_escalations')
      .insert({
        report_id: escalation.reportId,
        report_type: escalation.reportType,
        participant_id: escalation.participantId,
        participant_name: escalation.participantName,
        facility_id: escalation.facilityId,
        current_stage: escalation.currentStage,
        priority: escalation.priority,
        assigned_to: escalation.assignedTo,
        assigned_to_name: escalation.assignedToName,
        due_date: escalation.dueDate,
        completed_stages: escalation.completedStages,
        timeline: escalation.timeline,
        status: escalation.status
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating report escalation:', error)
      return null
    }

    return data.id
  }

  /**
   * Update report escalation stage
   */
  static async updateEscalationStage(
    escalationId: string,
    currentStage: string,
    completedStage: CompletedStage,
    status?: 'in_progress' | 'completed' | 'escalated' | 'on_hold'
  ): Promise<boolean> {
    if (!this.isAvailable()) return false

    // First fetch the current escalation to get existing data
    const { data: currentData, error: fetchError } = await supabase!
      .from('report_escalations')
      .select('completed_stages')
      .eq('id', escalationId)
      .single()

    if (fetchError) {
      console.error('Error fetching current escalation:', fetchError)
      return false
    }

    const completedStages = [...(currentData.completed_stages || []), completedStage]

    const updateData: any = {
      current_stage: currentStage,
      completed_stages: completedStages,
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    const { error } = await supabase!
      .from('report_escalations')
      .update(updateData)
      .eq('id', escalationId)

    if (error) {
      console.error('Error updating escalation stage:', error)
      return false
    }

    return true
  }

  /**
   * Add event to escalation timeline
   */
  static async addEscalationEvent(
    escalationId: string,
    event: EscalationEvent
  ): Promise<boolean> {
    if (!this.isAvailable()) return false

    // First fetch the current timeline
    const { data: currentData, error: fetchError } = await supabase!
      .from('report_escalations')
      .select('timeline')
      .eq('id', escalationId)
      .single()

    if (fetchError) {
      console.error('Error fetching current timeline:', fetchError)
      return false
    }

    const timeline = [...(currentData.timeline || []), event]

    const { error } = await supabase!
      .from('report_escalations')
      .update({
        timeline,
        updated_at: new Date().toISOString()
      })
      .eq('id', escalationId)

    if (error) {
      console.error('Error adding escalation event:', error)
      return false
    }

    return true
  }

  // ===========================
  // Document Library Methods
  // ===========================

  /**
   * Get all documents for a facility
   */
  static async getDocuments(facilityId?: string, category?: string): Promise<Document[]> {
    if (!this.isAvailable()) return []

    let query = supabase!
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      return []
    }

    return data.map(doc => ({
      id: doc.id,
      title: doc.title,
      category: doc.category as any,
      description: doc.description || undefined,
      fileUrl: doc.file_url,
      fileName: doc.file_name || doc.title,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      uploadedBy: doc.uploaded_by,
      uploadedByName: doc.uploaded_by_name || 'Unknown',
      uploadedAt: doc.uploaded_at,
      version: doc.version || '1.0',
      tags: doc.tags || [],
      requiresAcknowledgment: doc.requires_acknowledgment,
      acknowledgedBy: doc.acknowledged_by || [],
      expiryDate: doc.expiry_date || undefined,
      facilityId: doc.facility_id || undefined,
      accessCount: doc.access_count || 0,
      isArchived: doc.is_archived || false,
      lastAccessedAt: doc.last_accessed_at || undefined,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at
    }))
  }

  /**
   * Upload a new document
   */
  static async uploadDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    if (!this.isAvailable()) return null

    const { data, error } = await supabase!
      .from('documents')
      .insert({
        title: document.title,
        category: document.category,
        description: document.description,
        file_url: document.fileUrl,
        file_name: document.fileName,
        file_type: document.fileType,
        file_size: document.fileSize,
        uploaded_by: document.uploadedBy,
        uploaded_by_name: document.uploadedByName,
        uploaded_at: document.uploadedAt,
        version: document.version,
        tags: document.tags,
        requires_acknowledgment: document.requiresAcknowledgment,
        acknowledged_by: document.acknowledgedBy,
        expiry_date: document.expiryDate,
        facility_id: document.facilityId,
        access_count: document.accessCount || 0,
        is_archived: document.isArchived || false
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error uploading document:', error)
      return null
    }

    return data.id
  }

  /**
   * Acknowledge a document
   */
  static async acknowledgeDocument(documentId: string, userId: string, userName: string): Promise<boolean> {
    if (!this.isAvailable()) return false

    // First fetch the current document to get existing acknowledgments
    const { data: currentDoc, error: fetchError } = await supabase!
      .from('documents')
      .select('acknowledged_by')
      .eq('id', documentId)
      .single()

    if (fetchError) {
      console.error('Error fetching document:', fetchError)
      return false
    }

    const acknowledgedBy = [...(currentDoc.acknowledged_by || []), {
      userId,
      userName,
      acknowledgedAt: new Date().toISOString()
    }]

    const { error } = await supabase!
      .from('documents')
      .update({
        acknowledged_by: acknowledgedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)

    if (error) {
      console.error('Error acknowledging document:', error)
      return false
    }

    return true
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string): Promise<boolean> {
    if (!this.isAvailable()) return false

    const { error } = await supabase!
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      console.error('Error deleting document:', error)
      return false
    }

    return true
  }

  // ===========================
  // Analytics Methods
  // ===========================

  /**
   * Get analytics summary for a period
   */
  static async getAnalyticsSummary(
    facilityId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsSummary | null> {
    if (!this.isAvailable()) return null

    // This would be a complex aggregation query in production
    // For now, returning null to use mock data in the frontend
    // TODO: Implement proper analytics aggregation
    return null
  }

  /**
   * Get participant statistics
   */
  static async getParticipantStats(
    facilityId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ParticipantStats[]> {
    if (!this.isAvailable()) return []

    // This would aggregate incident data by participant
    // For now, returning empty to use mock data in the frontend
    // TODO: Implement proper participant statistics aggregation
    return []
  }

  /**
   * Get staff performance statistics
   */
  static async getStaffStats(
    facilityId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<StaffStats[]> {
    if (!this.isAvailable()) return []

    // This would aggregate report and incident data by staff
    // For now, returning empty to use mock data in the frontend
    // TODO: Implement proper staff statistics aggregation
    return []
  }

  // ===========================
  // Audit Trail Methods
  // ===========================

  /**
   * Get audit logs
   */
  static async getAuditLogs(
    entityType?: string,
    entityId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AuditLog[]> {
    if (!this.isAvailable()) return []

    let query = supabase!
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    if (entityId) {
      query = query.eq('entity_id', entityId)
    }

    if (startDate) {
      query = query.gte('timestamp', startDate)
    }

    if (endDate) {
      query = query.lte('timestamp', endDate)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }

    return data.map(log => ({
      id: log.id,
      entityType: log.entity_type,
      entityId: log.entity_id,
      action: log.action,
      performedBy: log.performed_by,
      performedByName: log.performed_by_name || undefined,
      timestamp: log.timestamp,
      changes: log.changes || undefined,
      metadata: log.metadata || undefined
    }))
  }

  /**
   * Create an audit log entry
   */
  static async createAuditLog(log: Omit<AuditLog, 'id'>): Promise<boolean> {
    if (!this.isAvailable()) return false

    const { error } = await supabase!
      .from('audit_logs')
      .insert({
        entity_type: log.entityType,
        entity_id: log.entityId,
        action: log.action,
        performed_by: log.performedBy,
        performed_by_name: log.performedByName,
        timestamp: log.timestamp,
        changes: log.changes,
        metadata: log.metadata
      })

    if (error) {
      console.error('Error creating audit log:', error)
      return false
    }

    return true
  }
}