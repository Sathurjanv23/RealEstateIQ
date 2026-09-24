import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
      toast.error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In — RealEstateIQ</title>
        <meta name="description" content="Sign in to RealEstateIQ to access Sri Lankan real estate intelligence." />
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#061017] hero-grid-pattern relative overflow-hidden">
        {/* Subtle emerald ambient aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00DC82]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fade-in">

          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <BrandLogo size="lg" showText={true} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Client Portal Sign In
            </h1>
            <p className="text-[#94A3B8] text-xs">
              Access institutional real estate valuations and portfolio intelligence
            </p>
          </div>

          {/* Form Card: Dark Charcoal with crisp border */}
          <div className="card-premium p-8 bg-[#0B1722] border border-[#162E40] shadow-2xl rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#CBD5E1] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@investor.lk"
                    className="w-full bg-[#08141F] border border-[#162E40] focus:border-[#00DC82] focus:ring-1 focus:ring-[#00DC82] text-white placeholder-[#64748B] rounded-xl px-4 py-3 pl-11 text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-[#CBD5E1] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#08141F] border border-[#162E40] focus:border-[#00DC82] focus:ring-1 focus:ring-[#00DC82] text-white placeholder-[#64748B] rounded-xl px-4 py-3 pl-11 pr-11 text-sm outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-sm font-bold mt-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#162E40]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-[#0B1722] px-3 text-[#64748B]">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Login */}
            <div className="flex justify-center w-full">
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Sign-In failed.')}
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
                  onClick={() => toast.error('Google Client ID is not configured yet.')}
                  className="btn-secondary w-full py-2.5 text-xs justify-center"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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

          <p className="text-center text-[#94A3B8] text-xs mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#00DC82] hover:underline font-bold">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
