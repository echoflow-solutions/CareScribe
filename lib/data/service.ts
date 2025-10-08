import { storage } from './storage'
import { SupabaseService } from '@/lib/supabase/service'
import { 
  users, roles, organization, participants, recentIncidents, 
  activeAlerts, routingRules, currentShift 
} from './dummy-data'
import { 
  User, Participant, Incident, Alert, Organization, 
  RoutingRule, Shift 
} from '@/lib/types'

const STORAGE_KEYS = {
  USERS: 'carescribe_users',
  ORGANIZATION: 'carescribe_organization',
  PARTICIPANTS: 'carescribe_participants',
  INCIDENTS: 'carescribe_incidents',
  ALERTS: 'carescribe_alerts',
  ROUTING_RULES: 'carescribe_routing_rules',
  CURRENT_SHIFT: 'carescribe_current_shift',
  CURRENT_USER: 'carescribe_current_user'
}

// Simple UUID generator for browser compatibility
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export class DataService {
  // Check if we should use Supabase
  static useSupabase(): boolean {
    return SupabaseService.isAvailable()
  }

  // Get user-specific storage key for current shift
  private static async getUserShiftKey(): Promise<string> {
    const currentUser = await this.getCurrentUser()
    if (currentUser) {
      return `${STORAGE_KEYS.CURRENT_SHIFT}_${currentUser.id}`
    }
    return STORAGE_KEYS.CURRENT_SHIFT
  }

  // Initialize demo data (only for local storage)
  static async initializeDemoData() {
    if (this.useSupabase()) {
      // Check Supabase connection
      const connected = await SupabaseService.checkConnection()
      console.log('Using Supabase:', connected)
      return
    }

    // Initialize local storage with demo data
    console.log('Initializing demo data in local storage')
    
    // Check if data already exists
    const existingUsers = await storage.get(STORAGE_KEYS.USERS)
    if (!existingUsers || existingUsers.length === 0) {
      await storage.set(STORAGE_KEYS.USERS, users)
      await storage.set(STORAGE_KEYS.ORGANIZATION, organization)
      await storage.set(STORAGE_KEYS.PARTICIPANTS, participants)
      await storage.set(STORAGE_KEYS.INCIDENTS, recentIncidents)
      await storage.set(STORAGE_KEYS.ALERTS, activeAlerts)
      await storage.set(STORAGE_KEYS.ROUTING_RULES, routingRules)
      await storage.set(STORAGE_KEYS.CURRENT_SHIFT, currentShift)
      console.log('Demo data initialized successfully')
    }
  }

  // User methods
  static async getCurrentUser(): Promise<User | null> {
    // Always use localStorage for current user session
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return userStr ? JSON.parse(userStr) : null
  }

  static async setCurrentUser(user: User) {
    // Always use localStorage for current user session
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  }

  static async getUsers(): Promise<User[]> {
    if (this.useSupabase()) {
      return await SupabaseService.getUsers()
    }
    return (await storage.get(STORAGE_KEYS.USERS)) || []
  }

  static async authenticateUser(email: string, password?: string): Promise<User | null> {
    if (this.useSupabase()) {
      const user = await SupabaseService.getUserByEmail(email)
      if (user) {
        // Validate password if provided
        if (password !== undefined && user.password !== password) {
          console.warn(`Invalid password for ${email}`)
          return null
        }
        await this.setCurrentUser(user)
        return user
      }

      console.warn(`Supabase user not found for ${email}, falling back to demo data`)
    }

    const fallbackUser = users.find((u) => u.email === email)
    if (fallbackUser) {
      // Validate password if provided
      if (password !== undefined && fallbackUser.password !== password) {
        console.warn(`Invalid password for ${email}`)
        return null
      }
      await this.setCurrentUser(fallbackUser)
      return fallbackUser
    }

    return null
  }

  // Organization methods
  static async getOrganization(): Promise<Organization | null> {
    if (this.useSupabase()) {
      return await SupabaseService.getOrganization()
    }
    return await storage.get(STORAGE_KEYS.ORGANIZATION)
  }

  static async updateOrganization(org: Organization) {
    if (this.useSupabase()) {
      // Would need to implement update method in SupabaseService
      console.log('Organization updates not implemented for Supabase yet')
      return
    }
    await storage.set(STORAGE_KEYS.ORGANIZATION, org)
  }

  // Participant methods
  static async getParticipants(): Promise<Participant[]> {
    if (this.useSupabase()) {
      const currentUser = await this.getCurrentUser()
      return await SupabaseService.getParticipants(currentUser?.facilityId)
    }
    return (await storage.get(STORAGE_KEYS.PARTICIPANTS)) || []
  }

  static async getParticipant(id: string): Promise<Participant | null> {
    const participants = await this.getParticipants()
    return participants.find(p => p.id === id) || null
  }

  static async updateParticipantStatus(id: string, status: Participant['currentStatus'], location: string) {
    if (this.useSupabase()) {
      await SupabaseService.updateParticipantStatus(id, status, location)
      return
    }

    const participants = await this.getParticipants()
    const index = participants.findIndex(p => p.id === id)
    if (index !== -1) {
      participants[index].currentStatus = status
      participants[index].location = location
      await storage.set(STORAGE_KEYS.PARTICIPANTS, participants)
    }
  }

  static async getShiftParticipants(shiftId: string): Promise<Participant[]> {
    if (this.useSupabase()) {
      return await SupabaseService.getShiftParticipants(shiftId)
    }
    // Fallback: return hardcoded participants for demo
    const allParticipants = await this.getParticipants()
    const SHIFT_PARTICIPANT_NAMES = ['Michael Brown', 'Emma Wilson', 'Lisa Thompson']
    return allParticipants.filter(p => SHIFT_PARTICIPANT_NAMES.includes(p.name))
  }

  // Incident methods
  static async getIncidents(): Promise<Incident[]> {
    if (this.useSupabase()) {
      const currentUser = await this.getCurrentUser()
      return await SupabaseService.getIncidents(currentUser?.facilityId)
    }
    return (await storage.get(STORAGE_KEYS.INCIDENTS)) || []
  }

  static async createIncident(incident: Incident) {
    if (this.useSupabase()) {
      await SupabaseService.createIncident(incident)
      return
    }

    const incidents = await this.getIncidents()
    incidents.unshift(incident)
    await storage.set(STORAGE_KEYS.INCIDENTS, incidents)
  }

  static async updateIncident(id: string, updates: Partial<Incident>) {
    if (this.useSupabase()) {
      // Would need to implement update method in SupabaseService
      console.log('Incident updates not implemented for Supabase yet')
      return
    }

    const incidents = await this.getIncidents()
    const index = incidents.findIndex(i => i.id === id)
    if (index !== -1) {
      incidents[index] = { ...incidents[index], ...updates }
      await storage.set(STORAGE_KEYS.INCIDENTS, incidents)
    }
  }

  // Alert methods
  static async getAlerts(): Promise<Alert[]> {
    if (this.useSupabase()) {
      const currentUser = await this.getCurrentUser()
      return await SupabaseService.getAlerts(currentUser?.facilityId)
    }
    return (await storage.get(STORAGE_KEYS.ALERTS)) || []
  }

  static async createAlert(alert: Alert) {
    if (this.useSupabase()) {
      // Would need to implement create method in SupabaseService
      console.log('Alert creation not implemented for Supabase yet')
      return
    }

    const alerts = await this.getAlerts()
    alerts.unshift(alert)
    await storage.set(STORAGE_KEYS.ALERTS, alerts)
  }

  static async acknowledgeAlert(id: string) {
    if (this.useSupabase()) {
      const currentUser = await this.getCurrentUser()
      if (currentUser) {
        await SupabaseService.acknowledgeAlert(id, currentUser.id)
      }
      return
    }

    const alerts = await this.getAlerts()
    const index = alerts.findIndex(a => a.id === id)
    if (index !== -1) {
      alerts[index].acknowledged = true
      await storage.set(STORAGE_KEYS.ALERTS, alerts)
    }
  }

  // Routing rules methods
  static async getRoutingRules(): Promise<RoutingRule[]> {
    if (this.useSupabase()) {
      return await SupabaseService.getRoutingRules()
    }
    return (await storage.get(STORAGE_KEYS.ROUTING_RULES)) || []
  }

  static async updateRoutingRule(id: string, rule: RoutingRule) {
    if (this.useSupabase()) {
      // Would need to implement update method in SupabaseService
      console.log('Routing rule updates not implemented for Supabase yet')
      return
    }

    const rules = await this.getRoutingRules()
    const index = rules.findIndex(r => r.id === id)
    if (index !== -1) {
      rules[index] = rule
      await storage.set(STORAGE_KEYS.ROUTING_RULES, rules)
    }
  }

  // Shift methods
  static async getCurrentShift(): Promise<Shift | null> {
    if (this.useSupabase()) {
      const currentUser = await this.getCurrentUser()
      if (currentUser) {
        // SIMPLIFIED: Query shifts directly with user ID
        return await SupabaseService.getCurrentShift(currentUser.id)
      }
      return null
    }
    // Use user-specific storage key for localStorage
    const userShiftKey = await this.getUserShiftKey()
    return await storage.get(userShiftKey)
  }

  static async startShift(shift: Shift): Promise<Shift> {
    if (this.useSupabase()) {
      try {
        // Get current user info to pass to Supabase
        const currentUser = await this.getCurrentUser()
        const createdShift = await SupabaseService.createShift(
          shift,
          currentUser?.name,
          currentUser?.email,
          currentUser?.role?.name
        )
        console.log('✅ [DataService] Shift created in Supabase with ID:', createdShift.id)
        return createdShift
      } catch (error: any) {
        // If Supabase fails (e.g., foreign key constraint), generate local ID for demo mode
        console.info('ℹ️ [DataService] Running in demo mode - using localStorage for shift tracking')
        const localShift = { ...shift, id: generateUUID() }
        console.log('✅ [DataService] Generated local shift with ID:', localShift.id)
        // NOTE: We don't save to localStorage here - let Zustand store handle persistence
        return localShift
      }
    }
    // Generate local shift with UUID for non-Supabase mode
    const localShift = { ...shift, id: generateUUID() }
    console.log('✅ [DataService] Generated local shift (demo mode) with ID:', localShift.id)
    // NOTE: We don't save to localStorage here - let Zustand store handle persistence
    return localShift
  }

  static async endShift(shiftId: string, handoverNotes?: string): Promise<void> {
    // Check if this is a demo shift (non-UUID ID) - use localStorage for demo mode
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isDemoShift = !uuidRegex.test(shiftId)

    if (this.useSupabase() && !isDemoShift) {
      // Only use Supabase for real UUID-based shifts
      await SupabaseService.endShift(shiftId, handoverNotes)
      return
    }

    // Use localStorage for demo shifts or when Supabase is not available
    const shift = await this.getCurrentShift()
    if (shift) {
      shift.status = 'completed'
      shift.handoverNotes = handoverNotes
      shift.endTime = new Date().toISOString()
      // Use user-specific storage key for localStorage
      const userShiftKey = await this.getUserShiftKey()
      await storage.set(userShiftKey, shift)
    }
  }

  static async updateShift(shiftId: string, updates: Partial<Shift>): Promise<void> {
    // Check if this is a demo shift (non-UUID ID) - use localStorage for demo mode
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isDemoShift = !uuidRegex.test(shiftId)

    if (this.useSupabase() && !isDemoShift) {
      // Only use Supabase for real UUID-based shifts
      await SupabaseService.updateShift(shiftId, updates)
      return
    }

    // Use localStorage for demo shifts or when Supabase is not available
    const shift = await this.getCurrentShift()
    if (shift) {
      Object.assign(shift, updates)
      // Use user-specific storage key for localStorage
      const userShiftKey = await this.getUserShiftKey()
      await storage.set(userShiftKey, shift)
    }
  }

  // Reset demo data
  static async resetDemoData() {
    await storage.clear()
    await this.initializeDemoData()
  }
}