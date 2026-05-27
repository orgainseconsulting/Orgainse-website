/**
 * Central API client.
 * - Builds absolute URLs from REACT_APP_BACKEND_URL (falls back to same-origin)
 * - Attaches the admin Bearer token from sessionStorage when calling /api/admin*
 * - Returns parsed JSON; throws an Error with message from the server
 *
 * Origin resolution: at runtime in the browser we always prefer the current
 * window origin so the frontend hits its OWN deployment's /api/* handlers —
 * even when REACT_APP_BACKEND_URL was baked into the build with a stale
 * Vercel alias (which produces silent 404s + CORS failures and is hard to
 * diagnose). Build-time env is only used during SSR/build (no window).
 */
const BUILD_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

function resolveApiBase() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
  }
  return `${BUILD_BACKEND_URL}/api`;
}

export const API_BASE = resolveApiBase();

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
    // Admin & dynamic public endpoints must always reflect the latest data
    // the moment a super-admin saves. Don't let the browser HTTP-cache GETs.
    cache: 'no-store',
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

  // ----- Auth -----
  adminLogin: (email, password) => request('/admin-login', { method: 'POST', body: { email, password } }),
  authMe: () => request('/auth/me', { requiresAdmin: true }),
  adminChangePassword: (current_password, new_password) =>
    request('/admin-change-password', { method: 'POST', body: { current_password, new_password }, requiresAdmin: true }),

  // ----- Lead dashboard -----
  adminDashboard: (page = 1, pageSize = 100) =>
    request(`/admin?page=${page}&page_size=${pageSize}`, { requiresAdmin: true }),
  adminDelete: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin-delete?${qs}`, { method: 'DELETE', requiresAdmin: true });
  },

  // ----- Admin users (super-admin only) -----
  adminUsersList: () => request('/admin-users', { requiresAdmin: true }),
  adminUsersInvite: (data) => request('/admin-users', { method: 'POST', body: data, requiresAdmin: true }),
  adminUsersUpdate: (id, data) => request(`/admin-users?id=${encodeURIComponent(id)}`, { method: 'PUT', body: data, requiresAdmin: true }),
  adminUsersReset: (id, new_temp_password) =>
    request(`/admin-users/reset-password?id=${encodeURIComponent(id)}`, { method: 'POST', body: { new_temp_password }, requiresAdmin: true }),
  adminUsersDelete: (id) => request(`/admin-users?id=${encodeURIComponent(id)}`, { method: 'DELETE', requiresAdmin: true }),

  // ----- App settings -----
  appSettingsGet: () => request('/app-settings', { requiresAdmin: true }),
  appSettingsUpdate: (data) => request('/app-settings', { method: 'PUT', body: data, requiresAdmin: true }),
  appSettingsPublic: () => request('/app-settings/public'),
};
