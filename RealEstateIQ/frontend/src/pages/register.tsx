import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Building2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/services';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const res = await authService.register({ name, email, password });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registration failed.');
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
          <div className="absolute top-1/3 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 -translate-x-1/2"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        </div>

        <div className="w-full max-w-md relative">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Building2 size={20} className="text-white" />
              </div>
              <span className="font-bold text-xl text-gradient">RealEstateIQ</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-white/50">Start making data-driven property decisions</p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">Full name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="name" type="text" autoComplete="name" value={name}
                    onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                    className="input-dark pl-11" required />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="email" type="email" autoComplete="email" value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="input-dark pl-11" required />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="password" type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password" value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
                    className="input-dark pl-11 pr-11" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">Confirm password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input id="confirmPassword" type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password"
                    className="input-dark pl-11" required />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-white/50 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
