-- Create table for participant health conditions (if not exists)
CREATE TABLE IF NOT EXISTS participant_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  diagnosed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add conditions column to participants table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'participants' 
                 AND column_name = 'conditions') THEN
    ALTER TABLE participants ADD COLUMN conditions TEXT[];
  END IF;
END $$;

-- Create demo users if they don't exist (with proper UUIDs)
INSERT INTO roles (id, name, level, permissions)
VALUES 
  ('11111111-0000-0000-0000-000000000001'::uuid, 'Executive Team', 1, ARRAY['view_all', 'strategic_insights', 'compliance_overview']),
  ('11111111-0000-0000-0000-000000000002'::uuid, 'Area Manager', 2, ARRAY['multi_facility_view', 'pattern_analysis', 'staff_performance']),
  ('11111111-0000-0000-0000-000000000003'::uuid, 'Team Leader', 3, ARRAY['team_oversight', 'report_approval', 'real_time_alerts']),
  ('11111111-0000-0000-0000-000000000004'::uuid, 'Support Worker', 4, ARRAY['incident_reporting', 'view_own_reports'])
ON CONFLICT (id) DO NOTHING;

-- Insert participants with conditions
INSERT INTO participants (id, name, facility_id, risk_level, current_status, current_location, conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'James Mitchell', NULL, 'high', 'calm', 'Living Room', 
   ARRAY['Bipolar Disorder', 'Generalized Anxiety Disorder', 'Insomnia', 'Mild Intellectual Disability', 'ADHD'],
   'Mary Mitchell', '0412 345 678', 'Mother'),
  
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Sarah Chen', NULL, 'low', 'happy', 'Garden',
   ARRAY['Depression', 'Neuropathic Pain', 'Osteoporosis', 'Vitamin D Deficiency', 'Autism Spectrum Disorder'],
   'David Chen', '0423 456 789', 'Brother'),
  
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Michael Brown', NULL, 'medium', 'anxious', 'Bedroom',
   ARRAY['Anxiety Disorder', 'Autism Spectrum Disorder', 'Hypertension', 'Insomnia', 'Sensory Processing Sensitivity'],
   'Susan Brown', '0434 567 890', 'Sister'),
  
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Emma Wilson', NULL, 'low', 'happy', 'Kitchen',
   ARRAY['Type 2 Diabetes', 'Hyperlipidemia', 'Vitamin D Deficiency', 'Mild Arthritis'],
   'Robert Wilson', '0445 678 901', 'Father'),
  
  ('55555555-5555-5555-5555-555555555555'::uuid, 'David Lee', NULL, 'low', 'resting', 'Bedroom',
   ARRAY['Mild Cognitive Impairment', 'Cardiovascular Disease', 'Hyperlipidemia', 'Osteoarthritis', 'Down Syndrome'],
   'Jennifer Lee', '0456 789 012', 'Mother'),
  
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Lisa Thompson', NULL, 'low', 'happy', 'Craft Room',
   ARRAY['Epilepsy', 'Depression', 'Iron Deficiency Anemia', 'Cerebral Palsy', 'Chronic Pain Syndrome'],
   'Mark Thompson', '0467 890 123', 'Brother')
ON CONFLICT (id) DO UPDATE SET
  conditions = EXCLUDED.conditions,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  emergency_contact_relationship = EXCLUDED.emergency_contact_relationship;

-- Delete existing medications for these participants first
DELETE FROM participant_medications WHERE participant_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  '55555555-5555-5555-5555-555555555555'::uuid,
  '66666666-6666-6666-6666-666666666666'::uuid
);

-- Insert medications for James Mitchell
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Risperidone', '2mg', '08:00', 'regular'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Lorazepam', '1mg', 'PRN', 'prn'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Sertraline', '100mg', '08:00', 'regular'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Quetiapine', '25mg', '22:00', 'regular'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Omega-3', '1000mg', '12:00', 'regular');

-- Insert medications for Sarah Chen
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Escitalopram', '10mg', '08:00', 'regular'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Gabapentin', '300mg', '08:00', 'regular'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Vitamin D', '1000IU', '09:00', 'regular'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Calcium Carbonate', '600mg', '12:00', 'regular'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Ibuprofen', '400mg', 'PRN', 'prn');

-- Insert medications for Michael Brown
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Sertraline', '50mg', '08:00', 'regular'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Propranolol', '20mg', '08:00', 'regular'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Propranolol', '20mg', '14:00', 'regular'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Melatonin', '5mg', '21:00', 'regular'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Diazepam', '5mg', 'PRN', 'prn');

-- Insert medications for Emma Wilson
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Metformin', '500mg', '08:00', 'regular'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Atorvastatin', '20mg', '20:00', 'regular'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Vitamin D3', '1000IU', '08:00', 'regular'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Paracetamol', '500mg', 'PRN', 'prn');

-- Insert medications for David Lee
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Donepezil', '5mg', '08:00', 'regular'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Memantine', '10mg', '08:00', 'regular'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Aspirin', '100mg', '08:00', 'regular'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Simvastatin', '40mg', '20:00', 'regular'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Multivitamin', '1 tablet', '08:00', 'regular');

-- Insert medications for Lisa Thompson
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Lamotrigine', '200mg', '08:00', 'regular'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Venlafaxine', '75mg', '08:00', 'regular'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Folic Acid', '5mg', '08:00', 'regular'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Iron Supplement', '325mg', '12:00', 'regular'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Naproxen', '250mg', 'PRN', 'prn');

-- Delete existing support plans and behavior patterns
DELETE FROM participant_support_plans WHERE participant_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  '55555555-5555-5555-5555-555555555555'::uuid,
  '66666666-6666-6666-6666-666666666666'::uuid
);

DELETE FROM participant_behavior_patterns WHERE participant_id IN (
  '11111111-1111-1111-1111-111111111111'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid
);

-- Insert support plans
INSERT INTO participant_support_plans (participant_id, strategies, preferences)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 
   ARRAY['Maintain quiet environment', 'Provide sensory breaks', 'Use visual schedules'],
   ARRAY['Prefers routine', 'Likes weighted blankets', 'Enjoys music']),
  
  ('22222222-2222-2222-2222-222222222222'::uuid,
   ARRAY['Encourage social activities', 'Support independence'],
   ARRAY['Enjoys gardening', 'Likes cooking']),
  
  ('33333333-3333-3333-3333-333333333333'::uuid,
   ARRAY['Maintain consistent routine', 'Provide advance notice of changes'],
   ARRAY['Likes structure', 'Enjoys reading']),
  
  ('44444444-4444-4444-4444-444444444444'::uuid,
   ARRAY['Promote independence', 'Support social connections'],
   ARRAY['Enjoys cooking', 'Likes music']),
  
  ('55555555-5555-5555-5555-555555555555'::uuid,
   ARRAY['Support daily living skills', 'Encourage participation'],
   ARRAY['Enjoys quiet time', 'Likes puzzles']),
  
  ('66666666-6666-6666-6666-666666666666'::uuid,
   ARRAY['Support creative activities', 'Encourage self-expression'],
   ARRAY['Loves arts and crafts', 'Enjoys group activities']);

-- Insert behavior patterns
INSERT INTO participant_behavior_patterns (participant_id, trigger, behavior, frequency, time_of_day, successful_interventions)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Loud noises', 'Sensory overload, covering ears, rocking', 78, '14:00-16:00',
   ARRAY['Quiet room', 'Weighted blanket', 'Noise-cancelling headphones']),
  
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Changes in routine', 'Anxiety, pacing', 65, NULL,
   ARRAY['Deep breathing', 'Scheduled activities']);

-- Insert users with role references
INSERT INTO users (email, name, role_id, facility_id, status)
VALUES 
  ('bernard.adjei@maxlifecare.com.au', 'Bernard Adjei', '11111111-0000-0000-0000-000000000004'::uuid, NULL, 'active'),
  ('tom.anderson@sunshinesupport.com.au', 'Tom Anderson', '11111111-0000-0000-0000-000000000003'::uuid, NULL, 'active'),
  ('dr.kim@sunshinesupport.com.au', 'Dr. Sarah Kim', '11111111-0000-0000-0000-000000000002'::uuid, NULL, 'active'),
  ('lisa.park@sunshinesupport.com.au', 'Lisa Park', '11111111-0000-0000-0000-000000000002'::uuid, NULL, 'active')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role_id = EXCLUDED.role_id;

-- Create demo organization
INSERT INTO organizations (id, name, ndis_number, facilities_count, primary_email, timezone)
VALUES 
  ('11111111-0000-0000-0000-100000000000'::uuid, 'Sunshine Support Services', '4-123-4567-8', 5, 'admin@sunshinesupport.com.au', 'Australia/Sydney')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  ndis_number = EXCLUDED.ndis_number;

-- Create some demo alerts
INSERT INTO alerts (facility_id, type, severity, message, participant_id, acknowledged)
VALUES 
  (NULL, 'risk', 'warning', 'James M. - Elevated risk (2-4 PM based on patterns)', '11111111-1111-1111-1111-111111111111'::uuid, false),
  (NULL, 'medication', 'info', 'Sarah C. - Medication due at 8 AM', '22222222-2222-2222-2222-222222222222'::uuid, false),
  (NULL, 'environmental', 'warning', 'Maintenance scheduled in common area 10 AM', NULL, false);