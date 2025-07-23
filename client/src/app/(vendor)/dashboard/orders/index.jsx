'use client'

import React, { useState, useEffect } from 'react';
import { commandService } from '@/services/apis';
import { useAuth } from '@/context/AuthProvider';
import ConfirmDialog from '@/components/ui/alert/confirmDialog';
import { RefreshCcw } from 'lucide-react';

const VendorOrderList = () => {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const { token, loading: loadAuth } = useAuth();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const STATUS = {
    2: { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
    1: { text: 'Confirmed', class: 'bg-green-100 text-green-800' },
    0: { text: 'Cancelled', class: 'bg-red-100 text-red-800' }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const loadCommands = async () => {
    if (!token) {
      showAlert('No authentication token found', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await commandService.vendorCommandList(token);
      if (response.error) {
        showAlert(response.error, 'error');
        setCommands([]);
      } else {
        setCommands(response.data || response || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      if (error.response?.status === 401) {
        showAlert('Authentication failed. Please login again.', 'error');
      } else {
        showAlert('Failed to load orders', 'error');
      }
      setCommands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (commandId, newStatus) => {
    setPendingStatusChange({ commandId, newStatus });
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    const { commandId, newStatus } = pendingStatusChange;
    try {
      let response;
      switch (newStatus) {
        case '1':
          response = await commandService.confirmByVendor(commandId, token);
          break;
        case '0':
          response = await commandService.cancelByVendor(commandId, token);
          break;
        case '2':
          response = await commandService.pendingByVendor(commandId, token);
          break;
        default:
          showAlert('Invalid status', 'error');
          return;
      }

      if (response.error) {
        showAlert(response.error, 'error');
      } else {
        showAlert(response.message || 'Status updated successfully', 'success');
        loadCommands();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('Failed to update status', 'error');
    } finally {
      setShowConfirmDialog(false);
      setPendingStatusChange(null);
    }
  };

  const cancelStatusChange = () => {
    setShowConfirmDialog(false);
    setPendingStatusChange(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedCommands = React.useMemo(() => {
    let filtered = commands.filter(command => {
      const searchString = searchTerm.toLowerCase();
      return (
        command.id.toString().includes(searchString) ||
        command.product?.name?.toLowerCase().includes(searchString) ||
        command.user?.firstname?.toLowerCase().includes(searchString) ||
        command.user?.lastname?.toLowerCase().includes(searchString) ||
        command.quantity.toString().includes(searchString)
      );
    });

    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'product') {
        aValue = a.product?.name || '';
        bValue = b.product?.name || '';
      } else if (sortConfig.key === 'user') {
        aValue = a.user?.firstname || '';
        bValue = b.user?.firstname || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [commands, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedCommands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCommands = filteredAndSortedCommands.slice(startIndex, endIndex);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const getStatusOptions = (currentStatus) => {
    return Object.entries(STATUS).map(([value, info]) => (
      <option key={value} value={value} disabled={parseInt(value) === currentStatus}>
        {info.text}
      </option>
    ));
  };

  useEffect(() => {
    if (!loadAuth && token) {
      loadCommands();
    }
  }, [token, loadAuth]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold text-center sm:text-left">
            Vendor Commands Management
          </h1>
          <p className="text-blue-100 mt-2 text-center sm:text-left">
            Manage your vendor commands and update their status
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <div
            className={`mx-6 mt-4 p-4 rounded-md ${
              alert.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : alert.type === 'error'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{alert.message}</span>
              <button onClick={() => setAlert(null)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Search and Items Per Page - Centered on mobile */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1); // reset to first page
                }}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 10, 25, 50, 100].map(size => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto flex justify-center sm:justify-end">
              <button
                onClick={loadCommands}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>


          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'id', label: 'ID' },
                  { key: 'product', label: 'Product' },
                  { key: 'user', label: 'Customer' },
                  { key: 'quantity', label: 'Quantity' },
                  { key: 'status', label: 'Status' },
                  { key: 'createdAt', label: 'Created' },
                  { key: 'updatedAt', label: 'Updated' },
                  { key: 'actions', label: 'Actions' }
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => key !== 'actions' && handleSort(key)}
                  >
                    <div className="flex items-center">
                      {label}
                      {key !== 'actions' && sortConfig.key === key && (
                        <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : currentCommands.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                currentCommands.map((command) => (
                  <tr key={command.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {command.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {command.product?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {command.user?.firstname +' '+ command.user?.lastname|| 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{command.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          STATUS[command.status]?.class || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS[command.status]?.text || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(command.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(command.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={command.status}
                        onChange={(e) => handleStatusChange(command.id, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {getStatusOptions(command.status)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Results info - Centered on mobile */}
              <div className="text-sm text-gray-700 text-center sm:text-left order-2 sm:order-1">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedCommands.length)} of{' '}
                {filteredAndSortedCommands.length} results
              </div>
              {/* Pagination controls - Centered on mobile */}
              <div className="flex flex-wrap items-center justify-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={cancelStatusChange}
        onConfirm={confirmStatusChange}
        title="Change Command Status"
        message="Are you sure you want to change the status of this command?"
        confirmText="Yes, Change It"
        cancelText="Cancel"
      />
    </div>
  );
};

export default VendorOrderList;