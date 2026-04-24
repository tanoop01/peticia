import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const fetchWithSupabaseDiagnostics: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (error) {
    const target =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (target.includes('.supabase.co')) {
      const networkError = new Error(
        'Unable to reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and DNS/network connectivity.'
      );
      (networkError as any).code = 'SUPABASE_NETWORK_ERROR';
      (networkError as any).cause = error;
      throw networkError;
    }

    throw error;
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: fetchWithSupabaseDiagnostics,
    headers: {
      'x-client-info': 'kairo-web-app'
    }
  },
  db: {
    schema: 'public'
  },
  // Performance optimizations
  realtime: {
    params: {
      eventsPerSecond: 2 // Reduce realtime event frequency
    }
  }
});

// Server-side client with service role (for admin operations)
// Only create this on the server side
let _supabaseAdmin: any = null;

export const getSupabaseAdmin = (): any => {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin can only be used server-side');
  }
  
  if (!_supabaseAdmin) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
    }
    
    _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  
  return _supabaseAdmin;
};
