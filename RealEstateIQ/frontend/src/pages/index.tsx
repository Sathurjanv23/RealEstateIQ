import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Brain, Home, TrendingUp, ShieldCheck, BarChart3, Zap, ChevronRight, Building2, Star, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: <Brain size={24} />, title: 'AI Price Prediction', desc: 'ML model estimates property values using area, location, age, bedrooms, and more.' },
  { icon: <BarChart3 size={24} />, title: 'Market Analytics', desc: 'Explore real statistics across locations, property types, and price distributions.' },
  { icon: <TrendingUp size={24} />, title: 'Valuation Comparison', desc: 'Compare ML estimated value against seller asking price with neutral analysis.' },
  { icon: <Building2 size={24} />, title: 'Property Management', desc: 'Browse, search, filter, and compare properties across Sri Lanka.' },
  { icon: <Star size={24} />, title: 'Smart Recommendations', desc: 'Get ranked property recommendations based on your budget and preferences.' },
  { icon: <ShieldCheck size={24} />, title: 'Secure Platform', desc: 'JWT authentication, bcrypt passwords, role-based access, and HTTPS-ready.' },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Register securely and set your preferences.' },
  { step: '02', title: 'Enter Property Details', desc: 'Input area, location, bedrooms, age, and parking.' },
  { step: '03', title: 'Get ML Estimate', desc: 'Our model returns an estimated price in seconds.' },
  { step: '04', title: 'Compare & Decide', desc: 'Compare against asking prices and market data.' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>RealEstateIQ — AI-Powered Real Estate Intelligence</title>
        <meta name="description" content="Estimate property values, compare properties, explore market insights, and make data-driven real estate decisions with AI." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-surface-900">
        {/* Navigation */}
        <nav className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-md bg-surface-900/80">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Building2 size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-gradient">RealEstateIQ</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link href="/properties" className="hover:text-white transition-colors">Properties</Link>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary">
                  Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary text-sm py-2">Sign In</Link>
                  <Link href="/register" className="btn-primary text-sm py-2">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 md:py-36">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          </div>

          <div className="max-w-7xl mx-auto text-center relative">
            <div className="badge-indigo mb-6 inline-flex">
              <Zap size={12} className="mr-1" /> AI-Powered Real Estate Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="text-gradient">Predict Property</span>
              <br />
              <span className="text-white">Values with AI</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Estimate property values, compare properties, explore market insights,
              and make data-driven real estate decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={isAuthenticated ? '/predict' : '/register'} className="btn-primary text-base px-8 py-4">
                Predict Property Value <ChevronRight size={18} />
              </Link>
              <Link href="/properties" className="btn-secondary text-base px-8 py-4">
                Explore Properties
              </Link>
            </div>

            {/* Hero stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mt-16">
              {[
                { value: '4', label: 'Locations' },
                { value: 'R²=0.997', label: 'Model Accuracy' },
                { value: '4', label: 'ML Models' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold text-gradient">{stat.value}</p>
                  <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-white mb-4">Platform Features</h2>
              <p className="text-white/50 max-w-xl mx-auto">Everything you need to make informed real estate decisions</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="glass-card-hover p-6 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-brand-400 mb-4"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-6 py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-white/50 max-w-xl mx-auto">Get an ML-powered property estimate in four simple steps</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {steps.map((s, i) => (
                <div key={s.step} className="glass-card p-6 relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 -right-3 z-10">
                      <ChevronRight size={20} className="text-brand-500/50" />
                    </div>
                  )}
                  <div className="text-4xl font-black text-gradient opacity-40 mb-4">{s.step}</div>
                  <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-white/50 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ML Intelligence section */}
        <section className="px-6 py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card p-10 md:p-16 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))' }}>
              <Brain size={48} className="text-brand-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">ML Intelligence</h2>
              <p className="text-white/60 max-w-2xl mx-auto mb-6">
                Our Linear Regression model (selected from 4 candidate models) achieves an R² of 0.9965 
                on the test set, with a Mean Absolute Error of LKR 8,127 on synthetic data.
              </p>
              <div className="grid md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                {[
                  { label: 'MAE', value: '8,127' },
                  { label: 'RMSE', value: '11,158' },
                  { label: 'R²', value: '0.9965' },
                  { label: 'CV R²', value: '0.9954' },
                ].map((m) => (
                  <div key={m.label} className="glass-card p-3 text-center">
                    <p className="text-xl font-bold text-gradient">{m.value}</p>
                    <p className="text-xs text-white/50 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs">
                ⚠️ Metrics are real (computed from actual test set evaluation). Dataset is synthetic — not real market data.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 border-t border-white/5">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/50 mb-8">Create a free account and predict your first property value in minutes.</p>
            <Link href="/register" className="btn-primary text-base px-10 py-4">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-brand-400" />
              <span className="font-semibold text-white">RealEstateIQ</span>
              <span className="text-white/30 text-sm">— AI-Powered Real Estate Intelligence</span>
            </div>
            <p className="text-white/30 text-sm">
              Dataset is synthetic. ML estimates are not guaranteed market valuations.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
