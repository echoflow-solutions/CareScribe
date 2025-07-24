-- Insert Participants (100+ participants across all facilities)
INSERT INTO participants (id, facility_id, name, date_of_birth, ndis_number, risk_level, current_status, current_location, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
-- House 3 Participants (Main demo house)
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'James Mitchell', '1995-03-15', '4301234567', 'high', 'calm', 'Living Room', 'Mary Mitchell', '0412345678', 'Mother'),
('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Sarah Chen', '1998-07-22', '4301234568', 'low', 'happy', 'Garden', 'David Chen', '0423456789', 'Brother'),
('850e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Michael Brown', '1992-11-08', '4301234569', 'medium', 'anxious', 'Bedroom', 'Susan Brown', '0434567890', 'Sister'),
('850e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'Emma Wilson', '2000-05-30', '4301234570', 'low', 'happy', 'Kitchen', 'Robert Wilson', '0445678901', 'Father'),
('850e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 'David Lee', '1997-09-12', '4301234571', 'low', 'resting', 'Bedroom', 'Jennifer Lee', '0456789012', 'Mother'),
('850e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440003', 'Lisa Thompson', '1994-02-28', '4301234572', 'low', 'happy', 'Craft Room', 'Mark Thompson', '0467890123', 'Brother');

-- House 1 Participants
INSERT INTO participants (facility_id, name, date_of_birth, ndis_number, risk_level, current_status, current_location, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Thomas Anderson', '1990-06-15', '4301234573', 'medium', 'calm', 'Common Room', 'Patricia Anderson', '0478901234', 'Mother'),
('650e8400-e29b-41d4-a716-446655440001', 'Jessica Martinez', '1996-08-20', '4301234574', 'high', 'anxious', 'Quiet Room', 'Carlos Martinez', '0489012345', 'Father'),
('650e8400-e29b-41d4-a716-446655440001', 'William Taylor', '1993-04-10', '4301234575', 'low', 'happy', 'Garden', 'Elizabeth Taylor', '0490123456', 'Sister'),
('650e8400-e29b-41d4-a716-446655440001', 'Olivia Davis', '1999-12-05', '4301234576', 'medium', 'calm', 'Art Room', 'Michael Davis', '0401234567', 'Brother'),
('650e8400-e29b-41d4-a716-446655440001', 'Benjamin Harris', '1991-10-18', '4301234577', 'high', 'resting', 'Bedroom', 'Linda Harris', '0412345679', 'Mother'),
('650e8400-e29b-41d4-a716-446655440001', 'Sophia Clark', '1997-07-25', '4301234578', 'low', 'happy', 'Music Room', 'John Clark', '0423456790', 'Father'),
('650e8400-e29b-41d4-a716-446655440001', 'Mason Rodriguez', '1994-01-30', '4301234579', 'medium', 'calm', 'Library', 'Maria Rodriguez', '0434567901', 'Mother'),
('650e8400-e29b-41d4-a716-446655440001', 'Isabella White', '2001-03-14', '4301234580', 'low', 'happy', 'Kitchen', 'James White', '0445679012', 'Father');

-- Generate more participants for other facilities
DO $$
DECLARE
    participant_names text[] := ARRAY['Alexander Johnson', 'Charlotte Smith', 'Ethan Williams', 'Amelia Brown', 'Daniel Jones', 'Mia Garcia', 'Christopher Miller', 'Harper Davis', 'Matthew Wilson', 'Evelyn Moore', 'Andrew Taylor', 'Abigail Anderson', 'Joshua Thomas', 'Emily Jackson', 'Ryan Martin', 'Madison Lee', 'Nathan Thompson', 'Chloe White', 'Tyler Harris', 'Avery Clark', 'Nicholas Lewis', 'Ella Robinson', 'Jacob Walker', 'Scarlett Hall', 'Logan Young', 'Grace King', 'Lucas Wright', 'Victoria Scott', 'Mason Green', 'Riley Adams', 'Noah Baker', 'Aria Nelson', 'Liam Carter', 'Zoe Mitchell', 'Elijah Turner', 'Lily Phillips', 'Aiden Campbell', 'Layla Parker', 'Jackson Evans', 'Penelope Edwards'];
    facility_ids text[] := ARRAY['650e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440011'];
    risk_levels text[] := ARRAY['low', 'medium', 'high'];
    statuses text[] := ARRAY['calm', 'happy', 'anxious', 'resting', 'agitated'];
    locations text[] := ARRAY['Common Room', 'Bedroom', 'Garden', 'Kitchen', 'Activity Room', 'Quiet Room', 'Dining Room'];
    i integer;
    j integer;
    birth_year integer;
    ndis_counter integer := 4301234581;
BEGIN
    FOR i IN 1..array_length(facility_ids, 1) LOOP
        FOR j IN 1..10 LOOP
            birth_year := 1990 + (random() * 15)::integer;
            
            INSERT INTO participants (
                facility_id, 
                name, 
                date_of_birth, 
                ndis_number, 
                risk_level, 
                current_status, 
                current_location,
                emergency_contact_name,
                emergency_contact_phone,
                emergency_contact_relationship
            ) VALUES (
                facility_ids[i],
                participant_names[((i-1)*10 + j) % array_length(participant_names, 1) + 1],
                make_date(birth_year, 1 + (random() * 11)::integer, 1 + (random() * 27)::integer),
                ndis_counter::text,
                risk_levels[1 + (random() * 2)::integer],
                statuses[1 + (random() * 4)::integer],
                locations[1 + (random() * 6)::integer],
                'Emergency Contact ' || j,
                '04' || lpad(((random() * 99999999)::integer)::text, 8, '0'),
                CASE (random() * 3)::integer
                    WHEN 0 THEN 'Mother'
                    WHEN 1 THEN 'Father'
                    WHEN 2 THEN 'Sibling'
                    ELSE 'Guardian'
                END
            );
            
            ndis_counter := ndis_counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- Insert Support Plans for key participants
INSERT INTO participant_support_plans (participant_id, strategies, preferences, goals) VALUES
('850e8400-e29b-41d4-a716-446655440001', 
    ARRAY['Maintain quiet environment during high-risk periods', 'Provide sensory breaks every 2 hours', 'Use visual schedules', 'Implement noise reduction strategies'],
    ARRAY['Prefers routine and predictability', 'Likes weighted blankets', 'Enjoys listening to classical music', 'Prefers dim lighting'],
    ARRAY['Reduce sensory overload incidents by 50%', 'Increase participation in group activities', 'Develop coping strategies for noise sensitivity']),
('850e8400-e29b-41d4-a716-446655440002',
    ARRAY['Encourage social activities', 'Support independence in daily tasks', 'Promote community engagement'],
    ARRAY['Enjoys gardening', 'Likes cooking', 'Prefers morning activities', 'Enjoys group discussions'],
    ARRAY['Maintain current level of independence', 'Expand social network', 'Learn new cooking skills']),
('850e8400-e29b-41d4-a716-446655440003',
    ARRAY['Maintain consistent routine', 'Provide advance notice of changes', 'Use calming techniques', 'Regular check-ins during transitions'],
    ARRAY['Likes structure and routine', 'Enjoys reading', 'Prefers quiet activities', 'Likes puzzles'],
    ARRAY['Reduce anxiety episodes', 'Improve flexibility with changes', 'Develop self-regulation skills']);

-- Insert Behavior Patterns for James Mitchell
INSERT INTO participant_behavior_patterns (participant_id, trigger, behavior, frequency, time_of_day, successful_interventions) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Loud noises', 'Sensory overload - covers ears, rocks, may become aggressive', 78, '14:00-16:00', ARRAY['Quiet room', 'Weighted blanket', 'Noise-cancelling headphones', 'Deep pressure therapy']),
('850e8400-e29b-41d4-a716-446655440001', 'Changes in routine', 'Anxiety, repetitive questioning', 45, 'Morning', ARRAY['Visual schedule review', 'Extra time for transitions', 'Calm verbal reassurance']),
('850e8400-e29b-41d4-a716-446655440001', 'Crowded spaces', 'Withdrawal, may leave area abruptly', 32, 'Any time', ARRAY['Scheduled breaks', 'Companion support', 'Alternative quiet spaces']);

-- Insert Medications
INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Risperidone', '2mg', '08:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440001', 'Lorazepam', '1mg', 'PRN', 'prn', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440002', 'Vitamin D', '1000IU', '09:00', 'regular', 'Dr. Michael Chen'),
('850e8400-e29b-41d4-a716-446655440003', 'Sertraline', '50mg', '08:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440003', 'Melatonin', '5mg', '21:00', 'regular', 'Dr. Sarah Kim');

-- Insert Routing Rules
INSERT INTO routing_rules (organization_id, name, conditions, actions, enabled) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Behavioral Incidents', 
    '[{"field": "type", "operator": "equals", "value": "behavioral"}]',
    '[{"type": "notify", "recipient": "Team Leader", "timing": "immediate"}, {"type": "notify", "recipient": "Clinical Manager", "timing": "within_30_min"}]',
    true),
('550e8400-e29b-41d4-a716-446655440000', 'Property Damage > $500',
    '[{"field": "property_damage", "operator": "equals", "value": true}, {"field": "damage_value", "operator": "greater_than", "value": 500}]',
    '[{"type": "notify", "recipient": "Team Leader", "timing": "immediate"}, {"type": "notify", "recipient": "Maintenance", "timing": "immediate"}, {"type": "notify", "recipient": "Area Manager", "timing": "within_1_hour"}]',
    true),
('550e8400-e29b-41d4-a716-446655440000', 'Medical Emergencies',
    '[{"field": "type", "operator": "equals", "value": "medical"}]',
    '[{"type": "notify", "recipient": "Team Leader", "timing": "immediate"}, {"type": "notify", "recipient": "Nurse", "timing": "immediate"}, {"type": "notify", "recipient": "Clinical Manager", "timing": "immediate"}]',
    true),
('550e8400-e29b-41d4-a716-446655440000', 'High Severity Incidents',
    '[{"field": "severity", "operator": "equals", "value": "high"}]',
    '[{"type": "notify", "recipient": "Area Manager", "timing": "immediate"}, {"type": "notify", "recipient": "Executive Team", "timing": "within_1_hour"}]',
    true);

-- Insert Active Alerts
INSERT INTO alerts (facility_id, type, severity, message, participant_id, acknowledged) VALUES
('650e8400-e29b-41d4-a716-446655440003', 'risk', 'warning', 'James M. - Elevated risk (2-4 PM based on patterns)', '850e8400-e29b-41d4-a716-446655440001', false),
('650e8400-e29b-41d4-a716-446655440003', 'medication', 'info', 'Sarah C. - Medication due at 8 AM', '850e8400-e29b-41d4-a716-446655440002', false),
('650e8400-e29b-41d4-a716-446655440003', 'environmental', 'warning', 'Maintenance scheduled in common area 10 AM', null, false),
('650e8400-e29b-41d4-a716-446655440001', 'pattern', 'info', 'Jessica M. showing increased anxiety - monitor closely', null, false),
('650e8400-e29b-41d4-a716-446655440002', 'risk', 'critical', 'Fire drill scheduled - prepare participants with sensory sensitivities', null, false);

-- Insert some historical incidents for pattern analysis
INSERT INTO incidents (participant_id, facility_id, staff_id, type, severity, location, description, antecedent, behavior, consequence, report_type, status, created_at) VALUES
-- James Mitchell incidents (showing pattern)
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 
    (SELECT id FROM users WHERE email = 'sarah.johnson@sunshinesupport.com.au'),
    'behavioral', 'medium', 'Living Room',
    'Sensory overload due to construction noise',
    'Construction work started outside without warning',
    'Covered ears, rocked back and forth, threw cushions',
    'Moved to quiet room, provided weighted blanket, construction halted',
    'abc', 'closed', NOW() - INTERVAL '7 days'),
    
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003',
    (SELECT id FROM users WHERE email = 'sarah.johnson@sunshinesupport.com.au'),
    'behavioral', 'low', 'Dining Room',
    'Anxiety during lunch due to unexpected visitor',
    'Unfamiliar maintenance worker entered during meal',
    'Became agitated, refused to eat, repetitive questioning',
    'Visitor asked to leave, calm reassurance provided, meal resumed',
    'abc', 'closed', NOW() - INTERVAL '14 days'),
    
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003',
    (SELECT id FROM users WHERE email = 'sarah.johnson@sunshinesupport.com.au'),
    'behavioral', 'high', 'Common Room',
    'Major sensory overload incident',
    'Fire alarm testing without prior notice',
    'Extreme distress, self-injurious behavior, property damage',
    'Emergency protocol activated, PRN administered, successful de-escalation',
    'both', 'closed', NOW() - INTERVAL '30 days');

-- Insert recent shift data
INSERT INTO shifts (staff_id, facility_id, start_time, end_time, status) VALUES
((SELECT id FROM users WHERE email = 'sarah.johnson@sunshinesupport.com.au'), 
    '650e8400-e29b-41d4-a716-446655440003',
    NOW() - INTERVAL '8 hours',
    NOW(),
    'completed'),
((SELECT id FROM users WHERE email = 'sarah.johnson@sunshinesupport.com.au'),
    '650e8400-e29b-41d4-a716-446655440003',
    NOW(),
    NOW() + INTERVAL '8 hours',
    'active');