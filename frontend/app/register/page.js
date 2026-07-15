'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { User, Lock, Mail, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) { setError('Please fill in all required fields'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters long'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', { name: formData.name, email: formData.email, password: formData.password, phone: formData.phone });
      setAuth(response.data.user, response.data.token);
      router.push('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
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
          <p className="text-[var(--clx-text-secondary)] mt-3 text-sm">Create your account to get started.</p>
          <div className="gold-accent-center mt-4" />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-[var(--clx-shadow-md)] p-8 sm:p-10 border border-[var(--clx-border-light)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="luxury-input" placeholder="John Doe" required disabled={loading} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="luxury-input" placeholder="you@example.com" required disabled={loading} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="luxury-input" placeholder="+91 98765 43210" disabled={loading} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="luxury-input" placeholder="••••••••" required disabled={loading} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-[var(--clx-text-secondary)] tracking-wider uppercase">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--clx-text-muted)]" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="luxury-input" placeholder="••••••••" required disabled={loading} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="luxury-btn w-full py-3.5 text-sm">
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> Creating Account...</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-center text-sm text-[var(--clx-text-secondary)]">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--clx-gold)] hover:text-[var(--clx-gold-dark)] font-medium transition-colors">Sign in</Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--clx-text-muted)] mt-6">
          By creating an account, you agree to our Terms & Conditions and Privacy Policy
        </p>
      </div>
    </div>
  );
}
