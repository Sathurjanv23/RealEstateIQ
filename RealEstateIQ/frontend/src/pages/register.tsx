import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Eye, EyeOff, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { BrandLogo } from '../components/ui/BrandLogo';
import { authService } from '../services/services';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Registration form state
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      toast.error('No Google credential returned.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.googleLogin(credentialResponse.credential);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome to RealEstateIQ, ${user.name}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Google registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Validate details & send OTP email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp(email, name);
      toast.success(`Verification code dispatched to ${email}`);
      setStep('otp');
      setCountdown(60);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP email
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await authService.sendOtp(email, name);
      toast.success('A new verification code has been dispatched.');
      setCountdown(60);
      setOtp('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyRegister({
        name,
        email,
        password,
        otp: otp.trim(),
      });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome to RealEstateIQ, ${user.name}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Verification failed. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account — RealEstateIQ</title>
        <meta name="description" content="Create your RealEstateIQ account to access institutional property intelligence." />
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F7F5F0]">
        <div className="w-full max-w-md relative animate-fade-in">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BrandLogo size="lg" showText={true} />
            </div>
            <h1 className="text-2xl font-black text-[#17231C] tracking-tight mb-1">
              {step === 'details' ? 'Create Client Account' : 'Verify Email Address'}
            </h1>
            <p className="text-[#718078] text-xs">
              {step === 'details'
                ? 'Join Sri Lanka’s premier real estate valuation network'
                : `Enter the 6-digit verification code sent to ${email}`}
            </p>
          </div>

          <div className="card-premium p-8 bg-white border border-[#E7E3DA] shadow-soft-lg">
            {step === 'details' ? (
              <>
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-[#17231C] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718078]" />
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Priyantha Jayasuriya"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-[#17231C] mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718078]" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@investor.lk"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-[#17231C] mb-1.5">
                      Password (min 8 characters)
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718078]" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="input-field pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#718078] hover:text-[#17231C]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#17231C] mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718078]" />
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-sm mt-2 disabled:opacity-50"
                  >
                    {loading ? 'Dispatching verification code...' : 'Continue & Verify Email'}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E7E3DA]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                    <span className="bg-white px-3 text-[#718078]">Or continue with</span>
                  </div>
                </div>

                {/* Google OAuth Register */}
                <div className="flex justify-center w-full">
                  {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                    <div className="w-full flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Google Sign-Up failed.')}
                        theme="outline"
                        shape="pill"
                        size="large"
                        text="signup_with"
                        width="100%"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toast.error('Google Client ID is not configured yet.')}
                      className="btn-secondary w-full py-2.5 text-xs justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Sign up with Google
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Step 2: OTP Verification Form */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF3EE] border border-[#B8D1C4] text-[#123B2A] flex items-center justify-center mx-auto mb-3">
                    <KeyRound size={22} />
                  </div>
                  <p className="text-xs text-[#718078]">
                    Enter the 6-digit verification code sent to <br />
                    <strong className="text-[#17231C]">{email}</strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-xs font-bold text-[#17231C] uppercase tracking-wider mb-2 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="input-field text-center font-mono text-2xl tracking-[0.5em] py-3 text-[#123B2A] font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full py-3.5 text-sm disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Complete Account'}
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="inline-flex items-center gap-1.5 text-[#718078] hover:text-[#123B2A] font-medium"
                  >
                    <ArrowLeft size={14} /> Back to details
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || resending}
                    className="inline-flex items-center gap-1.5 text-[#123B2A] hover:text-[#2F6B4F] disabled:text-[#718078]/50 disabled:cursor-not-allowed font-bold"
                  >
                    <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-[#718078] text-xs mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#123B2A] hover:text-[#2F6B4F] font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
