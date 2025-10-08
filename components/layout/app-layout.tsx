'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

interface AppLayoutProps {
  children: React.ReactNode
}

// Initialize sidebar state from localStorage synchronously
const getInitialSidebarState = () => {
  if (typeof window === 'undefined') return true
  const savedState = localStorage.getItem('sidebarOpen')
  return savedState !== null ? savedState === 'true' : true
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { currentUser } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(true) // Always start with true to match SSR
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check if we should show the layout (not on auth pages)
  const showLayout = currentUser && !pathname.includes('/login') && pathname !== '/'

  // Single initialization effect - runs once on mount
  useEffect(() => {
    const initMobile = window.innerWidth < 1024

    // Set all state in one batch
    setMounted(true)
    setIsMobile(initMobile)

    // Set initial sidebar state based on screen size and localStorage ONCE
    if (initMobile) {
      setSidebarOpen(false)
    } else {
      const savedState = localStorage.getItem('sidebarOpen')
      setSidebarOpen(savedState !== null ? savedState === 'true' : true)
    }

    // Handle window resize - only update isMobile, don't touch sidebarOpen
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', String(newState))
    }
  }

  if (!showLayout) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - only render after mount to prevent hydration mismatch */}
      {mounted && <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />}

      {/* Main content */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : (sidebarOpen ? 260 : 80)
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        {/* Mobile header */}
        {isMobile && (
          <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">CareScribe</h1>
          </header>
        )}

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </motion.div>
    </div>
  )
}