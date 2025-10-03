-- CareScribe Complete Database Setup
-- Run this entire script in your Supabase SQL editor to set up everything at once

-- =====================================================
-- PART 1: SCHEMA CREATION
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS shift_handovers CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS routing_rules CASCADE;
DROP TABLE IF EXISTS participant_medications CASCADE;
DROP TABLE IF EXISTS participant_behavior_patterns CASCADE;
DROP TABLE IF EXISTS participant_support_plans CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Organizations table
CREATE TABLE organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ndis_number VARCHAR(50) NOT NULL,
  facilities_count INTEGER DEFAULT 0,
  primary_email VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Facilities table
CREATE TABLE facilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  address TEXT,
  capacity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES roles(id),
  facility_id UUID REFERENCES facilities(id),
  avatar VARCHAR(500),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participants table
CREATE TABLE participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id),
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  ndis_number VARCHAR(50),
  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  current_status VARCHAR(50) DEFAULT 'calm',
  current_location VARCHAR(100),
  profile_image VARCHAR(500),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participant Support Plans
CREATE TABLE participant_support_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  strategies TEXT[],
  preferences TEXT[],
  goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participant Behavior Patterns
CREATE TABLE participant_behavior_patterns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  trigger VARCHAR(255),
  behavior TEXT,
  frequency INTEGER DEFAULT 0,
  time_of_day VARCHAR(50),
  successful_interventions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participant Medications
CREATE TABLE participant_medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  time VARCHAR(50),
  type VARCHAR(20) DEFAULT 'regular' CHECK (type IN ('regular', 'prn')),
  prescriber VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Routing Rules
CREATE TABLE routing_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  conditions JSONB DEFAULT '[]',
  actions JSONB DEFAULT '[]',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alerts
CREATE TABLE alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  facility_id UUID REFERENCES facilities(id),
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  participant_id UUID REFERENCES participants(id),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shifts
CREATE TABLE shifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id UUID REFERENCES users(id),
  facility_id UUID REFERENCES facilities(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed')),
  handover_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shift Handovers
CREATE TABLE shift_handovers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shift_id UUID REFERENCES shifts(id),
  from_staff_id UUID REFERENCES users(id),
  to_staff_id UUID REFERENCES users(id),
  handover_notes TEXT,
  critical_info JSONB DEFAULT '[]',
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Incidents
CREATE TABLE incidents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_id UUID REFERENCES participants(id),
  facility_id UUID REFERENCES facilities(id),
  staff_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  location VARCHAR(255),
  description TEXT,
  antecedent TEXT,
  behavior TEXT,
  consequence TEXT,
  interventions JSONB DEFAULT '[]',
  outcomes JSONB DEFAULT '[]',
  photos TEXT[],
  report_type VARCHAR(20) CHECK (report_type IN ('abc', 'incident', 'both')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'closed')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_facility ON users(facility_id);
CREATE INDEX idx_participants_facility ON participants(facility_id);
CREATE INDEX idx_incidents_participant ON incidents(participant_id);
CREATE INDEX idx_incidents_staff ON incidents(staff_id);
CREATE INDEX idx_incidents_created ON incidents(created_at DESC);
CREATE INDEX idx_alerts_facility ON alerts(facility_id);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_shifts_staff ON shifts(staff_id);
CREATE INDEX idx_shifts_facility ON shifts(facility_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Waitlist table for collecting interested users
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  organization TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Add indexes for waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- Enable Row Level Security for waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to join waitlist
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Policy for admins to view waitlist
CREATE POLICY "Admins can view waitlist" ON waitlist
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- PART 2: SEED DATA - ORGANIZATION SETUP
-- =====================================================

-- Insert Organization
INSERT INTO organizations (id, name, ndis_number, facilities_count, primary_email) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Sunshine Support Services', '4-123-4567-8', 12, 'admin@sunshinesupport.com.au');

-- Insert Roles
INSERT INTO roles (id, name, level, permissions) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Executive Team', 1, ARRAY['view_all', 'strategic_insights', 'compliance_overview', 'financial_reports']),
('550e8400-e29b-41d4-a716-446655440002', 'Area Manager', 2, ARRAY['multi_facility_view', 'pattern_analysis', 'staff_performance', 'budget_view']),
('550e8400-e29b-41d4-a716-446655440003', 'Team Leader', 3, ARRAY['team_oversight', 'report_approval', 'real_time_alerts', 'shift_management']),
('550e8400-e29b-41d4-a716-446655440004', 'Support Worker', 4, ARRAY['incident_reporting', 'view_own_reports', 'participant_care']),
('550e8400-e29b-41d4-a716-446655440005', 'Clinical Manager', 2, ARRAY['clinical_oversight', 'behavior_analysis', 'medication_management']),
('550e8400-e29b-41d4-a716-446655440006', 'Nurse', 3, ARRAY['medication_administration', 'health_monitoring', 'clinical_reporting']),
('550e8400-e29b-41d4-a716-446655440007', 'Behavioral Specialist', 3, ARRAY['behavior_plans', 'abc_analysis', 'intervention_design']);

-- Insert Facilities
INSERT INTO facilities (id, organization_id, name, code, address, capacity) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'House 1 - Riverside', 'H1', '123 River Street, Sydney NSW 2000', 8),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'House 2 - Parkview', 'H2', '456 Park Avenue, Sydney NSW 2000', 6),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'House 3 - Sunshine', 'H3', '789 Sunshine Road, Sydney NSW 2000', 6),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'House 4 - Hillside', 'H4', '321 Hill Street, Sydney NSW 2000', 8),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'House 5 - Lakeside', 'H5', '654 Lake Drive, Sydney NSW 2000', 10),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Community Hub North', 'CHN', '987 Community Lane, Sydney NSW 2000', 20),
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'Community Hub South', 'CHS', '147 South Street, Sydney NSW 2000', 20),
('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'Respite Center A', 'RCA', '258 Respite Road, Sydney NSW 2000', 12),
('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'Respite Center B', 'RCB', '369 Care Avenue, Sydney NSW 2000', 12),
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Day Program Center', 'DPC', '741 Activity Street, Sydney NSW 2000', 30),
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Skills Development Center', 'SDC', '852 Skills Way, Sydney NSW 2000', 25),
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Head Office', 'HO', '963 Corporate Boulevard, Sydney NSW 2000', 0);

-- Insert Key Demo Users
INSERT INTO users (email, name, role_id, facility_id, phone, status) VALUES
-- Demo accounts
('bernard.adjei@maxlifecare.com.au', 'Bernard Adjei', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', '0400444001', 'active'),
('tom.anderson@sunshinesupport.com.au', 'Tom Anderson', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', '0400333005', 'active'),
('dr.kim@sunshinesupport.com.au', 'Dr. Sarah Kim', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440012', '0400222005', 'active'),
('lisa.park@sunshinesupport.com.au', 'Lisa Park', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', '0400222001', 'active'),
('ceo@sunshinesupport.com.au', 'Margaret Thompson', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440012', '0400111111', 'active');

-- =====================================================
-- PART 3: SEED DATA - PARTICIPANTS
-- =====================================================

-- Insert main demo participants for House 3
INSERT INTO participants (id, facility_id, name, date_of_birth, ndis_number, risk_level, current_status, current_location, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'James Mitchell', '1995-03-15', '4301234567', 'high', 'calm', 'Living Room', 'Mary Mitchell', '0412345678', 'Mother'),
('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Sarah Chen', '1998-07-22', '4301234568', 'low', 'happy', 'Garden', 'David Chen', '0423456789', 'Brother'),
('850e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Michael Brown', '1992-11-08', '4301234569', 'medium', 'anxious', 'Bedroom', 'Susan Brown', '0434567890', 'Sister'),
('850e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'Emma Wilson', '2000-05-30', '4301234570', 'low', 'happy', 'Kitchen', 'Robert Wilson', '0445678901', 'Father'),
('850e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 'David Lee', '1997-09-12', '4301234571', 'low', 'resting', 'Bedroom', 'Jennifer Lee', '0456789012', 'Mother'),
('850e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440003', 'Lisa Thompson', '1994-02-28', '4301234572', 'low', 'happy', 'Craft Room', 'Mark Thompson', '0467890123', 'Brother');

-- Insert Support Plans for James Mitchell
INSERT INTO participant_support_plans (participant_id, strategies, preferences, goals) VALUES
('850e8400-e29b-41d4-a716-446655440001', 
    ARRAY['Maintain quiet environment during high-risk periods', 'Provide sensory breaks every 2 hours', 'Use visual schedules', 'Implement noise reduction strategies'],
    ARRAY['Prefers routine and predictability', 'Likes weighted blankets', 'Enjoys listening to classical music', 'Prefers dim lighting'],
    ARRAY['Reduce sensory overload incidents by 50%', 'Increase participation in group activities', 'Develop coping strategies for noise sensitivity']);

-- Insert Behavior Patterns for James Mitchell
INSERT INTO participant_behavior_patterns (participant_id, trigger, behavior, frequency, time_of_day, successful_interventions) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Loud noises', 'Sensory overload - covers ears, rocks, may become aggressive', 78, '14:00-16:00', ARRAY['Quiet room', 'Weighted blanket', 'Noise-cancelling headphones', 'Deep pressure therapy']);

-- Insert Medications
INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Risperidone', '2mg', '08:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440001', 'Lorazepam', '1mg', 'PRN', 'prn', 'Dr. Sarah Kim');

-- Insert Active Alerts
INSERT INTO alerts (facility_id, type, severity, message, participant_id, acknowledged) VALUES
('650e8400-e29b-41d4-a716-446655440003', 'risk', 'warning', 'James M. - Elevated risk (2-4 PM based on patterns)', '850e8400-e29b-41d4-a716-446655440001', false),
('650e8400-e29b-41d4-a716-446655440003', 'medication', 'info', 'Sarah C. - Medication due at 8 AM', '850e8400-e29b-41d4-a716-446655440002', false),
('650e8400-e29b-41d4-a716-446655440003', 'environmental', 'warning', 'Maintenance scheduled in common area 10 AM', null, false);

-- Insert Routing Rules
INSERT INTO routing_rules (organization_id, name, conditions, actions, enabled) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Behavioral Incidents', 
    '[{"field": "type", "operator": "equals", "value": "behavioral"}]',
    '[{"type": "notify", "recipient": "Team Leader", "timing": "immediate"}, {"type": "notify", "recipient": "Clinical Manager", "timing": "within_30_min"}]',
    true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'CareScribe database setup completed successfully!';
  RAISE NOTICE 'Demo accounts created:';
  RAISE NOTICE '- Support Worker: bernard.adjei@maxlifecare.com.au';
  RAISE NOTICE '- Team Leader: tom.anderson@sunshinesupport.com.au';
  RAISE NOTICE '- Clinical Manager: dr.kim@sunshinesupport.com.au';
  RAISE NOTICE '- Area Manager: lisa.park@sunshinesupport.com.au';
  RAISE NOTICE '- CEO: ceo@sunshinesupport.com.au';
END $$;