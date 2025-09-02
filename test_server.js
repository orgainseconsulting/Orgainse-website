#!/usr/bin/env node
/**
 * Local test server for Vercel serverless functions
 * This simulates the Vercel environment for testing purposes
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set environment variables for testing
process.env.MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
process.env.DB_NAME = process.env.DB_NAME || 'orgainse_consulting';

// Import and setup API routes
async function setupRoutes() {
  try {
    // Import the serverless functions
    const healthHandler = (await import('./api/health.js')).default;
    const newsletterHandler = (await import('./api/newsletter.js')).default;
    const contactHandler = (await import('./api/contact.js')).default;
    const adminHandler = (await import('./api/admin.js')).default;

    // Create mock req/res objects that match Vercel's interface
    function createHandler(handler) {
      return async (req, res) => {
        try {
          // Create Vercel-compatible request object
          const vercelReq = {
            method: req.method,
            body: req.body,
            query: req.query,
            headers: req.headers,
            url: req.url
          };

          // Create Vercel-compatible response object
          const vercelRes = {
            status: (code) => {
              res.status(code);
              return vercelRes;
            },
            json: (data) => {
              res.json(data);
              return vercelRes;
            },
            end: (data) => {
              res.end(data);
              return vercelRes;
            },
            setHeader: (name, value) => {
              res.setHeader(name, value);
              return vercelRes;
            }
          };

          await handler(vercelReq, vercelRes);
        } catch (error) {
          console.error('Handler error:', error);
          res.status(500).json({ error: 'Internal server error', details: error.message });
        }
      };
    }

    // Setup routes
    app.get('/api/health', createHandler(healthHandler));
    app.post('/api/newsletter', createHandler(newsletterHandler));
    app.options('/api/newsletter', createHandler(newsletterHandler));
    app.post('/api/contact', createHandler(contactHandler));
    app.options('/api/contact', createHandler(contactHandler));
    app.get('/api/admin', createHandler(adminHandler));
    app.options('/api/admin', createHandler(adminHandler));

    console.log('✅ All API routes loaded successfully');
  } catch (error) {
    console.error('❌ Error loading API routes:', error);
  }
}

// Start server
async function startServer() {
  await setupRoutes();
  
  app.listen(PORT, () => {
    console.log(`🚀 Test server running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  POST /api/newsletter');
    console.log('  POST /api/contact');
    console.log('  GET  /api/admin');
    console.log('');
    console.log('🧪 Ready for testing!');
  });
}

startServer().catch(console.error);