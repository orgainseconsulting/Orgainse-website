import { securityHeaders, rateLimit } from './middleware/security.js';

export default async function handler(req, res) {
  // Apply security headers
  securityHeaders(req, res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting - more permissive for health checks
    if (!rateLimit(req, res, { max: 200, windowMs: 15 * 60 * 1000 })) {
      return; // Rate limit exceeded
    }

    // System health checks
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Orgainse Consulting API',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      features: {
        security_headers: true,
        rate_limiting: true,
        input_sanitization: true,
        email_validation: true,
        admin_auth: true
      }
    };

    // Add cache headers
    res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minute cache
    
    res.status(200).json(healthData);

  } catch (error) {
    console.error('Health API Error:', error);
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'Orgainse Consulting API',
      error: 'Health check failed'
    });
  }
}