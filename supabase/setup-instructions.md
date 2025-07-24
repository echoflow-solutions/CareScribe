# Supabase Setup Instructions

## Setting up the CareScribe Demo Database

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/ongxuvdbrraqnjnmaibv/sql/new

2. **Run the Schema Script**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to create all tables

3. **Run the Seed Data Scripts**
   - First, run `supabase/seed.sql` to create the organization, facilities, roles, and staff
   - Then, run `supabase/seed-participants.sql` to create participants and related data

4. **Verify the Setup**
   - Check that all tables are created in the Table Editor
   - Verify that data has been populated

## Quick SQL to Run Everything

If you want to run everything at once, copy and paste this into the SQL editor:

```sql
-- First run schema.sql content
-- Then run seed.sql content
-- Then run seed-participants.sql content
```

## Testing the Connection

After setup, the app should automatically connect to Supabase when you:
1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Use any of the demo accounts to login

## Demo Accounts Available

- **Support Worker**: sarah.johnson@sunshinesupport.com.au
- **Team Leader**: tom.anderson@sunshinesupport.com.au
- **Clinical Manager**: dr.kim@sunshinesupport.com.au
- **Area Manager**: lisa.park@sunshinesupport.com.au
- **CEO**: ceo@sunshinesupport.com.au

## Troubleshooting

If the app isn't connecting to Supabase:
1. Check that `NEXT_PUBLIC_USE_LOCAL_STORAGE` is set to `false` in `.env.local`
2. Verify your Supabase URL and anon key are correct
3. Check the browser console for any connection errors
4. Ensure the tables have been created successfully