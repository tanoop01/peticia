import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Petition, PetitionCategory, PetitionStatus } from '@/types';
import { cache, CACHE_KEYS } from '@/lib/cache';

interface UsePetitionsOptions {
  category?: PetitionCategory;
  status?: PetitionStatus;
  city?: string;
  state?: string;
  creatorId?: string;
  limit?: number;
}

export function usePetitions(options: UsePetitionsOptions = {}) {
  // Use local state instead of shared store to prevent race conditions
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize options to prevent unnecessary re-fetching
  const optionsKey = JSON.stringify(options);
  const prevOptionsKey = useRef<string>();

  useEffect(() => {
    if (prevOptionsKey.current !== optionsKey) {
      prevOptionsKey.current = optionsKey;
      fetchPetitions();
    }
  }, [optionsKey]);

  async function fetchPetitions() {
    setLoading(true);
    setError(null);

    try {
      // Generate cache key based on query options
      const cacheKey = `petitions:${optionsKey}`;
      
      // Try to get from cache first
      const cachedData = cache.get<Petition[]>(cacheKey);
      if (cachedData) {
        setPetitions(cachedData);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('petitions')
        .select(`
          id,
          title,
          description,
          category,
          location_lat,
          location_lng,
          city,
          state,
          address,
          pincode,
          creator_id,
          signature_count,
          status,
          created_at,
          updated_at,
          sent_to_authority,
          sent_at,
          response_received,
          resolved_at,
          language,
          creator:users!creator_id(id, name, city, state, trust_score),
          petition_updates(id, created_at)
        `)
        .order('created_at', { ascending: false });

      if (options.category) {
        query = query.eq('category', options.category);
      }
      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.city) {
        query = query.ilike('city', options.city);
      }
      if (options.state) {
        query = query.ilike('state', options.state);
      }
      if (options.creatorId) {
        query = query.eq('creator_id', options.creatorId);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedPetitions: Petition[] = (data || []).map(mapPetitionFromDB);
      
      // Cache the results
      cache.set(cacheKey, formattedPetitions);
      
      setPetitions(formattedPetitions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { petitions, loading, error, refetch: fetchPetitions };
}

export function usePetition(id: string) {
  const [petition, setPetition] = useState<Petition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPetition();
  }, [id]);

  async function fetchPetition() {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('petitions')
        .select(`
          *,
          creator:users(*),
          signatures(*, user:users(*)),
          evidence(*),
          petition_authorities(authority:authorities(*)),
          petition_updates(*, created_by_user:users(*))
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        setPetition(mapPetitionFromDB(data));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { petition, loading, error, refetch: fetchPetition };
}

function mapPetitionFromDB(data: any): Petition {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    location: {
      latitude: parseFloat(data.location_lat),
      longitude: parseFloat(data.location_lng),
      city: data.city,
      state: data.state,
      address: data.address,
      pincode: data.pincode,
    },
    creatorId: data.creator_id,
    creator: data.creator ? {
      id: data.creator.id,
      phoneNumber: data.creator.phone_number || '',
      name: data.creator.name,
      city: data.creator.city,
      state: data.creator.state,
      role: data.creator.role || 'citizen',
      preferredLanguage: data.creator.preferred_language || 'en',
      isVerified: data.creator.is_verified || false,
      trustScore: data.creator.trust_score || 0,
      createdAt: data.creator.created_at ? new Date(data.creator.created_at) : new Date(),
      updatedAt: data.creator.updated_at ? new Date(data.creator.updated_at) : new Date(),
    } : {} as any,
    signatures: data.signatures || [],
    signatureCount: data.signature_count || 0,
    evidence: data.evidence || [],
    targetAuthorities: data.petition_authorities?.map((pa: any) => pa.authority) || [],
    status: data.status,
    updates: data.petition_updates || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    sentToAuthority: data.sent_to_authority || false,
    sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
    responseReceived: data.response_received || false,
    resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
    language: data.language || 'en',
  };
}
