'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthProvider';
import { authService } from '../../../services/apis';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Loader from '@/components/loader/loader';

export default function LoginForm() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.roles?.includes('ROLE_VENDOR')) {
        router.push('/dashboard/home');
      } else if (user.roles?.includes('ROLE_USER')) {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  async function handleLogin(e) {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setLoginError('');

    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email is required.');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('This is not a valid email.');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const data = response.data;

      login(data.user); // Save to context

      // Redirect after login
      if (data.user?.roles?.includes('ROLE_VENDOR')) {
        router.push('/dashboard/home');
      } else if (data.user?.roles?.includes('ROLE_USER')) {
        router.push('/');
      }

    } catch (err) {
      if (err.response) {
        setLoginError(err.response.data.message || 'Login failed.');
      } else if (err.request) {
        setLoginError('Network error. Please check your connection.');
      } else {
        setLoginError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!authLoading && !loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <div className="mb-6">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
              <p className="text-gray-600">Welcome back to Kounouz</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      passwordError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
              </div>

              {/* Login Error */}
              {loginError && (
                <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-md p-3">
                  {loginError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <Loader />;
  }
}


