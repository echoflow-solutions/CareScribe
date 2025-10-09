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
  participant_first_name?: string
  participant_last_name?: string
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

// Billing & Invoice Types
export interface BillingRecord {
  id: string
  billingId: string // Generated unique billing ID
  reportId: string // Link to incident or ABC report
  reportType: 'incident' | 'abc' | 'combined'
  participantId: string
  participantName: string
  facilityId: string
  dateOfService: string
  amount: number
  serviceCode?: string // NDIS service code
  description: string
  status: 'pending' | 'submitted' | 'approved' | 'paid' | 'disputed' | 'cancelled'
  submittedAt?: string
  submittedBy?: string
  submittedTo?: string // Finance department/system
  approvedAt?: string
  approvedBy?: string
  paidAt?: string
  notes?: string
  invoiceNumber?: string
  paymentReference?: string
  createdAt: string
  updatedAt: string
}

export interface BillingAttachment {
  id: string
  billingRecordId: string
  fileName: string
  fileUrl: string
  fileType: string
  uploadedAt: string
  uploadedBy: string
}

// Report Escalation & Workflow Types
export interface ReportEscalation {
  id: string
  reportId: string
  reportType: 'incident' | 'abc'
  participantId: string
  participantName: string
  facilityId: string
  currentStage: EscalationStage
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  assignedToName?: string
  dueDate?: string
  completedStages: CompletedStage[]
  timeline: EscalationEvent[]
  status: 'in_progress' | 'completed' | 'escalated' | 'on_hold'
  createdAt: string
  updatedAt: string
}

export type EscalationStage =
  | 'report_entry'
  | 'provider_notification'
  | 'follow_up'
  | 'support_workers'
  | 'complete_report'
  | 'send_to_stakeholders'
  | 'notify_stakeholders'
  | 'additional_follow_up'
  | 'review_and_close'

export interface CompletedStage {
  stage: EscalationStage
  completedAt: string
  completedBy: string
  completedByName: string
  notes?: string
  duration?: number // in minutes
}

export interface EscalationEvent {
  id: string
  reportEscalationId: string
  eventType: 'stage_change' | 'assignment' | 'comment' | 'escalation' | 'reminder'
  stage?: EscalationStage
  performedBy: string
  performedByName: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface EscalationStageDefinition {
  stage: EscalationStage
  name: string
  description: string
  order: number
  requiredAction: string
  estimatedDuration: number // in minutes
  responsible: string[] // Role types
  notifyOnComplete: string[] // Role types to notify
  canSkip: boolean
  automationAvailable: boolean
}

// Audit Trail Types
export interface AuditLog {
  id: string
  entityType: 'incident' | 'participant' | 'medication' | 'billing' | 'user' | 'shift'
  entityId: string
  action: 'create' | 'update' | 'delete' | 'submit' | 'approve' | 'reject' | 'export'
  performedBy: string
  performedByName: string
  timestamp: string
  changes?: AuditChange[]
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export interface AuditChange {
  field: string
  oldValue: any
  newValue: any
}

// Document Library Types
export interface Document {
  id: string
  title: string
  description?: string
  category: 'policy' | 'procedure' | 'form' | 'template' | 'training' | 'compliance' | 'other'
  fileUrl: string
  fileName: string
  fileSize: number // in bytes
  fileType: string
  version: string
  tags: string[]
  facilityId?: string
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  lastAccessedAt?: string
  accessCount: number
  isArchived: boolean
  expiryDate?: string
  requiresAcknowledgment: boolean
  acknowledgedBy?: string[]
}

// Analytics Types
export interface AnalyticsSummary {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  startDate: string
  endDate: string
  totalIncidents: number
  incidentsByType: Record<string, number>
  incidentsBySeverity: Record<string, number>
  participantStats: ParticipantStats[]
  staffStats: StaffStats[]
  trends: Trend[]
}

export interface ParticipantStats {
  participantId: string
  participantName: string
  incidentCount: number
  trend: 'increasing' | 'stable' | 'decreasing'
  riskLevel: 'low' | 'medium' | 'high'
}

export interface StaffStats {
  staffId: string
  staffName: string
  reportsSubmitted: number
  avgResponseTime: number // in minutes
  incidentsHandled: number
}

export interface Trend {
  metric: string
  value: number
  change: number // percentage change
  direction: 'up' | 'down' | 'stable'
  timestamp: string
}

// Restrictive Practices Types (NDIS Compliance)
export interface RestrictivePractice {
  id: string
  participantId: string
  participantName: string
  type: 'chemical' | 'physical' | 'environmental' | 'mechanical'
  description: string
  medication?: string // For chemical restraints
  dosage?: string // For chemical restraints
  authorization: RestrictivePracticeAuthorization
  reductionPlan: ReductionPlan
  usage: RestrictivePracticeUsage
  reportedToNDIS: boolean
  lastReportDate?: string
  nextReportDue: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  facilityId?: string
  createdAt?: string
  updatedAt?: string
}

export interface RestrictivePracticeAuthorization {
  authorizedBy: string
  authorizationDate: string
  expiryDate: string
  reviewDate: string
  status: 'active' | 'expired' | 'pending-renewal'
  authorizingBodyName?: string
  authorizationReference?: string
}

export interface ReductionPlan {
  hasReductionPlan: boolean
  goalDescription?: string
  strategies?: string[]
  targetDate?: string
  progress?: number // 0-100 percentage
  lastReviewedDate?: string
  nextReviewDate?: string
}

export interface RestrictivePracticeUsage {
  lastUsed?: string
  frequency: number // times used in current period
  trend: 'increasing' | 'decreasing' | 'stable'
  averageFrequency?: number
  notes?: string
}

// Vehicle & Transport Management Types
export interface Vehicle {
  id: string
  registration: string
  make: string
  model: string
  year: number
  color: string
  capacity: number
  wheelchairAccessible: boolean
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service'
  odometer: number
  nextService: string
  insuranceExpiry: string
  registrationExpiry: string
  fuelCard: FuelCard
  assignedFacility: string
  facilityId?: string
  lastInspection: string
  vinNumber?: string
  createdAt?: string
  updatedAt?: string
}

export interface FuelCard {
  number: string
  limit: number
  currentSpend: number
  provider?: string
}

export interface VehicleBooking {
  id: string
  vehicleId: string
  vehicleReg: string
  driverId: string
  driverName: string
  participantId?: string
  participantName?: string
  purpose: string
  destination: string
  startDate: string
  endDate: string
  startOdometer?: number
  endOdometer?: number
  kilometers?: number
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  fuelCost?: number
  tollsCost?: number
  parkingCost?: number
  totalCost?: number
  notes?: string
  facilityId?: string
  createdAt?: string
  updatedAt?: string
}

export interface VehicleMaintenanceRecord {
  id: string
  vehicleId: string
  vehicleReg?: string
  type: 'service' | 'repair' | 'inspection' | 'cleaning' | 'tire-change'
  description: string
  date: string
  scheduledDate?: string
  cost: number
  provider: string
  providerContact?: string
  odometer?: number
  nextServiceDue?: string
  partsReplaced?: string[]
  status: 'completed' | 'scheduled' | 'overdue'
  invoiceNumber?: string
  notes?: string
  facilityId?: string
  createdAt?: string
  updatedAt?: string
}

export interface VehicleIncident {
  id: string
  vehicleId: string
  vehicleReg: string
  driverId: string
  driverName: string
  date: string
  location: string
  type: 'accident' | 'breakdown' | 'traffic-violation' | 'damage' | 'near-miss'
  description: string
  severity: 'minor' | 'moderate' | 'major'
  policeReport: boolean
  policeReportNumber?: string
  insuranceClaim: boolean
  insuranceClaimNumber?: string
  witnessesPresent: boolean
  witnessDetails?: string
  participantInvolved?: boolean
  participantId?: string
  participantName?: string
  injuriesReported: boolean
  injuryDetails?: string
  photos?: string[]
  repairCost?: number
  status: 'reported' | 'under-investigation' | 'resolved' | 'closed'
  facilityId?: string
  createdAt?: string
  updatedAt?: string
}