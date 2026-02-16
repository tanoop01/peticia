import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Format signature count
 */
export function formatSignatureCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`;
  if (count < 100000) return `${Math.floor(count / 1000)}K`;
  if (count < 1000000) return `${(count / 1000).toFixed(0)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

/**
 * Get category display name
 */
export function getCategoryDisplay(category: string): string {
  const categories: Record<string, string> = {
    infrastructure: 'Infrastructure',
    safety: 'Safety & Security',
    rights: 'Rights & Justice',
    consumer: 'Consumer Rights',
    environment: 'Environment',
    labor: 'Labor & Employment',
    education: 'Education',
    health: 'Health',
    corruption: 'Corruption',
    other: 'Other'
  };
  return categories[category] || category;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    growing: 'bg-green-100 text-green-800',
    sent_to_authority: 'bg-yellow-100 text-yellow-800',
    response_received: 'bg-purple-100 text-purple-800',
    action_taken: 'bg-orange-100 text-orange-800',
    resolved: 'bg-emerald-100 text-emerald-800 font-semibold',
    closed: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get status display text
 */
export function getStatusDisplay(status: string): string {
  const statuses: Record<string, string> = {
    draft: 'Draft',
    active: 'Active',
    growing: 'Growing',
    sent_to_authority: 'Sent to Authority',
    response_received: 'Response Received',
    action_taken: 'Action Taken',
    resolved: 'Resolved',
    closed: 'Closed'
  };
  return statuses[status] || status;
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Generate mailto link for authority
 */
export function generateMailtoLink(
  email: string,
  subject: string,
  body: string
): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
