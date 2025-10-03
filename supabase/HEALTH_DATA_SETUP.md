# Setting Up Health Data for Participants

## Overview
This SQL script populates realistic health data (medications and conditions) for all participants in your CareScribe demo.

## How to Apply This Data

1. **Open your Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the Health Data Script**
   - Open the file `supabase/add-health-conditions.sql`
   - Copy the entire contents
   - Paste into the Supabase SQL Editor
   - Click "Run"

3. **Verify the Data**
   - The script will show a verification query at the end
   - You should see all participants with their medications and conditions listed

## What This Script Does

1. **Adds Conditions Column**: Creates a `conditions` array column on the participants table if it doesn't exist
2. **Populates Medications**: Adds realistic medication regimens for each participant
3. **Populates Health Conditions**: Adds appropriate health conditions based on each participant's risk level

## Health Data Added

### Lisa Thompson (Low Risk)
- **Medications**: Sertraline, Vitamin D, Paracetamol (PRN)
- **Conditions**: Mild anxiety disorder, Vitamin D deficiency, Seasonal allergies

### David Lee (Medium Risk)
- **Medications**: Risperidone (twice daily), Melatonin, Lorazepam (PRN)
- **Conditions**: Autism Spectrum Disorder, Insomnia, Generalized anxiety disorder, Sensory processing disorder

### Sarah Chen (High Risk)
- **Medications**: Sodium Valproate (twice daily), Quetiapine, Diazepam (PRN)
- **Conditions**: Epilepsy, Bipolar disorder, Type 2 diabetes, Hypertension

### Michael Brown (Medium Risk)
- **Medications**: Aripiprazole, Metformin (twice daily), Ibuprofen (PRN)
- **Conditions**: Schizophrenia, Type 2 diabetes, Chronic back pain, Mild intellectual disability

### Emma Wilson (Low Risk)
- **Medications**: Fluoxetine, Omega-3, Multivitamin
- **Conditions**: Depression, ADHD, Lactose intolerance

### James Mitchell (High Risk)
- **Medications**: Clozapine (twice daily), Lithium, Haloperidol (PRN), Benztropine
- **Conditions**: Treatment-resistant schizophrenia, Bipolar disorder type 1, Tardive dyskinesia, Obesity, Sleep apnea

## Important Notes

- All medications and conditions are realistic but fictional for demo purposes
- PRN medications are marked as "As needed" in the time field
- Each medication includes a prescriber name for authenticity
- The data aligns with each participant's risk level