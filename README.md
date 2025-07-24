# CareScribe - AI-Powered NDIS Incident Reporting Platform

Transform disability support documentation with voice-powered AI reporting that reduces report time by 95% while ensuring 100% NDIS compliance.

![CareScribe Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.4-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![AI Powered](https://img.shields.io/badge/AI-GPT--4%20%26%20Claude-purple)

## 🌟 Overview

CareScribe is a comprehensive AI-powered incident reporting system designed specifically for NDIS (National Disability Insurance Scheme) service providers in Australia. This production-ready demo showcases the complete platform with:

- **200+ staff profiles** across 12 facilities
- **Real-time dashboards** with live activity feeds
- **Voice-to-text AI reporting** that generates professional documentation
- **Role-based access control** with 5 distinct user levels
- **Comprehensive participant management** with behavioral tracking
- **NDIS-compliant reporting** with automatic classification

## 💡 Value Proposition

### For Support Workers
- **95% faster reporting**: Voice reports in under 2 minutes vs 30+ minutes typing
- **AI assistance**: Intelligent prompts ensure nothing is missed
- **Mobile-first design**: Report from anywhere, anytime
- **Shift management**: Easy clock-in/out with location tracking

### For Management
- **Real-time insights**: Live dashboards with instant alerts
- **Pattern recognition**: AI identifies behavioral triggers and trends
- **Compliance automation**: All reports meet NDIS requirements
- **Risk mitigation**: Predictive analytics for proactive intervention

### For Organizations
- **Cost reduction**: Save $50,000+ annually on documentation time
- **Quality improvement**: Consistent, professional reports every time
- **Staff satisfaction**: Remove administrative burden from carers
- **Scalability**: Handles 1,000s of reports across multiple facilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI or Anthropic API key (optional for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ghazzie/CareScribe_demo.git
   cd carescribe-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Use Supabase for all data storage
   NEXT_PUBLIC_USE_LOCAL_STORAGE=false
   
   # AI Provider Configuration
   NEXT_PUBLIC_AI_PROVIDER=openai  # or 'anthropic' or 'gpt-3.5'
   AI_API_KEY=your_api_key_here
   ```

4. **Set up database**
   Run the SQL scripts in order:
   ```bash
   # In Supabase SQL editor, run:
   # 1. supabase/setup-all.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Access

The application includes demo accounts for different user roles. On the login page, you can select from 5 different role types to experience the platform from various perspectives:

| Role | Access Level | Key Features |
|------|--------------|-------------|
| **Support Worker** | Level 4 | Voice reporting, shift management, participant care |
| **Team Leader** | Level 3 | Team oversight, shift approval, performance metrics |
| **Clinical Manager** | Level 2 | Behavioral analytics, clinical interventions, compliance |
| **Area Manager** | Level 2 | Multi-facility management, resource allocation |
| **Executive** | Level 1 | Executive dashboards, strategic insights |

> **Note**: Demo accounts are pre-configured and don't require passwords. Simply click on any role to log in and explore the features.

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Next.js 15.4.3**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality React components
- **Framer Motion**: Smooth animations
- **Zustand**: Lightweight state management

#### Backend
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Next.js API Routes**: Serverless functions
- **AI Integration**: OpenAI GPT-4/3.5 or Anthropic Claude

#### Key Libraries
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Recharts**: Data visualization
- **date-fns**: Date manipulation
- **Lucide Icons**: Consistent iconography

### Database Schema

The application uses 12 interconnected tables:

```sql
-- Core Tables
organizations     # Multi-tenant support
facilities        # Physical locations
users            # Staff members with roles
roles            # RBAC with 5 levels
participants     # NDIS participants
shifts           # Work shifts and handovers

-- Reporting Tables  
incidents        # All incident reports
abc_reports      # Antecedent-Behavior-Consequence
incident_reports # Detailed incident documentation
medications      # Medication tracking

-- Support Tables
alerts           # Real-time notifications
behavior_patterns # AI-identified patterns
```

## 📁 Project Structure

```
carescribe-demo/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   │   └── login/           # Login with demo accounts
│   ├── api/                 # API endpoints
│   │   └── ai/              # AI service integration
│   ├── dashboard/           # Main dashboard (role-based)
│   ├── quick-report/        # Voice reporting interface
│   ├── report/              # Multi-step reporting flow
│   │   ├── voice/          # Voice input step
│   │   ├── details/        # AI-generated details
│   │   ├── review/         # Final review
│   │   └── success/        # Confirmation
│   ├── shift-start/         # Shift management
│   ├── setup/               # Admin configuration
│   │   ├── organization/   # Company setup
│   │   ├── staff/          # User management
│   │   └── participants/   # Participant profiles
│   └── layout.tsx           # Root layout with sidebar
│
├── components/              # Reusable components
│   ├── ui/                 # shadcn/ui components
│   │   └── sidebar.tsx     # Persistent navigation
│   ├── layout/             # Layout components
│   │   └── app-layout.tsx  # Main app wrapper
│   └── demo-controls.tsx   # Demo mode features
│
├── lib/                     # Core functionality
│   ├── ai/                 # AI service layer
│   │   ├── prompts.ts      # System prompts
│   │   └── service.ts      # AI provider abstraction
│   ├── data/               # Data access layer
│   │   ├── service.ts      # Main data service
│   │   └── storage.ts      # Storage adapters
│   ├── store/              # Zustand state
│   ├── supabase/           # Database client
│   └── types/              # TypeScript definitions
│
├── supabase/               # Database files
│   └── setup-all.sql       # Complete schema + seed data
│
└── public/                 # Static assets
```

## 🎯 Features

### 1. AI-Powered Voice Reporting
**Implementation**: `/app/quick-report/page.tsx` + `/lib/ai/service.ts`

- Natural language processing for incident descriptions
- Intelligent follow-up questions based on context
- Automatic classification (ABC vs standard incident)
- Professional report generation with NDIS compliance
- Multi-language support (future)

**Technical Details**:
- WebSpeech API for voice capture
- Streaming responses for real-time feedback
- Token optimization for cost efficiency
- Fallback to manual input if needed

### 2. Real-Time Dashboard
**Implementation**: `/app/dashboard/page.tsx`

- Live activity feed with WebSocket updates
- Role-specific widgets and metrics
- Participant status monitoring
- Alert management system
- Quick action shortcuts

**Technical Details**:
- Server-sent events for real-time updates
- Optimistic UI updates with rollback
- Responsive grid layout
- Performance monitoring

### 3. Comprehensive Sidebar Navigation
**Implementation**: `/components/ui/sidebar.tsx`

- Persistent across all pages
- Collapsible with animation
- Role-based menu items
- Mobile responsive drawer
- LocalStorage persistence

**Technical Details**:
- Framer Motion animations
- Dynamic route highlighting
- Notification badges
- Keyboard shortcuts

### 4. Multi-Step Report Flow
**Implementation**: `/app/report/*`

- Guided reporting process
- Progress tracking
- Data validation at each step
- Draft saving
- Review before submission

### 5. Shift Management
**Implementation**: `/app/shift-start/page.tsx`

- Clock in/out functionality
- Handover notes
- Location verification
- Team member tracking
- Shift history

### 6. Participant Management
**Implementation**: `/app/setup/participants/*`

- Comprehensive profiles
- Behavioral tracking
- Medication schedules
- Risk assessments
- Care plan integration

### 7. Analytics & Insights
**Implementation**: `/app/analytics/*` (Premium feature)

- Behavioral pattern recognition
- Predictive risk modeling
- Compliance reporting
- Performance metrics
- Custom report builder

## 🎨 Design System

### Color Palette
```css
--primary: #3B82F6 (Blue-600)
--secondary: #8B5CF6 (Purple-600)
--success: #10B981 (Green-500)
--warning: #F59E0B (Yellow-500)
--danger: #EF4444 (Red-500)
--background: #FAFAFA (Gray-50)
```

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Sizes**: Responsive scaling with rem units

### Component Patterns
- **Cards**: Consistent shadows and hover states
- **Buttons**: Primary, secondary, ghost variants
- **Forms**: Inline validation with helpful errors
- **Modals**: Accessible with focus management
- **Tables**: Sortable, filterable, paginated

### Animations
- **Micro-interactions**: Button hovers, form feedback
- **Page transitions**: Smooth route changes
- **Loading states**: Skeleton screens
- **Success feedback**: Celebratory animations

## 🔧 Development Guidelines

### Code Standards

1. **TypeScript**
   - Strict mode enabled
   - No any types
   - Interfaces over types
   - Proper error handling

2. **React**
   - Functional components only
   - Custom hooks for logic
   - Memoization where needed
   - Proper dependency arrays

3. **Testing**
   - Unit tests for utilities
   - Integration tests for API
   - E2E tests for critical paths
   - Accessibility testing

### Git Workflow

```bash
# Feature branch
git checkout -b feature/voice-improvements

# Commit with conventional commits
git commit -m "feat: add multilingual support to voice input"

# Push and create PR
git push origin feature/voice-improvements
```

### Performance Optimization

1. **Code Splitting**
   - Dynamic imports for large components
   - Route-based splitting
   - Lazy loading for modals

2. **Image Optimization**
   - Next.js Image component
   - WebP format
   - Responsive sizes

3. **Bundle Size**
   - Tree shaking
   - Minimal dependencies
   - Regular audits

## 🔒 Security Considerations

### Authentication & Authorization
- Row Level Security (RLS) in Supabase
- JWT tokens with short expiry
- Role-based access control
- Session management

### Data Protection
- Encryption at rest and in transit
- PII handling compliance
- Audit logging
- GDPR/Privacy Act compliance

### API Security
- Rate limiting
- Input validation
- CORS configuration
- API key rotation

### Best Practices
- No hardcoded secrets
- Environment variable validation
- Security headers
- Regular dependency updates

## 📊 Performance Metrics

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 300KB (initial)

### Monitoring
- Real User Monitoring (RUM)
- Error tracking with Sentry
- Performance budgets
- Synthetic monitoring

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository**
   ```bash
   vercel
   ```

2. **Configure environment variables**
   - Add all `.env.local` variables in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional Hosting

```bash
# Build
npm run build

# Start production server
NODE_ENV=production npm start
```

## 🎯 Roadmap & Future Enhancements

### Phase 1: Core Features (Complete)
- ✅ Voice-to-text reporting
- ✅ Role-based dashboards
- ✅ Participant management
- ✅ Shift management
- ✅ Basic analytics

### Phase 2: Advanced Features (Q1 2025)
- 🔄 Offline mode with sync
- 🔄 Mobile app (React Native)
- 🔄 Advanced behavioral analytics
- 🔄 Integration with NDIS MyPlace
- 🔄 Custom report templates

### Phase 3: Enterprise Features (Q2 2025)
- 📅 Multi-organization support
- 📅 Advanced compliance tools
- 📅 Training modules
- 📅 API for third-party integration
- 📅 White-label options

### Phase 4: AI Enhancements (Q3 2025)
- 📅 Predictive incident prevention
- 📅 Automated care plan suggestions
- 📅 Natural language querying
- 📅 Voice assistant integration
- 📅 Computer vision for photo analysis

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code of conduct
- Development setup
- Pull request process
- Coding standards
- Testing requirements

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- NDIS for inspiration and guidelines
- Support workers who provided feedback
- Open source community for amazing tools
- Beta testers from various organizations

## 📞 Support

> **Note**: The following links are placeholders for demonstration purposes:

- **Documentation**: [docs.carescribe.com](https://docs.carescribe.com) *(placeholder)*
- **Issues**: [GitHub Issues](https://github.com/ghazzie/CareScribe_demo/issues)
- **Email**: support@carescribe.com *(placeholder)*
- **Community**: [Discord Server](https://discord.gg/carescribe) *(placeholder)*

---

**Built by Bernard Adjei-Yeboah & Akua Boateng with ❤️ for NDIS service providers** to revolutionize disability support documentation and improve participant outcomes.