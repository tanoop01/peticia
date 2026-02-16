import { useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';
import { cache, CACHE_KEYS } from '@/lib/cache';

// DEV MODE: Must match login page
const DEV_MODE = false;

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
        .select('id, phone_number, name, city, state, role, preferred_language, is_verified, trust_score, created_at, updated_at')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (data && !error) {
        const kairoUser: User = {
          id: data.id,
          phoneNumber: data.phone_number,
          name: data.name,
          city: data.city,
          state: data.state,
          role: data.role,
          preferredLanguage: data.preferred_language,
          isVerified: data.is_verified,
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
    const loadUser = async () => {
      try {
        let firebaseUid: string | null = null;

        if (DEV_MODE) {
          firebaseUid = localStorage.getItem('dev_firebase_uid');
        }

        if (!firebaseUid) {
          const firebaseUser = auth.currentUser;
          if (firebaseUser) {
            firebaseUid = firebaseUser.uid;
          }
        }

        if (firebaseUid) {
          await loadUserFromSupabase(firebaseUid);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    if (DEV_MODE) {
      loadUser();
      
      const handleStorageChange = () => {
        loadUser();
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } else {
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
    }
  }, [setUser, setLoading, loadUserFromSupabase]);

  return { user, initializing };
}
