/**
 * Careers API helpers (public + admin).
 * Resume uploads are chunked so each request stays well under the serverless
 * body limit; the backend reassembles, emails and discards the file.
 */
const BUILD_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = (typeof window !== 'undefined' && window.location?.origin)
  ? `${window.location.origin}/api`
  : `${BUILD_BACKEND_URL}/api`;

function getAdminToken() {
  try {
    const raw = sessionStorage.getItem('orgainse_admin_auth');
    if (!raw) return null;
    return JSON.parse(raw).token || null;
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, admin = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (admin) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_ACCEPT = '.pdf,.doc,.docx';
export const RESUME_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const WHY_MAX_CHARS = 500;
const CHUNK_CHARS = 480 * 1024;

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const result = String(reader.result || '');
    const comma = result.indexOf(',');
    resolve(comma >= 0 ? result.slice(comma + 1) : result);
  };
  reader.onerror = () => reject(new Error('Could not read the selected file'));
  reader.readAsDataURL(file);
});

const uuid = () => (window.crypto?.randomUUID
  ? window.crypto.randomUUID()
  : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-4${Math.random().toString(16).slice(2, 5)}`);

export const careersApi = {
  list: () => request('/careers'),
  get: (slug) => request(`/careers?slug=${encodeURIComponent(slug)}`),

  /**
   * Uploads the resume in chunks then submits the application.
   * onProgress receives 0..100.
   */
  apply: async ({ job_slug, full_name, email, phone, portfolio_url, why, file }, onProgress = () => {}) => {
    const b64 = await fileToBase64(file);
    const uploadId = uuid();
    const total = Math.max(1, Math.ceil(b64.length / CHUNK_CHARS));

    for (let i = 0; i < total; i += 1) {
      await request('/careers-apply', {
        method: 'POST',
        body: {
          action: 'chunk',
          upload_id: uploadId,
          index: i,
          total,
          chunk: b64.slice(i * CHUNK_CHARS, (i + 1) * CHUNK_CHARS),
        },
      });
      onProgress(Math.round(((i + 1) / (total + 1)) * 100));
    }

    const out = await request('/careers-apply', {
      method: 'POST',
      body: {
        action: 'submit',
        upload_id: uploadId,
        job_slug,
        full_name,
        email,
        phone,
        portfolio_url,
        why,
        filename: file.name,
        mime: file.type,
      },
    });
    onProgress(100);
    return out;
  },

  // ----- Admin -----
  adminList: () => request('/careers-admin', { admin: true }),
  adminAnalytics: () => request('/careers-admin?action=analytics', { admin: true }),
  adminGet: (id) => request(`/careers-admin?id=${encodeURIComponent(id)}`, { admin: true }),
  adminCreate: (data) => request('/careers-admin', { method: 'POST', body: data, admin: true }),
  adminUpdate: (id, data) => request(`/careers-admin?id=${encodeURIComponent(id)}`, { method: 'PUT', body: data, admin: true }),
  adminDelete: (id) => request(`/careers-admin?id=${encodeURIComponent(id)}`, { method: 'DELETE', admin: true }),
};

export default careersApi;
