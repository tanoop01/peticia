'use client';

// ============================================
// PHONE AUTHENTICATION - ARCHIVED
// ============================================
// This file contains the phone OTP authentication code
// It is preserved here for future reactivation when Blaze plan is affordable
// Original location: src/app/auth/login/page.tsx
// Archived: 2026-02-17
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// PHONE AUTH CONFIGURATION
// ⚠️ Firebase blocks real SMS on localhost - this is expected behavior
// 
// LOCAL DEVELOPMENT (localhost):
//   - Use Firebase test numbers: +91 83189 15519 → OTP: 123456
//   - Configure test numbers in Firebase Console → Authentication → Phone
//
// PRODUCTION (deployed domain):
//   - Real SMS works automatically
//   - Add your domain to Firebase Console → Settings → Authorized domains
//
// DEV_MODE is for legacy bypass, keep it disabled (false)
const DEV_MODE = false;
const DEV_OTP = '241240';

export default function PhoneLoginPageArchived() {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile data for new users
  const [profileData, setProfileData] = useState({
    name: '',
    city: '',
    state: '',
    role: 'other' as any,
    preferredLanguage: 'en' as any,
  });

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('[reCAPTCHA] Verified automatically');
        },
        'expired-callback': () => {
          console.log('[reCAPTCHA] Expired - will retry');
          if ((window as any).recaptchaVerifier) {
            try {
              (window as any).recaptchaVerifier.clear();
            } catch (e) {}
            (window as any).recaptchaVerifier = null;
          }
        },
        'error-callback': (error: any) => {
          console.error('[reCAPTCHA] Error:', error);
        }
      });
      
      try {
        (window as any).recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).recaptchaWidgetId = widgetId;
          console.log('[reCAPTCHA] Rendered and ready');
        });
      } catch (e) {
        console.log('[reCAPTCHA] Render will happen on demand');
      }
    }
    return (window as any).recaptchaVerifier;
  };

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (DEV_MODE) {
        console.log('[DEV MODE] Phone number:', phoneNumber);
        setStep('otp');
        toast({
          title: 'OTP Sent',
          description: 'Please check your phone for the verification code',
        });
      } else {
        console.log('[Firebase Auth] Starting phone authentication...');
        
        if ((window as any).recaptchaVerifier) {
          try {
            (window as any).recaptchaVerifier.clear();
          } catch (e) {
            console.log('[Firebase Auth] Error clearing reCAPTCHA:', e);
          }
          (window as any).recaptchaVerifier = null;
        }

        const appVerifier = setupRecaptcha();
        const formattedPhone = `+91${phoneNumber}`;
        const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        
        setConfirmationResult(result);
        setStep('otp');
        
        toast({
          title: 'OTP Sent',
          description: 'Please check your phone for the verification code',
        });
      }
    } catch (error: any) {
      console.error('[Firebase Auth] Error sending OTP:', error);
      
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/invalid-app-credential') {
        errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
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

  const verifyOTP = async () => {
    if (!otp) return;

    setLoading(true);
    try {
      if (DEV_MODE) {
        if (otp !== DEV_OTP) {
          toast({
            title: 'Invalid OTP',
            description: 'Please enter the correct verification code',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const mockFirebaseUid = `dev_${phoneNumber}`;
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', mockFirebaseUid)
          .maybeSingle();

        if (existingUser) {
          localStorage.setItem('dev_firebase_uid', mockFirebaseUid);
          localStorage.setItem('dev_phone_number', `+91${phoneNumber}`);
          router.push('/dashboard');
        } else {
          const { data: existingPhone } = await supabase
            .from('users')
            .select('*')
            .eq('phone_number', `+91${phoneNumber}`)
            .maybeSingle();
          
          if (existingPhone) {
            localStorage.setItem('dev_firebase_uid', existingPhone.firebase_uid);
            localStorage.setItem('dev_phone_number', `+91${phoneNumber}`);
            router.push('/dashboard');
          } else {
            localStorage.setItem('dev_firebase_uid', mockFirebaseUid);
            localStorage.setItem('dev_phone_number', `+91${phoneNumber}`);
            setStep('profile');
          }
        }
      } else {
        if (!confirmationResult) {
          toast({
            title: 'Error',
            description: 'Session expired. Please request OTP again.',
            variant: 'destructive',
          });
          setStep('phone');
          setLoading(false);
          return;
        }
        
        const result = await confirmationResult.confirm(otp);
        const user = result.user;

        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('firebase_uid', user.uid)
          .maybeSingle();

        if (existingUser) {
          router.push('/dashboard');
        } else {
          const { data: existingPhone } = await supabase
            .from('users')
            .select('*')
            .eq('phone_number', user.phoneNumber)
            .maybeSingle();
          
          if (existingPhone) {
            const { error: updateError } = await supabase
              .from('users')
              .update({ firebase_uid: user.uid })
              .eq('phone_number', user.phoneNumber);
            
            if (!updateError) {
              router.push('/dashboard');
            } else {
              setStep('profile');
            }
          } else {
            setStep('profile');
          }
        }
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the correct verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!profileData.name || !profileData.city || !profileData.state) {
      toast({
        title: 'Incomplete Profile',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let firebaseUid: string;
      let phoneNum: string;

      if (DEV_MODE) {
        firebaseUid = localStorage.getItem('dev_firebase_uid') || `dev_${phoneNumber}`;
        phoneNum = localStorage.getItem('dev_phone_number') || `+91${phoneNumber}`;
      } else {
        const user = auth.currentUser;
        if (!user) throw new Error('No authenticated user');
        firebaseUid = user.uid;
        phoneNum = user.phoneNumber || '';
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNum)
        .maybeSingle();

      if (existingUser) {
        if (existingUser.firebase_uid !== firebaseUid) {
          await supabase
            .from('users')
            .update({ firebase_uid: firebaseUid })
            .eq('phone_number', phoneNum);
        }
      } else {
        const { error } = await supabase.from('users').insert({
          firebase_uid: firebaseUid,
          phone_number: phoneNum,
          name: profileData.name,
          city: profileData.city,
          state: profileData.state,
          role: profileData.role,
          preferred_language: profileData.preferredLanguage,
          is_verified: true,
          verification_type: 'phone',
          verified_at: new Date().toISOString(),
          auth_provider: 'phone',
        });

        if (error) throw error;
      }

      toast({
        title: 'Welcome to PETICIA!',
        description: 'Your profile has been created successfully',
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div id="recaptcha-container" />
      
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
              {step === 'phone' && 'Sign in with your phone number'}
              {step === 'otp' && 'Enter the verification code'}
              {step === 'profile' && 'Complete your profile'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'phone' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex mt-2">
                    <span className="inline-flex items-center px-3 rounded-l-lg border-2 border-r-0 border-border-strong bg-bg-tertiary text-text-secondary">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10 digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="rounded-l-none border-l-0 bg-bg-secondary"
                      maxLength={10}
                    />
                  </div>
                </div>
                <Button onClick={sendOTP} disabled={loading} className="w-full">
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="mt-2 bg-bg-secondary"
                  />
                </div>
                <Button onClick={verifyOTP} disabled={loading} className="w-full">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button variant="ghost" onClick={() => setStep('phone')} className="w-full">
                  Change Phone Number
                </Button>
              </div>
            )}

            {step === 'profile' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="mt-2 bg-bg-secondary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      className="mt-2 bg-bg-secondary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                      className="mt-2 bg-bg-secondary"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">I am a...</Label>
                  <select
                    id="role"
                    value={profileData.role}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value as any })}
                    className="w-full mt-2 h-10 rounded-lg border-2 border-border-strong bg-bg-secondary px-3 text-text-primary"
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
                    value={profileData.preferredLanguage}
                    onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value as any })}
                    className="w-full mt-2 h-10 rounded-lg border-2 border-border-strong bg-bg-secondary px-3 text-text-primary"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="mr">मराठी (Marathi)</option>
                  </select>
                </div>
                <Button onClick={createProfile} disabled={loading} className="w-full">
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
