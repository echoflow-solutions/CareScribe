export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          ndis_number: string
          facilities_count: number
          primary_email: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      roles: {
        Row: {
          id: string
          name: string
          level: number
          permissions: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['roles']['Insert']>
      }
      facilities: {
        Row: {
          id: string
          organization_id: string
          name: string
          code: string
          address: string | null
          capacity: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['facilities']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['facilities']['Insert']>
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role_id: string | null
          facility_id: string | null
          avatar: string | null
          phone: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      participants: {
        Row: {
          id: string
          facility_id: string | null
          name: string
          date_of_birth: string | null
          ndis_number: string | null
          risk_level: string
          current_status: string
          current_location: string | null
          profile_image: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['participants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['participants']['Insert']>
      }
      participant_support_plans: {
        Row: {
          id: string
          participant_id: string
          strategies: string[] | null
          preferences: string[] | null
          goals: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['participant_support_plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['participant_support_plans']['Insert']>
      }
      participant_behavior_patterns: {
        Row: {
          id: string
          participant_id: string
          trigger: string | null
          behavior: string | null
          frequency: number
          time_of_day: string | null
          successful_interventions: string[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['participant_behavior_patterns']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['participant_behavior_patterns']['Insert']>
      }
      participant_medications: {
        Row: {
          id: string
          participant_id: string
          name: string
          dosage: string | null
          time: string | null
          type: string
          prescriber: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['participant_medications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['participant_medications']['Insert']>
      }
      routing_rules: {
        Row: {
          id: string
          organization_id: string | null
          name: string
          conditions: any
          actions: any
          enabled: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['routing_rules']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['routing_rules']['Insert']>
      }
      alerts: {
        Row: {
          id: string
          facility_id: string | null
          type: string
          severity: string
          message: string
          participant_id: string | null
          acknowledged: boolean
          acknowledged_by: string | null
          acknowledged_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
      }
      shifts: {
        Row: {
          id: string
          staff_id: string | null
          facility_id: string | null
          start_time: string
          end_time: string | null
          actual_end_time: string | null
          status: string
          handover_notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['shifts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['shifts']['Insert']>
      }
      incidents: {
        Row: {
          id: string
          participant_id: string | null
          facility_id: string | null
          staff_id: string | null
          type: string
          severity: string
          location: string | null
          description: string | null
          antecedent: string | null
          behavior: string | null
          consequence: string | null
          interventions: any
          outcomes: any
          photos: string[] | null
          report_type: string | null
          status: string
          submitted_at: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['incidents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['incidents']['Insert']>
      }
    }
  }
}