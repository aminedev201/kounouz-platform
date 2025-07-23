'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { productService } from '@/services/apis';
import Loader from '@/components/loader/dashboardLoader';
import ConfirmDialog from '@/components/ui/alert/confirmDialog';
import ZoomableImage from '@/components/ui/zoomableImage/zoomableImage';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const router = useRouter();
  const { user, token, loading: loadAuth } = useAuth();

  useEffect(() => {
    if (!loadAuth) {
      if (!user || !token) {
        router.push('/login');
        return;
      }
      fetchProducts();
    }
  }, [user, loadAuth, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getVendorProducts(token);
      setProducts(response.data);
    } catch (error) {
      showMessage('Failed to fetch products', 'danger');
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
    }, 3000);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await productService.delete(productToDelete.id, token);
      showMessage('Product deleted successfully', 'success');
      fetchProducts();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete product';
      showMessage(errorMessage, 'danger');
    } finally {
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setProductToDelete(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-gray-900 text-center md:text-left">My Products</h1>
        <Link
          href="/dashboard/products/create"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition duration-200 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md text-center ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found.</p>
          <Link
            href="/dashboard/products/create"
            className="mt-4 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition duration-200 w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            Create Your First Product
          </Link>
        </div>
      ) : (
        // <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        //   {products.map((product) => (
        //     <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden w-full">
        //       <ZoomableImage
        //         src={`/uploads/products/${product.image}`}
        //         alt={product.name}
        //         modalClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-99999 transition-all duration-300"
        //         imageClassName="max-w-[50vw] max-h-[50vw] object-contain rounded-xl border-2 border-white shadow-2xl transition-all duration-500 ease-out"
        //       ></ZoomableImage>
        //       <div className="p-4">
        //         <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center md:text-left">
        //           {product.name}
        //         </h3>
        //         <p className="text-gray-600 text-sm mb-2 line-clamp-2 text-center md:text-left">
        //           {product.description || 'No description available'}
        //         </p>
        //         <p className="text-xl font-bold text-indigo-600 mb-4 text-center md:text-left">
        //           ${product.price}
        //         </p>

        //         <div className="flex flex-col md:flex-row md:justify-between items-center space-y-3 md:space-y-0">
        //           <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
        //             <Link
        //               href={`/dashboard/products/${product.id}/edit`}
        //               className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition duration-200 w-full md:w-auto"
        //             >
        //               <Pencil className="w-4 h-4" />
        //               Edit
        //             </Link>
        //             <button
        //               onClick={() => handleDelete(product)}
        //               className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition duration-200 w-full md:w-auto"
        //             >
        //               <Trash2 className="w-4 h-4" />
        //               Delete
        //             </button>
        //           </div>
        //           <Link
        //             href={`/dashboard/products/${product.id}`}
        //             className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium w-full md:w-auto"
        //           >
        //             <Eye className="w-4 h-4" />
        //             View Details
        //           </Link>
        //         </div>
        //       </div>
        //     </div>
        //   ))}
        // </div>
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden w-full">
              {/* Fixed image container with consistent dimensions */}
              <div className="w-full h-64 bg-gray-100">
                <ZoomableImage
                  src={`/uploads/products/${product.image}`}
                  alt={product.name}
                  thumbnailClassName="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  modalClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-99999 transition-all duration-300"
                  imageClassName="max-w-[50vw] max-h-[50vw] object-contain rounded-xl border-2 border-white shadow-2xl transition-all duration-500 ease-out"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center md:text-left">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2 text-center md:text-left">
                  {product.description || 'No description available'}
                </p>
                <p className="text-xl font-bold text-indigo-600 mb-4 text-center md:text-left">
                  ${product.price}
                </p>
                
                <div className="flex flex-col md:flex-row md:justify-between items-center space-y-3 md:space-y-0">
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition duration-200 w-full md:w-auto"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition duration-200 w-full md:w-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium w-full md:w-auto"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
      />
    </div>
  );
}
