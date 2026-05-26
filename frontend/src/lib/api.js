/**
 * Central API client.
 * - Builds absolute URLs from REACT_APP_BACKEND_URL (falls back to same-origin)
 * - Attaches the admin Bearer token from sessionStorage when calling /api/admin*
 * - Returns parsed JSON; throws an Error with message from the server
 */
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

export const API_BASE = `${BACKEND_URL}/api`;

function getAdminToken() {
  try {
    const raw = sessionStorage.getItem('orgainse_admin_auth');
    if (!raw) return null;
    const { token } = JSON.parse(raw);
    return token || null;
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, headers = {}, requiresAdmin = false } = {}) {
  const url = `${API_BASE}${path}`;
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };

  if (requiresAdmin) {
    const token = getAdminToken();
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }

  if (!res.ok) {
    const msg = data?.error || data?.detail || data?.message || `Request failed (${res.status})`;
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  contact: (data) => request('/contact', { method: 'POST', body: data }),
  newsletter: (data) => request('/newsletter', { method: 'POST', body: data }),
  aiAssessment: (data) => request('/ai-assessment', { method: 'POST', body: data }),
  roiCalculator: (data) => request('/roi-calculator', { method: 'POST', body: data }),
  consultation: (data) => request('/consultation', { method: 'POST', body: data }),
  adminLogin: (username, password) => request('/admin-login', { method: 'POST', body: { username, password } }),
  adminDashboard: (page = 1, pageSize = 100) =>
    request(`/admin?page=${page}&page_size=${pageSize}`, { requiresAdmin: true }),
  adminDelete: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin-delete?${qs}`, { method: 'DELETE', requiresAdmin: true });
  },
};
