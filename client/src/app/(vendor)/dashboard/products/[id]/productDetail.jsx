'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { productService } from '@/services/apis';
import Loader from '@/components/loader/dashboardLoader';
import AlertMessage from '@/components/ui/alert/AlertMessage';
import ConfirmDialog from '@/components/ui/alert/confirmDialog';

export default function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const router = useRouter();
  const { user, token, loading: loadAuth } = useAuth();

  useEffect(() => {
    if (!loadAuth) {
      if (!user || !token) {
        router.push('/login');
        return;
      }
      fetchProduct();
    }
  }, [user, loadAuth, router, id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getOne(id, token);
      setProduct(response.data);
    } catch (error) {
      showMessage('Failed to fetch product', 'danger');
      setTimeout(() => {
        router.push('/dashboard/products');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 2000);
  };

  const handleDelete = () => {
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await productService.delete(id, token);
      showMessage('Product deleted successfully', 'success');
      setTimeout(() => {
        router.push('/dashboard/products');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete product';
      showMessage(errorMessage, 'danger');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link
            href="/dashboard/products"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center text-center sm:text-left mb-8 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Product Details</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className={`px-4 py-2 rounded-md font-medium transition duration-200 flex items-center gap-2 w-full sm:w-auto justify-center ${
              deleteLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            {deleteLoading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <AlertMessage message={message} type={messageType} />
      </div>

      {/* Product Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative flex justify-center">
            <img
              src={`/uploads/products/${product.image}`}
              alt={product.name}
              className="w-full h-96 lg:h-full object-cover"
            />
            
            <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              ${product.price}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6 lg:p-8">
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h2>
                <p className="text-3xl font-bold text-indigo-600">${product.price}</p>
              </div>

              {product.description && (
                <div className="text-center lg:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center lg:text-left">
                  <h4 className="font-medium text-gray-900 mb-1">Product ID</h4>
                  <p className="text-gray-600">#{product.id}</p>
                </div>
              </div>

              {(product.createdAt || product.updatedAt) && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 text-center lg:text-left">
                    {product.createdAt && (
                      <div>
                        <span className="font-medium">Created:</span> {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    )}
                    {product.updatedAt && (
                      <div>
                        <span className="font-medium">Updated:</span> {new Date(product.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center lg:text-left">Quick Actions</h3>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-center">
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Product
          </Link>
          <Link
            href="/dashboard/products"
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View All Products
          </Link>
          <Link
            href="/dashboard/products/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Product
          </Link>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
      />
    </div>
  );
}