const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('obliq_auth_token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type to JSON if not uploading FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('obliq_auth_token');
      localStorage.removeItem('obliq_auth_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request('/auth/me'),
    logout: () =>
      request('/auth/logout', {
        method: 'POST',
      }),
  },

  // Clients
  clients: {
    list: () => request('/clients'),
    get: (clientId) => request(`/clients/${clientId}`),
    create: (clientData) =>
      request('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      }),
    getDocuments: (clientId) => request(`/clients/${clientId}/documents`),
    getAuditHistory: (clientId) => request(`/clients/${clientId}/audit-history`),
  },

  // Documents
  documents: {
    get: (documentId) => request(`/documents/${documentId}`),
    upload: (documentId, formData) =>
      request(`/documents/${documentId}/upload`, {
        method: 'POST',
        body: formData,
      }),
    getVersions: (documentId) => request(`/documents/${documentId}/versions`),
    getVersion: (documentId, version) => request(`/documents/${documentId}/versions/${version}`),
    getAuditHistory: (documentId) => request(`/documents/${documentId}/audit-history`),
  },

  // Reviews
  reviews: {
    start: (documentId) =>
      request(`/documents/${documentId}/review/start`, {
        method: 'POST',
      }),
    approve: (documentId, note) =>
      request(`/documents/${documentId}/review/approve`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    correction: (documentId, comment) =>
      request(`/documents/${documentId}/review/correction`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }),
  },

  // Dashboard
  dashboard: {
    getStats: () => request('/dashboard/stats'),
  },
};
