'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, initializing } = useAuth()

  useEffect(() => {
    if (!initializing && !user) {
      router.push('/login')
    }
  }, [user, initializing, router])

  if (initializing || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary" />
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar className="md:left-4" />
      <SidebarInset>
        <main className="flex-1">
          <div className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
