import { useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';
import { cache, CACHE_KEYS } from '@/lib/cache';

// DEV MODE removed - email auth handles all environments now

export function useAuth() {
  const { user, setUser, setLoading } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  const loadUserFromSupabase = useCallback(async (firebaseUid: string) => {
    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.USER(firebaseUid);
      const cachedUser = cache.get<User>(cacheKey);
      
      if (cachedUser) {
        setUser(cachedUser);
        return cachedUser;
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, phone_number, name, full_name, city, state, role, preferred_language, is_verified, email_verified, auth_provider, trust_score, created_at, updated_at')
        .eq('firebase_uid', firebaseUid)
        .maybeSingle();

      if (data && !error) {
        const kairoUser: User = {
          id: data.id,
          email: data.email || undefined,
          username: data.username || undefined,
          phoneNumber: data.phone_number || undefined,
          name: data.name,
          fullName: data.full_name || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          role: data.role,
          preferredLanguage: data.preferred_language,
          isVerified: data.is_verified,
          emailVerified: data.email_verified || undefined,
          authProvider: data.auth_provider || undefined,
          trustScore: data.trust_score,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        
        // Cache the user data for 5 minutes
        cache.set(cacheKey, kairoUser, 300000);
        
        setUser(kairoUser);
        return kairoUser;
      }
      setUser(null);
      return null;
    } catch (error) {
      console.error('Error loading user from Supabase:', error);
      setUser(null);
      return null;
    }
  }, [setUser]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        await loadUserFromSupabase(firebaseUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, loadUserFromSupabase]);

  return { user, initializing };
}
