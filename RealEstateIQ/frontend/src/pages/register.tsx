import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Building2, Mail, Lock, User, Eye, EyeOff, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
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
      toast.error(error.response?.data?.message || 'Google sign-up failed.');
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
      toast.success(`Verification code sent to ${email}`);
      setStep('otp');
      setCountdown(60);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to send verification code. Please check your email.');
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
      toast.error(error.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account — RealEstateIQ</title>
        <meta name="description" content="Create your RealEstateIQ account to access AI-powered property intelligence." />
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="fixed inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 -translate-x-1/2"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
          />
        </div>

        <div className="w-full max-w-md relative">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Building2 size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-gradient">RealEstateIQ</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">
              {step === 'details' ? 'Create account' : 'Verify Email'}
            </h1>
            <p className="text-white/50">
              {step === 'details'
                ? 'Start making data-driven property decisions'
                : `We sent a 6-digit verification code to ${email}`}
            </p>
          </div>

          <div className="glass-card p-8">
            {step === 'details' ? (
              <>
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
                      Full name
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="input-dark pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-dark pl-11"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="input-dark pl-11 pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className="input-dark pl-11"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    {loading ? 'Sending verification code...' : 'Continue & Verify Email'}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#181829] px-3 text-white/40">Or continue with</span>
                  </div>
                </div>

                {/* Google OAuth Register */}
                <div className="flex justify-center w-full">
                  {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                    <div className="w-full flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Google Sign-Up failed. Please try again.')}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        text="signup_with"
                        width="100%"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toast.error('Google Client ID is not configured yet in .env.')}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={24} />
                  </div>
                  <p className="text-sm text-white/70">
                    Enter the 6-digit code sent to <br />
                    <span className="font-semibold text-white">{email}</span>
                  </p>
                </div>

                <div>
                  <label htmlFor="otp" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 text-center">
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
                    className="input-dark text-center font-mono text-2xl tracking-[0.5em] py-3 text-brand-300 font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to details
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || resending}
                    className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 disabled:text-white/30 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-white/50 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
