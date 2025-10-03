'use client'

import { useEffect, useState } from 'react'
import { DataService } from '@/lib/data/service'

export function DataInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeData = async () => {
      try {
        await DataService.initializeDemoData()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize demo data:', error)
        setIsInitialized(true) // Continue anyway
      }
    }

    initializeData()
  }, [])

  // Always render children, but data initialization happens in the background
  return <>{children}</>
}