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

-- Clear existing demo data (optional - comment out if you want to keep existing data)
-- DELETE FROM participant_medications;
-- DELETE FROM participant_conditions;
-- DELETE FROM participant_behavior_patterns;
-- DELETE FROM participant_support_plans;
-- DELETE FROM participants;

-- Insert participants with conditions
INSERT INTO participants (id, name, facility_id, risk_level, current_status, current_location, conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'James Mitchell', NULL, 'high', 'calm', 'Living Room', 
   ARRAY['Bipolar Disorder', 'Generalized Anxiety Disorder', 'Insomnia', 'Mild Intellectual Disability', 'ADHD'],
   'Mary Mitchell', '0412 345 678', 'Mother'),
  
  ('22222222-2222-2222-2222-222222222222', 'Sarah Chen', NULL, 'low', 'happy', 'Garden',
   ARRAY['Depression', 'Neuropathic Pain', 'Osteoporosis', 'Vitamin D Deficiency', 'Autism Spectrum Disorder'],
   'David Chen', '0423 456 789', 'Brother'),
  
  ('33333333-3333-3333-3333-333333333333', 'Michael Brown', NULL, 'medium', 'anxious', 'Bedroom',
   ARRAY['Anxiety Disorder', 'Autism Spectrum Disorder', 'Hypertension', 'Insomnia', 'Sensory Processing Sensitivity'],
   'Susan Brown', '0434 567 890', 'Sister'),
  
  ('44444444-4444-4444-4444-444444444444', 'Emma Wilson', NULL, 'low', 'happy', 'Kitchen',
   ARRAY['Type 2 Diabetes', 'Hyperlipidemia', 'Vitamin D Deficiency', 'Mild Arthritis'],
   'Robert Wilson', '0445 678 901', 'Father'),
  
  ('55555555-5555-5555-5555-555555555555', 'David Lee', NULL, 'low', 'resting', 'Bedroom',
   ARRAY['Mild Cognitive Impairment', 'Cardiovascular Disease', 'Hyperlipidemia', 'Osteoarthritis', 'Down Syndrome'],
   'Jennifer Lee', '0456 789 012', 'Mother'),
  
  ('66666666-6666-6666-6666-666666666666', 'Lisa Thompson', NULL, 'low', 'happy', 'Craft Room',
   ARRAY['Epilepsy', 'Depression', 'Iron Deficiency Anemia', 'Cerebral Palsy', 'Chronic Pain Syndrome'],
   'Mark Thompson', '0467 890 123', 'Brother')
ON CONFLICT (id) DO UPDATE SET
  conditions = EXCLUDED.conditions,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  emergency_contact_relationship = EXCLUDED.emergency_contact_relationship;

-- Insert medications for James Mitchell
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Risperidone', '2mg', '08:00', 'regular'),
  ('11111111-1111-1111-1111-111111111111', 'Lorazepam', '1mg', 'PRN', 'prn'),
  ('11111111-1111-1111-1111-111111111111', 'Sertraline', '100mg', '08:00', 'regular'),
  ('11111111-1111-1111-1111-111111111111', 'Quetiapine', '25mg', '22:00', 'regular'),
  ('11111111-1111-1111-1111-111111111111', 'Omega-3', '1000mg', '12:00', 'regular');

-- Insert medications for Sarah Chen
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Escitalopram', '10mg', '08:00', 'regular'),
  ('22222222-2222-2222-2222-222222222222', 'Gabapentin', '300mg', '08:00', 'regular'),
  ('22222222-2222-2222-2222-222222222222', 'Vitamin D', '1000IU', '09:00', 'regular'),
  ('22222222-2222-2222-2222-222222222222', 'Calcium Carbonate', '600mg', '12:00', 'regular'),
  ('22222222-2222-2222-2222-222222222222', 'Ibuprofen', '400mg', 'PRN', 'prn');

-- Insert medications for Michael Brown
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'Sertraline', '50mg', '08:00', 'regular'),
  ('33333333-3333-3333-3333-333333333333', 'Propranolol', '20mg', '08:00', 'regular'),
  ('33333333-3333-3333-3333-333333333333', 'Propranolol', '20mg', '14:00', 'regular'),
  ('33333333-3333-3333-3333-333333333333', 'Melatonin', '5mg', '21:00', 'regular'),
  ('33333333-3333-3333-3333-333333333333', 'Diazepam', '5mg', 'PRN', 'prn');

-- Insert medications for Emma Wilson
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'Metformin', '500mg', '08:00', 'regular'),
  ('44444444-4444-4444-4444-444444444444', 'Atorvastatin', '20mg', '20:00', 'regular'),
  ('44444444-4444-4444-4444-444444444444', 'Vitamin D3', '1000IU', '08:00', 'regular'),
  ('44444444-4444-4444-4444-444444444444', 'Paracetamol', '500mg', 'PRN', 'prn');

-- Insert medications for David Lee
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'Donepezil', '5mg', '08:00', 'regular'),
  ('55555555-5555-5555-5555-555555555555', 'Memantine', '10mg', '08:00', 'regular'),
  ('55555555-5555-5555-5555-555555555555', 'Aspirin', '100mg', '08:00', 'regular'),
  ('55555555-5555-5555-5555-555555555555', 'Simvastatin', '40mg', '20:00', 'regular'),
  ('55555555-5555-5555-5555-555555555555', 'Multivitamin', '1 tablet', '08:00', 'regular');

-- Insert medications for Lisa Thompson
INSERT INTO participant_medications (participant_id, name, dosage, time, type)
VALUES 
  ('66666666-6666-6666-6666-666666666666', 'Lamotrigine', '200mg', '08:00', 'regular'),
  ('66666666-6666-6666-6666-666666666666', 'Venlafaxine', '75mg', '08:00', 'regular'),
  ('66666666-6666-6666-6666-666666666666', 'Folic Acid', '5mg', '08:00', 'regular'),
  ('66666666-6666-6666-6666-666666666666', 'Iron Supplement', '325mg', '12:00', 'regular'),
  ('66666666-6666-6666-6666-666666666666', 'Naproxen', '250mg', 'PRN', 'prn');

-- Insert support plans
INSERT INTO participant_support_plans (participant_id, strategies, preferences)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 
   ARRAY['Maintain quiet environment', 'Provide sensory breaks', 'Use visual schedules'],
   ARRAY['Prefers routine', 'Likes weighted blankets', 'Enjoys music']),
  
  ('22222222-2222-2222-2222-222222222222',
   ARRAY['Encourage social activities', 'Support independence'],
   ARRAY['Enjoys gardening', 'Likes cooking']),
  
  ('33333333-3333-3333-3333-333333333333',
   ARRAY['Maintain consistent routine', 'Provide advance notice of changes'],
   ARRAY['Likes structure', 'Enjoys reading']),
  
  ('44444444-4444-4444-4444-444444444444',
   ARRAY['Promote independence', 'Support social connections'],
   ARRAY['Enjoys cooking', 'Likes music']),
  
  ('55555555-5555-5555-5555-555555555555',
   ARRAY['Support daily living skills', 'Encourage participation'],
   ARRAY['Enjoys quiet time', 'Likes puzzles']),
  
  ('66666666-6666-6666-6666-666666666666',
   ARRAY['Support creative activities', 'Encourage self-expression'],
   ARRAY['Loves arts and crafts', 'Enjoys group activities']);

-- Insert behavior patterns
INSERT INTO participant_behavior_patterns (participant_id, trigger, behavior, frequency, time_of_day, successful_interventions)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Loud noises', 'Sensory overload, covering ears, rocking', 78, '14:00-16:00',
   ARRAY['Quiet room', 'Weighted blanket', 'Noise-cancelling headphones']),
  
  ('33333333-3333-3333-3333-333333333333', 'Changes in routine', 'Anxiety, pacing', 65, NULL,
   ARRAY['Deep breathing', 'Scheduled activities']);

-- Create demo users if they don't exist
INSERT INTO roles (id, name, level, permissions)
VALUES 
  ('role-1', 'Executive Team', 1, ARRAY['view_all', 'strategic_insights', 'compliance_overview']),
  ('role-2', 'Area Manager', 2, ARRAY['multi_facility_view', 'pattern_analysis', 'staff_performance']),
  ('role-3', 'Team Leader', 3, ARRAY['team_oversight', 'report_approval', 'real_time_alerts']),
  ('role-4', 'Support Worker', 4, ARRAY['incident_reporting', 'view_own_reports'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (email, name, role_id, facility_id, status)
VALUES 
  ('bernard.adjei@maxlifecare.com.au', 'Bernard Adjei', 'role-4', NULL, 'active'),
  ('tom.anderson@sunshinesupport.com.au', 'Tom Anderson', 'role-3', NULL, 'active'),
  ('dr.kim@sunshinesupport.com.au', 'Dr. Sarah Kim', 'role-2', NULL, 'active'),
  ('lisa.park@sunshinesupport.com.au', 'Lisa Park', 'role-2', NULL, 'active')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role_id = EXCLUDED.role_id;

-- Create demo organization
INSERT INTO organizations (id, name, ndis_number, facilities_count, primary_email, timezone)
VALUES 
  ('org-1', 'Sunshine Support Services', '4-123-4567-8', 5, 'admin@sunshinesupport.com.au', 'Australia/Sydney')
ON CONFLICT (id) DO NOTHING;

-- Create some demo alerts
INSERT INTO alerts (facility_id, type, severity, message, participant_id, acknowledged)
VALUES 
  (NULL, 'risk', 'warning', 'James M. - Elevated risk (2-4 PM based on patterns)', '11111111-1111-1111-1111-111111111111', false),
  (NULL, 'medication', 'info', 'Sarah C. - Medication due at 8 AM', '22222222-2222-2222-2222-222222222222', false),
  (NULL, 'environmental', 'warning', 'Maintenance scheduled in common area 10 AM', NULL, false);