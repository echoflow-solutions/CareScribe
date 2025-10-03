// User and Role Types
export interface User {
  id: string
  email: string
  name: string
  role: Role
  facilityId?: string
  avatar?: string
  createdAt: string
}

export interface Role {
  id: string
  name: string
  level: 1 | 2 | 3 | 4 // Executive, Management, Supervision, Frontline
  permissions: string[]
}

// Organization Types
export interface Organization {
  id: string
  name: string
  ndisNumber: string
  facilities: number
  primaryEmail: string
  timezone: string
  createdAt: string
}

// Participant Types
export interface Participant {
  id: string
  name: string
  facility: string
  riskLevel: 'low' | 'medium' | 'high'
  currentStatus: 'calm' | 'anxious' | 'agitated' | 'happy' | 'resting'
  location: string
  medications: Medication[]
  conditions?: string[]
  behaviorPatterns: BehaviorPattern[]
  supportPlan: SupportPlan
  emergencyContact?: EmergencyContact
}

export interface Medication {
  id: string
  name: string
  dosage: string
  time: string
  type: 'regular' | 'prn'
}

export interface BehaviorPattern {
  id: string
  trigger: string
  behavior: string
  frequency: number
  timeOfDay?: string
  successfulInterventions: string[]
}

export interface SupportPlan {
  id: string
  participantId: string
  strategies: string[]
  preferences: string[]
  emergencyContacts: Contact[]
}

export interface Contact {
  name: string
  role: string
  phone: string
  email?: string
}

export type EmergencyContact = Contact

// Incident and Report Types
export interface Incident {
  id: string
  participantId: string
  participantName: string
  type: 'behavioral' | 'medical' | 'property' | 'other'
  severity: 'low' | 'medium' | 'high'
  timestamp: string
  location: string
  staffId: string
  staffName: string
  description: string
  antecedent?: string
  behavior?: string
  consequence?: string
  interventions: Intervention[]
  outcomes: Outcome[]
  photos?: string[]
  reportType?: 'abc' | 'incident' | 'both'
  status: 'draft' | 'submitted' | 'reviewed' | 'closed'
}

export interface Intervention {
  id: string
  description: string
  effectiveness: 'effective' | 'partial' | 'ineffective'
  timestamp: string
}

export interface Outcome {
  id: string
  description: string
  followUpRequired: boolean
  timestamp: string
}

// Routing Rules
export interface RoutingRule {
  id: string
  name: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  enabled: boolean
}

export interface RuleCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
}

export interface RuleAction {
  type: 'notify' | 'escalate' | 'create_task'
  recipient: string
  timing: 'immediate' | 'within_30_min' | 'within_1_hour' | 'next_business_day'
  message?: string
}

// Dashboard Types
export interface DashboardStats {
  totalIncidents: number
  resolvedIncidents: number
  activeAlerts: number
  upcomingMedications: number
  staffOnDuty: number
  participantsActive: number
}

export interface Alert {
  id: string
  type: 'risk' | 'medication' | 'environmental' | 'pattern'
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: string
  participantId?: string
  acknowledged: boolean
}

// Shift Types
export interface Shift {
  id: string
  staffId: string
  facilityId: string
  startTime: string
  endTime: string
  handoverNotes?: string
  status: 'scheduled' | 'active' | 'completed'
}