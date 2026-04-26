'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
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
        <div className="border-b border-border/70 bg-background/95 backdrop-blur md:hidden">
          <div className="flex h-14 items-center gap-3 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">PETICIA</p>
              <p className="truncate text-xs text-muted-foreground">Mobile navigation</p>
            </div>
          </div>
        </div>
        <main className="flex-1">
          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
