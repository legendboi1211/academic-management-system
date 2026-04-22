'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { Beaker, Mail, Lock, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, error: authError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        console.log('Starting signup...');
        await signup(email, password);
        console.log('Signup completed, redirecting...');
      } else {
        console.log('Starting login...');
        await login(email, password);
        console.log('Login completed, redirecting...');
      }
      router.push('/');
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMsg = err.message || err.code || 'Authentication failed';
      if (errorMsg.includes('email-already-in-use') || errorMsg.includes('EMAIL_EXISTS')) {
        setError('Email already in use');
      } else if (errorMsg.includes('invalid-email') || errorMsg.includes('INVALID_EMAIL')) {
        setError('Invalid email address');
      } else if (errorMsg.includes('wrong-password') || errorMsg.includes('INVALID_PASSWORD')) {
        setError('Wrong password');
      } else if (errorMsg.includes('user-not-found') || errorMsg.includes('USER_NOT_FOUND')) {
        setError('User not found');
      } else if (errorMsg.includes('auth/')) {
        setError(errorMsg);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col items-center justify-center font-mono px-4">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="bg-blue-600 p-3 rounded-xl">
            <Beaker className="text-white h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black">
            STUDY<span className="text-blue-600">.ORG</span>
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-black mb-2 text-center">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-center text-sm mb-8">
            {isSignup
              ? 'Start your academic journey'
              : 'Sign in to your account'}
          </p>

          {/* Error Message */}
          {(error || authError) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-red-200 text-sm">{error || authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? 'Min 6 characters' : 'Password'}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all mt-8 active:scale-95"
            >
              {loading
                ? 'Loading...'
                : isSignup
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>

          {/* Toggle Form */}
          <div className="mt-8 text-center border-t border-white/10 pt-8">
            <p className="text-gray-400 text-sm mb-4">
              {isSignup
                ? 'Already have an account?'
                : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-blue-400 hover:text-blue-300 font-bold text-sm transition-colors"
            >
              {isSignup ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-xs text-center mt-8">
          Your data is encrypted and private
        </p>
      </div>
    </div>
  );
}
