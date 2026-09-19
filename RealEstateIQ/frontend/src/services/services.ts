import api from './api';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }

export const authService = {
  login: (data: LoginPayload) => api.post('/api/auth/login', data),
  register: (data: RegisterPayload) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

export const propertyService = {
  getAll: (params?: Record<string, unknown>) => api.get('/api/properties', { params }),
  getOne: (id: string) => api.get(`/api/properties/${id}`),
  create: (data: Record<string, unknown>) => api.post('/api/properties', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/properties/${id}`, data),
  delete: (id: string) => api.delete(`/api/properties/${id}`),
  save: (id: string) => api.post(`/api/properties/${id}/save`),
  unsave: (id: string) => api.delete(`/api/properties/${id}/save`),
  getSaved: () => api.get('/api/properties/saved'),
  compare: (ids: string[]) => api.post('/api/properties/compare', { ids }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/api/properties/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const inquiryService = {
  create: (data: {
    propertyId: string;
    propertyName: string;
    propertyLocation?: string;
    name: string;
    phone: string;
    email?: string;
    preferredDate?: string;
    message?: string;
  }) => api.post('/api/inquiries', data),
  getAll: (params?: Record<string, unknown>) => api.get('/api/inquiries', { params }),
  updateStatus: (id: string, status: string) => api.patch(`/api/inquiries/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/api/inquiries/${id}`),
};

export const predictionService = {
  predict: (data: Record<string, unknown>) => api.post('/api/predictions', data),
  getHistory: (params?: Record<string, unknown>) => api.get('/api/predictions/history', { params }),
  getOne: (id: string) => api.get(`/api/predictions/${id}`),
};

export const marketService = {
  getAnalytics: (params?: Record<string, unknown>) => api.get('/api/market/analytics', { params }),
  getRecommendations: (params?: Record<string, unknown>) => api.get('/api/market/recommendations', { params }),
  getModelInfo: () => api.get('/api/market/model-info'),
};

export const adminService = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: (params?: Record<string, unknown>) => api.get('/api/admin/users', { params }),
  updateUserRole: (id: string, role: string) => api.put(`/api/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/api/admin/users/${id}`),
  getPredictionAnalytics: () => api.get('/api/admin/predictions/analytics'),
  getMlModels: () => api.get('/api/admin/models'),
  updateModelStatus: (id: string, status: string) => api.put(`/api/admin/models/${id}/status`, { status }),
  getDatasets: () => api.get('/api/admin/datasets'),
  getAuditLogs: (params?: Record<string, unknown>) => api.get('/api/admin/audit-logs', { params }),
};
