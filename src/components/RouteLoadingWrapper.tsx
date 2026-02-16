'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * RouteLoadingWrapper - Shows a subtle top loading bar during route transitions
 */
export function RouteLoadingWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Trigger loading animation on route change
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Top loading bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-kairo-orange to-kairo-yellow">
          <div className="h-full bg-white animate-pulse" />
        </div>
      )}
      
      {/* Page content with fade */}
      <div className={`transition-opacity duration-200 ${loading ? 'opacity-90' : 'opacity-100'}`}>
        {children}
      </div>
    </>
  );
}
