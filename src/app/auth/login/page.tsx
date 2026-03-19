'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Mail, Lock, User, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup' | 'profile';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Login/Signup form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile data for new users
  const [profileData, setProfileData] = useState({
    username: '',
    full_name: '',
    name: '', // display name
    city: '',
    state: '',
    country: '',
    location_lat: null as number | null,
    location_lng: null as number | null,
    location_address: '',
    role: 'other' as string,
    preferredLanguage: 'en' as string,
  });

  const fetchDeviceLocation = async () => {
    setFetchingLocation(true);
    try {
      if (!navigator.geolocation) {
        toast({
          title: 'Location Not Supported',
          description: 'Your browser does not support geolocation',
          variant: 'destructive',
        });
        setFetchingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get address details
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            setProfileData(prev => ({
              ...prev,
              location_lat: latitude,
              location_lng: longitude,
              city: data.city || data.locality || '',
              state: data.principalSubdivision || '',
              country: data.countryName || '',
              location_address: data.localityInfo?.administrative?.[0]?.name || data.locality || '',
            }));

            toast({
              title: 'Location Detected',
              description: `${data.city || data.locality}, ${data.principalSubdivision}`,
            });
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            setProfileData(prev => ({
              ...prev,
              location_lat: latitude,
              location_lng: longitude,
            }));
          }
          
          setFetchingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Location Access Denied',
            description: 'Please enable location access or enter manually',
          });
          setFetchingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error('Error fetching location:', error);
      setFetchingLocation(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('[Google Auth] User signed in:', user.uid);

      // Check if user exists in our database
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', user.uid)
        .maybeSingle();

      if (existingUser) {
        // User exists, redirect to dashboard
        router.push('/dashboard');
      } else {
        // New user, pre-fill profile data from Google
        setProfileData(prev => ({
          ...prev,
          full_name: user.displayName || '',
          name: user.displayName?.split(' ')[0] || '',
          username: user.email?.split('@')[0] || '',
        }));
        setMode('profile');
      }
    } catch (error: any) {
      console.error('[Google Auth] Error:', error);
      
      let errorMessage = 'Failed to sign in with Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked. Please allow popups for this site';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create Firebase user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      console.log('[Email Signup] User created:', user.uid);

      // Send email verification
      await sendEmailVerification(user);
      
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email to verify your account',
      });

      // Pre-fill username from email
      setProfileData(prev => ({
        ...prev,
        username: email.split('@')[0],
      }));

      // Show profile completion form
      setMode('profile');
    } catch (error: any) {
      console.error('[Email Signup] Error:', error);
      
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.includes('google.com') && !methods.includes('password')) {
            errorMessage = 'This email is registered with Google. Please use Sign in with Google.';
          } else {
            errorMessage = 'Email already in use. Try logging in instead.';
          }
        } catch {
          errorMessage = 'Email already in use. Try logging in instead.';
        }
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter email and password',
        variant: 'destructive',
      });
      return;
    }

    let loginEmail = email;
    setLoading(true);
    try {
      // Try to login with email first
      loginEmail = email;
      
      // Check if user entered username instead of email
      if (!email.includes('@')) {
        console.log('[Email Login] Username detected, looking up email...');
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('username', email)
          .maybeSingle();
        
        if (userData?.email) {
          loginEmail = userData.email;
          console.log('[Email Login] Found email for username');
        } else {
          toast({
            title: 'User Not Found',
            description: 'No account found with this username',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      loginEmail = loginEmail.trim().toLowerCase();

      // Detect provider before password sign-in to avoid misleading "incorrect password"
      let methods: string[] = [];
      try {
        methods = await fetchSignInMethodsForEmail(auth, loginEmail);
      } catch (methodError) {
        console.warn('[Email Login] Could not fetch sign-in methods:', methodError);
      }

      if (methods.includes('google.com') && !methods.includes('password')) {
        try {
          // One-time bridge: verify with Google popup, then link entered password
          // so next time the user can sign in with email/password directly.
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });

          const popupResult = await signInWithPopup(auth, provider);
          const googleUser = popupResult.user;
          const googleEmail = (googleUser.email || '').trim().toLowerCase();

          if (googleEmail !== loginEmail) {
            toast({
              title: 'Different Google Account Selected',
              description: 'Please choose the same Google account as the email you entered.',
              variant: 'destructive',
            });
            return;
          }

          try {
            const credential = EmailAuthProvider.credential(loginEmail, password);
            await linkWithCredential(googleUser, credential);
            console.log('[Email Login] Linked password provider for Google account');
          } catch (linkError: any) {
            // If already linked or already in use, continue with Google session.
            if (
              linkError?.code !== 'auth/provider-already-linked' &&
              linkError?.code !== 'auth/credential-already-in-use'
            ) {
              throw linkError;
            }
          }

          // After successful Google verification (and best-effort linking), continue login.
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', googleUser.uid)
            .maybeSingle();

          toast({
            title: 'Signed In Successfully',
            description: 'You can now use either Google or email/password for this account.',
          });

          if (existingUser) {
            router.push('/dashboard');
          } else {
            setMode('profile');
          }
          return;
        } catch (googleOnlyError: any) {
          let desc = 'This account is linked with Google. Please click Sign in with Google.';
          if (googleOnlyError?.code === 'auth/popup-closed-by-user') {
            desc = 'Google sign-in was cancelled. Please try again.';
          }
          toast({
            title: 'Use Google Sign-in',
            description: desc,
            variant: 'destructive',
          });
          return;
        }
      }

      // Fallback for environments where provider lookup may be limited
      if (methods.length === 0) {
        const { data: providerData } = await supabase
          .from('users')
          .select('auth_provider')
          .eq('email', loginEmail)
          .maybeSingle();

        if (providerData?.auth_provider === 'google') {
          toast({
            title: 'Use Google Sign-in',
            description: 'This account is linked with Google. Please click Sign in with Google.',
            variant: 'destructive',
          });
          return;
        }
      }

      const result = await signInWithEmailAndPassword(auth, loginEmail, password);
      const user = result.user;

      console.log('[Email Login] User signed in:', user.uid);

      // Check if user profile exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', user.uid)
        .maybeSingle();

      if (existingUser) {
        router.push('/dashboard');
      } else {
        // Edge case: Firebase user exists but no profile
        setMode('profile');
      }
    } catch (error: any) {
      console.error('[Email Login] Error:', error);
      
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-login-credentials'
      ) {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      }

      // If this email belongs to a Google-only account, guide user to Google sign-in.
      try {
        if (loginEmail.includes('@')) {
          const methods = await fetchSignInMethodsForEmail(auth, loginEmail);
          if (methods.includes('google.com') && !methods.includes('password')) {
            errorMessage = 'This account uses Google sign-in. Please click Sign in with Google.';
          }
        }
      } catch {
        // Keep original message if provider lookup fails.
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!profileData.username || !profileData.full_name || !profileData.name) {
      toast({
        title: 'Incomplete Profile',
        description: 'Please fill in username, full name, and display name',
        variant: 'destructive',
      });
      return;
    }

    // Validate username format (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      toast({
        title: 'Invalid Username',
        description: 'Username can only contain letters, numbers, and underscores',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Check if username is already taken
      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', profileData.username)
        .maybeSingle();

      if (existingUsername) {
        toast({
          title: 'Username Taken',
          description: 'This username is already in use. Please choose another',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Determine auth provider
      let authProvider = 'email';
      if (user.providerData[0]?.providerId === 'google.com') {
        authProvider = 'google';
      }

      // Create user profile
      const { error } = await supabase.from('users').insert({
        firebase_uid: user.uid,
        email: user.email,
        username: profileData.username,
        full_name: profileData.full_name,
        name: profileData.name,
        city: profileData.city || null,
        state: profileData.state || null,
        role: profileData.role,
        preferred_language: profileData.preferredLanguage,
        location_lat: profileData.location_lat,
        location_lng: profileData.location_lng,
        location_country: profileData.country || null,
        location_state: profileData.state || null,
        location_address: profileData.location_address || null,
        location_updated_at: profileData.location_lat ? new Date().toISOString() : null,
        is_verified: user.emailVerified,
        email_verified: user.emailVerified,
        verification_type: authProvider,
        verified_at: user.emailVerified ? new Date().toISOString() : null,
        auth_provider: authProvider,
      });

      if (error) throw error;

      toast({
        title: 'Welcome to PETICIA!',
        description: 'Your profile has been created successfully',
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      
      let errorMessage = 'Failed to create profile. Please try again.';
      if (error.code === '23505') {
        if (error.message.includes('username')) {
          errorMessage = 'Username already taken';
        } else if (error.message.includes('email')) {
          errorMessage = 'Email already registered';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8 text-text-secondary hover:text-text-primary transition-colors duration-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-hover rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to PETICIA</CardTitle>
            <CardDescription>
              {mode === 'login' && 'Sign in to your account'}
              {mode === 'signup' && 'Create a new account'}
              {mode === 'profile' && 'Complete your profile'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mode === 'login' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email or Username</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter email or username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-bg-secondary"
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-bg-secondary"
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
                    />
                  </div>
                </div>
                <Button onClick={handleEmailLogin} disabled={loading} className="w-full">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border-strong" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-bg-secondary px-2 text-text-secondary">Or continue with</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>

                <div className="text-center text-sm">
                  <span className="text-text-secondary">Don't have an account? </span>
                  <button
                    onClick={() => setMode('signup')}
                    className="text-accent hover:text-accent-hover font-medium"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-bg-secondary"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (6+ characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-bg-secondary"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-bg-secondary"
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailSignup()}
                    />
                  </div>
                </div>
                <Button onClick={handleEmailSignup} disabled={loading} className="w-full">
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border-strong" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-bg-secondary px-2 text-text-secondary">Or continue with</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>

                <div className="text-center text-sm">
                  <span className="text-text-secondary">Already have an account? </span>
                  <button
                    onClick={() => setMode('login')}
                    className="text-accent hover:text-accent-hover font-medium"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}

            {mode === 'profile' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input
                      id="username"
                      placeholder="Choose a unique username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className="pl-10 bg-bg-secondary"
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">Letters, numbers, and underscores only</p>
                </div>

                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="mt-2 bg-bg-secondary"
                  />
                </div>

                <div>
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    placeholder="How should we call you?"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="mt-2 bg-bg-secondary"
                  />
                </div>

                <div className="border-t border-border-strong pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fetchDeviceLocation}
                      disabled={fetchingLocation}
                    >
                      {fetchingLocation ? 'Detecting...' : 'Auto-detect'}
                    </Button>
                  </div>
                  
                  {profileData.location_lat && (
                    <p className="text-sm text-accent mb-2">
                      ✓ Location detected: {profileData.city}, {profileData.state}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                        className="mt-1 bg-bg-secondary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm">State</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={profileData.state}
                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                        className="mt-1 bg-bg-secondary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">I am a...</Label>
                  <select
                    id="role"
                    title="Select your role"
                    value={profileData.role}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    className="w-full mt-2 h-10 rounded-lg border-2 border-border-strong bg-bg-secondary px-3 text-text-primary focus:outline-none focus:ring-0 focus:shadow-none focus:border-border-strong transition-all duration-200"
                  >
                    <option value="student">Student</option>
                    <option value="worker">Worker</option>
                    <option value="woman">Woman</option>
                    <option value="business">Business Owner</option>
                    <option value="senior_citizen">Senior Citizen</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <select
                    id="language"
                    title="Select your preferred language"
                    value={profileData.preferredLanguage}
                    onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
                    className="w-full mt-2 h-10 rounded-lg border-2 border-border-strong bg-bg-secondary px-3 text-text-primary focus:outline-none focus:ring-0 focus:shadow-none focus:border-border-strong transition-all duration-200"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="mr">मराठी (Marathi)</option>
                  </select>
                </div>

                <Button onClick={handleCreateProfile} disabled={loading || fetchingLocation} className="w-full">
                  {loading ? 'Creating Profile...' : 'Complete Profile'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
