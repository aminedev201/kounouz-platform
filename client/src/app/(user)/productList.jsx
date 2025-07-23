'use client'

import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, Loader2, Star, Heart, Eye, Package, Plus, Minus } from 'lucide-react';
import { productService, commandService } from '../../services/apis';
import { useAuth } from '@/context/AuthProvider';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [userCommands, setUserCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commandsLoading, setCommandsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderingProduct, setOrderingProduct] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const { user, loading: authLoading  } = useAuth();
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user && user.roles.includes('ROLE_USER')) {
      fetchUserCommands();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCommands = async () => {
    try {
      setCommandsLoading(true);
      const response = await commandService.userCommandlist(user.token);
      setUserCommands(response.data);
    } catch (err) {
      console.error('Error fetching user commands:', err);
    } finally {
      setCommandsLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const handleQuickOrder = async (productId) => {
    if (!user) {
      showAlert('Please log in to place an order');
      return;
    }

    if (!user.roles.includes('ROLE_USER')) {
      showAlert('You need user privileges to place orders');
      return;
    }

    try {
      setOrderingProduct(productId);
      
      const orderData = {
        product: productId,
        quantity: 1
      };

      await commandService.create(orderData, user.token);
      
      await fetchUserCommands();
      
      showAlert('Order placed successfully!','success');

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to place order. Please try again.';
      showAlert(errorMessage);
      console.error('Error placing order:', err);
    } finally {
      setOrderingProduct(null);
    }
  };

  const handleCustomOrder = async () => {
    if (!selectedProduct || orderQuantity < 1) return;

    try {
      setOrderingProduct(selectedProduct.id);
      
      const orderData = {
        product: selectedProduct.id,
        quantity: orderQuantity
      };

      await commandService.create(orderData, user.token);
      
      await fetchUserCommands();
      
      setShowOrderModal(false);
      setSelectedProduct(null);
      setOrderQuantity(1);
      
      showAlert(`Order placed successfully! ${orderQuantity} x ${selectedProduct.name}`,'success');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to place order. Please try again.';
      showAlert(errorMessage);
      console.error('Error placing order:', err);
    } finally {
      setOrderingProduct(null);
    }
  };

  const openOrderModal = (product) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedProduct(null);
    setOrderQuantity(1);
  };

  const getProductCommandCount = (productId) => {
    return userCommands.filter(cmd => 
      cmd.product?.id === productId && cmd.status === 2 // STATUS_PENDING
    ).reduce((total, cmd) => total + cmd.quantity, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Alert */}
          {alert.show && (
            <div className={`mb-6 p-4 rounded-xl shadow-md border-l-4 ${alert.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {alert.type === 'success' ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{alert.message}</p>
                </div>
              </div>
            </div>
          )}
       
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const commandCount = getProductCommandCount(product.id);
              
              return (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={`/uploads/products/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gray-300 flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-gray-500">No Image</span>
                    </div>
                    
                    {/* Command Count Badge */}
                    {commandCount > 0 && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {commandCount}
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-500 ml-1">4.5</span>
                      </div>
                    </div>

                    {/* Owner Info */}
                    {product.owner && (
                      <p className="text-xs text-gray-500 mb-3">
                        Sold by: {product.owner.firstname + ' ' + product.owner.lastname}
                      </p>
                    )}

                    {/* Dates */}
                    <div className="text-xs text-gray-400 mb-4">
                      <p>Added: {formatDate(product.createdAt)}</p>
                    </div>

                    {/* Order Buttons */}
                    {user && user.roles.includes('ROLE_USER') ? (
                      <div className="space-y-2">
                        {/* Quick Order Button */}
                        <button
                          onClick={() => handleQuickOrder(product.id)}
                          disabled={orderingProduct === product.id}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                        >
                          {orderingProduct === product.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Ordering...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-4 w-4" />
                              <span>Quick Order (1)</span>
                            </>
                          )}
                        </button>

                        {/* Custom Order Button */}
                        <button
                          onClick={() => openOrderModal(product)}
                          className="w-full bg-white text-blue-600 border border-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Custom Order</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-md text-center">
                        {!user ? 'Login to Order' : 'User Access Required'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Order {selectedProduct.name}</h3>
            
            <div className="mb-4">
              <img
                src={`/uploads/products/${selectedProduct.image}`}
                alt={selectedProduct.name}
                className="w-full h-32 object-cover rounded-md mb-4"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <p className="text-gray-600 text-sm mb-2">{selectedProduct.description}</p>
              <p className="text-xl font-bold text-blue-600">{formatPrice(selectedProduct.price)}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-semibold w-12 text-center">{orderQuantity}</span>
                <button
                  onClick={() => setOrderQuantity(orderQuantity + 1)}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total: <span className="font-semibold">{formatPrice(selectedProduct.price * orderQuantity)}</span>
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeOrderModal}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomOrder}
                disabled={orderingProduct === selectedProduct.id}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {orderingProduct === selectedProduct.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Ordering...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Place Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;