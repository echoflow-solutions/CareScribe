'use client'

import { useState, useEffect, memo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  Home, FileText, Clock, Pill, AlertCircle, BarChart3,
  Shield, Users, Settings, LogOut, ChevronLeft, ChevronRight,
  Mic, Sparkles, Building, UserCheck, Bell,
  TrendingUp, Play,
  Radio, Newspaper, ListTodo, Zap, GraduationCap, Trophy, Heart, BookOpen,
  DollarSign, GitBranch, FolderOpen, Activity, PieChart, Car, ShieldAlert, HelpCircle
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

function SidebarComponent({ isOpen, onToggle, isMobile = false }: SidebarProps) {
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
        {
          title: 'Shift Start',
          icon: Play,
          href: '/shift-start',
          badge: !currentShift ? 'Start' : null,
        },
        ...baseItems,
        {
          title: "Today's Briefing",
          icon: Newspaper,
          href: '/briefing',
          badge: 'New',
        },
        {
          title: 'Handover',
          icon: BookOpen,
          href: '/handover',
          badge: 5, // Unread handover notes
        },
        {
          title: 'Smart Tasks',
          icon: ListTodo,
          href: '/tasks',
          badge: 5, // Pending tasks count
        },
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
          title: 'My Participants',
          icon: Users,
          href: '/participants',
          badge: null,
        },
        {
          title: 'Vehicles & Transport',
          icon: Car,
          href: '/vehicles',
          badge: null,
        },
        {
          title: 'Team Pulse',
          icon: Radio,
          href: '/team-pulse',
          badge: 2, // Unread messages
        },
        {
          title: 'Quick Actions',
          icon: Zap,
          href: '/quick-actions',
          badge: null,
        },
        {
          title: 'Training',
          icon: GraduationCap,
          href: '/training',
          badge: null,
        },
        {
          title: 'My Performance',
          icon: Trophy,
          href: '/performance',
          badge: null,
        },
        {
          title: 'Wellness Check',
          icon: Heart,
          href: '/wellness',
          badge: 'Daily',
        },
        {
          title: 'Notifications',
          icon: Bell,
          href: '/notifications',
          badge: notifications > 0 ? notifications : null,
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
          title: 'Billing & Invoices',
          icon: DollarSign,
          href: '/billing',
          badge: null,
        },
        {
          title: 'Report Escalation',
          icon: GitBranch,
          href: '/escalation',
          badge: null,
        },
        {
          title: 'Document Library',
          icon: FolderOpen,
          href: '/documents',
          badge: null,
        },
        {
          title: 'Analytics Dashboard',
          icon: PieChart,
          href: '/analytics-dashboard',
          badge: null,
        },
        {
          title: 'Audit Trail',
          icon: Activity,
          href: '/audit',
          badge: null,
        },
        {
          title: 'Manage Participants',
          icon: Users,
          href: '/setup/participants',
          badge: null,
        },
        {
          title: 'Vehicles & Transport',
          icon: Car,
          href: '/vehicles',
          badge: null,
        },
        {
          title: 'Restrictive Practices',
          icon: ShieldAlert,
          href: '/restrictive-practices',
          badge: 'Compliance',
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
        title: 'Manage Participants',
        icon: Users,
        href: '/setup/participants',
        badge: null,
      },
      {
        title: 'Vehicles & Transport',
        icon: Car,
        href: '/vehicles',
        badge: null,
      },
      {
        title: 'Restrictive Practices',
        icon: ShieldAlert,
        href: '/restrictive-practices',
        badge: 'Compliance',
      },
    ]
  }

  const navigationItems = getNavigationItems()

  const handleLogout = () => {
    // Clear all persisted state
    useStore.getState().clearState()
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
      <aside
        data-sidebar="true"
        data-mobile={isMobile}
        data-open={isOpen}
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r shadow-lg z-50",
          "flex flex-col transition-all duration-300 ease-in-out",
          isMobile ? (isOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full") : (isOpen ? "w-[260px]" : "w-[80px]"),
          "overflow-hidden"
        )}
      >
        {/* Header */}
        <div className={cn("p-4 border-b", !isOpen && !isMobile && "px-2")}>
          <div className={cn("flex items-center", isOpen ? "justify-between" : "flex-col gap-2")}>
            <div className={cn("flex items-center gap-3", !isOpen && !isMobile && "flex-col gap-2")}>
              <div className="p-2 bg-primary rounded-xl shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {(isOpen || isMobile) && (
                <span className="font-bold text-xl whitespace-nowrap">
                  CareScribe
                </span>
              )}
            </div>

            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className={cn("p-1 shrink-0", !isOpen && "w-full justify-center")}
              >
                {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* User info */}
        <div className={cn("p-4 border-b", !isOpen && !isMobile && "px-2")}>
          <div className={cn("flex items-center gap-3", !isOpen && !isMobile && "flex-col")}>
            <Avatar className={cn("h-10 w-10 shrink-0", !isOpen && !isMobile && "h-8 w-8")}>
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
              !isOpen && !isMobile && "p-2 justify-center"
            )}
          >
            <Mic className={cn("h-4 w-4 shrink-0", (isOpen || isMobile) && "mr-2")} />
            {(isOpen || isMobile) && <span>Quick Report</span>}
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
                  "w-full relative overflow-hidden",
                  isOpen || isMobile ? "justify-start" : "justify-center px-2",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", (isOpen || isMobile) && "mr-3")} />
                {(isOpen || isMobile) && (
                  <span className="flex-1 text-left">
                    {item.title}
                  </span>
                )}
                {item.badge && (isOpen || isMobile) && (
                  <Badge
                    variant={typeof item.badge === 'number' ? "destructive" : "secondary"}
                    className="ml-auto shrink-0"
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
            className={cn(
              "w-full overflow-hidden",
              isOpen || isMobile ? "justify-start" : "justify-center px-2"
            )}
          >
            <Settings className={cn("h-4 w-4 shrink-0", (isOpen || isMobile) && "mr-3")} />
            {(isOpen || isMobile) && <span>Settings</span>}
          </Button>

          <Button
            variant="ghost"
            onClick={() => window.open('https://docs.carescribe.com', '_blank')}
            className={cn(
              "w-full overflow-hidden",
              isOpen || isMobile ? "justify-start" : "justify-center px-2"
            )}
          >
            <HelpCircle className={cn("h-4 w-4 shrink-0", (isOpen || isMobile) && "mr-3")} />
            {(isOpen || isMobile) && <span>Help & Docs</span>}
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full overflow-hidden text-red-600 hover:text-red-700 hover:bg-red-50",
              isOpen || isMobile ? "justify-start" : "justify-center px-2"
            )}
          >
            <LogOut className={cn("h-4 w-4 shrink-0", (isOpen || isMobile) && "mr-3")} />
            {(isOpen || isMobile) && <span>Logout</span>}
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
      </aside>
    </>
  )
}

// Export memoized version to prevent unnecessary re-renders
export const Sidebar = memo(SidebarComponent)