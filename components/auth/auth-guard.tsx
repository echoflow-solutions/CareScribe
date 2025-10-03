'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useHydration } from '@/lib/hooks/use-hydration'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter()
  const hasHydrated = useHydration()
  const currentUser = useStore((state) => state.currentUser)

  useEffect(() => {
    if (!hasHydrated) return
    
    if (!currentUser) {
      router.push(redirectTo)
    }
  }, [currentUser, hasHydrated, router, redirectTo])

  // Show loading state while store is hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!currentUser) {
    return null
  }

  return <>{children}</>
}