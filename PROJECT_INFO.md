# CareScribe Project Quick Reference

## 📊 Project Overview
- **Name**: CareScribe
- **Purpose**: AI-powered NDIS incident reporting system
- **Tech Stack**: Next.js 15.4.3, TypeScript, Supabase, OpenAI GPT-4o
- **Status**: In active development

## 🔗 Supabase Connection
- **Project**: CareScribe_demo
- **Project Ref**: `ongxuvdbrraqnjnmaibv`
- **URL**: `https://ongxuvdbrraqnjnmaibv.supabase.co`
- **Status**: ✅ Connected and working

## 📁 Key Files
- `.env.local` - Environment variables (Supabase credentials, OpenAI API key)
- `CLAUDE.md` - Instructions for AI assistant
- `DATABASE_STATUS.md` - Complete database documentation
- `lib/supabase/client.ts` - Supabase client configuration
- `lib/ai/config.ts` - AI provider configuration (GPT-4o)

## 🗄️ Database Tables (All Exist)
✅ users, facilities, participants, draft_reports, incidents, alerts, badges_achievements, daily_briefings, fatigue_monitoring, help_requests, location_beacons, medication_*, notification_preferences, user_clock_status

## 🚀 Development Server
- **Port**: 3000
- **Command**: `npm run dev`
- **URL**: http://localhost:3000

## 🎯 Recent Features Implemented
1. ✅ AI-Guided Incident Report (GPT-4o powered)
2. ✅ Adaptive progress indicators (answer quality-based)
3. ✅ NDIS compliance scoring (real-time calculation)
4. ✅ Early finish option with color-coded compliance (red/orange/yellow/green)
5. ✅ Draft auto-save with localStorage fallback
6. ✅ Close confirmation dialog

## ⚙️ Configuration
- AI Model: GPT-4o (upgraded from GPT-4 Turbo)
- Storage Mode: Supabase (localStorage fallback enabled)
- Rate Limiting: 20 requests/minute per client
- Request Timeout: 30 seconds

## 🔑 Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ongxuvdbrraqnjnmaibv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[present]
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
NEXT_PUBLIC_AI_PROVIDER=openai
AI_API_KEY=[present]
```

## 📝 Known Issues
- ⚠️ draft_reports table needs permissions for `anon` role
- 🔧 Fix available: Run `SIMPLE_FIX_PERMISSIONS.sql` in Supabase
- ✅ Workaround active: LocalStorage fallback working

## 🎨 UI Features
- Color-coded NDIS compliance scoring
- Intelligent completion detection
- Edit capability for all answers
- Multiple completion paths
- Real-time progress tracking

## 🔐 Security Notes
- Row Level Security (RLS) disabled on draft_reports (unrestricted)
- Anon key used for API access
- User isolation at database level (foreign key constraints)

## 📚 Documentation
- `DATABASE_STATUS.md` - Database schema and status
- `CLAUDE.md` - AI assistant instructions
- `SIMPLE_FIX_PERMISSIONS.sql` - Database permissions fix
- `supabase/migrations/` - All database migrations

## 🆘 Quick Troubleshooting
1. **Database errors**: Check `DATABASE_STATUS.md` → Run permissions fix
2. **Server not starting**: Kill port 3000, restart with `npm run dev`
3. **API errors**: Check `.env.local` has all required variables
4. **Build errors**: Run `npm run lint` and fix TypeScript errors
