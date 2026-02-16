'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, RefreshCw, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, reverseGeocode } from '@/hooks/useLocation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface LocationData {
  latitude: number;
  longitude: number;
  country: string;
  state: string;
  district: string;
  address: string;
  updatedAt?: string;
}

export function LocationSettings() {
  const { user } = useAuth();
  const { location, loading, getCurrentLocation } = useLocation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [savedLocation, setSavedLocation] = useState<LocationData | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form fields for address details
  const [formData, setFormData] = useState({
    country: '',
    state: '',
    district: '',
    address: '',
  });

  // Load saved location on mount
  useEffect(() => {
    if (user?.id) {
      loadSavedLocation();
    }
  }, [user?.id]);

  // Reverse geocode when location changes and auto-fill form
  useEffect(() => {
    if (location) {
      reverseGeocodeLocation(location.latitude, location.longitude);
    }
  }, [location]);

  const loadSavedLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('location_lat, location_lng, location_country, location_state, location_district, location_address, location_updated_at')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data.location_lat && data.location_lng) {
        const savedData: LocationData = {
          latitude: parseFloat(data.location_lat),
          longitude: parseFloat(data.location_lng),
          country: data.location_country || '',
          state: data.location_state || '',
          district: data.location_district || '',
          address: data.location_address || '',
          updatedAt: data.location_updated_at,
        };
        setSavedLocation(savedData);
        
        // Store saved data in form for when user clicks "Get Current Location"
        // But don't show the form yet
        setFormData({
          country: savedData.country,
          state: savedData.state,
          district: savedData.district,
          address: savedData.address,
        });
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
    }
  };

  const reverseGeocodeLocation = async (lat: number, lng: number) => {
    const geoData = await reverseGeocode(lat, lng);
    if (geoData) {
      // Auto-fill form fields with geocoded data
      setFormData({
        country: geoData.country,
        state: geoData.state,
        district: geoData.district,
        address: geoData.address,
      });
    }
  };

  const handleFetchLocation = async () => {
    try {
      await getCurrentLocation();
      setShowForm(true); // Show form after fetching location
      toast({
        title: 'Location Fetched',
        description: 'Your current location has been retrieved. Address details are being loaded...',
      });
    } catch (error) {
      // Error toast already shown by useLocation hook
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveLocation = async () => {
    if (!location || !user?.id) {
      toast({
        title: 'No Location',
        description: 'Please fetch your current location first',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!formData.country || !formData.state || !formData.district) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in Country, State, and District fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/user/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          country: formData.country,
          state: formData.state,
          district: formData.district,
          address: formData.address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save location');
      }

      setSavedLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        country: formData.country,
        state: formData.state,
        district: formData.district,
        address: formData.address,
        updatedAt: result.data.updatedAt,
      });

      setShowForm(false); // Hide form after successful save

      toast({
        title: 'Location Saved',
        description: 'Your location and address details have been saved successfully',
      });
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save location. Please make sure the database migration has been applied.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-kairo-orange" />
          Your Location
        </CardTitle>
        <CardDescription>
          Save your location to automatically tag petitions and signatures with your area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saved Location Display */}
        {savedLocation && (
          <div className="p-4 bg-bg-secondary border-2 border-strong rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-text-primary">Location Saved</p>
                <p className="text-sm text-text-secondary mt-1">
                  {[savedLocation.address, savedLocation.district, savedLocation.state, savedLocation.country]
                    .filter(Boolean)
                    .join(', ') || 'No address details'}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Last updated: {formatDate(savedLocation.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fetch Location Button */}
        <Button
          onClick={handleFetchLocation}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Fetching Location...' : 'Get Current Location'}
        </Button>

        {/* Current GPS Coordinates */}
        {/* {location && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-1">GPS Coordinates:</p>
            <p className="text-sm text-blue-700">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Accuracy: ±{location.accuracy.toFixed(0)}m
            </p>
          </div>
        )} */}

        {/* Address Form Fields - Only show when form is active */}
        {showForm && (
          <>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="e.g., India"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={!location}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="e.g., Maharashtra"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={!location}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  placeholder="e.g., Mumbai"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  disabled={!location}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Local Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., Street name, Locality, Landmark"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!location}
                />
              </div>
            </div>

            {/* Save Button */}
            {location && (
              <Button
                onClick={handleSaveLocation}
                disabled={saving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Location'}
              </Button>
            )}
          </>
        )}

     
      </CardContent>
    </Card>
  );
}
