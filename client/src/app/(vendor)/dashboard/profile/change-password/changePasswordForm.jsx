"use client"
import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { authService } from '@/services/apis';
import { X, Save } from 'lucide-react'
export default function ChangePasswordPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.old_password) {
      newErrors.old_password = ['Current password is required.'];
    }
    
    if (!formData.new_password) {
      newErrors.new_password = ['New password is required.'];
    } else if (formData.new_password.length < 8 || formData.new_password.length > 50) {
      newErrors.new_password = ['New password must be between 8 and 50 characters.'];
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = ['Confirm password is required.'];
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = ['New passwords do not match.'];
    }
    
    if (formData.old_password && formData.new_password && formData.old_password === formData.new_password) {
      newErrors.new_password = ['New password must be different from current password.'];
    }
    
    return newErrors;
  };

  const hasErrors = () => {
    return Object.keys(errors).some(key => errors[key] && errors[key].length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    setMessage('');
    
    try {
      const response = await authService.changePassword(formData, token);
      
      if (response.data.code === 200) {
        setSuccess(true);
        setMessage('Password changed successfully! Redirecting to login...');
        setMessageType('success');
        
        // Show success message briefly, then logout and redirect
        setTimeout(() => {
          logout();
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage('An error occurred. Please try again.');
        setMessageType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const AlertMessage = ({ message, type }) => {
    if (!message) return null;
    
    const bgColor = type === 'error' ? 'bg-red-50' : 'bg-green-50';
    const textColor = type === 'error' ? 'text-red-600' : 'text-green-600';
    const borderColor = type === 'error' ? 'border-red-200' : 'border-green-200';
    
    return (
      <div className={`${bgColor} border ${borderColor} rounded-md p-4 mb-6`}>
        <div className="flex items-center">
          {type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
          )}
          <span className={`text-sm ${textColor}`}>{message}</span>
        </div>
      </div>
    );
  };

  const renderPasswordInput = (name, label, placeholder, required = false) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className='text-red-600'>*</span>}
      </label>
      <div className="relative">
        <input
          type={showPasswords[name] ? 'text' : 'password'}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10 ${
            errors[name] && errors[name].length > 0 ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={loading || success}
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(name)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          disabled={loading || success}
        >
          {showPasswords[name] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[name] && errors[name].length > 0 && (
        <div className="mt-1 text-sm text-red-600">
          {errors[name].map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );

  if (success) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Changed Successfully!
            </h2>
            <p className="text-gray-600">
              You will be redirected to the login page in a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Change Password
          </h1>
        </div>

        <AlertMessage message={message} type={messageType} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          {renderPasswordInput('old_password', 'Current Password', 'Enter your current password', true)}

          {/* New Password */}
          {renderPasswordInput('new_password', 'New Password', 'Enter your new password', true)}

          {/* Confirm Password */}
          {renderPasswordInput('confirm_password', 'Confirm New Password', 'Confirm your new password', true)}

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-end sm:space-x-3 gap-2 sm:gap-0 text-center sm:text-right">
            <button
              type="button"
              onClick={() => router.push('/dashboard/profile/account-information')}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200 flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || hasErrors() || success}
              className={`px-6 py-2 rounded-md font-medium transition duration-200 flex items-center justify-center gap-2 ${
                loading || hasErrors() || success
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}