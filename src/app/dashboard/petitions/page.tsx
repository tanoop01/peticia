'use client';

import { usePetitions } from '@/hooks/usePetitions';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatSignatureCount, getCategoryDisplay, getStatusColor, getStatusDisplay, formatRelativeTime } from '@/lib/utils';

export default function MyPetitionsPage() {
  const { user } = useAuth();
  const { petitions, loading } = usePetitions({ creatorId: user?.id });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Petitions</h1>
          <p className="text-gray-600">Track and manage your civic actions</p>
        </div>
        <Link href="/dashboard/create-petition">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kairo-orange mx-auto" />
        </div>
      ) : petitions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Petitions Yet</h3>
            <p className="text-gray-600 mb-6">
              Start creating change by launching your first petition
            </p>
            <Link href="/dashboard/create-petition">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Petition
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {petitions.map((petition) => (
            <Link key={petition.id} href={`/dashboard/petitions/${petition.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(petition.status)}`}>
                          {getStatusDisplay(petition.status)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {getCategoryDisplay(petition.category)}
                        </span>
                      </div>
                      <CardTitle className="text-xl mb-2">{petition.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {petition.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span className="font-semibold text-kairo-orange">
                        {formatSignatureCount(petition.signatureCount)} signatures
                      </span>
                    </div>
                    <span>•</span>
                    <span>{formatRelativeTime(petition.createdAt)}</span>
                    {petition.sentToAuthority && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 font-medium">Sent to Authority</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
