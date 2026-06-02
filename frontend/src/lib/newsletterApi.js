/**
 * Newsletter API helpers (admin + public).
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
  } catch { return null; }
}

async function request(path, { method = 'GET', body, admin = false, raw = false } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (admin) {
    const t = getAdminToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (raw) return res; // for CSV downloads etc.
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

export const newsletterApi = {
  // Public
  list: (page = 1, pageSize = 12) => request(`/newsletter-issues?page=${page}&page_size=${pageSize}`),
  getBySlug: (slug) => request(`/newsletter-issues?slug=${encodeURIComponent(slug)}`),
  unsubscribeCheck: (token) => request(`/unsubscribe?token=${encodeURIComponent(token)}`),
  unsubscribe: (token) => request('/unsubscribe', { method: 'POST', body: { token } }),

  // Admin — issues
  adminIssuesList: (page = 1, pageSize = 50) => request(`/newsletter-admin/issues?page=${page}&page_size=${pageSize}`, { admin: true }),
  adminIssueGet: (id) => request(`/newsletter-admin/issues?id=${encodeURIComponent(id)}`, { admin: true }),
  adminIssueCreate: (issue) => request('/newsletter-admin/issues', { method: 'POST', body: issue, admin: true }),
  adminIssueUpdate: (id, issue) => request(`/newsletter-admin/issues?id=${encodeURIComponent(id)}`, { method: 'PUT', body: issue, admin: true }),
  adminIssueDelete: (id) => request(`/newsletter-admin/issues?id=${encodeURIComponent(id)}`, { method: 'DELETE', admin: true }),
  adminIssueSend: (id, { segment_slug, test_email } = {}) =>
    request(`/newsletter-admin/issues/send?id=${encodeURIComponent(id)}`, {
      method: 'POST', body: { segment_slug, test_email }, admin: true,
    }),

  // Admin — subscribers
  adminSubsList: ({ q, segment, state, page = 1, page_size = 50 } = {}) => {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (segment) qs.set('segment', segment);
    if (state) qs.set('state', state);
    qs.set('page', page);
    qs.set('page_size', page_size);
    return request(`/newsletter-admin/subscribers?${qs.toString()}`, { admin: true });
  },
  adminSubCreate: (sub) => request('/newsletter-admin/subscribers', { method: 'POST', body: sub, admin: true }),
  adminSubUpdate: (id, patch) => request(`/newsletter-admin/subscribers?id=${encodeURIComponent(id)}`, { method: 'PUT', body: patch, admin: true }),
  adminSubDelete: (id) => request(`/newsletter-admin/subscribers?id=${encodeURIComponent(id)}`, { method: 'DELETE', admin: true }),
  adminSubsExportUrl: ({ segment, state } = {}) => {
    const qs = new URLSearchParams();
    if (segment) qs.set('segment', segment);
    if (state) qs.set('state', state);
    return `${API}/newsletter-admin/subscribers/export?${qs.toString()}`;
  },

  // Admin — segments
  adminSegmentsList: () => request('/newsletter-admin/segments', { admin: true }),
  adminSegmentCreate: (seg) => request('/newsletter-admin/segments', { method: 'POST', body: seg, admin: true }),
  adminSegmentDelete: (id) => request(`/newsletter-admin/segments?id=${encodeURIComponent(id)}`, { method: 'DELETE', admin: true }),

  // Admin — analytics
  adminAnalytics: () => request('/newsletter-admin/analytics', { admin: true }),
};
