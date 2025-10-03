'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase/client'
import { 
  Mic, Shield, Brain, Clock, Users, BarChart3, 
  ArrowRight, Play, Sparkles, FileText, AlertCircle,
  CheckCircle, Zap, Globe, Headphones, Lock, TrendingUp,
  MessageSquare, Calendar, Bell, Camera, Settings, Menu,
  X, ChevronDown, Star, Award, Target, Layers, Building2,
  Phone, Mail, UserCircle
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    company_name: '',
    company_size: '',
    state: '',
    current_solution: '',
    how_heard: ''
  })
  
  // Separate state for optional survey data to prevent it from being cleared
  const [surveyData, setSurveyData] = useState({
    email: '',
    role: '',
    company_name: '',
    company_size: '',
    state: '',
    current_solution: '',
    how_heard: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showOptionalSurvey, setShowOptionalSurvey] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [userPosition, setUserPosition] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { scrollY } = useScroll()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95])

  // Email validation function
  const validateEmail = (email: string) => {
    // Basic email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email) {
      setEmailError('')
      return false
    }
    
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address (e.g., name@company.com)')
      return false
    }
    
    // Additional checks
    const parts = email.split('@')
    if (parts.length !== 2) {
      setEmailError('Email must contain exactly one @ symbol')
      return false
    }
    
    const [localPart, domain] = parts
    
    // Check local part
    if (localPart.length === 0) {
      setEmailError('Email username cannot be empty')
      return false
    }
    
    // Check domain
    const domainParts = domain.split('.')
    if (domainParts.length < 2) {
      setEmailError('Please include a domain extension (e.g., .com, .org)')
      return false
    }
    
    if (domainParts.some(part => part.length === 0)) {
      setEmailError('Invalid domain format')
      return false
    }
    
    // Check for common typos
    const commonDomains = ['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'protonmail']
    const domainName = domainParts[0].toLowerCase()
    const suggestions: { [key: string]: string } = {
      'gmial': 'gmail',
      'gmai': 'gmail',
      'gmil': 'gmail',
      'yahooo': 'yahoo',
      'yaho': 'yahoo',
      'hotmial': 'hotmail',
      'hotmai': 'hotmail',
      'outlok': 'outlook',
      'outloo': 'outlook'
    }
    
    if (suggestions[domainName]) {
      setEmailError(`Did you mean ${suggestions[domainName]}.com?`)
      return false
    }
    
    setEmailError('')
    return true
  }

  const features = [
    {
      icon: Mic,
      title: "Voice-First Reporting",
      description: "Natural conversation captures incidents in under 3 minutes",
      color: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Brain,
      title: "AI Intelligence",
      description: "Automatically determines ABC vs Incident report types",
      color: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Clock,
      title: "Save 22 Minutes",
      description: "Per report compared to traditional documentation",
      color: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Shield,
      title: "NDIS Compliant",
      description: "Meets all regulatory requirements automatically",
      color: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      icon: Users,
      title: "Smart Routing",
      description: "Reports reach the right people instantly",
      color: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: BarChart3,
      title: "Pattern Recognition",
      description: "Predict and prevent incidents before they occur",
      color: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ]

  const extendedFeatures = [
    {
      category: "Intelligent Reporting",
      items: [
        { icon: MessageSquare, title: "Conversational AI", desc: "Natural language processing understands context" },
        { icon: Zap, title: "Instant Classification", desc: "ABC vs Incident reports auto-determined" },
        { icon: FileText, title: "Auto-Documentation", desc: "Complete reports generated from voice" },
        { icon: CheckCircle, title: "Compliance Check", desc: "Ensures NDIS requirements are met" }
      ]
    },
    {
      category: "Workflow Automation",
      items: [
        { icon: TrendingUp, title: "Smart Escalation", desc: "Critical incidents routed immediately" },
        { icon: Bell, title: "Real-time Alerts", desc: "Instant notifications to relevant staff" },
        { icon: Calendar, title: "Follow-up Scheduling", desc: "Automated reminders and tasks" },
        { icon: Layers, title: "Multi-level Review", desc: "Hierarchical approval workflows" }
      ]
    },
    {
      category: "Analytics & Insights",
      items: [
        { icon: BarChart3, title: "Trend Analysis", desc: "Identify patterns across incidents" },
        { icon: Target, title: "Risk Prediction", desc: "AI-powered risk assessment" },
        { icon: Award, title: "Performance Metrics", desc: "Staff and facility performance tracking" },
        { icon: Globe, title: "Compliance Dashboard", desc: "Real-time regulatory compliance status" }
      ]
    },
    {
      category: "Security & Support",
      items: [
        { icon: Lock, title: "Enterprise Security", desc: "Bank-level encryption and data protection" },
        { icon: Headphones, title: "24/7 Support", desc: "Dedicated support team available" },
        { icon: Camera, title: "Media Attachments", desc: "Photo and video evidence support" },
        { icon: Settings, title: "Custom Workflows", desc: "Tailored to your organization's needs" }
      ]
    }
  ]

  const stats = [
    { value: "95%", label: "Time Reduction", desc: "In report completion" },
    { value: "100%", label: "NDIS Compliant", desc: "Meeting all requirements" },
    { value: "3min", label: "Average Report Time", desc: "From incident to submission" },
    { value: "24/7", label: "Always Available", desc: "Report anytime, anywhere" }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Only validate email if user has attempted to submit
    if (field === 'email' && hasAttemptedSubmit) {
      validateEmail(value)
    }
  }
  
  // Separate handler for survey inputs
  const handleSurveyInputChange = (field: string, value: any) => {
    setSurveyData(prev => ({ ...prev, [field]: value }))
  }


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasAttemptedSubmit(true)
    
    // Validate email before submission
    if (!validateEmail(formData.email)) {
      return
    }
    
    setIsSubmitting(true)

    try {
      if (!supabase) {
        // For demo purposes, just show success when no Supabase
        setSubmittedEmail(formData.email) // Store email before showing survey
        setShowOptionalSurvey(true)
        setEmailError('')
        setUserPosition(Math.floor(Math.random() * 200) + 50)
      } else {
        const { error } = await supabase
          .from('waitlist')
          .insert([{ email: formData.email }])

        if (error) {
          console.error('Error adding to waitlist:', error)
          
          if (error.code === '23505') {
            alert('Great! You\'re already on the waitlist. We\'ll be in touch soon!')
          } else if (error.code === '42703') {
            // Column does not exist error
            console.error('Database schema error: The waitlist table structure is incorrect')
            alert('Database configuration error: The waitlist table is missing required columns. Please run the database migration.')
          } else if (error.code === '42501') {
            // Permission denied error
            alert('Permission error: Unable to access the waitlist. Please check database permissions.')
          } else {
            alert(`Error: ${error.message || 'Unknown error occurred'}. Please try again.`)
          }
        } else {
          setSubmittedEmail(formData.email) // Store the email for later use
          setEmailError('')
          setUserPosition(Math.floor(Math.random() * 200) + 50)
          
          // Add a small delay to ensure the insert is fully committed
          setTimeout(() => {
            // Pre-populate the email in survey data
            setSurveyData(prev => ({ ...prev, email: formData.email }))
            setShowOptionalSurvey(true)
          }, 1000) // 1 second delay
        }
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOptionalSurvey = async () => {
    setIsSubmitting(true)
    
    
    try {
      if (supabase && surveyData.email) {
        // Insert survey data into the new survey_responses table
        const surveyRecord = {
          email: surveyData.email,
          company_name: surveyData.company_name || null,
          role: surveyData.role || null,
          company_size: surveyData.company_size || null,
          state: surveyData.state || null,
          current_solution: surveyData.current_solution || null,
          how_heard: surveyData.how_heard || null
        }
        
        
        const { data, error } = await supabase
          .from('survey_responses')
          .insert([surveyRecord])
          .select()
        
        if (error) {
          console.error('Error saving survey response:', error)
          
          // Check for specific database errors
          if (error.code === '42P01') {
            // Table does not exist
            alert('The survey responses table does not exist yet. Please run the CREATE_SURVEY_TABLE.sql migration in Supabase.')
          } else if (error.code === '42703') {
            // Column does not exist error
            alert('Database configuration error: The survey_responses table is missing columns. Please check the migration.')
          } else if (error.code === '42501') {
            // Permission denied error
            alert('Permission error: Unable to save survey response. Please check database permissions.')
          } else {
            // Generic error
            alert(`Error saving your information: ${error.message || 'Unknown error'}. Please try again.`)
          }
        } else {
          setShowSuccess(true)
          setShowOptionalSurvey(false)
          
          // Reset form after successful submission
          setTimeout(() => {
            setFormData({
              email: '',
              role: '',
              company_name: '',
              company_size: '',
              state: '',
              current_solution: '',
              how_heard: ''
            })
            setSurveyData({
              email: '',
              role: '',
              company_name: '',
              company_size: '',
              state: '',
              current_solution: '',
              how_heard: ''
            })
            setShowSuccess(false)
            setHasAttemptedSubmit(false)
            setSubmittedEmail('')
          }, 5000)
        }
      } else {
        // Demo mode or missing email
        if (!surveyData.email) {
          console.error('Missing email in survey data')
          alert('Please enter your email address.')
        } else {
          // Demo mode
          setShowSuccess(true)
          setShowOptionalSurvey(false)
          
          setTimeout(() => {
            setFormData({
              email: '',
              role: '',
              company_name: '',
              company_size: '',
              state: '',
              current_solution: '',
              how_heard: ''
            })
            setSurveyData({
              email: '',
              role: '',
              company_name: '',
              company_size: '',
              state: '',
              current_solution: '',
              how_heard: ''
            })
            setShowSuccess(false)
            setHasAttemptedSubmit(false)
            setSubmittedEmail('')
          }, 5000)
        }
      }
    } catch (err) {
      console.error('Error in handleOptionalSurvey:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const skipSurvey = () => {
    setShowSuccess(true)
    setShowOptionalSurvey(false)
    
    // Reset form
    setTimeout(() => {
      setFormData({
        email: '',
        role: '',
        company_name: '',
        company_size: '',
        state: '',
        current_solution: '',
        how_heard: ''
      })
      setSurveyData({
        email: '',
        role: '',
        company_name: '',
        company_size: '',
        state: '',
        current_solution: '',
        how_heard: ''
      })
      setShowSuccess(false)
      setHasAttemptedSubmit(false)
      setSubmittedEmail('') // Also reset the submitted email
    }, 5000)
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fixed Header */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 md:w-20 sm:h-16 md:h-20 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 md:w-14 sm:h-10 md:h-14 text-white" />
            </div>
            <span className="font-bold text-2xl sm:text-4xl md:text-6xl">CareScribe</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </button>
            <button onClick={() => scrollToSection('benefits')} className="text-sm font-medium hover:text-primary transition-colors">
              Benefits
            </button>
            <Button size="sm" onClick={() => router.push('/login')}>
              Try Demo
            </Button>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-6 py-4 space-y-4">
              <button onClick={() => scrollToSection('features')} className="block text-sm font-medium">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="block text-sm font-medium">
                How It Works
              </button>
              <button onClick={() => scrollToSection('benefits')} className="block text-sm font-medium">
                Benefits
              </button>
              <Button size="sm" className="w-full" onClick={() => router.push('/login')}>
                Try Demo
              </Button>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section with CareScribe Branding */}
      <section className="relative overflow-hidden px-6 pt-32 pb-24 sm:pt-40 sm:pb-32 lg:px-8">
        <motion.div
          style={{ scale: heroScale }}
          className="mx-auto max-w-7xl"
        >
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 sm:gap-4 md:gap-6 mb-3">
              <motion.div 
                className="w-16 h-16 sm:w-20 md:w-24 sm:h-20 md:h-24 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
              >
                <Sparkles className="w-10 h-10 sm:w-12 md:w-16 sm:h-12 md:h-16 text-white" />
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CareScribe
              </h1>
            </div>
            <div className="flex justify-center -mt-2">
              <Badge className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg" variant="secondary">
                <Star className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                <span className="whitespace-nowrap">The Future of NDIS Incident Reporting</span>
              </Badge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6">
              Transform Disability Support
              <span className="block text-primary mt-1 sm:mt-2">With AI-Powered Voice</span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl leading-7 sm:leading-8 text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
              Say goodbye to paperwork. CareScribe uses advanced AI to convert 
              spoken words into comprehensive, compliant incident reports in minutes.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm font-semibold text-gray-900">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.desc}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="group w-full sm:w-auto"
                onClick={() => router.push('/login')}
              >
                <Zap className="mr-2 h-5 w-5" />
                Try Demo Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => scrollToSection('waitlist')}
              >
                Join Waitlist
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ 
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{ 
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, delay: 5 }}
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">How CareScribe Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform incident reporting
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Speak Naturally",
                description: "Describe the incident in your own words. Our AI understands context and nuance.",
                icon: Mic,
                color: "bg-blue-500"
              },
              {
                step: "2",
                title: "AI Processes",
                description: "Advanced AI classifies, structures, and ensures compliance automatically.",
                icon: Brain,
                color: "bg-purple-500"
              },
              {
                step: "3",
                title: "Review & Submit",
                description: "Review the generated report, make any edits, and submit with confidence.",
                icon: CheckCircle,
                color: "bg-green-500"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="text-6xl font-bold text-gray-100 absolute top-0 left-1/2 -translate-x-1/2 -z-10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <div className="border-t-2 border-dashed border-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to revolutionize incident reporting
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Extended Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Complete Feature Set</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive solution designed for modern disability support providers
            </p>
          </motion.div>

          <div className="space-y-16">
            {extendedFeatures.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.2 }}
              >
                <h3 className="text-2xl font-semibold mb-8 text-center text-primary">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.items.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group cursor-pointer"
                    >
                      <div className="p-6 rounded-xl bg-gray-50 hover:bg-primary/5 transition-all duration-300">
                        <item.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose CareScribe?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join the revolution in disability support documentation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                { title: "Save Time", desc: "Reduce reporting time by 95%" },
                { title: "Improve Accuracy", desc: "AI ensures nothing is missed" },
                { title: "Ensure Compliance", desc: "Always meet NDIS requirements" },
                { title: "Empower Staff", desc: "Focus on care, not paperwork" },
                { title: "Better Outcomes", desc: "Faster response to incidents" }
              ].map((benefit, index) => (
                <div key={benefit.title} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{benefit.title}</h4>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-purple-100 border-none">
                <h3 className="text-2xl font-bold mb-6">See CareScribe in Action</h3>
                <p className="text-gray-700 mb-6">
                  Experience how our AI transforms a 3-minute conversation into a 
                  comprehensive, compliant incident report.
                </p>
                <Button 
                  size="lg" 
                  className="w-full group"
                  onClick={() => router.push('/login')}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Try Interactive Demo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Card>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-6 py-2" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Trusted by Care Providers
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Care Providers Need This Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industry professionals share why they need a better incident reporting system
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-6"
                animate={{
                  x: ["0%", "-50%"],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 30,
                    ease: "linear",
                  },
                }}
              >
                {/* Testimonial Cards - Duplicated for seamless loop */}
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-6 flex-nowrap">
                    {/* Testimonial 1 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        "We're currently drowning in paper forms. Each incident report takes us 30-40 minutes to complete. We desperately need a voice-based solution like CareScribe that could cut this down to just minutes and ensure nothing gets missed."
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          MR
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">Maria Reyes</p>
                          <p className="text-sm text-gray-600">Support Coordinator</p>
                        </div>
                      </div>
                    </Card>

                    {/* Testimonial 2 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        "Our current software is so complicated that staff avoid using it. We need something intuitive like CareScribe where they can just speak naturally and have AI handle the complexity. This would transform our compliance rates."
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          RS
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">Rajesh Sharma</p>
                          <p className="text-sm text-gray-600">SIL Home Manager</p>
                        </div>
                      </div>
                    </Card>

                    {/* Testimonial 3 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        "I spend more time on paperwork than with participants. A voice-to-text system that understands disability support context would give us back hours every week. We need CareScribe to focus on what really matters - our clients."
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          JD
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">Jennifer De La Cruz</p>
                          <p className="text-sm text-gray-600">Support Worker</p>
                        </div>
                      </div>
                    </Card>

                    {/* Testimonial 4 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        "Critical incidents often go unreported because the process is too cumbersome. We need a solution like CareScribe that makes reporting as easy as having a conversation. Automated escalation would be a game-changer for participant safety."
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          DM
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">Deepika Mehta</p>
                          <p className="text-sm text-gray-600">Operations Manager</p>
                        </div>
                      </div>
                    </Card>

                    {/* Testimonial 5 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        {`We're still using paper forms in ${new Date().getFullYear()}! Field workers struggle to complete reports on time. A voice-based AI system would revolutionize how we document incidents. We need this technology yesterday.`}
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          RC
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">Roberto Cruz</p>
                          <p className="text-sm text-gray-600">Team Leader</p>
                        </div>
                      </div>
                    </Card>

                    {/* Testimonial 6 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        "Managing multiple SIL homes means drowning in incident reports. We urgently need an AI-powered system that can intelligently categorize ABC vs regular incidents and ensure NDIS compliance automatically."
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          PS
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">Priya Singh</p>
                          <p className="text-sm text-gray-600">Area Manager</p>
                        </div>
                      </div>
                    </Card>

                    {/* Testimonial 7 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        "Our night shift staff struggle with lengthy forms after incidents. A voice recording system that converts to proper reports would be invaluable. We need CareScribe to ensure 24/7 quality documentation."
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          GV
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">Grace Villanueva</p>
                          <p className="text-sm text-gray-600">Night Shift Supervisor</p>
                        </div>
                      </div>
                    </Card>

                    {/* Testimonial 8 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        "Incident patterns are invisible in our paper system. We desperately need analytics to prevent future incidents. CareScribe's AI-powered insights would help us provide safer, better care for our participants."
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          DK
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">David Kumar</p>
                          <p className="text-sm text-gray-600">Quality & Compliance Manager</p>
                        </div>
                      </div>
                    </Card>

                    {/* Testimonial 9 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        "Training new staff on our complex reporting system takes weeks. We need something intuitive like CareScribe where they can start reporting incidents effectively from day one. Voice input would eliminate the learning curve."
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          AS
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">Angela Santos</p>
                          <p className="text-sm text-gray-600">Training Coordinator</p>
                        </div>
                      </div>
                    </Card>

                    {/* Testimonial 10 */}
                    <Card className="min-w-[400px] p-8 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start mb-4">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <blockquote className="text-gray-700 mb-6 text-lg italic">
                        "Follow-ups fall through the cracks with our manual system. We need automated reminders and task assignments. CareScribe would ensure every incident gets proper resolution and nothing is forgotten."
                      </blockquote>
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          VN
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">Vikram Nair</p>
                          <p className="text-sm text-gray-600">Service Manager</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Gradient Overlays for smooth edges */}
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-gray-600">NDIS Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-gray-600">Industry Leading</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-gray-600">98% User Satisfaction</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-24 bg-gradient-to-br from-primary/5 to-purple-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Badge className="mb-4 px-6 py-2" variant="secondary">
              <Sparkles className="mr-2 h-4 w-4" />
              Limited Early Access
            </Badge>
            
            <h2 className="text-3xl font-bold mb-4">
              Join the Waitlist
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Be among the first to transform your incident reporting process. 
              Get exclusive early access and special launch pricing.
            </p>

            <Card className="p-8 bg-white/80 backdrop-blur-sm border-2">
              {showSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    You're In! Welcome to CareScribe 🎉
                  </h3>
                  
                  <p className="text-lg text-gray-700 mb-6 max-w-md mx-auto">
                    Thank you for joining our mission to revolutionize NDIS incident reporting.
                  </p>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                    <p className="text-sm text-blue-800">
                      We'll notify you when early access opens
                    </p>
                  </div>
                </motion.div>
              ) : showOptionalSurvey ? (
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">Thanks for joining!</h3>
                      <p className="text-gray-600">
                        Help us serve you better (optional - 30 seconds)
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="survey_email">
                          Email address
                        </Label>
                        <Input
                          id="survey_email"
                          type="email"
                          placeholder="Confirm your email address"
                          value={surveyData.email}
                          onChange={(e) => handleSurveyInputChange('email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_name">
                          Organization name
                        </Label>
                        <Input
                          id="company_name"
                          type="text"
                          placeholder="Enter your organization name"
                          value={surveyData.company_name}
                          onChange={(e) => handleSurveyInputChange('company_name', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">
                          What's your role in the organization?
                        </Label>
                        <Select 
                          value={surveyData.role} 
                          onValueChange={(value) => handleSurveyInputChange('role', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="support_worker">Support Worker</SelectItem>
                            <SelectItem value="team_leader">Team Leader</SelectItem>
                            <SelectItem value="manager">Manager/Executive</SelectItem>
                            <SelectItem value="admin">Admin/IT</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_size">
                          How large is your organization?
                        </Label>
                        <Select 
                          value={surveyData.company_size} 
                          onValueChange={(value) => handleSurveyInputChange('company_size', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="200+">200+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">
                          State/Territory
                        </Label>
                        <Select 
                          value={surveyData.state || ''} 
                          onValueChange={(value) => handleSurveyInputChange('state', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state/territory" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NSW">New South Wales</SelectItem>
                            <SelectItem value="VIC">Victoria</SelectItem>
                            <SelectItem value="QLD">Queensland</SelectItem>
                            <SelectItem value="WA">Western Australia</SelectItem>
                            <SelectItem value="SA">South Australia</SelectItem>
                            <SelectItem value="TAS">Tasmania</SelectItem>
                            <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                            <SelectItem value="NT">Northern Territory</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="current_solution">
                          Current incident reporting method
                        </Label>
                        <Select 
                          value={surveyData.current_solution} 
                          onValueChange={(value) => handleSurveyInputChange('current_solution', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select current method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paper">Paper forms</SelectItem>
                            <SelectItem value="excel">Excel/Spreadsheets</SelectItem>
                            <SelectItem value="other_software">Other software</SelectItem>
                            <SelectItem value="no_system">No formal system</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="how_heard">
                          How did you hear about us?
                        </Label>
                        <Select 
                          value={surveyData.how_heard || ''} 
                          onValueChange={(value) => handleSurveyInputChange('how_heard', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">Google search</SelectItem>
                            <SelectItem value="bing">Bing search</SelectItem>
                            <SelectItem value="other_search">Other search engine</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="twitter">Twitter/X</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="referral">Colleague/Friend referral</SelectItem>
                            <SelectItem value="ndis_event">NDIS event/conference</SelectItem>
                            <SelectItem value="trade_show">Trade show/Exhibition</SelectItem>
                            <SelectItem value="webinar">Webinar/Online event</SelectItem>
                            <SelectItem value="industry_publication">Industry publication/Newsletter</SelectItem>
                            <SelectItem value="podcast">Podcast</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="forum">Industry forum/Community</SelectItem>
                            <SelectItem value="partner">Partner organization</SelectItem>
                            <SelectItem value="email">Email marketing</SelectItem>
                            <SelectItem value="advertisement">Online advertisement</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={skipSurvey}
                        className="flex-1"
                      >
                        Skip
                      </Button>
                      <Button 
                        type="button"
                        onClick={handleOptionalSurvey}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Input
                            type="email"
                            placeholder="Enter your work email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            onInvalid={(e) => {
                              e.preventDefault()
                              setEmailError('Please enter a valid work email address')
                              setHasAttemptedSubmit(true)
                            }}
                            className={`w-full ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
                            disabled={isSubmitting}
                            required
                          />
                          {emailError && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-500 mt-1 flex items-center gap-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {emailError}
                            </motion.p>
                          )}
                        </div>
                        <Button 
                          type="submit"
                          size="lg"
                          disabled={!formData.email || isSubmitting}
                          className="w-full sm:w-auto"
                        >
                          {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        Be among the first to transform your incident reporting process
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </Card>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>NDIS Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                <span>24/7 Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-8">
              Ready to Experience the Future?
            </h2>
            
            <Card className="p-12 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary/20">
              <div className="max-w-3xl mx-auto">
                <p className="text-lg text-gray-700 mb-8">
                  Try our interactive demo and see how CareScribe can transform 
                  your incident reporting process in just minutes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { role: "Support Worker", desc: "Report incidents quickly" },
                    { role: "Team Leader", desc: "Review and approve reports" },
                    { role: "Manager", desc: "Access analytics and insights" },
                    { role: "Administrator", desc: "Configure workflows" }
                  ].map((demo) => (
                    <div key={demo.role} className="bg-white rounded-lg p-4 text-left">
                      <h4 className="font-semibold">{demo.role}</h4>
                      <p className="text-sm text-gray-600">{demo.desc}</p>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg" 
                  className="group"
                  onClick={() => router.push('/login')}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Start Interactive Demo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-xl">CareScribe</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming disability support through intelligent documentation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollToSection('benefits')} className="hover:text-white transition-colors">Benefits</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Demo</button></li>
                <li><button onClick={() => scrollToSection('waitlist')} className="hover:text-white transition-colors">Join Waitlist</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Compliance</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>NDIS Compliant</li>
                <li>ISO 27001 Certified</li>
                <li>HIPAA Compliant</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => router.push('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => router.push('/terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => router.push('/cookies')} className="hover:text-white transition-colors">Cookie Policy</button></li>
                <li><button onClick={() => router.push('/security')} className="hover:text-white transition-colors">Security</button></li>
                <li><button onClick={() => router.push('/accessibility')} className="hover:text-white transition-colors">Accessibility</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-sm text-gray-400">
              <p className="text-center lg:text-left">© {new Date().getFullYear()} CareScribe. All rights reserved. Built by Bernard Adjei-Yeboah with ❤️ for Maxlife Care. Thank you Dermot.</p>
              <div className="flex items-center justify-center gap-3 whitespace-nowrap flex-shrink-0">
                <button onClick={() => router.push('/privacy')} className="hover:text-white transition-colors">Privacy</button>
                <span className="text-gray-600">•</span>
                <button onClick={() => router.push('/terms')} className="hover:text-white transition-colors">Terms</button>
                <span className="text-gray-600">•</span>
                <button onClick={() => router.push('/cookies')} className="hover:text-white transition-colors">Cookies</button>
                <span className="text-gray-600">•</span>
                <button onClick={() => router.push('/security')} className="hover:text-white transition-colors">Security</button>
                <span className="text-gray-600">•</span>
                <button onClick={() => router.push('/accessibility')} className="hover:text-white transition-colors">Accessibility</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}