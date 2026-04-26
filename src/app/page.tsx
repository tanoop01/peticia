'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowRight, Shield, Users, Target, TrendingUp } from 'lucide-react';
import { SlideIn, StaggerContainer, StaggerItem } from '@/components/PageTransition';

export default function HomePage() {
  const router = useRouter();
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && user) {
      router.push('/dashboard');
    }
  }, [user, initializing, router]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-border">
              <Image src="/peticia-logo.svg.png" alt="PETICIA logo" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <span className="text-xl font-semibold text-foreground">PETICIA</span>
          </div>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24">
        <SlideIn direction="up" className="max-w-5xl mx-auto text-center">
          {/* <span className="inline-flex items-center rounded-full border border-border-strong bg-bg-secondary/80 px-3 py-1 text-xs text-text-secondary mb-6">
            Civic action platform for India
          </span> */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-6 text-foreground leading-tight">
            Converting Awareness into 
            <span className="text-primary"> Government Action</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            India's own civic operating system that bridges citizens and government 
            accountability. Know your rights, raise your voice, and create real change.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-sm px-8">
                Start Your Petition <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/community">
              <Button size="lg" variant="outline" className="text-sm px-8">
                Explore Community
              </Button>
            </Link>
          </div>
        </SlideIn>

        {/* Features Grid */}
        <StaggerContainer className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          <StaggerItem>
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Know Your Rights"
              description="AI-powered legal assistant in your language"
            />
          </StaggerItem>
          <StaggerItem>
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="Build Community"
              description="Connect with fellow citizens on local issues"
            />
          </StaggerItem>
          <StaggerItem>
            <FeatureCard
              icon={<Target className="w-5 h-5" />}
              title="Direct Authority"
              description="Send petitions directly to decision-makers"
            />
          </StaggerItem>
          <StaggerItem>
            <FeatureCard
              icon={<TrendingUp className="w-5 h-5" />}
              title="Track Impact"
              description="See real resolutions and outcomes"
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Stats Section (hidden for now)
        <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
          <StatCard number="10K+" label="Active Citizens" />
          <StatCard number="500+" label="Petitions Created" />
          <StatCard number="150+" label="Issues Resolved" />
        </div>
        */}

        {/* How It Works */}
        <div className="mt-24 sm:mt-32">
          <h2 className="mb-10 text-center text-2xl font-semibold text-foreground sm:mb-12 sm:text-3xl">How PETICIA Works</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard number={1} title="Verify Identity" description="Sign up with your email" />
            <StepCard number={2} title="Know Rights" description="Get legal guidance from AI assistant" />
            <StepCard number={3} title="Create Petition" description="AI helps draft your petition" />
            <StepCard number={4} title="Get Action" description="Send to authorities & track resolution" />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 rounded-2xl p-6 text-center sm:mt-32 sm:p-10 md:p-12 surface-block-strong">
          <h2 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">Ready to Create Change?</h2>
          <p className="mb-8 text-base text-muted-foreground sm:text-lg">
            Join thousands of Indians taking civic action
          </p>
          <Link href="/login">
            <Button size="lg" className="text-sm px-8">
              Join PETICIA Today
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-16 py-8 sm:mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>2026 PETICIA</p>
        </div>
      </footer>

      <ThemeToggle />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="surface-block rounded-xl p-6 transition-transform duration-200 hover:translate-y-[-2px]">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-sm font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

// Stats card intentionally kept commented while the homepage stats section is hidden.
// function StatCard({ number, label }: { number: string; label: string }) {
//   return (
//     <div className="surface-block rounded-xl p-8 transition-transform duration-200 hover:translate-y-[-2px]">
//       <div className="text-3xl font-semibold text-accent mb-2">{number}</div>
//       <div className="text-sm text-secondary">{label}</div>
//     </div>
//   );
// }

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="surface-block rounded-xl p-6 relative transition-transform duration-200 hover:translate-y-[-2px]">
      <div className="absolute -top-3 left-6 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
        {number}
      </div>
      <h3 className="text-sm font-semibold mt-4 mb-2 text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}