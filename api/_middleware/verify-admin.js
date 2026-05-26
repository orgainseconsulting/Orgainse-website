/**
 * Bearer-token JWT middleware for Vercel admin endpoints.
 *
 * Usage:
 *   import { requireAdmin } from './middleware/verify-admin.js';
 *   const auth = requireAdmin(req, res);
 *   if (!auth) return; // 401/403 already sent
 *   // ...proceed
 */
import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, options = {}) {
  const header = req.headers.authorization || '';
  if (!header.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' });
    return null;
  }
  const token = header.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' });
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server misconfigured: JWT_SECRET not set' });
    return null;
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (payload.role !== 'admin') {
      res.status(403).json({ error: 'Not an admin token' });
      return null;
    }
    const requiredPurpose = options.allowPasswordChange ? null : 'full';
    if (requiredPurpose && payload.purpose && payload.purpose !== requiredPurpose) {
      res.status(403).json({ error: 'Token purpose insufficient' });
      return null;
    }
    return payload;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
    return null;
  }
}
