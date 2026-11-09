import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const publicService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
};

export const adminService = {
  list: (resource) => api.get(`/admin/${resource}`),
  get: (resource, id) => api.get(`/admin/${resource}/${id}`),
  create: (resource, data) => api.post(`/admin/${resource}`, data),
  update: (resource, id, data) => api.put(`/admin/${resource}/${id}`, data),
  remove: (resource, id) => api.delete(`/admin/${resource}/${id}`),
  getCompanySettings: () => api.get('/admin/company-settings'),
  updateCompanySettings: (data) => api.put('/admin/company-settings', data),
  updatePurchaseOrderStatus: (id, data) => api.post(`/admin/purchase-orders/${id}/status`, data),
};

export const customerService = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
  createQuotationRequest: (data) => api.post('/customer/quotation-requests', data),
  getQuotationRequests: () => api.get('/customer/quotation-requests'),
  getOffers: () => api.get('/customer/offers'),
  respondToOffer: (id, status) => api.post(`/customer/offers/${id}/respond`, { status }),
};
