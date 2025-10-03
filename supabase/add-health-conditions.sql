-- Add health conditions column to participants table if it doesn't exist
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS conditions TEXT[] DEFAULT '{}';

-- Clear existing medications (for clean demo data)
DELETE FROM participant_medications;

-- Insert medications for each participant
-- Note: These are realistic but fictional medication regimens for demo purposes

-- Lisa Thompson (low risk)
INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Sertraline', '50mg', '8:00 AM', 'regular', 'Dr. Sarah Mitchell'
FROM participants WHERE name = 'Lisa Thompson';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Vitamin D', '1000 IU', '8:00 AM', 'regular', 'Dr. Sarah Mitchell'
FROM participants WHERE name = 'Lisa Thompson';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Paracetamol', '500mg', 'As needed', 'prn', 'Dr. Sarah Mitchell'
FROM participants WHERE name = 'Lisa Thompson';

-- Update Lisa Thompson's conditions
UPDATE participants 
SET conditions = ARRAY['Mild anxiety disorder', 'Vitamin D deficiency', 'Seasonal allergies']
WHERE name = 'Lisa Thompson';

-- David Lee (medium risk)
INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Risperidone', '2mg', '8:00 AM', 'regular', 'Dr. James Chen'
FROM participants WHERE name = 'David Lee';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Risperidone', '1mg', '8:00 PM', 'regular', 'Dr. James Chen'
FROM participants WHERE name = 'David Lee';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Melatonin', '3mg', '9:00 PM', 'regular', 'Dr. James Chen'
FROM participants WHERE name = 'David Lee';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Lorazepam', '1mg', 'As needed for anxiety', 'prn', 'Dr. James Chen'
FROM participants WHERE name = 'David Lee';

-- Update David Lee's conditions
UPDATE participants 
SET conditions = ARRAY['Autism Spectrum Disorder', 'Insomnia', 'Generalized anxiety disorder', 'Sensory processing disorder']
WHERE name = 'David Lee';

-- Sarah Chen (high risk)
INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Sodium Valproate', '500mg', '8:00 AM', 'regular', 'Dr. Michael Roberts'
FROM participants WHERE name = 'Sarah Chen';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Sodium Valproate', '500mg', '8:00 PM', 'regular', 'Dr. Michael Roberts'
FROM participants WHERE name = 'Sarah Chen';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Quetiapine', '100mg', '9:00 PM', 'regular', 'Dr. Michael Roberts'
FROM participants WHERE name = 'Sarah Chen';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Diazepam', '5mg', 'As needed for seizures', 'prn', 'Dr. Michael Roberts'
FROM participants WHERE name = 'Sarah Chen';

-- Update Sarah Chen's conditions
UPDATE participants 
SET conditions = ARRAY['Epilepsy', 'Bipolar disorder', 'Type 2 diabetes', 'Hypertension']
WHERE name = 'Sarah Chen';

-- Michael Brown (medium risk)
INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Aripiprazole', '10mg', '8:00 AM', 'regular', 'Dr. Emily Watson'
FROM participants WHERE name = 'Michael Brown';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Metformin', '500mg', '8:00 AM', 'regular', 'Dr. Emily Watson'
FROM participants WHERE name = 'Michael Brown';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Metformin', '500mg', '6:00 PM', 'regular', 'Dr. Emily Watson'
FROM participants WHERE name = 'Michael Brown';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Ibuprofen', '400mg', 'As needed for pain', 'prn', 'Dr. Emily Watson'
FROM participants WHERE name = 'Michael Brown';

-- Update Michael Brown's conditions
UPDATE participants 
SET conditions = ARRAY['Schizophrenia', 'Type 2 diabetes', 'Chronic back pain', 'Mild intellectual disability']
WHERE name = 'Michael Brown';

-- Emma Wilson (low risk)
INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Fluoxetine', '20mg', '8:00 AM', 'regular', 'Dr. Lisa Anderson'
FROM participants WHERE name = 'Emma Wilson';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Omega-3', '1000mg', '8:00 AM', 'regular', 'Dr. Lisa Anderson'
FROM participants WHERE name = 'Emma Wilson';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Multivitamin', '1 tablet', '8:00 AM', 'regular', 'Dr. Lisa Anderson'
FROM participants WHERE name = 'Emma Wilson';

-- Update Emma Wilson's conditions
UPDATE participants 
SET conditions = ARRAY['Depression', 'ADHD', 'Lactose intolerance']
WHERE name = 'Emma Wilson';

-- James Mitchell (high risk)
INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Clozapine', '300mg', '8:00 AM', 'regular', 'Dr. Robert Kim'
FROM participants WHERE name = 'James Mitchell';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Clozapine', '200mg', '8:00 PM', 'regular', 'Dr. Robert Kim'
FROM participants WHERE name = 'James Mitchell';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Lithium', '600mg', '8:00 AM', 'regular', 'Dr. Robert Kim'
FROM participants WHERE name = 'James Mitchell';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Haloperidol', '5mg', 'As needed for agitation', 'prn', 'Dr. Robert Kim'
FROM participants WHERE name = 'James Mitchell';

INSERT INTO participant_medications (participant_id, name, dosage, time, type, prescriber) 
SELECT id, 'Benztropine', '1mg', '8:00 AM', 'regular', 'Dr. Robert Kim'
FROM participants WHERE name = 'James Mitchell';

-- Update James Mitchell's conditions
UPDATE participants 
SET conditions = ARRAY['Treatment-resistant schizophrenia', 'Bipolar disorder type 1', 'Tardive dyskinesia', 'Obesity', 'Sleep apnea']
WHERE name = 'James Mitchell';

-- Additional participants if they exist
-- Add medications for any other participants following similar patterns

-- Verify the updates
SELECT p.name, p.conditions, 
       array_agg(pm.name || ' - ' || pm.dosage || ' (' || pm.type || ')' ORDER BY pm.time) as medications
FROM participants p
LEFT JOIN participant_medications pm ON p.id = pm.participant_id
GROUP BY p.id, p.name, p.conditions
ORDER BY p.name;