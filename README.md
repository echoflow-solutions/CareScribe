# CareScribe - AI-Powered NDIS Incident Reporting

Transform disability support documentation with voice-powered AI reporting that reduces report time by 95% while ensuring 100% NDIS compliance.

![CareScribe Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.4-black)

A comprehensive demonstration of CareScribe, an AI-powered incident reporting system designed for NDIS service providers. This demo showcases the complete user journey from login through incident reporting with realistic data for 200+ staff members across 12 facilities.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Accounts

Click any demo account on the login page (no password required):

- **Support Worker**: sarah.johnson@sunshinesupport.com.au
- **Team Leader**: tom.anderson@sunshinesupport.com.au  
- **Clinical Manager**: dr.kim@sunshinesupport.com.au
- **Area Manager**: lisa.park@sunshinesupport.com.au
- **CEO**: ceo@sunshinesupport.com.au

## 🎯 Key Features

### 🎤 Voice-First AI Reporting
- **Natural Language Processing**: Speak naturally about incidents
- **AI-Powered Conversations**: Intelligent follow-up questions
- **Automatic Report Generation**: Professional NDIS-compliant reports
- **Smart Classification**: ABC vs Incident reports auto-determined

### 🤖 AI Integration (NEW!)
- **Multiple AI Providers**: OpenAI GPT-4, GPT-3.5, or Anthropic Claude
- **Context-Aware Responses**: AI understands incident context
- **Professional Documentation**: Generates complete, structured reports
- **Cost-Effective**: Reports cost cents, not dollars

### 📊 Intelligent Analytics
- **Pattern Recognition**: Identify behavioral triggers
- **Risk Prediction**: AI-powered risk assessment
- **Real-time Alerts**: Immediate escalation for critical incidents
- **Trend Analysis**: Track incidents across time and participants

### 👥 Role-Based Experience
- **Support Worker**: Quick reporting, participant status
- **Team Leader**: Team oversight, shift management
- **Clinical Manager**: Behavioral analytics, intervention tracking
- **Area Manager**: Multi-facility insights
- **Executive**: Strategic overview, compliance monitoring

### 📱 Complete Feature Set
- 200+ staff profiles across 12 facilities
- Comprehensive participant behavior patterns
- Medication tracking and PRN monitoring
- Historical incident analysis
- Real-time data synchronization

## 🗄️ Database

This demo uses **Supabase** for data persistence with:
- 12 interconnected tables
- Realistic organizational structure
- Comprehensive seed data
- Real-time data synchronization

## 🛠️ Tech Stack

- **Next.js 15.4** - Latest React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Supabase** - Database & backend
- **Framer Motion** - Animations
- **Zustand** - State management
- **OpenAI/Anthropic** - AI integration
- **Recharts** - Data visualization

## 📁 Project Structure

```
carescribe-demo/
├── app/                    # Next.js app directory
│   ├── api/              # API routes
│   │   └── ai/          # AI service endpoints
│   ├── dashboard/        # Main dashboard
│   ├── login/           # Authentication
│   ├── quick-report/    # Voice reporting start
│   ├── report/          # Multi-step reporting flow
│   └── setup/           # Admin setup flows
├── components/           # Reusable components
├── lib/                  # Utilities and services
│   ├── ai/              # AI configuration & service
│   ├── data/            # Data service layer
│   ├── supabase/        # Supabase integration
│   └── types/           # TypeScript definitions
└── supabase/            # Database schemas
```

## 🎮 Demo Scenarios

1. **AI-Powered Quick Report**: 
   - Click "Quick Report" and describe an incident
   - AI asks intelligent follow-up questions
   - Review the professionally generated report

2. **Voice Reporting**:
   - Use the microphone button for natural speech
   - AI transcribes and understands context
   - Automatic incident classification

3. **Pattern Recognition**:
   - Report matches trigger real-time alerts
   - Historical patterns inform risk assessment
   - Proactive intervention suggestions

4. **Complete Workflow**:
   - Shift handover with AI summaries
   - Medication tracking and PRN monitoring
   - Multi-level approval routing

## 🔧 Development

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🤖 AI Configuration

### Setting Up AI Features

1. **Choose your AI provider** in `.env.local`:
   ```env
   NEXT_PUBLIC_AI_PROVIDER=openai  # or 'anthropic' or 'gpt-3.5'
   AI_API_KEY=your_api_key_here
   ```

2. **Get API Keys**:
   - **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)

3. **Cost Estimates**:
   - GPT-4: ~$0.03-0.06 per report
   - GPT-3.5: ~$0.002-0.004 per report
   - Claude 3: ~$0.015-0.03 per report

See [AI_SETUP.md](./AI_SETUP.md) for detailed instructions.

## 📝 Important Notes

- All participant data is demonstration data only
- Voice recording is simulated in demo mode
- AI responses are real when API key is configured
- Notifications and alerts are for demonstration purposes

## 🚦 Environment Variables

```env
# AI Configuration
NEXT_PUBLIC_AI_PROVIDER=openai
AI_API_KEY=your_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔒 Security

- API keys are never exposed to the client
- All AI requests go through secure server-side routes
- Bank-level encryption for sensitive data
- HIPAA-compliant infrastructure ready

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

---

Built with ❤️ for NDIS service providers to streamline incident reporting and improve participant care.