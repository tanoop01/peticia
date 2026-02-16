'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const { toast } = useToast();

  const getCurrentLocation = useCallback((): Promise<LocationCoordinates> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        const err: LocationError = {
          code: 0,
          message: 'Geolocation is not supported by your browser'
        };
        setError(err);
        setLoading(false);
        toast({
          title: 'Location Not Supported',
          description: 'Your browser does not support geolocation',
          variant: 'destructive',
        });
        reject(err);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(coords);
          setLoading(false);
          resolve(coords);
        },
        (error) => {
          const err: LocationError = {
            code: error.code,
            message: getErrorMessage(error.code),
          };
          setError(err);
          setLoading(false);
          toast({
            title: 'Location Access Denied',
            description: err.message,
            variant: 'destructive',
          });
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, [toast]);

  const watchLocation = useCallback((
    onSuccess: (coords: LocationCoordinates) => void,
    onError?: (error: LocationError) => void
  ): number | null => {
    if (!navigator.geolocation) {
      const err: LocationError = {
        code: 0,
        message: 'Geolocation is not supported by your browser',
      };
      onError?.(err);
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setLocation(coords);
        onSuccess(coords);
      },
      (error) => {
        const err: LocationError = {
          code: error.code,
          message: getErrorMessage(error.code),
        };
        setError(err);
        onError?.(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return watchId;
  }, []);

  const clearWatch = useCallback((watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    watchLocation,
    clearWatch,
  };
}

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location access was denied. Please enable location permissions in your browser settings.';
    case 2:
      return 'Location information is unavailable. Please check your device settings.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while fetching location.';
  }
}

/**
 * Reverse geocode coordinates to get detailed address information
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{
  city: string;
  state: string;
  district: string;
  country: string;
  address: string;
  pincode: string;
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PETICIA-Civic-Platform',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};
    
    console.log('Reverse geocode response:', data);
    console.log('Postcode from API:', address.postcode);

    // Extract city (try multiple fallbacks)
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      'Unknown';

    // Extract state
    const state = address.state || address.region || 'Unknown';

    // Extract district (administrative subdivision)
    const district =
      address.county ||
      address.state_district ||
      address.district ||
      'Unknown';

    // Extract country
    const country = address.country || 'Unknown';

    // Format full address
    const addressParts = [
      address.road,
      address.suburb,
      address.village,
      address.city || address.town,
      address.county,
      address.state,
      address.postcode,
    ].filter(Boolean);

    return {
      city,
      state,
      district,
      country,
      address: addressParts.join(', ') || data.display_name || 'Unknown location',
      pincode: address.postcode || '',
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}
