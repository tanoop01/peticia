'use client';

import { useParams } from 'next/navigation';
import { usePetition } from '@/hooks/usePetitions';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, MapPin, Calendar, CheckCircle, Share2, 
  ArrowLeft, AlertCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ShareModal } from '@/components/ShareModal';
import Link from 'next/link';
import { 
  formatDate, 
  formatSignatureCount, 
  getCategoryDisplay, 
  getStatusColor, 
  getStatusDisplay 
} from '@/lib/utils';

export default function CommunityPetitionDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { petition, loading, refetch } = usePetition(params.id as string);
  const [hasSigned, setHasSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [checkingSignature, setCheckingSignature] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  // Check if user has already signed this petition
  useEffect(() => {
    const checkSignature = async () => {
      if (!user || !petition) {
        setCheckingSignature(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('signatures')
          .select('id')
          .eq('petition_id', petition.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          setHasSigned(true);
        }
      } catch (error) {
        console.error('Error checking signature:', error);
      } finally {
        setCheckingSignature(false);
      }
    };

    checkSignature();
  }, [user, petition]);

  const handleShare = async () => {
    setShowShareModal(true);
  };

  const handleSign = async () => {
    if (!user || !petition) return;

    setSigning(true);
    try {
      // Get user's saved location
      const { data: userData } = await supabase
        .from('users')
        .select('location_lat, location_lng')
        .eq('id', user.id)
        .single();

      const response = await fetch('/api/signatures/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petition_id: petition.id,
          user_id: user.id,
          is_verified: user.isVerified,
          location_lat: userData?.location_lat || null,
          location_lng: userData?.location_lng || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sign petition');
      }

      toast({
        title: 'Petition Signed!',
        description: 'Your signature has been added successfully',
      });

      setHasSigned(true);
      await refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign petition',
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kairo-orange" />
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Petition Not Found</h2>
        <Link href="/dashboard/community">
          <Button>Back to Community</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard/community">
        <Button variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Community
        </Button>
      </Link>

      <Card className="border-2 border-kairo-orange">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(petition.status)}`}>
                  {getStatusDisplay(petition.status)}
                </span>
                <span className="text-sm text-gray-600">{getCategoryDisplay(petition.category)}</span>
              </div>
              <CardTitle className="text-3xl mb-2">{petition.title}</CardTitle>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-kairo-orange">
                    {formatSignatureCount(petition.signatureCount)} signatures
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(petition.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {petition.location.city}, {petition.location.state}
                </div>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={handleShare} title="Share petition">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-wrap text-lg leading-relaxed">
              {petition.description}
            </p>
          </div>

          {user?.id !== petition.creatorId && (
            <div className="pt-8 border-t">
              {hasSigned ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium text-lg">Signed</span>
                </div>
              ) : (
                <Button
                  onClick={handleSign}
                  disabled={signing || checkingSignature}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {checkingSignature ? 'Loading...' : signing ? 'Signing...' : 'Sign This Petition'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Started by</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 kairo-gradient rounded-full flex items-center justify-center text-white font-bold text-xl">
              {petition.creator.name[0]}
            </div>
            <div>
              <div className="font-semibold">{petition.creator.name}</div>
              <div className="text-sm text-gray-600">
                {petition.creator.city}, {petition.creator.state}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      {petition && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={petition.title}
          shareUrl={`${window.location.origin}/dashboard/community/${petition.id}`}
        />
      )}
    </div>
  );
}
