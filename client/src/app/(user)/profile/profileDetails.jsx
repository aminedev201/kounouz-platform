"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ui/alert/confirmDialog';
import { authService } from '@/services/apis';

import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  Camera, 
  Shield, 
  Settings,
  Loader2,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';

// Avatar component
const Avatar = ({ user, size = 'xl', showUpload = false, onUploadClick }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
    '2xl': 'h-32 w-32 text-3xl'
  };

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `/uploads/avatars/${user.avatar}`;
    }
    return '/uploads/avatars/default.jpg';
  };

  const getInitials = (firstname, lastname) => {
    const first = firstname?.charAt(0) || '';
    const last = lastname?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getAvatarColor = (firstname) => {
    if (!firstname) return 'bg-gray-500';
    
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    const index = firstname.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative">
      {!imageError ? (
        <img
          src={getAvatarUrl()}
          alt={`${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'User'}
          className={`${sizeClasses[size]} rounded-full object-cover border-4 border-white shadow-lg`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full ${getAvatarColor(user?.firstname)} flex items-center justify-center text-white font-bold border-4 border-white shadow-lg`}>
          {getInitials(user?.firstname, user?.lastname)}
        </div>
      )}
      
      {showUpload && (
        <button
          onClick={onUploadClick}
          className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
        >
          <Camera className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, copyable = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-lg text-gray-900 break-all">{value}</p>
          </div>
        </div>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
};


const ProfileDetails = () => {
  const { user, loading ,token , logout} = useAuth();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      const isAuthenticated = user && user.roles && user.roles.includes('ROLE_USER');
      
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      setPageLoading(false);
    }
  }, [user, loading, router]);

    const handleDelete = async () => {
      try {
        const res = await authService.deleteMyAccount(token);
        if (res.status === 200) {
          logout(); 
        } else {
          console.error('Failed to delete account: Unexpected status', res.status);
        } 
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
   };

  const handleUploadClick = () => {
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const fullName = `${user.firstname || ''} ${user.lastname || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Profile Details</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              <div className="relative -mt-12 mb-4 sm:mb-0">
                <Avatar 
                  user={user} 
                  size="2xl" 
                  showUpload={true} 
                  onUploadClick={handleUploadClick}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {fullName || 'User'}
                    </h2>
                    <p className="text-gray-600 mt-1">{user.email}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                      onClick={() => router.push('/profile/edit')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => router.push('/profile/change-password')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <InfoCard
                icon={User}
                label="First Name"
                value={user.firstname || 'Not provided'}
              />
              <InfoCard
                icon={User}
                label="Last Name"
                value={user.lastname || 'Not provided'}
              />
              <InfoCard
                icon={Mail}
                label="Email Address"
                value={user.email}
                copyable={true}
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <InfoCard
                icon={Calendar}
                label="Member Since"
                value={formatDate(user.createdAt)}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/profile/edit')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit3 className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-sm font-medium">Edit Profile</span>
            </button>
            <button
              onClick={() => router.push('/profile/change-password')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-sm font-medium">Change Password</span>
            </button>
            <button
              onClick={() => router.push('/my-orders')}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              <span className="text-sm font-medium">My Orders</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setIsConfirmOpen(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete My Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ProfileDetails;