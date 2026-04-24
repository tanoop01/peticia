'use client'

import { useMemo, memo } from 'react'
import { usePetitions } from '@/hooks/usePetitions'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, TrendingUp, CheckCircle, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatSignatureCount, getCategoryDisplay, getStatusColor, getStatusDisplay, formatRelativeTime } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  // Only fetch user's petitions
  const { petitions: myPetitions, loading: myLoading } = usePetitions({ creatorId: user?.id })
  // Fetch city petitions with city filter if user has city set
  const { petitions: cityPetitions, loading: cityLoading } = usePetitions(
    user?.city ? { city: user.city } : { state: user?.state }
  )

  // Memoize calculations to prevent recalculation on every render
  const stats = useMemo(() => {
    const myPetitionsCount = myPetitions.length
    const totalSignatures = myPetitions.reduce((sum, p) => sum + (p.signatureCount || 0), 0)
    const resolvedCount = myPetitions.filter(p => p.status === 'resolved').length
    const impactScore = totalSignatures * 10

    return { myPetitionsCount, totalSignatures, resolvedCount, impactScore }
  }, [myPetitions])

  // Filter out user's own petitions from city petitions
  const filteredCityPetitions = useMemo(() => {
    return cityPetitions.filter(p => p.creatorId !== user?.id)
  }, [cityPetitions, user?.id])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-xl border border-border bg-gradient-to-b from-card to-card/70 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome back, {user?.name}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Ready to create change in {user?.city}?
        </p>
        <Link href="/dashboard/create-petition">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Start a New Petition
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard
            icon={<FileText className="w-5 h-5 text-muted-foreground" />}
          label="My Petitions"
          value={stats.myPetitionsCount}
          loading={myLoading}
        />
        <StatCard
            icon={<Users className="w-5 h-5 text-muted-foreground" />}
          label="Total Signatures"
          value={formatSignatureCount(stats.totalSignatures)}
          loading={myLoading}
        />
        <StatCard
            icon={<CheckCircle className="w-5 h-5 text-muted-foreground" />}
          label="Resolved"
          value={stats.resolvedCount}
          loading={myLoading}
        />
        <StatCard
            icon={<TrendingUp className="w-5 h-5 text-muted-foreground" />}
          label="Impact Score"
          value={stats.impactScore}
          loading={myLoading}
        />
      </div>

      {/* My Petitions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">My Petitions</h2>
          <Link href="/dashboard/petitions">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {myLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary" />
          </div>
        ) : myPetitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myPetitions.slice(0, 4).map((petition) => (
              <PetitionCard key={petition.id} petition={petition} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No petitions yet</p>
              <Link href="/dashboard/create-petition">
                <Button variant="outline" className="mt-4">
                  Create Your First Petition
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* City Petitions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Petitions in {user?.city || user?.state}
          </h2>
          <Link href="/dashboard/community">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {cityLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary" />
          </div>
        ) : filteredCityPetitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCityPetitions.slice(0, 4).map((petition) => (
              <PetitionCard key={petition.id} petition={petition} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No petitions in your area yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
              {loading ? '...' : value}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/50 p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

const PetitionCard = memo(function PetitionCard({ petition }: { petition: any }) {
  return (
    <Link href={`/dashboard/petitions/${petition.id}`}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-2">{petition.title}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                By {petition.creatorName}
              </CardDescription>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                petition.status
              )}`}
            >
              {getStatusDisplay(petition.status)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {petition.description}
          </p>
        </CardContent>
        <div className="mt-auto border-t border-border/70 px-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Signatures</p>
                <p className="font-semibold text-foreground">
                  {formatSignatureCount(petition.signatureCount || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-semibold text-foreground">
                  {getCategoryDisplay(petition.category)}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(petition.createdAt)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
})
