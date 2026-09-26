import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
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

  const handleGoogleAuth = async (accessToken: string) => {
    setLoading(true);
    try {
      const res = await authService.googleLogin({ accessToken });
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

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleAuth(tokenResponse.access_token),
    onError: () => toast.error('Google Sign-In was cancelled or failed.'),
  });

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
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-12 bg-[#080A0E] relative overflow-y-auto">
        {/* Subtle champagne gold ambient aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#DFBA73]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-fade-in my-auto">

          {/* Logo Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <BrandLogo size="lg" variant="luxury" showText={true} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight mb-1.5">
              Client Portal Sign In
            </h1>
            <p className="text-neutral-400 text-xs">
              Access institutional real estate valuations and portfolio intelligence
            </p>
          </div>

          {/* Form Card: Dark Obsidian with crisp glass border */}
          <div className="luxury-glass-card p-6 sm:p-8 border border-white/[0.1] shadow-2xl rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@investor.lk"
                    className="w-full bg-[#090D14] border border-white/[0.12] focus:border-[#DFBA73] focus:ring-1 focus:ring-[#DFBA73] text-white placeholder-neutral-500 rounded-xl px-4 py-2.5 pl-11 text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#090D14] border border-white/[0.12] focus:border-[#DFBA73] focus:ring-1 focus:ring-[#DFBA73] text-white placeholder-neutral-500 rounded-xl px-4 py-2.5 pl-11 pr-11 text-sm outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm font-bold mt-1 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.1]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-[#0C1017] px-3 text-[#DFBA73]">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Login Button */}
            <div className="w-full">
              <button
                type="button"
                onClick={() => triggerGoogleLogin()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] border border-white/[0.14] hover:border-[#DFBA73]/60 text-white text-xs font-semibold tracking-wide transition-all duration-200 shadow-lg group disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="group-hover:text-[#DFBA73] transition-colors">Continue with Google</span>
              </button>
            </div>
          </div>

          <p className="text-center text-neutral-400 text-xs mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#DFBA73] hover:underline font-bold">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
