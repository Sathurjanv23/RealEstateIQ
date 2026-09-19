import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { BrandLogo } from '../components/ui/BrandLogo';
import { authService } from '../services/services';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In — RealEstateIQ</title>
        <meta name="description" content="Sign in to RealEstateIQ to access AI-powered property intelligence." />
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        {/* Background blur */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 -translate-x-1/2"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        </div>

        <div className="w-full max-w-md relative">
          {/* Logo */}
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <BrandLogo size="lg" showText={true} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Sign in to access your Sri Lanka property portfolio</p>
          </div>

          {/* Form */}
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
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

            {/* Google OAuth Login */}
            <div className="flex justify-center w-full">
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Sign-In failed. Please try again.')}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="continue_with"
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
                  Continue with Google
                </button>
              )}
            </div>


          </div>

          <p className="text-center text-white/50 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
