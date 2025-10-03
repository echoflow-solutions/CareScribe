export interface IncidentTypeOption {
  value: string
  label: string
  category: 'behavioral' | 'medical' | 'safety' | 'administrative' | 'other'
  severity?: 'low' | 'medium' | 'high'
  requiresImmediateResponse?: boolean
}

export const INCIDENT_TYPES: IncidentTypeOption[] = [
  // Behavioral
  { value: 'behavioral', label: 'Behavioral Incident', category: 'behavioral' },
  { value: 'aggression_physical', label: 'Physical Aggression', category: 'behavioral', severity: 'high' },
  { value: 'aggression_verbal', label: 'Verbal Aggression', category: 'behavioral', severity: 'medium' },
  { value: 'self_harm', label: 'Self-Harm', category: 'behavioral', severity: 'high', requiresImmediateResponse: true },
  { value: 'absconding', label: 'Absconding/Missing Person', category: 'behavioral', severity: 'high', requiresImmediateResponse: true },
  { value: 'property', label: 'Property Damage', category: 'behavioral', severity: 'medium' },
  { value: 'restrictive_practice', label: 'Restrictive Practice', category: 'behavioral', severity: 'high' },
  
  // Medical
  { value: 'medical', label: 'Medical Issue', category: 'medical' },
  { value: 'medication_error', label: 'Medication Error', category: 'medical', severity: 'high', requiresImmediateResponse: true },
  { value: 'fall', label: 'Fall or Trip', category: 'medical', severity: 'medium' },
  { value: 'injury', label: 'Injury', category: 'medical', severity: 'medium' },
  { value: 'seizure', label: 'Seizure', category: 'medical', severity: 'high', requiresImmediateResponse: true },
  { value: 'choking', label: 'Choking Incident', category: 'medical', severity: 'high', requiresImmediateResponse: true },
  { value: 'allergic_reaction', label: 'Allergic Reaction', category: 'medical', severity: 'high', requiresImmediateResponse: true },
  { value: 'infection_control', label: 'Infection Control Issue', category: 'medical', severity: 'medium' },
  { value: 'dietary', label: 'Dietary Issue', category: 'medical', severity: 'low' },
  
  // Safety
  { value: 'safety', label: 'Safety Concern', category: 'safety' },
  { value: 'environmental', label: 'Environmental Hazard', category: 'safety', severity: 'medium' },
  { value: 'equipment_failure', label: 'Equipment Failure', category: 'safety', severity: 'medium' },
  { value: 'near_miss', label: 'Near Miss', category: 'safety', severity: 'low' },
  
  // Administrative
  { value: 'abuse_neglect', label: 'Abuse or Neglect', category: 'administrative', severity: 'high', requiresImmediateResponse: true },
  { value: 'privacy_breach', label: 'Privacy Breach', category: 'administrative', severity: 'high' },
  { value: 'death', label: 'Death', category: 'administrative', severity: 'high', requiresImmediateResponse: true },
  
  // Other
  { value: 'other', label: 'Other', category: 'other' }
]

export const getIncidentTypeLabel = (value: string): string => {
  const type = INCIDENT_TYPES.find(t => t.value === value)
  return type?.label || value
}

export const getIncidentTypesByCategory = (category: IncidentTypeOption['category']): IncidentTypeOption[] => {
  return INCIDENT_TYPES.filter(t => t.category === category)
}

export const getHighSeverityIncidentTypes = (): IncidentTypeOption[] => {
  return INCIDENT_TYPES.filter(t => t.severity === 'high')
}

export const getImmediateResponseIncidentTypes = (): IncidentTypeOption[] => {
  return INCIDENT_TYPES.filter(t => t.requiresImmediateResponse)
}