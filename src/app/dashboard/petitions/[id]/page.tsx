'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, MapPin, Calendar, TrendingUp, Mail, Share2, 
  CheckCircle, AlertCircle, ArrowLeft, MessageSquare, Trash2 
} from 'lucide-react';
import { usePetition } from '@/hooks/usePetitions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ShareModal } from '@/components/ShareModal';
import { 
  formatDate, 
  formatSignatureCount, 
  getCategoryDisplay, 
  getStatusColor, 
  getStatusDisplay,
  generateMailtoLink 
} from '@/lib/utils';
import Link from 'next/link';

export default function PetitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { petition, loading, refetch } = usePetition(params.id as string);

  const [hasSigned, setHasSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateContent, setUpdateContent] = useState('');
  const [suggestedAuthority, setSuggestedAuthority] = useState('');
  const [loadingAuthority, setLoadingAuthority] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (petition && user) {
      checkIfSigned();
    }
  }, [petition, user]);

  const handleShare = async () => {
    setShowShareModal(true);
  };

  const checkIfSigned = async () => {
    if (!petition || !user) return;

    const { data } = await supabase
      .from('signatures')
      .select('id')
      .eq('petition_id', petition.id)
      .eq('user_id', user.id)
      .single();

    setHasSigned(!!data);
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
      
      // Refresh petition data to get updated count and signature list
      await refetch();
    } catch (error: any) {
      console.error('Error signing petition:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign petition',
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  };

  const handleGetAuthoritySuggestion = async () => {
    if (!petition) return;

    setLoadingAuthority(true);
    try {
      const response = await fetch('/api/ai/suggest-authorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: petition.category,
          state: petition.location.state,
          city: petition.location.city,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get authority suggestion');
      }

      const data = await response.json();
      setSuggestedAuthority(data.suggestion);
    } catch (error) {
      console.error('Error getting authority suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to get authority suggestion',
        variant: 'destructive',
      });
    } finally {
      setLoadingAuthority(false);
    }
  };

  const handleSendToAuthority = async () => {
    if (!petition) return;

    try {
      const response = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petitionTitle: petition.title,
          petitionContent: petition.description,
          signatureCount: petition.signatureCount,
          location: `${petition.location.city}, ${petition.location.state}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
      const { subject, body } = data.email;

      // For demo, we'll show the email in a mailto link
      // In production, integrate with actual authority database
      const mailtoLink = generateMailtoLink(
        'authority@example.com', // Replace with actual authority email
        subject,
        body
      );

      window.location.href = mailtoLink;

      // Update petition status
      await supabase
        .from('petitions')
        .update({ 
          sent_to_authority: true, 
          sent_at: new Date().toISOString(),
          status: 'sent_to_authority' 
        })
        .eq('id', petition.id);

      toast({
        title: 'Opening Email Client',
        description: 'Your email client will open with the petition ready to send',
      });

      await refetch();
    } catch (error) {
      console.error('Error preparing email:', error);
      toast({
        title: 'Error',
        description: 'Failed to prepare email',
        variant: 'destructive',
      });
    }
  };

  const handlePostUpdate = async () => {
    if (!user || !petition || !updateContent.trim()) return;

    try {
      const response = await fetch('/api/petition-updates/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          petition_id: petition.id,
          type: 'progress',
          content: updateContent,
          created_by: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post update');
      }

      toast({
        title: 'Update Posted',
        description: 'Your update has been shared with all supporters',
      });

      setUpdateContent('');
      setShowUpdateForm(false);
      await refetch();
    } catch (error: any) {
      console.error('Error posting update:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to post update',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePetition = async () => {
    if (!user || !petition) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/petitions/${petition.id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete petition');
      }

      toast({
        title: 'Petition Deleted',
        description: 'Your petition has been permanently deleted',
      });

      router.push('/dashboard/petitions');
    } catch (error: any) {
      console.error('Error deleting petition:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete petition',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleResolvePetition = async () => {
    if (!user || !petition) return;

    setResolving(true);
    try {
      const response = await fetch(`/api/petitions/${petition.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resolve petition');
      }

      toast({
        title: 'Petition Resolved',
        description: 'Your petition has been marked as resolved',
      });

      await refetch();
    } catch (error: any) {
      console.error('Error resolving petition:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to resolve petition',
        variant: 'destructive',
      });
    } finally {
      setResolving(false);
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
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isCreator = user?.id === petition.creatorId;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/petitions">
        <Button variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Petitions
        </Button>
      </Link>

      {/* Header Card */}
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
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-lg leading-relaxed">
              {petition.description}
            </p>
          </div>

          {!hasSigned && !isCreator && petition.status !== 'resolved' && (
            <div className="mt-8 pt-8 border-t">
              <Button
                onClick={handleSign}
                disabled={signing}
                size="lg"
                className="w-full md:w-auto"
              >
                {signing ? 'Signing...' : 'Sign This Petition'}
              </Button>
            </div>
          )}

          {petition.status === 'resolved' && !isCreator && (
            <div className="mt-8 pt-8 border-t">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  This petition has been resolved and is no longer accepting signatures.
                </p>
              </div>
            </div>
          )}

          {hasSigned && !isCreator && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium text-lg">Signed</span>
              </div>
            </div>
          )}

          {isCreator && (
            <div className="mt-8 pt-8 border-t space-y-4">
              <div className="flex gap-4 flex-wrap">
                {petition.status !== 'resolved' && (
                  <>
                    {!petition.sentToAuthority && petition.signatureCount >= 10 && (
                      <>
                        {!suggestedAuthority ? (
                          <Button
                            onClick={handleGetAuthoritySuggestion}
                            disabled={loadingAuthority}
                            variant="outline"
                          >
                            {loadingAuthority ? 'Finding Authority...' : 'Find Right Authority'}
                          </Button>
                        ) : (
                          <Button onClick={handleSendToAuthority}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send to Authority
                          </Button>
                        )}
                      </>
                    )}
                    <Button onClick={() => setShowUpdateForm(!showUpdateForm)} variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Post Update
                    </Button>
                    <Button 
                      onClick={handleResolvePetition}
                      disabled={resolving}
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {resolving ? 'Resolving...' : 'Mark as Resolved'}
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Petition
                </Button>
              </div>

              {suggestedAuthority && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Suggested Authority:</h4>
                    <p className="text-sm whitespace-pre-wrap">{suggestedAuthority}</p>
                  </CardContent>
                </Card>
              )}

              {showUpdateForm && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="update">Post an Update</Label>
                      <Textarea
                        id="update"
                        value={updateContent}
                        onChange={(e) => setUpdateContent(e.target.value)}
                        placeholder="Share progress, responses, or new developments..."
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handlePostUpdate}>
                        Post Update
                      </Button>
                      <Button onClick={() => setShowUpdateForm(false)} variant="ghost">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showDeleteConfirm && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 mb-2">Delete this petition?</h4>
                        <p className="text-sm text-red-800">
                          This action cannot be undone. This will permanently delete your petition, 
                          all {formatSignatureCount(petition.signatureCount)} signatures, and any updates. 
                          All data will be lost.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDeletePetition} 
                        disabled={deleting}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                      </Button>
                      <Button 
                        onClick={() => setShowDeleteConfirm(false)} 
                        variant="outline"
                        disabled={deleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolved Banner */}
      {petition.status === 'resolved' && (
        <Card className="border-2 border-emerald-600 bg-emerald-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-100">Petition Resolved</h3>
                <p className="text-sm text-emerald-200">
                  This petition has been successfully resolved by the creator.
                  {petition.resolvedAt && ` Resolved on ${formatDate(petition.resolvedAt)}.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Creator Info */}
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
                {petition.creator.isVerified && (
                  <CheckCircle className="w-4 h-4 inline ml-2 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updates Timeline */}
      {petition.updates && petition.updates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Updates</CardTitle>
            <CardDescription>Latest developments on this petition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...petition.updates]
                .sort((a: any, b: any) => {
                  const aTime = new Date(a.created_at || a.createdAt || 0).getTime();
                  const bTime = new Date(b.created_at || b.createdAt || 0).getTime();
                  return bTime - aTime;
                })
                .map((update: any) => (
                <div key={update.id} className="border-l-2 border-kairo-orange pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-kairo-orange uppercase">
                      {update.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(update.created_at || update.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{update.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signatures */}
      <Card>
        <CardHeader>
          <CardTitle>Signatures ({formatSignatureCount(petition.signatureCount)})</CardTitle>
          <CardDescription>
            {petition.signatures.length > 0 
              ? `${petition.signatures.length} people have signed this petition`
              : 'Be the first to sign this petition'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {petition.signatures.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No signatures yet. Be the first to support this cause!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Signature List */}
              <ul className="divide-y divide-border-subtle border border-border-subtle rounded-lg bg-bg-secondary">
                {petition.signatures.map((sig: any) => (
                  <li key={sig.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary truncate">
                          {sig.user?.name || 'Anonymous User'}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {sig.user?.city || 'Unknown'}, {sig.user?.state || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted whitespace-nowrap">
                        <span>{formatDate(sig.signed_at)}</span>
                        {sig.is_verified && <CheckCircle className="w-3 h-3 text-green-600" />}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Show count if there are more signatures */}
              {petition.signatureCount > petition.signatures.length && (
                <div className="text-center text-sm text-gray-600 pt-4 border-t">
                  <p>
                    Showing {petition.signatures.length} of {formatSignatureCount(petition.signatureCount)} signatures
                  </p>
                </div>
              )}
            </div>
          )}
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
