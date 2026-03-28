'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { auth } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from 'firebase/auth'
import Link from 'next/link'
import { Loader2, MapPin } from 'lucide-react'

type AuthMode = 'signup' | 'profile'

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState<AuthMode>('signup')
  const [loading, setLoading] = useState(false)
  const [fetchingLocation, setFetchingLocation] = useState(false)

  // Signup form data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Profile data for new users
  const [profileData, setProfileData] = useState({
    username: '',
    full_name: '',
    name: '',
    city: '',
    state: '',
    country: '',
    location_lat: null as number | null,
    location_lng: null as number | null,
    location_address: '',
    role: 'other' as string,
    preferredLanguage: 'en' as string,
  })

  const fetchDeviceLocation = async () => {
    setFetchingLocation(true)
    try {
      if (!navigator.geolocation) {
        toast({
          title: 'Location Not Supported',
          description: 'Your browser does not support geolocation',
          variant: 'destructive',
        })
        setFetchingLocation(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            const data = await response.json()

            setProfileData((prev) => ({
              ...prev,
              location_lat: latitude,
              location_lng: longitude,
              city: data.city || data.locality || '',
              state: data.principalSubdivision || '',
              country: data.countryName || '',
              location_address: data.localityInfo?.administrative?.[0]?.name || data.locality || '',
            }))

            toast({
              title: 'Location Detected',
              description: `${data.city || data.locality}, ${data.principalSubdivision}`,
            })
          } catch (error) {
            console.error('Error reverse geocoding:', error)
            setProfileData((prev) => ({
              ...prev,
              location_lat: latitude,
              location_lng: longitude,
            }))
          }

          setFetchingLocation(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          toast({
            title: 'Location Access Denied',
            description: 'Please enable location access or enter manually',
          })
          setFetchingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      )
    } catch (error) {
      console.error('Error fetching location:', error)
      setFetchingLocation(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account',
      })

      const result = await signInWithPopup(auth, provider)
      const user = result.user

      console.log('[Google Auth] User signed up:', user.uid)

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', user.uid)
        .maybeSingle()

      if (existingUser) {
        router.push('/dashboard')
      } else {
        setProfileData((prev) => ({
          ...prev,
          full_name: user.displayName || '',
          name: user.displayName?.split(' ')[0] || '',
          username: user.email?.split('@')[0] || '',
        }))
        setMode('profile')
      }
    } catch (error: any) {
      console.error('[Google Auth] Error:', error)

      let errorMessage = 'Failed to sign up with Google'
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up cancelled'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked. Please allow popups for this site'
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const user = result.user

      console.log('[Email Signup] User created:', user.uid)

      await sendEmailVerification(user)

      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email to verify your account',
      })

      setProfileData((prev) => ({
        ...prev,
        username: email.split('@')[0],
      }))

      setMode('profile')
    } catch (error: any) {
      console.error('[Email Signup] Error:', error)

      let errorMessage = 'Failed to create account'
      if (error.code === 'auth/email-already-in-use') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email)
          if (methods.includes('google.com') && !methods.includes('password')) {
            errorMessage = 'This email is registered with Google. Please use Sign up with Google.'
          } else {
            errorMessage = 'Email already in use. Try logging in instead.'
          }
        } catch {
          errorMessage = 'Email already in use. Try logging in instead.'
        }
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak'
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profileData.username || !profileData.full_name || !profileData.name) {
      toast({
        title: 'Incomplete Profile',
        description: 'Please fill in username, full name, and display name',
        variant: 'destructive',
      })
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      toast({
        title: 'Invalid Username',
        description: 'Username can only contain letters, numbers, and underscores',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('No authenticated user')

      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', profileData.username)
        .maybeSingle()

      if (existingUsername) {
        toast({
          title: 'Username Taken',
          description: 'This username is already in use. Please choose another',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      let authProvider = 'email'
      if (user.providerData[0]?.providerId === 'google.com') {
        authProvider = 'google'
      }

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
      })

      if (error) throw error

      toast({
        title: 'Welcome to PETICIA!',
        description: 'Your profile has been created successfully',
      })

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error creating profile:', error)

      let errorMessage = 'Failed to create profile. Please try again.'
      if (error.code === '23505') {
        if (error.message.includes('username')) {
          errorMessage = 'Username already taken'
        } else if (error.message.includes('email')) {
          errorMessage = 'Email already registered'
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'profile') {
    return (
      <Card {...props}>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Just a few more details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProfile}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  disabled={loading}
                  required
                />
                <FieldDescription>
                  Only letters, numbers, and underscores allowed
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  disabled={loading}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="name">Display Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={loading}
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel htmlFor="location">Location</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchDeviceLocation}
                    disabled={fetchingLocation || loading}
                  >
                    {fetchingLocation ? 'Detecting...' : 'Auto-detect'}
                  </Button>
                </div>

                {profileData.location_lat && (
                  <p className="text-sm text-green-600 mb-2">
                    ✓ Location detected: {profileData.city}, {profileData.state}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <FieldLabel htmlFor="city" className="text-sm">City</FieldLabel>
                    <Input
                      id="city"
                      placeholder="City"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="state" className="text-sm">State</FieldLabel>
                    <Input
                      id="state"
                      placeholder="State"
                      value={profileData.state}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="role">I am a...</FieldLabel>
                <select
                  id="role"
                  title="Select your role"
                  value={profileData.role}
                  onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                  disabled={loading}
                  className="w-full mt-2 h-10 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="student">Student</option>
                  <option value="worker">Worker</option>
                  <option value="woman">Woman</option>
                  <option value="business">Business Owner</option>
                  <option value="senior_citizen">Senior Citizen</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field>
                <FieldLabel htmlFor="language">Preferred Language</FieldLabel>
                <select
                  id="language"
                  title="Select your preferred language"
                  value={profileData.preferredLanguage}
                  onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
                  disabled={loading}
                  className="w-full mt-2 h-10 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </Field>

              <Button type="submit" className="w-full" disabled={loading || fetchingLocation}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Profile
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSignup}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <FieldDescription>
                We'll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <FieldDescription>
                Must be at least 6 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                Sign up with Google
              </Button>
              <FieldDescription className="text-center">
                Already have an account?{' '}
                <Link href="/login" className="underline hover:no-underline">
                  Sign in
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
