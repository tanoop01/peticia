'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save, Phone, MapPin, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useLocation, reverseGeocode } from '@/hooks/useLocation';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const { user } = useAuth();
  const { setUser } = useAuthStore();
  const { location, loading: locationLoading, getCurrentLocation } = useLocation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showLocationFields, setShowLocationFields] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    username: '',
    email: '',
    city: '',
    state: '',
    role: '',
    preferredLanguage: '',
    phoneNumber: '',
    // Location fields
    localAddress: '',
    district: '',
    pincode: '',
    locationState: '',
    country: '',
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Reverse geocode when location changes
  useEffect(() => {
    if (location) {
      reverseGeocodeLocation(location.latitude, location.longitude);
    }
  }, [location]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || '',
        fullName: data.full_name || '',
        username: data.username || '',
        email: data.email || '',
        city: data.city || '',
        state: data.state || '',
        role: data.role || '',
        preferredLanguage: data.preferred_language || '',
        phoneNumber: data.phone_number || '',
        localAddress: data.location_address || '',
        district: data.location_district || '',
        pincode: data.location_pincode || '',
        locationState: data.location_state || '',
        country: data.location_country || '',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const reverseGeocodeLocation = async (lat: number, lng: number) => {
    const geoData = await reverseGeocode(lat, lng);
    if (geoData) {
      setFormData(prev => ({
        ...prev,
        country: geoData.country,
        locationState: geoData.state,
        district: geoData.district,
        localAddress: geoData.address,
        pincode: geoData.pincode,
      }));
    }
  };

  const handleFetchLocation = async () => {
    try {
      await getCurrentLocation();
      setShowLocationFields(true);
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

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    // Validate required fields
    if (!formData.name) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in Display Name field',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        name: formData.name,
        full_name: formData.fullName || formData.name,
        city: formData.city || null,
        state: formData.state || null,
        role: formData.role,
        preferred_language: formData.preferredLanguage,
      };

      // Add location data if location was fetched
      if (location) {
        updateData.location_lat = location.latitude.toString();
        updateData.location_lng = location.longitude.toString();
        updateData.location_country = formData.country;
        updateData.location_state = formData.locationState;
        updateData.location_district = formData.district;
        updateData.location_address = formData.localAddress;
        updateData.location_pincode = formData.pincode;
        updateData.location_updated_at = new Date().toISOString();
      }

      console.log('Saving profile with data:', updateData);

      // Use API endpoint with service role permissions
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...updateData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Profile update error:', result.error);
        throw new Error(result.error || 'Failed to update profile');
      }

      console.log('Profile saved successfully:', result.user);

      // Clear ALL user-related caches
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        cache.invalidate(CACHE_KEYS.USER(firebaseUser.uid));
      }
      // Also clear by pattern
      cache.invalidatePattern('user:');
      
      console.log('Cache cleared');

      // Use the returned user data from the API
      const updatedUser = result.user;

      if (updatedUser) {
        // Update the auth store with fresh data
        const newUserData = {
          id: updatedUser.id,
          phoneNumber: updatedUser.phone_number,
          name: updatedUser.name,
          city: updatedUser.city,
          state: updatedUser.state,
          role: updatedUser.role,
          preferredLanguage: updatedUser.preferred_language,
          isVerified: updatedUser.is_verified,
          trustScore: updatedUser.trust_score,
          createdAt: new Date(updatedUser.created_at),
          updatedAt: new Date(updatedUser.updated_at),
        };
        
        console.log('Updating auth store with:', newUserData);
        setUser(newUserData);
        
        // Also cache the new data
        if (firebaseUser) {
          cache.set(CACHE_KEYS.USER(firebaseUser.uid), newUserData, 300000);
        }
        
        // Update form data to reflect saved changes
        setFormData({
          fullName: updatedUser.full_name || '',
          username: updatedUser.username || '',
          email: updatedUser.email || '',
          name: updatedUser.name || '',
          city: updatedUser.city || '',
          state: updatedUser.state || '',
          role: updatedUser.role || '',
          preferredLanguage: updatedUser.preferred_language || '',
          phoneNumber: updatedUser.phone_number || '',
          localAddress: formData.localAddress,
          district: formData.district,
          pincode: formData.pincode,
          locationState: formData.locationState,
          country: formData.country,
        });
      }
      
      setShowLocationFields(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      student: 'Student',
      professional: 'Professional',
      activist: 'Activist',
      other: 'Other',
    };
    return roleMap[role] || role;
  };

  const getLanguageDisplay = (lang: string) => {
    const langMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      mr: 'Marathi',
      gu: 'Gujarati',
      ta: 'Tamil',
      te: 'Telugu',
      bn: 'Bengali',
      kn: 'Kannada',
    };
    return langMap[lang] || lang;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Your Profile</h1>
        <p className="text-text-secondary">Manage your account details and preferences</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-accent" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your basic profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email (Read-only) */}
          {formData.email && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-text-muted" />
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-bg-tertiary cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-text-muted">Email cannot be changed</p>
            </div>
          )}

          {/* Username (Read-only) */}
          {formData.username && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-text-muted" />
                <Input
                  id="username"
                  value={`@${formData.username}`}
                  disabled
                  className="bg-bg-tertiary cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-text-muted">Username cannot be changed</p>
            </div>
          )}

          {/* Phone Number (Read-only) - Only show if exists */}
          {formData.phoneNumber && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-muted" />
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  disabled
                  className="bg-bg-tertiary cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-text-muted">Phone number cannot be changed</p>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className="bg-bg-secondary"
            />
          </div>

          {/* Display Name and Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                placeholder="How should we call you?"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="flex h-10 w-full rounded-lg border-2 border-border-strong bg-bg-secondary px-3 py-2 text-sm text-text-primary transition-all duration-200 focus:outline-none focus:ring-0 focus:shadow-none focus:border-border-strong focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none focus-visible:border-border-strong disabled:cursor-not-allowed disabled:opacity-50 hover:border-border-strong"
              >
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="activist">Activist</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Location Section */}
          <div className="pt-6 border-t border-border-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  Location Details
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Automatically tag petitions and signatures with your area
                </p>
              </div>
              <Button
                onClick={handleFetchLocation}
                disabled={locationLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${locationLoading ? 'animate-spin' : ''}`} />
                {locationLoading ? 'Fetching...' : 'Get Location'}
              </Button>
            </div>

            {/* Saved Location Display - Shows when fields are collapsed */}
            {!showLocationFields && (formData.country || formData.locationState || formData.district) && (
              <div className="p-3 bg-bg-secondary border border-border-subtle rounded-lg">
                <p className="text-xs text-text-muted mb-1">Saved Location:</p>
                <p className="text-sm text-text-secondary">
                  {[formData.localAddress, formData.district, formData.locationState, formData.pincode, formData.country]
                    .filter(Boolean)
                    .join(', ') || 'No location saved'}
                </p>
              </div>
            )}

            {/* Location Form Fields */}
            {showLocationFields && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g., India"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationState">State</Label>
                  <Input
                    id="locationState"
                    placeholder="e.g., Punjab"
                    value={formData.locationState}
                    onChange={(e) => handleInputChange('locationState', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    placeholder="e.g., Jalandhar"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="e.g., 144001"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="localAddress">Local Address</Label>
                <Input
                  id="localAddress"
                  placeholder="e.g., Street name, Locality, Landmark"
                  value={formData.localAddress}
                  onChange={(e) => handleInputChange('localAddress', e.target.value)}
                />
              </div>
            </div>
            )}
          </div>

          {/* Current Values Display */}
          {/* <div className="pt-4 border-t border-border-subtle">
            <p className="text-xs text-text-muted mb-2">Current Settings:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-bg-secondary border border-border-subtle rounded text-xs text-text-secondary">
                {getRoleDisplay(formData.role)}
              </span>
              <span className="px-2 py-1 bg-bg-secondary border border-border-subtle rounded text-xs text-text-secondary">
                {getLanguageDisplay(formData.preferredLanguage)}
              </span>
            </div>
          </div> */}

          {/* Save Button */}
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            variant="default"
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
