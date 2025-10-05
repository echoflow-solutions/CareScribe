// User and Role Types
export interface User {
  id: string
  email: string
  name: string
  role: Role
  facilityId?: string
  avatar?: string
  createdAt: string
  password?: string // Demo purposes only - plain text password
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
  facilityId?: string // For database sync
  dateOfBirth?: string
  age?: number
  ndisNumber?: string
  profileImage?: string
  riskLevel: 'low' | 'medium' | 'high'
  currentStatus: 'calm' | 'anxious' | 'agitated' | 'happy' | 'resting'
  location: string
  medications: Medication[]
  conditions?: string[]
  behaviorPatterns: BehaviorPattern[]
  supportPlan: SupportPlan
  emergencyContact?: EmergencyContact
  // New comprehensive fields
  recentIncidents?: number // Count of incidents in last 7 days
  lastIncidentDate?: string
  onShift?: boolean // Is this participant assigned to current shift
  mood?: 'positive' | 'neutral' | 'negative' // Overall mood trend
  communicationPreference?: 'verbal' | 'visual' | 'both' | 'limited'
  sensoryProfile?: {
    lights?: 'bright' | 'dim' | 'no-preference'
    sounds?: 'quiet' | 'moderate' | 'no-preference'
    textures?: string[]
  }
  favoriteActivities?: string[]
  recentSuccess?: string // Most recent positive achievement
}

export interface Medication {
  id: string
  name: string
  dosage: string
  time: string
  type: 'regular' | 'prn'
  active?: boolean
  websterPackEnabled?: boolean
  pillDescription?: string
  pillCountPerDose?: number
  pharmacyId?: string
  pharmacyMedicationId?: string
  ndcCode?: string
  fhirMedicationId?: string
  lastPharmacySync?: string
  prescriber?: string
}

export interface MedicationLog {
  id: string
  participantId: string
  medicationId: string
  administeredBy: string
  administeredByName?: string
  administeredAt: string
  dosage: string
  notes?: string
}

// Webster Pack & Medication Management Types
export interface MedicationTimingSlot {
  id: string
  slotName: 'Morning' | 'Afternoon' | 'Evening' | 'Night'
  defaultTime: string // '08:00', '12:00', '18:00', '22:00'
  displayOrder: number
  createdAt: string
}

export interface WebsterPack {
  id: string
  participantId: string
  pharmacyId: string
  packNumber: string
  weekStarting: string // Date
  weekEnding: string // Date
  preparedDate: string // Date
  expectedPillCount: number
  actualPillCount?: number
  status: 'pending' | 'received' | 'verified' | 'in_use' | 'depleted' | 'discarded'
  receivedDate?: string
  receivedBy?: string
  verifiedDate?: string
  verifiedBy?: string
  verificationNotes?: string
  discrepancyReported: boolean
  fhirMedicationRequestId?: string
  createdAt: string
  updatedAt: string
}

export interface WebsterPackSlot {
  id: string
  websterPackId: string
  medicationId?: string
  dayOfWeek: number // 0=Sunday, 6=Saturday
  slotDate: string // Date
  timingSlotId: string
  timingSlotName: 'Morning' | 'Afternoon' | 'Evening' | 'Night'
  expectedPillCount: number
  actualPillCount?: number
  medicationName: string
  dosage: string
  pillDescription?: string
  administrationStatus: 'pending' | 'administered' | 'missed' | 'refused' | 'double_checked'
  administeredAt?: string
  administeredBy?: string
  verificationRequired: boolean
  verifiedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PharmacyIntegration {
  id: string
  facilityId: string
  pharmacyName: string
  pharmacyId: string
  pharmacyAddress?: string
  pharmacyPhone?: string
  pharmacyEmail?: string
  fhirEndpointUrl?: string
  fhirApiKeyEncrypted?: string
  integrationType: 'fhir' | 'erx' | 'custom_api' | 'manual'
  syncEnabled: boolean
  lastSyncAt?: string
  lastSyncStatus?: 'success' | 'failed' | 'partial'
  syncFrequencyHours: number
  autoVerifyPacks: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PharmacySyncLog {
  id: string
  pharmacyIntegrationId: string
  syncStartedAt: string
  syncCompletedAt?: string
  syncStatus: 'success' | 'failed' | 'partial'
  medicationsSynced: number
  websterPacksSynced: number
  errorsEncountered: number
  errorDetails?: Record<string, any>
  syncDetails?: Record<string, any>
  initiatedBy?: string
  createdAt: string
}

export interface MedicationDiscrepancy {
  id: string
  websterPackId: string
  websterPackSlotId?: string
  discrepancyType: 'wrong_medication' | 'wrong_count' | 'missing_dose' | 'extra_dose' | 'damaged'
  expectedMedication?: string
  expectedCount?: number
  actualMedication?: string
  actualCount?: number
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  reportedBy?: string
  reportedAt: string
  pharmacyNotified: boolean
  pharmacyNotifiedAt?: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  resolutionNotes?: string
  pharmacyResponse?: string
  createdAt: string
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
  facilityId?: string // CRITICAL: Enables cross-user sync at facility level
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