"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  TrendingUp,
  Plus,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react"

// PETICIA navigation data
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: TrendingUp,
      isActive: true,
    },
    {
      title: "Create Petition",
      url: "/dashboard/create-petition",
      icon: Plus,
    },
    {
      title: "My Petitions",
      url: "/dashboard/petitions",
      icon: FileText,
    },
    {
      title: "AI Assistant",
      url: "/dashboard/ai-assistant",
      icon: MessageSquare,
    },
    {
      title: "Community",
      url: "/dashboard/community",
      icon: Users,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  
  return (
    <Sidebar className="pl-3 md:pl-4" {...props}>
      <SidebarHeader className="p-3 pt-4">
        <Link href="/dashboard" className="group mb-3 flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-card transition-transform duration-150 group-hover:scale-105">
            <Image src="/peticia-logo.svg.png" alt="PETICIA logo" width={40} height={40} className="h-full w-full object-cover" />
          </div>
          <span className="text-xl font-semibold text-foreground">PETICIA</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className="h-11 px-3.5">
                      <Link href={item.url}>
                        <Icon className="h-5 w-5" />
                        <span className="text-base font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
