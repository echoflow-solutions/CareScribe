'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { currentUser } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we should show the layout (not on auth pages)
  const showLayout = currentUser && !pathname.includes('/login') && pathname !== '/'

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      
      // Load saved state from localStorage
      const savedState = localStorage.getItem('sidebarOpen')
      if (savedState !== null) {
        setSidebarOpen(mobile ? false : savedState === 'true')
      } else {
        setSidebarOpen(!mobile)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
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
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} isMobile={isMobile} />

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          !isMobile && sidebarOpen && "lg:ml-[260px]",
          !isMobile && !sidebarOpen && "lg:ml-[80px]"
        )}
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
      </div>
    </div>
  )
}