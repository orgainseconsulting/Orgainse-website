// Security middleware for all API endpoints
export const securityHeaders = (req, res) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://assets.calendly.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.calendly.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https://images.unsplash.com https://www.google-analytics.com; " +
    "connect-src 'self' https://www.google-analytics.com https://api.calendly.com; " +
    "frame-src https://calendly.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );

  // Enhanced Security Headers - RELAXED CSP for API endpoints
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  res.setHeader('Permissions-Policy', 'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // CORS - more restrictive for production
  const allowedOrigins = [
    'http://localhost:3000',
    'https://orgainse-consulting.vercel.app',
    'https://orgainse-website.vercel.app',
    'https://www.orgainse.com',
    'https://orgainse.com',
    'https://orgainse-consulting.emergent.host',
    'https://www.orgainse-consulting.emergent.host'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
};

// Rate limiting storage (in production, use Redis or external service)
const rateLimitStore = new Map();

export const rateLimit = (req, res, options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later.'
  } = options;

  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress ||
             'unknown';

  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create rate limit data for this IP
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const requests = rateLimitStore.get(ip);
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(time => time > windowStart);
  rateLimitStore.set(ip, recentRequests);

  // Check if limit exceeded
  if (recentRequests.length >= max) {
    res.status(429).json({
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    });
    return false;
  }

  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, max - recentRequests.length));
  res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

  return true;
};

// Input sanitization
export const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .substring(0, 10000); // Limit length
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => sanitizeInput(item));
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return data;
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Request size validation
export const validateRequestSize = (req, res, maxSize = 1024 * 1024) => { // 1MB default
  const contentLength = parseInt(req.headers['content-length'] || '0');
  
  if (contentLength > maxSize) {
    res.status(413).json({
      error: 'Request payload too large',
      maxSize: `${maxSize / 1024 / 1024}MB`
    });
    return false;
  }
  
  return true;
};

// Clean up rate limit store periodically (prevents memory leaks)
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  for (const [ip, requests] of rateLimitStore.entries()) {
    const recentRequests = requests.filter(time => time > (now - windowMs));
    if (recentRequests.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, recentRequests);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes