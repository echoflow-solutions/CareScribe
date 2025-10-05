# Loading Comprehensive Participant Data

## 🎯 Overview

This guide will help you load **28 comprehensive, realistic participants** into your Supabase database, complete with:

- ✅ **Detailed profiles** (age, NDIS number, date of birth)
- ✅ **Risk level distribution** (High, Medium, Low across all facilities)
- ✅ **Comprehensive support plans** (strategies, preferences, goals)
- ✅ **Behavior patterns** (triggers, interventions, frequency)
- ✅ **Medication schedules** (regular and PRN medications)
- ✅ **Emergency contacts** (multiple contacts per participant)

## 📊 Data Distribution

### House 3 (Main Demo) - 12 Participants
- **3 High Risk**: James Mitchell, Marcus Thompson, Aisha Patel
- **4 Medium Risk**: Michael Brown, Sophie Martinez, Daniel Kim, Isabella Nguyen
- **5 Low Risk**: Sarah Chen, Emma Wilson, David Lee, Lisa Thompson, Ryan O'Connor

### House 1 (Riverside) - 8 Participants
- **2 High Risk**: Jessica Martinez, Benjamin Harris
- **3 Medium Risk**: Thomas Anderson, Olivia Davis, Mason Rodriguez
- **3 Low Risk**: William Taylor, Sophia Clark, Isabella White

### House 2 (Parkview) - 8 Participants
- **1 High Risk**: Ethan Williams
- **4 Medium Risk**: Charlotte Smith, Noah Baker, Amelia Johnson, Liam Carter
- **3 Low Risk**: Mia Garcia, Harper Davis, Logan Young

## 🚀 Quick Load Instructions

### Method 1: Supabase SQL Editor (RECOMMENDED)

1. **Open Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Navigate to SQL Editor**
   - Click on your project
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Load the SQL File**
   - Open the file: `supabase/seed-comprehensive-participants.sql`
   - Copy ALL contents
   - Paste into the SQL Editor

4. **Execute**
   - Click "Run" button
   - Wait for confirmation (should take ~5-10 seconds)

5. **Verify**
   ```sql
   SELECT risk_level, COUNT(*) as count
   FROM participants
   WHERE facility_id = '650e8400-e29b-41d4-a716-446655440003'
   GROUP BY risk_level;
   ```

   Expected output:
   ```
   high   | 3
   medium | 4
   low    | 5
   ```

### Method 2: Command Line (psql)

If you have `psql` installed:

```bash
# Set your Supabase connection string
export DB_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-ID].supabase.co:5432/postgres"

# Run the SQL file
psql $DB_URL < supabase/seed-comprehensive-participants.sql
```

## ✨ What Gets Created

### 1. Participants
Each participant includes:
- Full name, date of birth, age
- NDIS number
- Risk level and current status
- Current location
- Emergency contact details

### 2. Support Plans
Comprehensive support strategies including:
- Detailed intervention strategies
- Personal preferences
- Care goals and objectives
- Emergency protocols

### 3. Behavior Patterns
Detailed tracking of:
- Specific triggers
- Behavioral responses
- Frequency and timing
- Successful interventions
- Time of day patterns

### 4. Medications
Complete medication schedules:
- Regular medications with exact times
- PRN (as needed) medications
- Dosages and prescribing doctors
- Medication types

## 🎨 Featured Participants

### James Mitchell (High Risk)
- **Age**: 30
- **Risk**: Sensory Processing Disorder
- **Triggers**: Loud noises, routine changes, crowded spaces
- **Medications**: Risperidone (2mg 2x/day), Lorazepam (PRN), Melatonin
- **Support**: Visual schedules, weighted blanket, noise-cancelling headphones

### Sarah Chen (Low Risk)
- **Age**: 27
- **Focus**: Independent living skills
- **Interests**: Gardening, cooking, community engagement
- **Goals**: Certificate II in Kitchen Operations, budgeting skills

### Marcus Thompson (High Risk)
- **Age**: 33
- **Focus**: Behavioral support
- **Interests**: Boxing, basketball, woodwork
- **Interventions**: De-escalation techniques, physical activities

## 🔍 Verification Queries

After loading, run these to verify data:

```sql
-- Total participants by facility
SELECT f.name, COUNT(p.id) as participant_count
FROM participants p
JOIN facilities f ON p.facility_id = f.id
GROUP BY f.name;

-- Participants with medications
SELECT p.name, COUNT(m.id) as medication_count
FROM participants p
LEFT JOIN participant_medications m ON p.id = m.participant_id
GROUP BY p.name
ORDER BY medication_count DESC;

-- Behavior patterns summary
SELECT p.name, COUNT(bp.id) as pattern_count
FROM participants p
LEFT JOIN participant_behavior_patterns bp ON p.id = bp.participant_id
GROUP BY p.name
HAVING COUNT(bp.id) > 0;
```

## 🐛 Troubleshooting

### Issue: "relation does not exist"
**Solution**: Run the schema creation first:
```bash
psql $DB_URL < supabase/schema.sql
psql $DB_URL < supabase/seed-comprehensive-participants.sql
```

### Issue: "duplicate key value"
**Solution**: The SQL file includes TRUNCATE commands. If you get errors:
1. Comment out the TRUNCATE lines (lines 8-9)
2. Manually delete existing participants in Supabase dashboard
3. Re-run the file

### Issue: "permission denied"
**Solution**: Make sure you're using the correct service key with sufficient permissions

## 📞 Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Verify facility IDs match your setup
3. Ensure all tables exist (participants, participant_support_plans, etc.)

## 🎉 Next Steps

After loading the data:

1. **Refresh your app** - Reload the Participants page
2. **Test filtering** - Try filtering by risk level and facility
3. **Explore participants** - Click on different participants to see their details
4. **View comprehensive data** - Check support plans, medications, behavior patterns

---

**Note**: This is demo/test data. For production, replace with actual participant information following NDIS privacy and compliance requirements.
