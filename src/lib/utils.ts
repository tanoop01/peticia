import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Unknown'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | undefined): string {
  if (!date) return 'Unknown'
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

/**
 * Format signature count (e.g., "1.2K", "5.6M")
 */
export function formatSignatureCount(count: number | undefined): string {
  if (!count) return '0'
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}

/**
 * Get category display name
 */
export function getCategoryDisplay(category: string | undefined): string {
  const categoryMap: Record<string, string> = {
    'education': 'Education',
    'health': 'Health',
    'infrastructure': 'Infrastructure',
    'environment': 'Environment',
    'economy': 'Economy',
    'security': 'Security',
    'women_safety': "Women's Safety",
    'governance': 'Governance',
    'other': 'Other',
  }
  return categoryMap[category?.toLowerCase() || ''] || category || 'Other'
}

/**
 * Get status display name
 */
export function getStatusDisplay(status: string | undefined): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'active': 'Active',
    'resolved': 'Resolved',
    'rejected': 'Rejected',
    'draft': 'Draft',
  }
  return statusMap[status?.toLowerCase() || ''] || status || 'Unknown'
}

/**
 * Get status color class
 */
export function getStatusColor(status: string | undefined): string {
  const colorMap: Record<string, string> = {
    'pending': 'bg-slate-200 text-slate-800',
    'active': 'bg-slate-200 text-slate-800',
    'resolved': 'bg-slate-300 text-slate-900',
    'rejected': 'bg-slate-300 text-slate-900',
    'draft': 'bg-slate-100 text-slate-700',
  }
  return colorMap[status?.toLowerCase() || ''] || 'bg-slate-100 text-slate-700'
}

/**
 * Generate mailto link for petitions
 */
export function generateMailtoLink(email: string | undefined, subject?: string, body?: string): string {
  if (!email) return ''
  const finalSubject = subject || 'Petition Support'
  const finalBody = body || 'We request your support for this petition.'
  
  return `mailto:${email}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalBody)}`
}
