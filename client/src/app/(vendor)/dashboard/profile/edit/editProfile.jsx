'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { authService } from '@/services/apis';
import Loader from '@/components/loader/dashboardLoader';
import AlertMessage from '@/components/ui/alert/AlertMessage';
import ImageUpload from '@/components/ui/upload/ImageUpload';
import { X, Save } from 'lucide-react';


export default function EditProfile() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    avatar: null,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  const router = useRouter();
  const { user, token, loading: loadAuth, setUser, logout } = useAuth();

  const hasErrors = () =>
    Object.keys(errors).some(
      (key) => errors[key] && Array.isArray(errors[key]) && errors[key].length > 0
    );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname?.trim()) {
      newErrors.firstname = ['First name is required.'];
    } else if (formData.firstname.length > 255) {
      newErrors.firstname = ['First name cannot be longer than 255 characters.'];
    }

    if (!formData.lastname?.trim()) {
      newErrors.lastname = ['Last name is required.'];
    } else if (formData.lastname.length > 255) {
      newErrors.lastname = ['Last name cannot be longer than 255 characters.'];
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      newErrors.email = ['Email is required.'];
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = ['This is not a valid email.'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!loadAuth) {
      if (!user || !token) {
        router.push('/login');
        return;
      }

      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        avatar: user.avatar || null,
      });

      if (user.avatar) {
        setAvatarPreview(`/uploads/avatars/${user.avatar}`);
      } else {
        setAvatarPreview(null);
      }

      setInitialLoading(false);
    }
  }, [user, loadAuth, router]);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
      router.push('/dashboard/profile/account-information');
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const uploadAvatarLocally = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('fileName', file.name);
      formData.append('folder', 'avatars');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to upload avatar');
      }

      return result.fileName;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      let avatarName = formData.avatar;

      if (avatarFile) {
        avatarName = await uploadAvatarLocally(avatarFile);
      } else if (avatarPreview === null) {
        avatarName = null;
      }

      const submitData = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        avatar: avatarName,
      };

      const response = await authService.editProfile(submitData, token);

      if (user.email !== submitData.email) {
        logout();
        router.push('/login');
        return;
      }

      if (setUser) setUser(response.data.user);

      showMessage('Profile updated successfully', 'success');

      setFormData({
        firstname: response.data.user.firstname || '',
        lastname: response.data.user.lastname || '',
        email: response.data.user.email || '',
        avatar: response.data.user.avatar || null,
      });

      if (response.data.user.avatar) {
        setAvatarPreview(`/uploads/avatars/${response.data.user.avatar}`);
      } else {
        setAvatarPreview(null);
      }
      setAvatarFile(null);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        showMessage(
          error.response?.data?.message || error.message || 'Failed to update profile',
          'danger'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Loader />;

  return (
    <div className="mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        <AlertMessage message={message} type={messageType} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <ImageUpload
              onImageChange={handleAvatarChange}
              preview={avatarPreview}
              error={errors.avatar}
              isAvatar={true}
            />
          </div>

          {/* Firstname */}
          <div>
            <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                errors.firstname?.length ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
            {errors.firstname?.map((err, i) => (
              <p key={i} className="text-sm text-red-600">
                {err}
              </p>
            ))}
          </div>

          {/* Lastname */}
          <div>
            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                errors.lastname?.length ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
            {errors.lastname?.map((err, i) => (
              <p key={i} className="text-sm text-red-600">
                {err}
              </p>
            ))}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                errors.email?.length ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email"
            />
            {errors.email?.map((err, i) => (
              <p key={i} className="text-sm text-red-600">
                {err}
              </p>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 text-center">
            <button
              type="submit"
              disabled={loading || hasErrors()}
              className={`px-6 py-2 text-white font-semibold rounded flex items-center justify-center gap-2 ${
                loading || hasErrors()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                'Updating...'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Profile
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/profile/account-information')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
