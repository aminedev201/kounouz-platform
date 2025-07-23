'use client';

import React, { useEffect, useState } from 'react';
import { commandService } from '@/services/apis';
import { useAuth } from '@/context/AuthProvider';
import ConfirmDialog from '@/components/ui/alert/confirmDialog';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader/loader';

export default function UserOrderList() {
  const { token, user, loading: loadAuth , userOrderCount , setuserOrderCount} = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, orderId: null });
  const [editingQuantity, setEditingQuantity] = useState({ orderId: null, quantity: '', error: '' });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const router = useRouter();

  useEffect(() => {
    if (!loadAuth) {
      if (!user || !token || !user?.roles.includes('ROLE_USER')) {
        router.push('/login');
        return;
      } else {
        fetchOrders();
      }
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await commandService.userCommandlist(token);
      setOrders(res.data);
      setuserOrderCount(res.data.length);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      showAlert('Failed to fetch orders', 'error');
    }
  };

  useEffect(() => {
    const filtered = orders.filter(order =>
      order.product.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [search, orders]);

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedOrders.length / perPage);
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * perPage, currentPage * perPage);

  const toggleSort = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const handleDelete = async id => {
    try {
      await commandService.delete(id, token);
      fetchOrders();
      showAlert('Order deleted successfully', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      showAlert('Failed to delete order', 'error');
    }
  };

  // Validation function for quantity
  const validateQuantity = (quantity) => {
    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity < 1) {
      return 'Quantity must be at least 1';
    }
    return '';
  };

  const handleQuantityChange = (value) => {
    const error = validateQuantity(value);
    setEditingQuantity(prev => ({ 
      ...prev, 
      quantity: value, 
      error 
    }));
  };

  const handleQuantityUpdate = async (id, quantity) => {
    // Final validation before sending request
    const error = validateQuantity(quantity);
    if (error) {
      setEditingQuantity(prev => ({ ...prev, error }));
      showAlert(error, 'error');
      return;
    }

    try {
      await commandService.updateQuantity(id, { quantity: parseInt(quantity) }, token);
      fetchOrders();
      setEditingQuantity({ orderId: null, quantity: '', error: '' });
      showAlert('Quantity updated successfully', 'success');
    } catch (err) {
      console.error('Update quantity failed:', err);
      showAlert('Failed to update quantity', 'error');
    }
  };

  const startEditingQuantity = (orderId, currentQuantity) => {
    setEditingQuantity({ orderId, quantity: currentQuantity.toString(), error: '' });
  };

  const cancelEditingQuantity = () => {
    setEditingQuantity({ orderId: null, quantity: '', error: '' });
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 0: return { text: 'Cancelled', class: 'bg-red-50 text-red-700 border border-red-200', icon: '✕' };
      case 1: return { text: 'Confirmed', class: 'bg-green-50 text-green-700 border border-green-200', icon: '✓' };
      case 2: return { text: 'Pending', class: 'bg-amber-50 text-amber-700 border border-amber-200', icon: '⏳' };
      default: return { text: 'Unknown', class: 'bg-gray-50 text-gray-700 border border-gray-200', icon: '?' };
    }
  };

  if (!loadAuth && user && user.roles.includes('ROLE_USER')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your order history</p>
          </div>

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

          {/* Search and Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Show:</span>
                <select 
                  value={perPage} 
                  onChange={e => setPerPage(Number(e.target.value))} 
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[5, 10, 25].map(n => <option key={n} value={n}>{n} per page</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleSort('product.name')}>
                      <div className="flex items-center gap-2">
                        Product
                        {sortConfig.key === 'product.name' && (
                          <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-6 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleSort('quantity')}>
                      <div className="flex items-center gap-2">
                        Quantity
                        {sortConfig.key === 'quantity' && (
                          <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-6 font-semibold text-gray-900">Status</th>
                    <th className="text-left p-6 font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleSort('createdAt')}>
                      <div className="flex items-center gap-2">
                        Created
                        {sortConfig.key === 'createdAt' && (
                          <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-6 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedOrders.map(order => {
                    const statusInfo = getStatusDisplay(order.status);
                    const isEditing = editingQuantity.orderId === order.id;
                    const isPending = order.status === 2;
                    const hasError = isEditing && editingQuantity.error;
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-6">
                          <div className="font-medium text-gray-900">{order.product.name}</div>
                        </td>
                        <td className="p-6">
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={editingQuantity.quantity}
                                    min="1"
                                    className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
                                      hasError 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                    onChange={e => handleQuantityChange(e.target.value)}
                                  />
                                </div>
                                <button
                                  onClick={() => handleQuantityUpdate(order.id, editingQuantity.quantity)}
                                  disabled={hasError}
                                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    hasError
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                  }`}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditingQuantity}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                              {hasError && (
                                <div className="text-red-600 text-sm font-medium flex items-center gap-1">
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {editingQuantity.error}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-gray-900">{order.quantity}</span>
                              {isPending && (
                                <button
                                  onClick={() => startEditingQuantity(order.id, order.quantity)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium text-sm"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${statusInfo.class}`}>
                            <span>{statusInfo.icon}</span>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="text-gray-900 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {new Date(order.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="p-6">
                          {isPending && (
                            <button
                              onClick={() => setConfirmDelete({ isOpen: true, orderId: order.id })}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, sortedOrders.length)} of {sortedOrders.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)} 
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)} 
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {paginatedOrders.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={confirmDelete.isOpen}
          onClose={() => setConfirmDelete({ isOpen: false, orderId: null })}
          onConfirm={() => {
            handleDelete(confirmDelete.orderId);
            setConfirmDelete({ isOpen: false, orderId: null });
          }}
          title="Delete Order"
          message="Are you sure you want to delete this order?"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    );
  } else {
    return <Loader />;
  }
}