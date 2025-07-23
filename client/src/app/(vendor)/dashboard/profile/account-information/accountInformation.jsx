'use client';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/alert/confirmDialog';
import { User, Mail, Calendar, Shield, Lock ,Trash2  } from 'lucide-react';
import { authService } from '@/services/apis';

export default function AccountInformation() {
  const { user, logout , token } = useAuth();
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!user) return null;

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Information</h1>
          <p className="text-gray-600">Manage your profile and account preferences</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Section */}
              <div className="relative group">
                <div className="relative">
                  <img
                    src={user.avatar ? `/uploads/avatars/${user.avatar}` : '/uploads/avatars/default.jpg'}
                    alt={user.avatar}
                    className={`w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {user.firstname} {user.lastname}
                </h2>
                <p className="text-indigo-100 text-lg mb-4">{user.email}</p>
                
                {/* Roles */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {user.roles?.map((role, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium border bg-gray-100 text-gray-700 border-gray-200`}
                    >
                      {role.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <InfoCard
                icon={<User className="w-5 h-5" />}
                label="First Name"
                value={user.firstname}
              />
              <InfoCard
                icon={<User className="w-5 h-5" />}
                label="Last Name"
                value={user.lastname}
              />
              <InfoCard
                icon={<Mail className="w-5 h-5" />}
                label="Email Address"
                value={user.email}
              />
              <InfoCard
                icon={<Shield className="w-5 h-5" />}
                label="Account Type"
                value={user.roles?.map(r => r.replace('ROLE_', '')).join(', ')}
              />
              <InfoCard
                icon={<Calendar className="w-5 h-5" />}
                label="Member Since"
                value={formatDate(user.createdAt)}
              />
              <InfoCard
                icon={<Calendar className="w-5 h-5" />}
                label="Last Updated"
                value={formatDate(user.updatedAt)}
              />
            </div>

            {/* Action Buttons */}
           <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/dashboard/profile/edit')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition duration-200 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/profile/change-password')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition duration-200 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                </div>

                <button
                  onClick={() => setIsConfirmOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
}

// Enhanced Info Card Component
function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-indigo-600">{icon}</div>
        <p className="text-sm text-gray-600 font-medium">{label}</p>
      </div>
      <p className="text-lg text-gray-900 font-semibold break-words">{value || '-'}</p>
    </div>
  );
}
