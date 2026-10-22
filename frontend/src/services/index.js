import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const produkService = {
  getAll: (params) => api.get('/produk', { params }),
  getById: (id) => api.get(`/produk/${id}`),
  create: (data) => api.post('/produk', data),
  update: (id, data) => api.put(`/produk/${id}`, data),
  delete: (id) => api.delete(`/produk/${id}`),
};

export const penjualanService = {
  getDashboard: () => api.get('/penjualan/dashboard'),
  getAll: (params) => api.get('/penjualan', { params }),
  getById: (id) => api.get(`/penjualan/${id}`),
  create: (data) => api.post('/penjualan', data),
  updateStatus: (id, status) => api.put(`/penjualan/${id}/status`, { status }),
};

export const kategoriService = {
  getAll: () => api.get('/master/kategori'),
  create: (data) => api.post('/master/kategori', data),
  update: (id, data) => api.put(`/master/kategori/${id}`, data),
  delete: (id) => api.delete(`/master/kategori/${id}`),
};

export const supplierService = {
  getAll: () => api.get('/master/supplier'),
  create: (data) => api.post('/master/supplier', data),
  update: (id, data) => api.put(`/master/supplier/${id}`, data),
  delete: (id) => api.delete(`/master/supplier/${id}`),
};

export const pelangganService = {
  getAll: (params) => api.get('/master/pelanggan', { params }),
  create: (data) => api.post('/master/pelanggan', data),
  update: (id, data) => api.put(`/master/pelanggan/${id}`, data),
  delete: (id) => api.delete(`/master/pelanggan/${id}`),
};

export const userService = {
  getAll: () => api.get('/master/users'),
  create: (data) => api.post('/master/users', data),
  update: (id, data) => api.put(`/master/users/${id}`, data),
  delete: (id) => api.delete(`/master/users/${id}`),
};
