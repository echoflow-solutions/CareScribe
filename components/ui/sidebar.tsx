'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  Home, FileText, Clock, Pill, AlertCircle, BarChart3,
  Shield, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  Mic, Menu, X, Sparkles, Building, UserCheck, Bell,
  TrendingUp, Calendar, MessageSquare, HelpCircle
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

export function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, currentShift, setCurrentUser, setCurrentShift } = useStore()
  const [notifications, setNotifications] = useState(3)

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!currentUser) return []

    const baseItems = [
      {
        title: 'Dashboard',
        icon: Home,
        href: '/dashboard',
        badge: null,
      },
      {
        title: 'Reports',
        icon: FileText,
        href: '/reports',
        badge: null,
      },
    ]

    // Support Worker specific items
    if (currentUser.role.level === 4) {
      return [
        ...baseItems,
        {
          title: 'Shifts',
          icon: Clock,
          href: '/shifts',
          badge: currentShift ? 'Active' : null,
        },
        {
          title: 'Medications',
          icon: Pill,
          href: '/medications',
          badge: null,
        },
        {
          title: 'Participants',
          icon: Users,
          href: '/setup/participants',
          badge: null,
        },
      ]
    }

    // Team Leader items
    if (currentUser.role.level === 3) {
      return [
        ...baseItems,
        {
          title: 'Shift Management',
          icon: Clock,
          href: '/shifts',
          badge: null,
        },
        {
          title: 'Team Performance',
          icon: TrendingUp,
          href: '/performance',
          badge: null,
        },
        {
          title: 'Alerts',
          icon: AlertCircle,
          href: '/alerts',
          badge: notifications > 0 ? notifications : null,
        },
        {
          title: 'Participants',
          icon: Users,
          href: '/setup/participants',
          badge: null,
        },
      ]
    }

    // Management roles (Clinical Manager, Area Manager, Executive)
    return [
      ...baseItems,
      {
        title: 'Analytics',
        icon: BarChart3,
        href: '/analytics',
        badge: null,
      },
      {
        title: 'Performance',
        icon: TrendingUp,
        href: '/performance',
        badge: null,
      },
      {
        title: 'Compliance',
        icon: Shield,
        href: '/compliance',
        badge: null,
      },
      {
        title: 'Alerts',
        icon: AlertCircle,
        href: '/alerts',
        badge: notifications > 0 ? notifications : null,
      },
      {
        title: 'Organization',
        icon: Building,
        href: '/setup/organization',
        badge: null,
      },
      {
        title: 'Staff',
        icon: UserCheck,
        href: '/setup/staff',
        badge: null,
      },
      {
        title: 'Participants',
        icon: Users,
        href: '/setup/participants',
        badge: null,
      },
    ]
  }

  const navigationItems = getNavigationItems()

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentShift(null)
    router.push('/login')
  }

  const handleQuickReport = () => {
    router.push('/quick-report')
  }

  // For mobile, close sidebar when route changes
  useEffect(() => {
    if (isMobile && isOpen) {
      onToggle()
    }
  }, [pathname])

  if (!currentUser) return null

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? (isMobile ? 280 : 260) : (isMobile ? 0 : 80),
          x: isMobile && !isOpen ? -280 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r shadow-lg z-50",
          "flex flex-col",
          isMobile && "w-[280px]"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-primary rounded-xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-xl">CareScribe</span>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-auto"
                >
                  <div className="p-2 bg-primary rounded-xl">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className={cn("p-1", !isOpen && "mx-auto mt-2")}
              >
                {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* User info */}
        <div className={cn("p-4 border-b", !isOpen && !isMobile && "px-2")}>
          <div className={cn("flex items-center gap-3", !isOpen && !isMobile && "flex-col")}>
            <Avatar className={cn("h-10 w-10", !isOpen && !isMobile && "h-8 w-8")}>
              <AvatarFallback className="bg-primary/10 text-primary">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {(isOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.role.name}</p>
              </div>
            )}
          </div>
          
          {/* Quick Report Button */}
          <Button
            onClick={handleQuickReport}
            className={cn(
              "w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              !isOpen && !isMobile && "p-2"
            )}
          >
            <Mic className={cn("h-4 w-4", (isOpen || isMobile) && "mr-2")} />
            {(isOpen || isMobile) && "Quick Report"}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full justify-start relative",
                  !isOpen && !isMobile && "px-2",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <Icon className={cn("h-4 w-4", (isOpen || isMobile) && "mr-3")} />
                {(isOpen || isMobile) && <span className="flex-1 text-left">{item.title}</span>}
                {item.badge && (isOpen || isMobile) && (
                  <Badge 
                    variant={typeof item.badge === 'number' ? "destructive" : "secondary"}
                    className="ml-auto"
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.badge && !isOpen && !isMobile && typeof item.badge === 'number' && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </Button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-1">
          <Button
            variant="ghost"
            onClick={() => router.push('/settings')}
            className={cn("w-full justify-start", !isOpen && !isMobile && "px-2")}
          >
            <Settings className={cn("h-4 w-4", (isOpen || isMobile) && "mr-3")} />
            {(isOpen || isMobile) && "Settings"}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => window.open('https://docs.carescribe.com', '_blank')}
            className={cn("w-full justify-start", !isOpen && !isMobile && "px-2")}
          >
            <HelpCircle className={cn("h-4 w-4", (isOpen || isMobile) && "mr-3")} />
            {(isOpen || isMobile) && "Help & Docs"}
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn("w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50", !isOpen && !isMobile && "px-2")}
          >
            <LogOut className={cn("h-4 w-4", (isOpen || isMobile) && "mr-3")} />
            {(isOpen || isMobile) && "Logout"}
          </Button>
        </div>

        {/* Demo indicator */}
        {(isOpen || isMobile) && (
          <div className="p-4 border-t">
            <Badge variant="outline" className="w-full justify-center">
              Demo Mode
            </Badge>
          </div>
        )}
      </motion.aside>
    </>
  )
}