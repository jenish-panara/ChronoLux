'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      setAuth(response.data.user, response.data.token);
      if (response.data.user.role === 'admin') { router.push('/admin'); } else { router.push('/'); }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--clx-ivory)] px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--clx-text-primary)] tracking-tight">
            Chrono<span className="text-[var(--clx-gold)]">Lux</span>
          </Link>
          <p className="text-[var(--clx-text-secondary)] mt-3 text-sm">Welcome back. Sign in to your account.</p>
          <div className="gold-accent-center mt-4" />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-md)] p-8 sm:p-10 border border-[var(--clx-border-light)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--clx-text-muted)]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="luxury-input pl-11"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--clx-text-muted)]" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="luxury-input pl-11"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 border-[var(--clx-border)] rounded accent-[var(--clx-gold)]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-[var(--clx-text-secondary)]">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-[var(--clx-gold)] hover:text-[var(--clx-gold-dark)] transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="luxury-btn w-full py-3.5 text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-[var(--clx-text-secondary)]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[var(--clx-gold)] hover:text-[var(--clx-gold-dark)] font-medium transition-colors">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}