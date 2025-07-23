'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/apis';
import Loader from '@/components/loader/loader';
import { useAuth } from '@/context/AuthProvider';

export default function SignupForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirm_password: '',
    role: '',
  });
  const { user, loading: authLoading } = useAuth();
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(true);
  const [showGlobalError, setShowGlobalError] = useState(true);

  // New state for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    if (!authLoading && user) {
      if (user.roles?.includes('ROLE_VENDOR')) {
        router.push('/dashboard/home');
      } else if (user.roles?.includes('ROLE_USER')) {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function handleRegister(e) {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setShowSuccess(true);
    setShowGlobalError(true);
    setLoading(true);

    const newErrors = {};

    // Validate firstname
    if (!form.firstname.trim()) {
      newErrors.firstname = ['First name is required.'];
    } else if (form.firstname.length > 255) {
      newErrors.firstname = ['First name cannot be longer than 255 characters.'];
    }

    // Validate lastname
    if (!form.lastname.trim()) {
      newErrors.lastname = ['Last name is required.'];
    } else if (form.lastname.length > 255) {
      newErrors.lastname = ['Last name cannot be longer than 255 characters.'];
    }

    // Validate email
    if (!form.email.trim()) {
      newErrors.email = ['Email is required.'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = ['This is not a valid email.'];
    }

    // Validate password
    if (!form.password) {
      newErrors.password = ['Password is required.'];
    } else if (form.password.length < 8 || form.password.length > 50) {
      newErrors.password = ['Password must be between 8 and 50 characters.'];
    }

    // Validate confirm password
    if (!form.confirm_password) {
      newErrors.confirm_password = ['Confirm password is required.'];
    } else if (form.password !== form.confirm_password) {
      newErrors.confirm_password = ['Passwords do not match.'];
    }

    // Validate role
    const allowedRoles = ['ROLE_USER', 'ROLE_VENDOR'];
    if (!form.role) {
      newErrors.role = ['Role is required.'];
    } else if (!allowedRoles.includes(form.role)) {
      newErrors.role = [`This role (${form.role}) is not allowed.`];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {

      const response = await authService.register(form);

      if (response.status === 201) {
        setSuccessMessage(response.data.message);
        setShowSuccess(true);
        setForm({
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          confirm_password: '',
          role: '',
        });
      } else {
        setErrors(response.data.errors || {});
        setShowGlobalError(true);
      }
    } catch (error) {
      if (error.response) {
        setErrors(error.response.data.errors || { global: [error.response.data.message || 'Registration failed.'] });
      } else if (error.request) {
        setErrors({ global: ['Network error. Please check your connection and try again.'] });
      } else {
        setErrors({ global: ['An unexpected error occurred. Please try again later.'] });
      }
      setShowGlobalError(true);
    } finally {
      setLoading(false);
    }
  }

  if (!authLoading && !loading && !user) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
            <p className="text-gray-600">Create your account</p>
          </div>

          {/* Signup Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Global Error */}
              {errors.global && showGlobalError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 relative">
                  <p className="text-red-600 text-sm">{errors.global[0]}</p>
                  <button
                    type="button"
                    onClick={() => setShowGlobalError(false)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Success Message */}
              {successMessage && showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 relative">
                  <p className="text-green-600 text-sm">{successMessage}</p>
                  <button
                    type="button"
                    onClick={() => setShowSuccess(false)}
                    className="absolute top-2 right-2 text-green-400 hover:text-green-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* First Name */}
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstname"
                  id="firstname"
                  value={form.firstname}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstname ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoComplete="given-name"
                />
                {errors.firstname && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstname[0]}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastname"
                  id="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastname ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoComplete="family-name"
                />
                {errors.lastname && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastname[0]}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="" disabled>Select account type</option>
                  <option value="ROLE_USER">Customer</option>
                  <option value="ROLE_VENDOR">Vendor</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role[0]}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  id="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoComplete="new-password"
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirm_password[0]}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Login
            </Link>
          </div>
          
          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  } else
    return <Loader />
}