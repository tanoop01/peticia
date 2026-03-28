'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
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
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  linkWithCredential,
} from 'firebase/auth'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account',
      })

      const result = await signInWithPopup(auth, provider)
      const user = result.user

      console.log('[Google Auth] User signed in:', user.uid)

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', user.uid)
        .maybeSingle()

      if (existingUser) {
        router.push('/dashboard')
      } else {
        router.push('/signup')
      }
    } catch (error: any) {
      console.error('[Google Auth] Error:', error)

      let errorMessage = 'Failed to sign in with Google'
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled'
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter email and password',
        variant: 'destructive',
      })
      return
    }

    let loginEmail = email.trim().toLowerCase()
    setLoading(true)

    try {
      if (!email.includes('@')) {
        console.log('[Email Login] Username detected, looking up email...')
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('username', email)
          .maybeSingle()

        if (userData?.email) {
          loginEmail = userData.email
          console.log('[Email Login] Found email for username')
        } else {
          toast({
            title: 'User Not Found',
            description: 'No account found with this username',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }
      }

      let methods: string[] = []
      try {
        methods = await fetchSignInMethodsForEmail(auth, loginEmail)
      } catch (methodError) {
        console.warn('[Email Login] Could not fetch sign-in methods:', methodError)
      }

      if (methods.includes('google.com') && !methods.includes('password')) {
        try {
          const provider = new GoogleAuthProvider()
          provider.setCustomParameters({ prompt: 'select_account' })

          const popupResult = await signInWithPopup(auth, provider)
          const googleUser = popupResult.user
          const googleEmail = (googleUser.email || '').trim().toLowerCase()

          if (googleEmail !== loginEmail) {
            toast({
              title: 'Different Google Account Selected',
              description: 'Please choose the same Google account as the email you entered.',
              variant: 'destructive',
            })
            return
          }

          try {
            const credential = EmailAuthProvider.credential(loginEmail, password)
            await linkWithCredential(googleUser, credential)
            console.log('[Email Login] Linked password provider for Google account')
          } catch (linkError: any) {
            if (
              linkError?.code !== 'auth/provider-already-linked' &&
              linkError?.code !== 'auth/credential-already-in-use'
            ) {
              throw linkError
            }
          }

          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', googleUser.uid)
            .maybeSingle()

          toast({
            title: 'Signed In Successfully',
            description: 'You can now use either Google or email/password for this account.',
          })

          if (existingUser) {
            router.push('/dashboard')
          } else {
            router.push('/signup')
          }
          return
        } catch (googleOnlyError: any) {
          let desc = 'This account is linked with Google. Please click Sign in with Google.'
          if (googleOnlyError?.code === 'auth/popup-closed-by-user') {
            desc = 'Google sign-in was cancelled. Please try again.'
          }
          toast({
            title: 'Use Google Sign-in',
            description: desc,
            variant: 'destructive',
          })
          return
        }
      }

      if (methods.length === 0) {
        const { data: providerData } = await supabase
          .from('users')
          .select('auth_provider')
          .eq('email', loginEmail)
          .maybeSingle()

        if (providerData?.auth_provider === 'google') {
          toast({
            title: 'Use Google Sign-in',
            description: 'This account is linked with Google. Please click Sign in with Google.',
            variant: 'destructive',
          })
          return
        }
      }

      const result = await signInWithEmailAndPassword(auth, loginEmail, password)
      const user = result.user

      console.log('[Email Login] User signed in:', user.uid)

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', user.uid)
        .maybeSingle()

      if (existingUser) {
        router.push('/dashboard')
      } else {
        router.push('/signup')
      }
    } catch (error: any) {
      console.error('[Email Login] Error:', error)

      let errorMessage = 'Failed to sign in'
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email'
      } else if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-login-credentials'
      ) {
        errorMessage = 'Incorrect password'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later'
      }

      try {
        if (loginEmail.includes('@')) {
          const methods = await fetchSignInMethodsForEmail(auth, loginEmail)
          if (methods.includes('google.com') && !methods.includes('password')) {
            errorMessage = 'This account uses Google sign-in. Please click Sign in with Google.'
          }
        }
      } catch {
        // Keep original message if provider lookup fails.
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

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Sign in with your email and password or use Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email or Username</FieldLabel>
                <Input
                  id="email"
                  type="text"
                  placeholder="m@example.com or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
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
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  Sign in with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="underline hover:no-underline">
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
