-- Seed data for CareScribe Demo
-- This creates a realistic dataset for a large NDIS provider with 200+ staff and multiple facilities

-- Clear existing data
TRUNCATE TABLE incidents CASCADE;
TRUNCATE TABLE shift_handovers CASCADE;
TRUNCATE TABLE shifts CASCADE;
TRUNCATE TABLE alerts CASCADE;
TRUNCATE TABLE routing_rules CASCADE;
TRUNCATE TABLE participant_medications CASCADE;
TRUNCATE TABLE participant_behavior_patterns CASCADE;
TRUNCATE TABLE participant_support_plans CASCADE;
TRUNCATE TABLE participants CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE facilities CASCADE;
TRUNCATE TABLE roles CASCADE;
TRUNCATE TABLE organizations CASCADE;

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

-- Insert Users (Staff Members)
-- Executive Team (5 people)
INSERT INTO users (id, email, name, role_id, facility_id, phone, status) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'ceo@sunshinesupport.com.au', 'Margaret Thompson', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440012', '0400111111', 'active'),
('750e8400-e29b-41d4-a716-446655440002', 'coo@sunshinesupport.com.au', 'Robert Williams', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440012', '0400111112', 'active'),
('750e8400-e29b-41d4-a716-446655440003', 'cfo@sunshinesupport.com.au', 'Patricia Davis', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440012', '0400111113', 'active'),
('750e8400-e29b-41d4-a716-446655440004', 'clinical.director@sunshinesupport.com.au', 'Dr. Michael Chen', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440012', '0400111114', 'active'),
('750e8400-e29b-41d4-a716-446655440005', 'quality@sunshinesupport.com.au', 'Jennifer Miller', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440012', '0400111115', 'active');

-- Area Managers (8 people)
INSERT INTO users (email, name, role_id, facility_id, phone, status) VALUES
('lisa.park@sunshinesupport.com.au', 'Lisa Park', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', '0400222001', 'active'),
('david.jones@sunshinesupport.com.au', 'David Jones', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', '0400222002', 'active'),
('maria.garcia@sunshinesupport.com.au', 'Maria Garcia', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', '0400222003', 'active'),
('james.wilson@sunshinesupport.com.au', 'James Wilson', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', '0400222004', 'active'),
('dr.kim@sunshinesupport.com.au', 'Dr. Sarah Kim', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440012', '0400222005', 'active'),
('ahmed.hassan@sunshinesupport.com.au', 'Ahmed Hassan', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', '0400222006', 'active'),
('sophie.martin@sunshinesupport.com.au', 'Sophie Martin', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', '0400222007', 'active'),
('raj.patel@sunshinesupport.com.au', 'Raj Patel', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', '0400222008', 'active');

-- Team Leaders (24 people - 2 per facility)
INSERT INTO users (email, name, role_id, facility_id, phone, status) VALUES
-- House 1
('tom.anderson@sunshinesupport.com.au', 'Tom Anderson', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', '0400333001', 'active'),
('lucy.brown@sunshinesupport.com.au', 'Lucy Brown', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', '0400333002', 'active'),
-- House 2
('mark.taylor@sunshinesupport.com.au', 'Mark Taylor', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '0400333003', 'active'),
('emma.white@sunshinesupport.com.au', 'Emma White', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '0400333004', 'active'),
-- House 3
('jason.lee@sunshinesupport.com.au', 'Jason Lee', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', '0400333005', 'active'),
('nina.rodriguez@sunshinesupport.com.au', 'Nina Rodriguez', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', '0400333006', 'active'),
-- House 4
('peter.wong@sunshinesupport.com.au', 'Peter Wong', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', '0400333007', 'active'),
('olivia.smith@sunshinesupport.com.au', 'Olivia Smith', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', '0400333008', 'active'),
-- House 5
('mohammed.ali@sunshinesupport.com.au', 'Mohammed Ali', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', '0400333009', 'active'),
('rachel.green@sunshinesupport.com.au', 'Rachel Green', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', '0400333010', 'active'),
-- Community Hub North
('daniel.martinez@sunshinesupport.com.au', 'Daniel Martinez', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', '0400333011', 'active'),
('amanda.lewis@sunshinesupport.com.au', 'Amanda Lewis', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', '0400333012', 'active'),
-- Community Hub South
('kevin.ng@sunshinesupport.com.au', 'Kevin Ng', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440007', '0400333013', 'active'),
('isabella.rossi@sunshinesupport.com.au', 'Isabella Rossi', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440007', '0400333014', 'active'),
-- Respite Center A
('chris.evans@sunshinesupport.com.au', 'Chris Evans', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', '0400333015', 'active'),
('melissa.turner@sunshinesupport.com.au', 'Melissa Turner', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', '0400333016', 'active'),
-- Respite Center B
('alex.kumar@sunshinesupport.com.au', 'Alex Kumar', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440009', '0400333017', 'active'),
('victoria.hall@sunshinesupport.com.au', 'Victoria Hall', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440009', '0400333018', 'active'),
-- Day Program Center
('ryan.murphy@sunshinesupport.com.au', 'Ryan Murphy', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440010', '0400333019', 'active'),
('julia.chen@sunshinesupport.com.au', 'Julia Chen', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440010', '0400333020', 'active'),
-- Skills Development Center
('nathan.wright@sunshinesupport.com.au', 'Nathan Wright', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440011', '0400333021', 'active'),
('grace.kim@sunshinesupport.com.au', 'Grace Kim', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440011', '0400333022', 'active'),
-- Clinical Team Leaders
('dr.johnson@sunshinesupport.com.au', 'Dr. Patricia Johnson', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440012', '0400333023', 'active'),
('dr.singh@sunshinesupport.com.au', 'Dr. Priya Singh', '550e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440012', '0400333024', 'active');

-- Support Workers (150+ people)
-- Generate support workers for each facility
DO $$
DECLARE
    first_names text[] := ARRAY['Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'James', 'Sophia', 'Daniel', 'Olivia', 'Matthew', 'Emma', 'Christopher', 'Ava', 'Andrew', 'Isabella', 'Joseph', 'Mia', 'Ryan', 'Charlotte', 'Nicholas', 'Amelia', 'Anthony', 'Harper', 'Tyler', 'Evelyn', 'Joshua', 'Abigail', 'William', 'Madison', 'Alexander', 'Elizabeth', 'Ethan', 'Sofia', 'Jacob', 'Avery', 'Mason', 'Ella', 'Noah', 'Scarlett', 'Liam', 'Grace', 'Jayden', 'Chloe', 'Logan', 'Victoria', 'Lucas', 'Riley', 'Benjamin', 'Aria', 'Elijah'];
    last_names text[] := ARRAY['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
    facility_ids text[] := ARRAY['650e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440011'];
    i integer;
    j integer;
    first_name text;
    last_name text;
    email text;
    counter integer := 1;
BEGIN
    -- Add specific support workers first
    INSERT INTO users (email, name, role_id, facility_id, phone, status) VALUES
    ('bernard.adjei@maxlifecare.com.au', 'Bernard Adjei', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', '0400444001', 'active');
    
    -- Generate additional support workers
    FOR i IN 1..11 LOOP
        FOR j IN 1..15 LOOP
            first_name := first_names[1 + (counter % array_length(first_names, 1))];
            last_name := last_names[1 + ((counter + j) % array_length(last_names, 1))];
            email := lower(first_name || '.' || last_name || counter::text || '@sunshinesupport.com.au');
            
            INSERT INTO users (email, name, role_id, facility_id, phone, status) VALUES
            (email, first_name || ' ' || last_name, '550e8400-e29b-41d4-a716-446655440004', facility_ids[i], '040044' || lpad(counter::text, 4, '0'), 'active');
            
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;