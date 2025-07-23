'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { productService } from '@/services/apis';
import Loader from '@/components/loader/dashboardLoader';
import AlertMessage from '@/components/ui/alert/AlertMessage';
import ImageUpload from '@/components/ui/upload/ImageUpload';

import { X, Plus, Save, AlertCircle } from 'lucide-react';

export default function ProductForm({ productId = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!productId);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const router = useRouter();
  const { user, token, loading: loadAuth } = useAuth();
  const isEditing = !!productId;

  const hasErrors = () => {
    return Object.keys(errors).some(
      (key) => errors[key] && Array.isArray(errors[key]) && errors[key].length > 0
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = ['Product name is required.'];
    } else if (formData.name.trim().length < 2) {
      newErrors.name = ['Product name must be at least 2 characters long.'];
    } else if (formData.name.trim().length > 255) {
      newErrors.name = ['Product name cannot be longer than 255 characters.'];
    }

    // Description validation
    if (formData.description && formData.description.trim().length > 500) {
      newErrors.description = ['Description cannot be longer than 500 characters.'];
    }

    // Price validation
    if (!formData.price || formData.price === '') {
      newErrors.price = ['Price is required.'];
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue)) {
        newErrors.price = ['Price must be a valid number.'];
      } else if (priceValue < 0) {
        newErrors.price = ['The price must be zero or positive.'];
      }
    }

    // Image validation
    if (!isEditing && !imageFile && !formData.image) {
      newErrors.image = ['Product image is required.'];
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
      if (isEditing) {
        fetchProduct();
      }
    }
  }, [user, loadAuth, router, productId]);

  const fetchProduct = async () => {
    try {
      setInitialLoading(true);
      const response = await productService.getOne(productId, token);
      const product = response.data;

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        image: product.image || null
      });

      // Set preview if product.image exists
      if (product.image) {
        setImagePreview(`/uploads/products/${product.image}`);
      }
    } catch (error) {
      showMessage('Failed to fetch product', 'danger');
      router.push('/dashboard/products');
    } finally {
      setInitialLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    const newErrors = { ...errors };

    if (name === 'name') {
      if (!value || value.trim().length === 0) {
        newErrors.name = ['Product name is required.'];
      } else if (value.trim().length < 2) {
        newErrors.name = ['Product name must be at least 2 characters long.'];
      } else if (value.trim().length > 255) {
        newErrors.name = ['Product name cannot be longer than 255 characters.'];
      } else {
        newErrors.name = [];
      }
    }

    if (name === 'description') {
      if (value && value.trim().length > 500) {
        newErrors.description = ['Description cannot be longer than 500 characters.'];
      } else {
        newErrors.description = [];
      }
    }

    if (name === 'price') {
      if (!value || value === '') {
        newErrors.price = ['Price is required.'];
      } else {
        const priceValue = parseFloat(value);
        if (isNaN(priceValue)) {
          newErrors.price = ['Price must be a valid number.'];
        } else if (priceValue < 0) {
          newErrors.price = ['The price must be zero or positive.'];
        } else {
          newErrors.price = [];
        }
      }
    }

    setErrors(newErrors);
  };

  const uploadImageLocally = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('fileName', file.name);
      formData.append('folder', 'products');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('Upload error:', errorData);
          throw new Error(errorData.error || 'Failed to upload image');
        } else {
          const errorText = await response.text();
          console.error('Upload error (HTML):', errorText);
          throw new Error(
            `Upload failed with status ${response.status}. Check if /api/upload-image endpoint exists.`
          );
        }
      }

      const result = await response.json();
      return result.fileName;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }

    // Clear image errors when file is selected
    const newErrors = { ...errors };
    if (file) {
      newErrors.image = [];
    } else if (!isEditing && !formData.image) {
      newErrors.image = ['Product image is required.'];
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setErrors({});

    try {
      let imageName = formData.image;

      if (imageFile) {
        imageName = await uploadImageLocally(imageFile);
      }

      const submitData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : '',
        price: parseFloat(formData.price),
        image: imageName
      };

      let response;
      if (isEditing) {
        response = await productService.update(productId, submitData, token);
        showMessage('Product updated successfully', 'success');
      } else {
        response = await productService.create(submitData, token);
        showMessage('Product created successfully', 'success');
      }

      setTimeout(() => {
        if (isEditing) {
          router.push(`/dashboard/products/${productId}`);
        } else {
          router.push('/dashboard/products');
        }
      }, 3000);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        showMessage(error.response.data.message, 'danger');
      } else if (error.response?.data?.error) {
        showMessage(error.response.data.error, 'danger');
      } else {
        const errorMessage = error.message || `Failed to ${isEditing ? 'update' : 'create'} product`;
        showMessage(errorMessage, 'danger');
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </h1>
        </div>

        <AlertMessage message={message} type={messageType} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none   ${
                errors.name && errors.name.length > 0 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm text-red-600 flex flex-col gap-1">
                {errors.name &&
                  errors.name.length > 0 &&
                  errors.name.map((error, index) => (
                    <p key={index} className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                      {error}
                    </p>
                  ))}
              </div>
              <span className={`text-xs ${formData.name.length > 255 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.name.length}/255
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none   ${
                errors.description && errors.description.length > 0 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product description"
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm text-red-600 flex flex-col gap-1">
                {errors.description &&
                  errors.description.length > 0 &&
                  errors.description.map((error, index) => (
                    <p key={index} className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                      {error}
                    </p>
                  ))}
              </div>
              <span className={`text-xs ${formData.description.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.description.length}/500
              </span>
            </div>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price ($) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none   ${
                errors.price && errors.price.length > 0 ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && errors.price.length > 0 && (
              <div className="mt-1 text-sm text-red-600 flex flex-col gap-1">
                {errors.price.map((error, index) => (
                  <p key={index} className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image {!isEditing && <span className="text-red-600">*</span>}
            </label>
            <ImageUpload onImageChange={handleImageChange} preview={imagePreview} error={errors.image} />
            {errors.image && errors.image.length > 0 && (
              <div className="mt-1 text-sm text-red-600 flex flex-col gap-1">
                {errors.image.map((error, index) => (
                  <p key={index} className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 text-center">
          <button
            type="submit"
            disabled={loading || hasErrors()}
            className={`px-6 py-2 rounded-md font-medium transition duration-200 flex items-center justify-center gap-2 ${
              loading || hasErrors()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
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
                {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isEditing ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200 flex items-center justify-center gap-1"
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
