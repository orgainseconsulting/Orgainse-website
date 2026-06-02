/**
 * Blog API helpers (admin & public).
 */
// Same-origin in the browser; fall back to build-time env at SSR/build time.
// Avoids stale Vercel aliases causing silent 404 / CORS failures.
const BUILD_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = (typeof window !== 'undefined' && window.location?.origin)
  ? `${window.location.origin}/api`
  : `${BUILD_BACKEND_URL}/api`;

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

async function adminRequest(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
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

async function publicRequest(path) {
  const res = await fetch(`${API}${path}`);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!res.ok) {
    const msg = data?.error || data?.detail || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const blogApi = {
  // Public
  list: (page = 1, pageSize = 12) => publicRequest(`/blog?page=${page}&page_size=${pageSize}`),
  getBySlug: (slug) => publicRequest(`/blog?slug=${encodeURIComponent(slug)}`),

  // Admin
  adminList: (page = 1, pageSize = 50) => adminRequest(`/blog-admin?page=${page}&page_size=${pageSize}`),
  adminGet: (id) => adminRequest(`/blog-admin?id=${encodeURIComponent(id)}`),
  adminCreate: (post) => adminRequest('/blog-admin', { method: 'POST', body: post }),
  adminUpdate: (id, post) => adminRequest(`/blog-admin?id=${encodeURIComponent(id)}`, { method: 'PUT', body: post }),
  adminDelete: (id) => adminRequest(`/blog-admin?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
  adminAnalytics: () => adminRequest('/blog-admin?action=analytics'),
};
