const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: isFormData || !options.body ? options.body : JSON.stringify(options.body),
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed.');
  }

  return payload?.data ?? null;
}

export const api = {
  /**
   * Wake the API host and verify the database (health runs SELECT 1).
   * 200 = API + DB up. 404 = older deploy without /health (host still awake).
   * 503 = API up but database unavailable.
   */
  health: async (options = {}) => {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: options.signal,
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') ? await response.json() : null;
      return payload?.data ?? { ok: true };
    }

    // Older deploys may 404 — still means the host is awake.
    if (response.status === 404 || response.status === 401) {
      return { ok: true };
    }

    if (response.status === 503) {
      throw new Error(
        'Database is unavailable right now. If using free Supabase, the project may still be resuming — try again shortly.'
      );
    }

    throw new Error('Server is unavailable right now. Please try again.');
  },
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),
  dashboard: () => request('/dashboard'),
  getOptions: () => request('/vouchers/meta/options'),
  listVouchers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, value);
      }
    });
    const qs = query.toString();
    return request(`/vouchers${qs ? `?${qs}` : ''}`);
  },
  getVoucher: (id) => request(`/vouchers/${id}`),
  createVoucher: (payload) => request('/vouchers', { method: 'POST', body: payload }),
  updateVoucher: (id, payload) =>
    request(`/vouchers/${id}`, { method: 'PUT', body: payload }),
  deleteVoucher: (id) => request(`/vouchers/${id}`, { method: 'DELETE' }),
  submitVoucher: (id, employeeSignatureUrl) =>
    request(`/vouchers/${id}/submit`, {
      method: 'POST',
      body: { employeeSignatureUrl },
    }),
  approveVoucher: (id, directorSignatureUrl) =>
    request(`/vouchers/${id}/approve`, {
      method: 'POST',
      body: { directorSignatureUrl },
    }),
  rejectVoucher: (id, rejectionReason) =>
    request(`/vouchers/${id}/reject`, {
      method: 'POST',
      body: { rejectionReason },
    }),
  downloadVoucher: async (id) => {
    const response = await fetch(`${API_BASE}/vouchers/${id}/download`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || 'Download failed.');
    }

    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="(.+)"/);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = match?.[1] || `voucher-${id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  },
  uploadSignature: (file) => {
    const formData = new FormData();
    formData.append('signature', file);
    return request('/uploads/signature', { method: 'POST', body: formData });
  },
};
