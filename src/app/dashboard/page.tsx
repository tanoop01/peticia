'use client';

import { useMemo, memo } from 'react';
import { usePetitions } from '@/hooks/usePetitions';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, TrendingUp, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatSignatureCount, getCategoryDisplay, getStatusColor, getStatusDisplay, formatRelativeTime } from '@/lib/utils';
import { SlideIn, StaggerContainer, StaggerItem } from '@/components/PageTransition';

export default function DashboardPage() {
  const { user } = useAuth();
  // Only fetch user's petitions
  const { petitions: myPetitions, loading: myLoading } = usePetitions({ creatorId: user?.id });
  // Fetch city petitions with city filter if user has city set
  const { petitions: cityPetitions, loading: cityLoading } = usePetitions(
    user?.city ? { city: user.city } : { state: user?.state }
  );

  // Memoize calculations to prevent recalculation on every render
  const stats = useMemo(() => {
    const myPetitionsCount = myPetitions.length;
    const totalSignatures = myPetitions.reduce((sum, p) => sum + (p.signatureCount || 0), 0);
    const resolvedCount = myPetitions.filter(p => p.status === 'resolved').length;
    const impactScore = totalSignatures * 10;
    
    return { myPetitionsCount, totalSignatures, resolvedCount, impactScore };
  }, [myPetitions]);

  // Filter out user's own petitions from city petitions
  const filteredCityPetitions = useMemo(() => {
    return cityPetitions.filter(p => p.creatorId !== user?.id);
  }, [cityPetitions, user?.id]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <SlideIn direction="up">
        <div className="bg-secondary border border-subtle rounded-xl p-8">
          <h1 className="text-2xl font-semibold text-primary mb-2">Welcome back, {user?.name}</h1>
          <p className="text-sm text-secondary mb-6">
            Ready to create change in {user?.city}?
          </p>
          <Link href="/dashboard/create-petition">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Start a New Petition
            </Button>
          </Link>
        </div>
      </SlideIn>

      {/* Stats Grid */}
      <StaggerContainer className="grid md:grid-cols-4 gap-6">
        <StaggerItem>
          <StatCard
            icon={<FileText className="w-5 h-5 text-accent" />}
            label="My Petitions"
            value={myLoading ? '...' : stats.myPetitionsCount}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Users className="w-5 h-5 text-accent" />}
            label="Total Signatures"
            value={myLoading ? '...' : formatSignatureCount(stats.totalSignatures)}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-accent" />}
            label="Resolved"
            value={myLoading ? '...' : stats.resolvedCount}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-accent" />}
            label="Impact Score"
            value={myLoading ? '...' : stats.impactScore}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <QuickActionCard
          title="AI Rights Assistant"
          description="Get legal guidance in seconds"
          icon={<FileText className="w-5 h-5" />}
          href="/dashboard/ai-assistant"
        />
        <QuickActionCard
          title="Create Petitions"
          description="AI assisted petition writing "
          icon={<FileText className="w-5 h-5" />}
          href="/dashboard/community"
        />
        {/* <QuickActionCard
          title="City Issues Map"
          description="See what's happening locally"
          icon={<FileText className="w-5 h-5" />}
          href="/dashboard/city-map"
        /> */}
        <QuickActionCard
          title="Browse Petitions"
          description="Support community causes"
          icon={<FileText className="w-5 h-5" />}
          href="/dashboard/community"
        />
        
      </div>

      {/* My Petitions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Recent Petitions</CardTitle>
              <CardDescription>Track your civic actions</CardDescription>
            </div>
            <Link href="/dashboard/petitions">
              <Button variant="ghost">View All <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {myLoading ? (
            <div className="text-center py-8 text-secondary">Loading...</div>
          ) : myPetitions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-secondary mb-4">You haven't created any petitions yet</p>
              <Link href="/dashboard/create-petition">
                <Button>Create Your First Petition</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myPetitions.slice(0, 3).map((petition, index) => (
                <SlideIn key={petition.id} direction="up" delay={index * 0.1}>
                  <Link href={`/dashboard/petitions/${petition.id}`}>
                    <div className="border border-subtle rounded-lg p-4 hover:border-strong transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-primary mb-1">{petition.title}</h3>
                          <p className="text-xs text-secondary mb-2">
                            {petition.description.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted">
                            <span>{formatSignatureCount(petition.signatureCount)} signatures</span>
                            <span>•</span>
                            <span>{getCategoryDisplay(petition.category)}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(petition.createdAt)}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(petition.status)}`}>
                          {getStatusDisplay(petition.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </SlideIn>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Petitions */}
      <Card>
        <CardHeader>
          <CardTitle>Trending in {user?.city || user?.state || 'your area'}</CardTitle>
          <CardDescription>Popular petitions in your area</CardDescription>
        </CardHeader>
        <CardContent>
          {cityLoading ? (
            <div className="text-center py-8 text-secondary">Loading...</div>
          ) : filteredCityPetitions.length === 0 ? (
            <div className="text-center py-8 text-secondary">
              No petitions in your area yet
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCityPetitions
                .slice(0, 3)
                .map((petition) => (
                  <Link key={petition.id} href={`/dashboard/community/${petition.id}`}>
                    <div className="border border-subtle rounded-lg p-4 hover:border-strong transition-colors">
                      <h3 className="text-sm font-semibold text-primary mb-1">{petition.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span className="font-medium text-accent">
                          {formatSignatureCount(petition.signatureCount)} signatures
                        </span>
                        <span>•</span>
                        <span>by {petition.creator.name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const StatCard = memo(({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-secondary mb-1">{label}</p>
            <p className="text-2xl font-semibold text-primary">{value}</p>
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
});
StatCard.displayName = 'StatCard';

const QuickActionCard = memo(({ title, description, icon, href }: any) => {
  return (
    <Link href={href}>
      <Card className="h-full cursor-pointer">
        <CardContent className="pt-6">
          <div className="text-accent mb-4">{icon}</div>
          <h3 className="text-sm font-semibold text-primary mb-2">{title}</h3>
          <p className="text-xs text-secondary">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
});
QuickActionCard.displayName = 'QuickActionCard';
