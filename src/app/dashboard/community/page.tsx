'use client';

import { useState } from 'react';
import { usePetitions } from '@/hooks/usePetitions';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, TrendingUp, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { 
  formatSignatureCount, 
  getCategoryDisplay, 
  getStatusColor, 
  getStatusDisplay, 
  formatRelativeTime 
} from '@/lib/utils';
import { PetitionCategory } from '@/types';

export default function CommunityPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PetitionCategory | 'all'>('all');
  const { petitions, loading } = usePetitions(
    selectedCategory !== 'all' ? { category: selectedCategory } : {}
  );

  const filteredPetitions = petitions.filter(p => 
    searchQuery === '' || 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories: { value: PetitionCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'safety', label: 'Safety' },
    { value: 'rights', label: 'Rights' },
    { value: 'consumer', label: 'Consumer' },
    { value: 'environment', label: 'Environment' },
    { value: 'labor', label: 'Labor' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health' },
    { value: 'corruption', label: 'Corruption' },
  ];

  const localPetitions = filteredPetitions.filter(p => p.location.city === user?.city);
  const trendingPetitions = [...filteredPetitions]
    .sort((a, b) => b.signatureCount - a.signatureCount)
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">Community Petitions</h1>
        <p className="text-text-secondary">
          Discover and support petitions from across India
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-foreground" />}
          label="Active Petitions"
          value={petitions.length}
        />
        <StatCard
          icon={<MapPin className="w-6 h-6 text-foreground" />}
          label={`In ${user?.city}`}
          value={localPetitions.length}
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-foreground" />}
          label="Total Signatures"
          value={formatSignatureCount(
            petitions.reduce((sum, p) => sum + p.signatureCount, 0)
          )}
        />
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                placeholder="Search petitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              title="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="h-10 w-full rounded-md border-2 border-border-strong bg-bg-secondary px-3 text-text-primary focus:outline-none focus:ring-0 focus:shadow-none focus:border-border-strong md:w-48"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Trending in Your City */}
      {localPetitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-foreground" />
              Trending in {user?.city}
            </CardTitle>
            <CardDescription>Popular petitions in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {localPetitions.slice(0, 3).map((petition) => (
                <Link key={petition.id} href={`/dashboard/community/${petition.id}`}>
                  <div className="p-4 bg-bg-secondary border border-border-subtle rounded-lg hover:border-border-strong transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1 text-text-primary">{petition.title}</h3>
                        <p className="text-sm text-text-secondary mb-2 line-clamp-1">
                          {petition.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted sm:gap-4">
                          <span className="font-medium text-foreground">
                            {formatSignatureCount(petition.signatureCount)} signatures
                          </span>
                          {petition.updates && petition.updates.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{petition.updates.length} update{petition.updates.length > 1 ? 's' : ''}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>by {petition.creator.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Petitions */}
      <Card>
        <CardHeader>
          <CardTitle>All Petitions</CardTitle>
          <CardDescription>
            {filteredPetitions.length} petitions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-foreground mx-auto" />
            </div>
          ) : filteredPetitions.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              No petitions found matching your criteria
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPetitions.map((petition) => (
                <Link key={petition.id} href={`/dashboard/community/${petition.id}`}>
                  <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 hover:border-border-strong transition-colors duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(petition.status)}`}>
                            {getStatusDisplay(petition.status)}
                          </span>
                          <span className="text-xs text-text-muted">
                            {getCategoryDisplay(petition.category)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-1 text-text-primary">{petition.title}</h3>
                        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                          {petition.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted sm:gap-6">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold text-foreground">
                          {formatSignatureCount(petition.signatureCount)}
                        </span>
                      </div>
                      {petition.updates && petition.updates.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span>{petition.updates.length} update{petition.updates.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{petition.location.city}, {petition.location.state}</span>
                      </div>
                      <span>•</span>
                      <span>by {petition.creator.name}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(petition.createdAt)}</span>
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary mb-1">{label}</p>
            <p className="text-2xl font-bold text-text-primary sm:text-3xl">{value}</p>
          </div>
          <div className="opacity-75">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
