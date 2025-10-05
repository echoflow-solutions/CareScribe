-- =====================================================
-- COMPREHENSIVE PARTICIPANT SEED DATA
-- Created for CareScribe Demo
-- Features: Realistic data across all risk levels
-- =====================================================

-- Clear existing participant data (be careful in production!)
-- Delete in correct order due to foreign key constraints
DELETE FROM participant_medications;
DELETE FROM participant_behavior_patterns;
DELETE FROM participant_support_plans;
DELETE FROM participants;

-- =====================================================
-- HOUSE 3 (Main Demo House) - Comprehensive Participants
-- =====================================================

-- HIGH RISK PARTICIPANTS (3 participants)
INSERT INTO participants (id, facility_id, name, date_of_birth, ndis_number, risk_level, current_status, current_location, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'James Mitchell', '1995-03-15', '4301234567', 'high', 'calm', 'Living Room', 'Mary Mitchell', '0412 345 678', 'Mother'),
('850e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440003', 'Marcus Thompson', '1992-08-22', '4301234568', 'high', 'anxious', 'Quiet Room', 'Denise Thompson', '0423 456 789', 'Sister'),
('850e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440003', 'Aisha Patel', '1997-11-05', '4301234569', 'high', 'resting', 'Bedroom', 'Raj Patel', '0434 567 890', 'Father');

-- MEDIUM RISK PARTICIPANTS (4 participants)
INSERT INTO participants (id, facility_id, name, date_of_birth, ndis_number, risk_level, current_status, current_location, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
('850e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Michael Brown', '1992-11-08', '4301234570', 'medium', 'calm', 'Garden', 'Susan Brown', '0445 678 901', 'Sister'),
('850e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440003', 'Sophie Martinez', '1999-02-14', '4301234571', 'medium', 'happy', 'Art Room', 'Carlos Martinez', '0456 789 012', 'Father'),
('850e8400-e29b-41d4-a716-446655440023', '650e8400-e29b-41d4-a716-446655440003', 'Daniel Kim', '1994-06-30', '4301234572', 'medium', 'anxious', 'Music Room', 'Jin Kim', '0467 890 123', 'Brother'),
('850e8400-e29b-41d4-a716-446655440024', '650e8400-e29b-41d4-a716-446655440003', 'Isabella Nguyen', '1996-09-18', '4301234573', 'medium', 'calm', 'Dining Room', 'Linh Nguyen', '0478 901 234', 'Mother');

-- LOW RISK PARTICIPANTS (5 participants)
INSERT INTO participants (id, facility_id, name, date_of_birth, ndis_number, risk_level, current_status, current_location, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Sarah Chen', '1998-07-22', '4301234574', 'low', 'happy', 'Garden', 'David Chen', '0489 012 345', 'Brother'),
('850e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'Emma Wilson', '2000-05-30', '4301234575', 'low', 'happy', 'Kitchen', 'Robert Wilson', '0490 123 456', 'Father'),
('850e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', 'David Lee', '1997-09-12', '4301234576', 'low', 'resting', 'Bedroom', 'Jennifer Lee', '0401 234 567', 'Mother'),
('850e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440003', 'Lisa Thompson', '1994-02-28', '4301234577', 'low', 'happy', 'Craft Room', 'Mark Thompson', '0412 345 679', 'Brother'),
('850e8400-e29b-41d4-a716-446655440025', '650e8400-e29b-41d4-a716-446655440003', 'Ryan O''Connor', '2001-12-03', '4301234578', 'low', 'happy', 'Common Room', 'Patricia O''Connor', '0423 456 790', 'Mother');

-- =====================================================
-- HOUSE 1 (Riverside) - Balanced Mix
-- =====================================================

INSERT INTO participants (id, facility_id, name, date_of_birth, ndis_number, risk_level, current_status, current_location, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
-- High Risk (2)
('850e8400-e29b-41d4-a716-446655440030', '650e8400-e29b-41d4-a716-446655440001', 'Jessica Martinez', '1993-04-10', '4301234580', 'high', 'anxious', 'Quiet Room', 'Rosa Martinez', '0434 567 901', 'Mother'),
('850e8400-e29b-41d4-a716-446655440031', '650e8400-e29b-41d4-a716-446655440001', 'Benjamin Harris', '1991-10-18', '4301234581', 'high', 'resting', 'Bedroom', 'Linda Harris', '0445 678 012', 'Sister'),
-- Medium Risk (3)
('850e8400-e29b-41d4-a716-446655440032', '650e8400-e29b-41d4-a716-446655440001', 'Thomas Anderson', '1990-06-15', '4301234582', 'medium', 'calm', 'Common Room', 'Patricia Anderson', '0456 789 123', 'Mother'),
('850e8400-e29b-41d4-a716-446655440033', '650e8400-e29b-41d4-a716-446655440001', 'Olivia Davis', '1999-12-05', '4301234583', 'medium', 'calm', 'Art Room', 'Michael Davis', '0467 890 234', 'Father'),
('850e8400-e29b-41d4-a716-446655440034', '650e8400-e29b-41d4-a716-446655440001', 'Mason Rodriguez', '1994-01-30', '4301234584', 'medium', 'happy', 'Library', 'Maria Rodriguez', '0478 901 345', 'Mother'),
-- Low Risk (3)
('850e8400-e29b-41d4-a716-446655440035', '650e8400-e29b-41d4-a716-446655440001', 'William Taylor', '1993-04-10', '4301234585', 'low', 'happy', 'Garden', 'Elizabeth Taylor', '0489 012 456', 'Sister'),
('850e8400-e29b-41d4-a716-446655440036', '650e8400-e29b-41d4-a716-446655440001', 'Sophia Clark', '1997-07-25', '4301234586', 'low', 'happy', 'Music Room', 'John Clark', '0490 123 567', 'Father'),
('850e8400-e29b-41d4-a716-446655440037', '650e8400-e29b-41d4-a716-446655440001', 'Isabella White', '2001-03-14', '4301234587', 'low', 'calm', 'Kitchen', 'James White', '0401 234 678', 'Father');

-- =====================================================
-- HOUSE 2 (Parkview) - Balanced Mix
-- =====================================================

INSERT INTO participants (id, facility_id, name, date_of_birth, ndis_number, risk_level, current_status, current_location, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
-- High Risk (1)
('850e8400-e29b-41d4-a716-446655440040', '650e8400-e29b-41d4-a716-446655440002', 'Ethan Williams', '1995-08-07', '4301234590', 'high', 'calm', 'Sensory Room', 'Amanda Williams', '0412 345 680', 'Mother'),
-- Medium Risk (4)
('850e8400-e29b-41d4-a716-446655440041', '650e8400-e29b-41d4-a716-446655440002', 'Charlotte Smith', '1998-11-20', '4301234591', 'medium', 'happy', 'Activity Room', 'George Smith', '0423 456 791', 'Father'),
('850e8400-e29b-41d4-a716-446655440042', '650e8400-e29b-41d4-a716-446655440002', 'Noah Baker', '1992-03-25', '4301234592', 'medium', 'calm', 'Workshop', 'Helen Baker', '0434 567 902', 'Sister'),
('850e8400-e29b-41d4-a716-446655440043', '650e8400-e29b-41d4-a716-446655440002', 'Amelia Johnson', '1996-07-14', '4301234593', 'medium', 'anxious', 'Bedroom', 'Tom Johnson', '0445 678 013', 'Brother'),
('850e8400-e29b-41d4-a716-446655440044', '650e8400-e29b-41d4-a716-446655440002', 'Liam Carter', '2000-09-08', '4301234594', 'medium', 'calm', 'Computer Room', 'Sarah Carter', '0456 789 124', 'Mother'),
-- Low Risk (3)
('850e8400-e29b-41d4-a716-446655440045', '650e8400-e29b-41d4-a716-446655440002', 'Mia Garcia', '1999-05-19', '4301234595', 'low', 'happy', 'Garden', 'Luis Garcia', '0467 890 235', 'Father'),
('850e8400-e29b-41d4-a716-446655440046', '650e8400-e29b-41d4-a716-446655440002', 'Harper Davis', '1997-12-11', '4301234596', 'low', 'happy', 'Kitchen', 'Nancy Davis', '0478 901 346', 'Mother'),
('850e8400-e29b-41d4-a716-446655440047', '650e8400-e29b-41d4-a716-446655440002', 'Logan Young', '1994-06-22', '4301234597', 'low', 'calm', 'Living Room', 'Kevin Young', '0489 012 457', 'Father');

-- =====================================================
-- SUPPORT PLANS - Comprehensive and Realistic
-- =====================================================

-- James Mitchell (High Risk - Sensory Processing)
INSERT INTO participant_support_plans (participant_id, strategies, preferences, goals) VALUES
('850e8400-e29b-41d4-a716-446655440001',
    ARRAY[
        'Maintain quiet environment during high-risk periods (2-4 PM)',
        'Provide sensory breaks every 2 hours with weighted blanket',
        'Use visual schedules and timers for transitions',
        'Implement noise reduction strategies (headphones available)',
        'Pre-warn about any changes to routine 24 hours in advance',
        'Offer deep pressure therapy when signs of distress appear'
    ],
    ARRAY[
        'Prefers routine and predictability - same meal times daily',
        'Likes weighted blankets (8kg) - keeps one in room',
        'Enjoys listening to classical music (Mozart, Bach)',
        'Prefers dim lighting - avoid fluorescent lights',
        'Likes structured activities - puzzles, sorting games',
        'Enjoys one-on-one interactions over group settings'
    ],
    ARRAY[
        'Reduce sensory overload incidents by 50% over 6 months',
        'Increase participation in group activities to 2x per week',
        'Develop and use 3 self-regulation strategies independently',
        'Improve tolerance to unexpected changes (practice scenarios)',
        'Expand communication about sensory needs proactively'
    ]),

-- Sarah Chen (Low Risk - Independent Living Skills)
('850e8400-e29b-41d4-a716-446655440002',
    ARRAY[
        'Encourage daily independence in personal care',
        'Support participation in meal planning and preparation',
        'Promote community engagement (2x per week)',
        'Facilitate social connections with peers',
        'Encourage physical activity - daily walks'
    ],
    ARRAY[
        'Enjoys gardening - has own vegetable patch',
        'Likes cooking and trying new recipes',
        'Prefers morning activities - most alert 9 AM-12 PM',
        'Enjoys group discussions and socializing',
        'Likes shopping trips and community outings',
        'Prefers hands-on learning activities'
    ],
    ARRAY[
        'Maintain current level of independence in ADLs',
        'Learn 5 new cooking recipes independently',
        'Expand social network through community groups',
        'Improve budgeting skills for shopping',
        'Complete Certificate II in Kitchen Operations'
    ]),

-- Michael Brown (Medium Risk - Anxiety Management)
('850e8400-e29b-41d4-a716-446655440003',
    ARRAY[
        'Maintain consistent daily routine with visual schedule',
        'Provide advance notice of changes (minimum 24 hours)',
        'Use calming techniques - breathing exercises',
        'Regular check-ins during transitions (every 30 mins)',
        'Implement gradual exposure to new situations',
        'Practice mindfulness and relaxation daily'
    ],
    ARRAY[
        'Likes structure and routine - prefers written schedules',
        'Enjoys reading - library visits 3x per week',
        'Prefers quiet activities - art, reading, puzzles',
        'Likes jigsaw puzzles (500-1000 pieces)',
        'Enjoys nature walks in familiar areas',
        'Prefers predictable meal times and food choices'
    ],
    ARRAY[
        'Reduce anxiety episodes from weekly to monthly',
        'Improve flexibility with routine changes',
        'Develop 5 self-regulation skills for anxiety',
        'Increase tolerance for new situations gradually',
        'Practice and use mindfulness techniques daily'
    ]),

-- Marcus Thompson (High Risk - Behavioral Support)
('850e8400-e29b-41d4-a716-446655440020',
    ARRAY[
        'Use de-escalation techniques early - watch for warning signs',
        'Provide space and time during agitation periods',
        'Implement positive behavior support plan',
        'Regular exercise program - boxing, running',
        'Calm reassurance and validation of feelings',
        'Use visual cue cards for communication during distress'
    ],
    ARRAY[
        'Prefers physical activities - boxing, basketball',
        'Likes structure but needs flexibility',
        'Enjoys rap music and hip-hop culture',
        'Prefers direct, honest communication',
        'Likes working with hands - woodwork, mechanics',
        'Enjoys video games as relaxation'
    ],
    ARRAY[
        'Reduce aggressive outbursts by 60% over 3 months',
        'Improve emotional regulation skills',
        'Develop healthy coping mechanisms for frustration',
        'Increase positive social interactions',
        'Complete anger management program successfully'
    ]),

-- Emma Wilson (Low Risk - Skills Development)
('850e8400-e29b-41d4-a716-446655440004',
    ARRAY[
        'Encourage participation in vocational training',
        'Support development of work skills',
        'Facilitate peer mentoring opportunities',
        'Promote creative expression through art',
        'Support community volunteering'
    ],
    ARRAY[
        'Enjoys arts and crafts - painting, drawing',
        'Likes helping others - peer support role',
        'Prefers collaborative projects',
        'Enjoys music - plays keyboard',
        'Likes animal therapy - weekly dog visits',
        'Prefers colorful, creative environments'
    ],
    ARRAY[
        'Complete Certificate I in Visual Arts',
        'Develop portfolio of artwork for exhibition',
        'Mentor 2 new participants in art activities',
        'Volunteer at local animal shelter weekly',
        'Improve fine motor skills through crafts'
    ]);

-- =====================================================
-- BEHAVIOR PATTERNS - Detailed Tracking
-- =====================================================

-- James Mitchell - Multiple Patterns
INSERT INTO participant_behavior_patterns (participant_id, trigger, behavior, frequency, time_of_day, successful_interventions) VALUES
('850e8400-e29b-41d4-a716-446655440001',
    'Loud unexpected noises (alarms, construction, shouting)',
    'Sensory overload response: covers ears, rocks back and forth, may throw nearby objects, may become verbally aggressive if approached',
    78,
    '14:00-16:00',
    ARRAY[
        'Immediately move to quiet room away from noise source',
        'Provide weighted blanket (8kg)',
        'Offer noise-cancelling headphones',
        'Apply deep pressure therapy if accepted',
        'Reduce lighting in quiet space',
        'Play preferred music (Mozart) at low volume',
        'Allow 20-30 minutes for self-regulation',
        'Avoid verbal interaction initially - use visual cards'
    ]),

('850e8400-e29b-41d4-a716-446655440001',
    'Unexpected changes to daily routine or schedule',
    'Increased anxiety: repetitive questioning, pacing, hand-wringing, may refuse to participate in activities',
    45,
    '08:00-10:00',
    ARRAY[
        'Review visual schedule together',
        'Provide extra transition time (15-20 minutes)',
        'Explain changes using social story or visual aids',
        'Offer choice in how to approach the change',
        'Provide calm verbal reassurance',
        'Break change into smaller steps',
        'Allow favorite calming activity before change'
    ]),

('850e8400-e29b-41d4-a716-446655440001',
    'Crowded spaces or large group settings',
    'Social withdrawal: leaves area abruptly, goes to bedroom, may become non-verbal',
    32,
    'Any time',
    ARRAY[
        'Schedule regular breaks from group settings',
        'Provide companion support for gradual exposure',
        'Offer alternative quiet spaces nearby',
        'Use gradual desensitization approach',
        'Allow self-paced participation',
        'Provide exit strategy and safe person to approach'
    ]),

-- Marcus Thompson - Behavioral Patterns
('850e8400-e29b-41d4-a716-446655440020',
    'Perceived unfairness or criticism',
    'Verbal aggression: raised voice, angry outbursts, may punch walls or throw items',
    25,
    '16:00-19:00',
    ARRAY[
        'Early intervention at first warning signs',
        'Provide space - maintain 2 meter distance',
        'Use calm, low voice tone',
        'Validate feelings without agreeing/disagreeing',
        'Offer physical outlet - punching bag, running',
        'Remove audience if possible',
        'Use boxing gloves as positive redirect',
        'Follow up conversation when calm - same day'
    ]),

-- Michael Brown - Anxiety Patterns
('850e8400-e29b-41d4-a716-446655440003',
    'New people or unfamiliar visitors',
    'Increased anxiety: avoidance, repetitive questions, may hide in room, tearfulness',
    18,
    'Any time',
    ARRAY[
        'Pre-warn about visitors with photo/description',
        'Introduce new people gradually in comfortable setting',
        'Allow Michael to observe from distance first',
        'Keep initial interactions brief (5-10 minutes)',
        'Provide comfort item - favorite book',
        'Use breathing exercises before introduction',
        'Allow retreat to room if needed without pressure'
    ]);

-- =====================================================
-- MEDICATIONS - Realistic and Comprehensive
-- =====================================================

-- James Mitchell
INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Risperidone', '2mg', '08:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440001', 'Risperidone', '2mg', '20:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440001', 'Lorazepam', '1mg', 'PRN for acute anxiety', 'prn', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440001', 'Melatonin', '3mg', '21:00', 'regular', 'Dr. Sarah Kim'),

-- Sarah Chen
('850e8400-e29b-41d4-a716-446655440002', 'Vitamin D', '1000IU', '09:00', 'regular', 'Dr. Michael Chen'),
('850e8400-e29b-41d4-a716-446655440002', 'Multivitamin', '1 tablet', '09:00', 'regular', 'Dr. Michael Chen'),

-- Michael Brown
('850e8400-e29b-41d4-a716-446655440003', 'Sertraline', '100mg', '08:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440003', 'Melatonin', '5mg', '21:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440003', 'Propranolol', '10mg', 'PRN for acute anxiety', 'prn', 'Dr. Sarah Kim'),

-- Marcus Thompson
('850e8400-e29b-41d4-a716-446655440020', 'Quetiapine', '200mg', '08:00', 'regular', 'Dr. Jennifer Lopez'),
('850e8400-e29b-41d4-a716-446655440020', 'Quetiapine', '300mg', '20:00', 'regular', 'Dr. Jennifer Lopez'),
('850e8400-e29b-41d4-a716-446655440020', 'Diazepam', '5mg', 'PRN for severe agitation', 'prn', 'Dr. Jennifer Lopez'),
('850e8400-e29b-41d4-a716-446655440020', 'Sodium Valproate', '500mg', '08:00', 'regular', 'Dr. Jennifer Lopez'),
('850e8400-e29b-41d4-a716-446655440020', 'Sodium Valproate', '500mg', '20:00', 'regular', 'Dr. Jennifer Lopez'),

-- Aisha Patel
('850e8400-e29b-41d4-a716-446655440021', 'Olanzapine', '10mg', '20:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440021', 'Clonazepam', '0.5mg', '08:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440021', 'Clonazepam', '0.5mg', '20:00', 'regular', 'Dr. Sarah Kim'),

-- Emma Wilson
('850e8400-e29b-41d4-a716-446655440004', 'Levothyroxine', '50mcg', '07:00', 'regular', 'Dr. Michael Chen'),

-- Sophie Martinez
('850e8400-e29b-41d4-a716-446655440022', 'Fluoxetine', '20mg', '08:00', 'regular', 'Dr. Sarah Kim'),
('850e8400-e29b-41d4-a716-446655440022', 'Melatonin', '3mg', '21:00', 'regular', 'Dr. Sarah Kim'),

-- Daniel Kim
('850e8400-e29b-41d4-a716-446655440023', 'Escitalopram', '15mg', '08:00', 'regular', 'Dr. Jennifer Lopez'),
('850e8400-e29b-41d4-a716-446655440023', 'Buspirone', '10mg', '08:00', 'regular', 'Dr. Jennifer Lopez'),
('850e8400-e29b-41d4-a716-446655440023', 'Buspirone', '10mg', '20:00', 'regular', 'Dr. Jennifer Lopez');

-- =====================================================
-- SUCCESS!
-- =====================================================

-- Summary count
SELECT
    risk_level,
    COUNT(*) as count
FROM participants
WHERE facility_id = '650e8400-e29b-41d4-a716-446655440003'
GROUP BY risk_level
ORDER BY
    CASE risk_level
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
    END;
