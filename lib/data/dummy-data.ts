import { 
  User, Role, Organization, Participant, Incident, Alert, 
  RoutingRule, Shift, BehaviorPattern 
} from '@/lib/types'

// Roles
export const roles: Role[] = [
  {
    id: '1',
    name: 'Executive Team',
    level: 1,
    permissions: ['view_all', 'strategic_insights', 'compliance_overview']
  },
  {
    id: '2', 
    name: 'Area Manager',
    level: 2,
    permissions: ['multi_facility_view', 'pattern_analysis', 'staff_performance']
  },
  {
    id: '3',
    name: 'Team Leader',
    level: 3,
    permissions: ['team_oversight', 'report_approval', 'real_time_alerts']
  },
  {
    id: '4',
    name: 'Support Worker',
    level: 4,
    permissions: ['incident_reporting', 'view_own_reports']
  }
]

// Demo Users
export const users: User[] = [
  {
    id: '1',
    email: 'bernard.adjei@maxlifecare.com.au',
    name: 'Bernard Adjei',
    role: roles[3], // Support Worker
    facilityId: 'house-3',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bernard',
    password: 'demo',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    email: 'tom.anderson@maxlifecare.com.au',
    name: 'Tom Anderson',
    role: roles[2], // Team Leader
    facilityId: 'house-3',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    password: 'demo',
    createdAt: '2023-06-20T10:00:00Z'
  },
  {
    id: '3',
    email: 'dr.kim@maxlifecare.com.au',
    name: 'Dr. Sarah Kim',
    role: roles[1], // Clinical Manager (Area Manager level)
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrKim',
    password: 'demo',
    createdAt: '2022-03-10T10:00:00Z'
  },
  {
    id: '4',
    email: 'lisa.park@maxlifecare.com.au',
    name: 'Lisa Park',
    role: roles[1], // Area Manager
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    password: 'demo',
    createdAt: '2021-11-05T10:00:00Z'
  },
  {
    id: '5',
    email: 'dermot@maxlifecare.com.au',
    name: 'Dermot Roche',
    role: roles[3], // Support Worker
    facilityId: 'house-3',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dermot',
    password: 'demo',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '6',
    email: 'elyce.p@maxlifecare.com.au',
    name: 'Elyce Pobiega',
    role: roles[3], // Support Worker
    facilityId: 'house-3',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elyce',
    password: 'demo',
    createdAt: '2024-01-22T10:00:00Z'
  },
  {
    id: '7',
    email: 'guest@maxlifecare.com.au',
    name: 'Guest Guest',
    role: roles[3], // Support Worker
    facilityId: 'house-3',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
    password: 'demo',
    createdAt: '2024-01-25T10:00:00Z'
  }
]

// Demo Organization
export const organization: Organization = {
  id: '1',
  name: 'Maxlife Care',
  ndisNumber: '4-123-4567-8',
  facilities: 5,
  primaryEmail: 'admin@maxlifecare.com.au',
  timezone: 'Australia/Sydney',
  createdAt: '2020-01-01T00:00:00Z'
}

// Demo Participants
export const participants: Participant[] = [
  {
    id: '1',
    name: 'James Mitchell',
    facility: 'House 3',
    riskLevel: 'high',
    currentStatus: 'calm',
    location: 'Living Room',
    medications: [
      {
        id: '1',
        name: 'Risperidone',
        dosage: '2mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '2',
        name: 'Lorazepam',
        dosage: '1mg',
        time: 'PRN',
        type: 'prn'
      },
      {
        id: '3',
        name: 'Sertraline',
        dosage: '100mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '4',
        name: 'Quetiapine',
        dosage: '25mg',
        time: '22:00',
        type: 'regular'
      },
      {
        id: '5',
        name: 'Omega-3',
        dosage: '1000mg',
        time: '12:00',
        type: 'regular'
      }
    ],
    conditions: [
      'Bipolar Disorder',
      'Generalized Anxiety Disorder',
      'Insomnia',
      'Mild Intellectual Disability',
      'ADHD'
    ],
    behaviorPatterns: [
      {
        id: '1',
        trigger: 'Loud noises',
        behavior: 'Sensory overload, covering ears, rocking',
        frequency: 78,
        timeOfDay: '14:00-16:00',
        successfulInterventions: ['Quiet room', 'Weighted blanket', 'Noise-cancelling headphones']
      }
    ],
    supportPlan: {
      id: '1',
      participantId: '1',
      strategies: ['Maintain quiet environment', 'Provide sensory breaks', 'Use visual schedules'],
      preferences: ['Prefers routine', 'Likes weighted blankets', 'Enjoys music'],
      emergencyContacts: [
        {
          name: 'Mary Mitchell',
          role: 'Mother',
          phone: '0412 345 678'
        }
      ]
    }
  },
  {
    id: '2',
    name: 'Sarah Chen',
    facility: 'House 3',
    riskLevel: 'low',
    currentStatus: 'happy',
    location: 'Garden',
    medications: [
      {
        id: '1',
        name: 'Escitalopram',
        dosage: '10mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '2',
        name: 'Gabapentin',
        dosage: '300mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '3',
        name: 'Vitamin D',
        dosage: '1000IU',
        time: '09:00',
        type: 'regular'
      },
      {
        id: '4',
        name: 'Calcium Carbonate',
        dosage: '600mg',
        time: '12:00',
        type: 'regular'
      },
      {
        id: '5',
        name: 'Ibuprofen',
        dosage: '400mg',
        time: 'PRN',
        type: 'prn'
      }
    ],
    conditions: [
      'Depression',
      'Neuropathic Pain',
      'Osteoporosis',
      'Vitamin D Deficiency',
      'Autism Spectrum Disorder'
    ],
    behaviorPatterns: [],
    supportPlan: {
      id: '2',
      participantId: '2',
      strategies: ['Encourage social activities', 'Support independence'],
      preferences: ['Enjoys gardening', 'Likes cooking'],
      emergencyContacts: [
        {
          name: 'David Chen',
          role: 'Brother',
          phone: '0423 456 789'
        }
      ]
    }
  },
  {
    id: '3',
    name: 'Michael Brown',
    facility: 'House 3',
    riskLevel: 'medium',
    currentStatus: 'anxious',
    location: 'Bedroom',
    medications: [
      {
        id: '1',
        name: 'Sertraline',
        dosage: '50mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '2',
        name: 'Propranolol',
        dosage: '20mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '3',
        name: 'Propranolol',
        dosage: '20mg',
        time: '14:00',
        type: 'regular'
      },
      {
        id: '4',
        name: 'Melatonin',
        dosage: '5mg',
        time: '21:00',
        type: 'regular'
      },
      {
        id: '5',
        name: 'Diazepam',
        dosage: '5mg',
        time: 'PRN',
        type: 'prn'
      }
    ],
    conditions: [
      'Anxiety Disorder',
      'Autism Spectrum Disorder',
      'Hypertension',
      'Insomnia',
      'Sensory Processing Sensitivity'
    ],
    behaviorPatterns: [
      {
        id: '2',
        trigger: 'Changes in routine',
        behavior: 'Anxiety, pacing',
        frequency: 65,
        successfulInterventions: ['Deep breathing', 'Scheduled activities']
      }
    ],
    supportPlan: {
      id: '3',
      participantId: '3',
      strategies: ['Maintain consistent routine', 'Provide advance notice of changes'],
      preferences: ['Likes structure', 'Enjoys reading'],
      emergencyContacts: [
        {
          name: 'Susan Brown',
          role: 'Sister',
          phone: '0434 567 890'
        }
      ]
    },
    recentSuccess: 'Completed morning routine independently for 5 consecutive days',
    communicationPreference: 'visual'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    facility: 'House 3',
    riskLevel: 'low',
    currentStatus: 'happy',
    location: 'Kitchen',
    medications: [
      {
        id: '1',
        name: 'Metformin',
        dosage: '500mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '2',
        name: 'Atorvastatin',
        dosage: '20mg',
        time: '20:00',
        type: 'regular'
      },
      {
        id: '3',
        name: 'Vitamin D3',
        dosage: '1000IU',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '4',
        name: 'Paracetamol',
        dosage: '500mg',
        time: 'PRN',
        type: 'prn'
      }
    ],
    conditions: [
      'Type 2 Diabetes',
      'Hyperlipidemia',
      'Vitamin D Deficiency',
      'Mild Arthritis'
    ],
    behaviorPatterns: [],
    supportPlan: {
      id: '4',
      participantId: '4',
      strategies: ['Promote independence', 'Support social connections'],
      preferences: ['Enjoys cooking', 'Likes music'],
      emergencyContacts: [
        {
          name: 'Robert Wilson',
          role: 'Father',
          phone: '0445 678 901'
        }
      ]
    },
    recentSuccess: 'Prepared a complete meal with minimal assistance',
    communicationPreference: 'verbal'
  },
  {
    id: '5',
    name: 'David Lee',
    facility: 'House 3',
    riskLevel: 'low',
    currentStatus: 'resting',
    location: 'Bedroom',
    medications: [
      {
        id: '1',
        name: 'Donepezil',
        dosage: '5mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '2',
        name: 'Memantine',
        dosage: '10mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '3',
        name: 'Aspirin',
        dosage: '100mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '4',
        name: 'Simvastatin',
        dosage: '40mg',
        time: '20:00',
        type: 'regular'
      },
      {
        id: '5',
        name: 'Multivitamin',
        dosage: '1 tablet',
        time: '08:00',
        type: 'regular'
      }
    ],
    conditions: [
      'Mild Cognitive Impairment',
      'Cardiovascular Disease',
      'Hyperlipidemia',
      'Osteoarthritis',
      'Down Syndrome'
    ],
    behaviorPatterns: [],
    supportPlan: {
      id: '5',
      participantId: '5',
      strategies: ['Support daily living skills', 'Encourage participation'],
      preferences: ['Enjoys quiet time', 'Likes puzzles'],
      emergencyContacts: [
        {
          name: 'Jennifer Lee',
          role: 'Mother',
          phone: '0456 789 012'
        }
      ]
    }
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    facility: 'House 3',
    riskLevel: 'low',
    currentStatus: 'happy',
    location: 'Craft Room',
    medications: [
      {
        id: '1',
        name: 'Lamotrigine',
        dosage: '200mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '2',
        name: 'Venlafaxine',
        dosage: '75mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '3',
        name: 'Folic Acid',
        dosage: '5mg',
        time: '08:00',
        type: 'regular'
      },
      {
        id: '4',
        name: 'Iron Supplement',
        dosage: '325mg',
        time: '12:00',
        type: 'regular'
      },
      {
        id: '5',
        name: 'Naproxen',
        dosage: '250mg',
        time: 'PRN',
        type: 'prn'
      }
    ],
    conditions: [
      'Epilepsy',
      'Depression',
      'Iron Deficiency Anemia',
      'Cerebral Palsy',
      'Chronic Pain Syndrome'
    ],
    behaviorPatterns: [],
    supportPlan: {
      id: '6',
      participantId: '6',
      strategies: ['Support creative activities', 'Encourage self-expression'],
      preferences: ['Loves arts and crafts', 'Enjoys group activities'],
      emergencyContacts: [
        {
          name: 'Mark Thompson',
          role: 'Brother',
          phone: '0467 890 123'
        }
      ]
    },
    recentSuccess: 'Led a group craft activity and helped two other participants',
    communicationPreference: 'both'
  }
]

// Recent Incidents
export const recentIncidents: Incident[] = [
  {
    id: '1',
    participantId: '1',
    participantName: 'James Mitchell',
    type: 'behavioral',
    severity: 'medium',
    timestamp: '2025-07-23T02:30:00Z',
    location: 'Bedroom',
    staffId: 'night-staff',
    staffName: 'Night Staff',
    description: 'Minor behavioral incident due to noise sensitivity',
    antecedent: 'Loud noise from neighboring room',
    behavior: 'Covering ears, rocking, verbal distress',
    consequence: 'Moved to quiet room with weighted blanket',
    interventions: [
      {
        id: '1',
        description: 'Provided quiet room and weighted blanket',
        effectiveness: 'effective',
        timestamp: '2025-07-23T02:35:00Z'
      }
    ],
    outcomes: [
      {
        id: '1',
        description: 'James calmed down and returned to sleep',
        followUpRequired: false,
        timestamp: '2025-07-23T02:45:00Z'
      }
    ],
    reportType: 'abc',
    status: 'submitted'
  }
]

// Active Alerts - Pre-Shift Intelligence for 3 active participants
export const activeAlerts: Alert[] = [
  {
    id: '1',
    type: 'risk',
    severity: 'warning',
    message: 'James M. - High risk participant. Review behavior management plan before shift.',
    timestamp: new Date().toISOString(),
    participantId: '1',
    acknowledged: false
  },
  {
    id: '2',
    type: 'medication',
    severity: 'info',
    message: 'Sarah C. - Morning medications due at 8:00 AM (check PRN availability)',
    timestamp: new Date().toISOString(),
    participantId: '2',
    acknowledged: false
  },
  {
    id: '3',
    type: 'environmental',
    severity: 'info',
    message: 'Michael B. - Scheduled activity at 2:00 PM, ensure materials prepared',
    timestamp: new Date().toISOString(),
    participantId: '3',
    acknowledged: false
  },
  {
    id: '4',
    type: 'risk',
    severity: 'info',
    message: '3 active participants today - All support plans reviewed and current',
    timestamp: new Date().toISOString(),
    acknowledged: false
  }
]

// Demo Routing Rules
export const routingRules: RoutingRule[] = [
  {
    id: '1',
    name: 'Behavioral Incidents',
    conditions: [
      {
        field: 'type',
        operator: 'equals',
        value: 'behavioral'
      }
    ],
    actions: [
      {
        type: 'notify',
        recipient: 'Team Leader',
        timing: 'immediate'
      },
      {
        type: 'notify',
        recipient: 'Clinical Manager',
        timing: 'within_30_min'
      }
    ],
    enabled: true
  },
  {
    id: '2',
    name: 'Property Damage',
    conditions: [
      {
        field: 'property_damage',
        operator: 'equals',
        value: true
      },
      {
        field: 'damage_value',
        operator: 'greater_than',
        value: 500
      }
    ],
    actions: [
      {
        type: 'notify',
        recipient: 'Team Leader',
        timing: 'immediate'
      },
      {
        type: 'notify',
        recipient: 'Maintenance Coordinator',
        timing: 'immediate'
      },
      {
        type: 'notify',
        recipient: 'Area Manager',
        timing: 'within_1_hour'
      }
    ],
    enabled: true
  }
]

// Current Shift
export const currentShift: Shift = {
  id: '1',
  staffId: '1',
  facilityId: 'house-3',
  startTime: '2025-07-23T07:00:00Z',
  endTime: '2025-07-23T15:00:00Z',
  status: 'active',
  handoverNotes: 'James had a minor incident at 2:30 AM but settled well. Monitor during afternoon high-risk period.'
}