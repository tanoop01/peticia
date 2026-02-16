'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Map, MessageSquare, LogOut, Plus, TrendingUp, Users, User } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';

// DEV MODE: Must match login page and useAuth
const DEV_MODE = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && !user) {
      router.push('/auth/login');
    }
  }, [user, initializing, router]);

  const handleLogout = async () => {
    if (DEV_MODE) {
      localStorage.removeItem('dev_firebase_uid');
      localStorage.removeItem('dev_phone_number');
    } else {
      await signOut(auth);
    }
    router.push('/');
  };

  if (initializing || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border-subtle border-t-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary border-r border-border-subtle flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-border-subtle">
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-text-primary">PETICIA</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink 
            href="/dashboard" 
            icon={<TrendingUp className="w-5 h-5" />} 
            label="Dashboard"
            active={pathname === '/dashboard'}
          />
           <NavLink 
            href="/dashboard/create-petition" 
            icon={<Plus className="w-5 h-5" />} 
            label="Create Petition"
            active={pathname === '/dashboard/create-petition'}
          />
           <NavLink 
            href="/dashboard/petitions" 
            icon={<FileText className="w-5 h-5" />} 
            label="My Petitions"
            active={pathname === '/dashboard/petitions'}
          />
          <NavLink 
            href="/dashboard/ai-assistant" 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="AI Assistant"
            active={pathname === '/dashboard/ai-assistant'}
          />
         
         
          {/* <NavLink 
            href="/dashboard/city-map" 
            icon={<Map className="w-5 h-5" />} 
            label="City Issues"
            active={pathname === '/dashboard/city-map'}
          /> */}
          <NavLink 
            href="/dashboard/community" 
            icon={<Users className="w-5 h-5" />} 
            label="Community"
            active={pathname === '/dashboard/community'}
          />
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border-subtle space-y-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">{user.name}</div>
              <div className="text-xs text-text-muted truncate">{user.city}, {user.state}</div>
            </div>
          </div>
          <Link href="/dashboard/profile" className="block">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "w-full justify-start text-text-muted hover:text-accent",
                pathname === '/dashboard/profile' && "bg-accent-light text-accent"
              )}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-full justify-start text-text-muted hover:text-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-sm border-b border-border-subtle">
          <div className="px-8 py-4">
            <div className="max-w-7xl mx-auto">
              {/* Header content can be added here if needed */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label, active }: { 
  href: string; 
  icon: React.ReactNode; 
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-150 text-sm font-medium",
        active 
          ? "bg-accent-light text-accent" 
          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
      )}>
        {icon}
        <span>{label}</span>
      </div>
    </Link>
  );
}
