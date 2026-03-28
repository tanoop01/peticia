'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">PETICIA</span>
          </div>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-24">
        <SlideIn direction="up" className="max-w-5xl mx-auto text-center">
          {/* <span className="inline-flex items-center rounded-full border border-border-strong bg-bg-secondary/80 px-3 py-1 text-xs text-text-secondary mb-6">
            Civic action platform for India
          </span> */}
          <h1 className="text-5xl md:text-6xl font-semibold mb-6 text-foreground leading-tight">
            Converting Awareness into 
            <span className="text-primary"> Government Action</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
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
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
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
        <div className="mt-32">
          <h2 className="text-3xl font-semibold text-center mb-12 text-foreground">How PETICIA Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <StepCard number={1} title="Verify Identity" description="Sign up with your email" />
            <StepCard number={2} title="Know Rights" description="Get legal guidance from AI assistant" />
            <StepCard number={3} title="Create Petition" description="AI helps draft your petition" />
            <StepCard number={4} title="Get Action" description="Send to authorities & track resolution" />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 surface-block-strong rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-semibold mb-4 text-foreground">Ready to Create Change?</h2>
          <p className="text-lg mb-8 text-muted-foreground">
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
      <footer className="border-t border-border-subtle mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>2026 PETICIA</p>
        </div>
      </footer>
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
  );}