import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

const createAuthenticatedRequest = (token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  return config;
};

export const authService = {
  login: (data) => apiClient.post('/login', data),
  register: (data) => apiClient.post('/register', data),
  getCurrentUser: (id, token) => apiClient.get(`/current-user/${id}`, createAuthenticatedRequest(token)),
  editProfile: (data, token) => apiClient.put('/user/profile', data, createAuthenticatedRequest(token)),
  changePassword: (data, token) => apiClient.put('/user/change-password', data, createAuthenticatedRequest(token)),
  deleteMyAccount: (token) => apiClient.delete('/user/delete/my-account', {}, createAuthenticatedRequest(token)),
};

export const productService = {
  getAll: () => apiClient.get('/user/products'),
  getVendorProducts: (token) => apiClient.get('/products', createAuthenticatedRequest(token)),
  vendorProductCount: (token) => apiClient.get('/products/count/vendor', createAuthenticatedRequest(token)),
  create: (data, token) => apiClient.post('/products', data, createAuthenticatedRequest(token)),
  update: (id, data, token) => apiClient.put(`/products/${id}`, data, createAuthenticatedRequest(token)),
  delete: (id, token) => apiClient.delete(`/products/${id}`, createAuthenticatedRequest(token)),
  getOne: (id, token) => apiClient.get(`/products/${id}`, createAuthenticatedRequest(token)),
};

export const commandService = {
  // For User
  userCommandlist: (token) => apiClient.get('/commands', createAuthenticatedRequest(token)),
  getOne: (id, token) => apiClient.get(`/commands/${id}`, createAuthenticatedRequest(token)),
  create: (data, token) => apiClient.post('/commands', data, createAuthenticatedRequest(token)),
  updateQuantity: (id, data, token) => apiClient.patch(`/commands/${id}`, data, createAuthenticatedRequest(token)),
  delete: (id, token) => apiClient.delete(`/commands/${id}`, createAuthenticatedRequest(token)),
  
  // For Vendor
  vendorCommandList: (token) => apiClient.get('/commands/vendor/list', createAuthenticatedRequest(token)),
  vendorCommandCount: (token) => apiClient.get('/commands/count/vendor', createAuthenticatedRequest(token)),
  confirmByVendor: (id, token) => apiClient.post(`/commands/${id}/confirm`, {}, createAuthenticatedRequest(token)),
  cancelByVendor: (id, token) => apiClient.post(`/commands/${id}/cancel`, {}, createAuthenticatedRequest(token)),
  pendingByVendor: (id, token) => apiClient.post(`/commands/${id}/pending`, {}, createAuthenticatedRequest(token)),

};

