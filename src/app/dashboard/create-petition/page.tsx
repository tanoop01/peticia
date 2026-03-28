'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles, MapPin, Upload, ArrowRight, ArrowLeft, Wand2, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { PetitionCategory } from '@/types';

type Step = 'choice' | 'details' | 'manual' | 'review' | 'location';
type CreationMode = 'ai' | 'manual' | null;

export default function CreatePetitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('choice');
  const [mode, setMode] = useState<CreationMode>(null);
  const [loading, setLoading] = useState(false);

  // Form data
  const [category, setCategory] = useState<PetitionCategory>('infrastructure');
  const [problemDescription, setProblemDescription] = useState('');
  const [personalImpact, setPersonalImpact] = useState('');
  const [desiredChange, setDesiredChange] = useState('');
  const [generatedPetition, setGeneratedPetition] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    address: '',
  });
  const [locationAutoFilled, setLocationAutoFilled] = useState(false);

  // Load user's saved location when reaching location step
  useEffect(() => {
    if (step === 'location' && user?.id) {
      loadUserLocation();
    }
  }, [step, user?.id]);

  const loadUserLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('location_lat, location_lng, location_address, location_district, location_city, location_state, location_country')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data.location_lat && data.location_lng) {
        // Build address string from profile data
        const addressParts = [
          data.location_address,
          data.location_district,
          data.location_city,
          data.location_state,
          data.location_country
        ].filter(Boolean);
        
        const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '';

        setLocation({
          latitude: parseFloat(data.location_lat),
          longitude: parseFloat(data.location_lng),
          address: fullAddress,
        });
        setLocationAutoFilled(true);
        toast({
          title: 'Location Auto-filled',
          description: 'Using your saved location from profile',
        });
      }
    } catch (error) {
      console.error('Error loading user location:', error);
    }
  };

  // Pre-fill from AI Assistant if coming from there
  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      setProblemDescription(query);
      setMode('ai');
      setStep('details');
    }
  }, [searchParams]);

  const handleModeSelection = (selectedMode: CreationMode) => {
    setMode(selectedMode);
    if (selectedMode === 'ai') {
      setStep('details');
    } else {
      setStep('manual');
    }
  };

  const handleGeneratePetition = async () => {
    if (!problemDescription || !personalImpact || !desiredChange) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-petition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          problemDescription,
          personalImpact,
          desiredChange,
          location: `${user?.city}, ${user?.state}`,
          language: user?.preferredLanguage || 'en',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate petition');
      }

      const data = await response.json();
      setGeneratedPetition(data.petition);
      setStep('review');
    } catch (error) {
      console.error('Error generating petition:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate petition. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Try to get address from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'PETICIA Petition Platform',
                },
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              
              setLocation({
                latitude: lat,
                longitude: lng,
                address: address,
              });
              
              toast({
                title: 'Location captured',
                description: 'Your location has been added to the petition',
              });
            } else {
              // Fallback: use coordinates as address
              setLocation({
                latitude: lat,
                longitude: lng,
                address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              });
              
              toast({
                title: 'Location captured',
                description: 'Coordinates captured. Please add a description of the location.',
              });
            }
          } catch (error) {
            console.error('Error getting address:', error);
            // Fallback: use coordinates as address
            setLocation({
              latitude: lat,
              longitude: lng,
              address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            });
            
            toast({
              title: 'Location captured',
              description: 'Coordinates captured. Please add a description of the location.',
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Error',
            description: 'Could not get your location. Please enter manually.',
            variant: 'destructive',
          });
        }
      );
    }
  };

  const handleSubmitPetition = async () => {
    if (!title || !generatedPetition || !user) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/petitions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: generatedPetition,
          category,
          location_lat: location.latitude || 0,
          location_lng: location.longitude || 0,
          city: user.city,
          state: user.state,
          address: location.address,
          creator_id: user.id,
          status: 'active',
          language: user.preferredLanguage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create petition');
      }

      toast({
        title: 'Petition Created!',
        description: 'Your petition is now live and collecting signatures',
      });

      router.push(`/dashboard/petitions/${result.data.id}`);
    } catch (error: any) {
      console.error('Error creating petition:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create petition. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories: { value: PetitionCategory; label: string }[] = [
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'safety', label: 'Safety & Security' },
    { value: 'rights', label: 'Rights & Justice' },
    { value: 'consumer', label: 'Consumer Rights' },
    { value: 'environment', label: 'Environment' },
    { value: 'labor', label: 'Labor & Employment' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health' },
    { value: 'corruption', label: 'Corruption' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted p-8 text-foreground">
        <h1 className="text-3xl font-bold mb-2">Create a Petition</h1>
        <p className="text-muted-foreground">
          {step === 'choice' && 'Choose how you want to create your petition'}
          {step === 'details' && 'Tell us about the problem'}
          {step === 'manual' && 'Write your petition'}
          {step === 'review' && 'Review and edit your petition'}
          {step === 'location' && 'Add location details'}
        </p>
      </div>

      {/* Progress Bar */}
      {step !== 'choice' && (
        <div className="flex items-center gap-2">
          <StepIndicator 
            active={step === 'details' || step === 'manual'} 
            completed={step === 'review' || step === 'location'} 
            label="1" 
          />
          <div className="flex-1 h-1 bg-muted rounded">
            <div className={`h-full bg-foreground rounded transition-all ${
              step === 'details' || step === 'manual' ? 'w-0' : step === 'review' ? 'w-1/2' : 'w-full'
            }`} />
          </div>
          <StepIndicator active={step === 'review'} completed={step === 'location'} label="2" />
          <div className="flex-1 h-1 bg-muted rounded">
            <div className={`h-full bg-foreground rounded transition-all ${
              step === 'location' ? 'w-full' : 'w-0'
            }`} />
          </div>
          <StepIndicator active={step === 'location'} completed={false} label="3" />
        </div>
      )}

      {/* Step 0: Choice */}
      {step === 'choice' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Generation Option */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-border-strong" onClick={() => handleModeSelection('ai')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-border bg-muted">
                <Wand2 className="w-6 h-6 text-foreground" />
              </div>
              <CardTitle>Generate with AI</CardTitle>
              <CardDescription>
                Answer a few questions and let AI draft a professional petition for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Professionally formatted petition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Includes relevant legal references</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Quick and easy to create</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Edit before publishing</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-6 hover:border-border-strong">
                <Sparkles className="w-4 h-4 mr-2" />
                Use AI Assistant
              </Button>
            </CardContent>
          </Card>

          {/* Manual Writing Option */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-border-strong" onClick={() => handleModeSelection('manual')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-border bg-muted">
                <Edit3 className="w-6 h-6 text-foreground" />
              </div>
              <CardTitle>Write Manually</CardTitle>
              <CardDescription>
                Write your petition from scratch with complete control over content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Full creative control</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Express in your own words</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>No AI required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground mt-0.5">✓</span>
                  <span>Best for experienced writers</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-6 hover:border-border-strong">
                <FileText className="w-4 h-4 mr-2" />
                Write Myself
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 1: Details (AI Mode) */}
      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Petition Details</CardTitle>
            <CardDescription>
              Provide information about the issue you want to address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PetitionCategory)}
                className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="problem">What is the problem? *</Label>
              <Textarea
                id="problem"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Describe the issue in detail. Example: The main road in our area has had dangerous potholes for 6 months. Despite complaints to the municipal corporation, no action has been taken."
                rows={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="impact">How does this affect you and others? *</Label>
              <Textarea
                id="impact"
                value={personalImpact}
                onChange={(e) => setPersonalImpact(e.target.value)}
                placeholder="Example: These potholes have caused multiple accidents. My neighbor broke their leg after falling. Daily commute is dangerous for everyone."
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="change">What change do you want? *</Label>
              <Textarea
                id="change"
                value={desiredChange}
                onChange={(e) => setDesiredChange(e.target.value)}
                placeholder="Example: We demand the municipal corporation repair all potholes within 15 days and conduct regular road maintenance."
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep('choice')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleGeneratePetition}
                disabled={loading}
                size="lg"
                className="flex-1"
              >
                {loading ? (
                  'Generating Petition...'
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Manual Writing */}
      {step === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Petition</CardTitle>
            <CardDescription>
              Create your petition manually with your own words
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as PetitionCategory)}
                className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="manual-title">Petition Title *</Label>
              <Input
                id="manual-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your petition a clear, concise title"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="manual-content">Petition Content *</Label>
              <Textarea
                id="manual-content"
                value={generatedPetition}
                onChange={(e) => setGeneratedPetition(e.target.value)}
                placeholder="Write your petition here. Include:&#10;• Clear description of the problem&#10;• Who is affected and how&#10;• What action you want from authorities&#10;• Any relevant background information"
                rows={15}
                className="mt-2 font-serif"
              />
              <p className="text-sm text-gray-500 mt-2">
                Tip: Be clear, specific, and respectful. Explain the issue, its impact, and your proposed solution.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep('choice')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!title || !generatedPetition) {
                    toast({
                      title: 'Missing Information',
                      description: 'Please fill in both title and content',
                      variant: 'destructive',
                    });
                    return;
                  }
                  setStep('location');
                }}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review */}
      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Petition</CardTitle>
            <CardDescription>
              AI has drafted your petition. You can edit it before publishing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Petition Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your petition a clear, concise title"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="content">Petition Content *</Label>
              <Textarea
                id="content"
                value={generatedPetition}
                onChange={(e) => setGeneratedPetition(e.target.value)}
                rows={15}
                className="mt-2 font-serif"
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(mode === 'ai' ? 'details' : 'manual')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!title.trim()) {
                    toast({
                      title: 'Title Required',
                      description: 'Please enter a title for your petition',
                      variant: 'destructive',
                    });
                    return;
                  }
                  if (!generatedPetition.trim()) {
                    toast({
                      title: 'Content Required',
                      description: 'Please enter petition content',
                      variant: 'destructive',
                    });
                    return;
                  }
                  setStep('location');
                }}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Location */}
      {step === 'location' && (
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
            <CardDescription>
              Add location to help authorities understand the issue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="address">Address/Location</Label>
              <Textarea
                id="address"
                value={location.address}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
                placeholder="Example: Main Road, Sector 12, near City Mall"
                rows={3}
                className="mt-2"
              />
            </div>

            <Button onClick={handleGetLocation} variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Use My Current Location
            </Button>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(mode === 'ai' ? 'review' : 'manual')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmitPetition}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Publishing...' : 'Publish Petition'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepIndicator({ active, completed, label }: any) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
        completed
          ? 'bg-foreground text-background'
          : active
          ? 'border-2 border-foreground text-foreground'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {label}
    </div>
  );
}
