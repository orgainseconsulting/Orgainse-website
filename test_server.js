require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8001;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment variables - should be set in .env or deployment environment
// Removed hardcoded credentials for security
if (!process.env.MONGO_URL) {
  console.error('❌ MONGO_URL environment variable is required');
  process.exit(1);
}
process.env.DB_NAME = process.env.DB_NAME || 'orgainse-consulting';

// Import and setup API routes
async function setupRoutes() {
  try {
    // Import ES modules dynamically
    const { default: healthHandler } = await import('./api/health.js');
    const { default: newsletterHandler } = await import('./api/newsletter.js');
    const { default: contactHandler } = await import('./api/contact.js');
    const { default: adminHandler } = await import('./api/admin.js');
    const { default: aiAssessmentHandler } = await import('./api/ai-assessment.js');
    const { default: roiCalculatorHandler } = await import('./api/roi-calculator.js');
    const { default: consultationHandler } = await import('./api/consultation.js');

    // Setup routes for all 7 endpoints
    app.get('/api/health', healthHandler);
    app.post('/api/newsletter', newsletterHandler);
    app.post('/api/contact', contactHandler);
    app.get('/api/admin', adminHandler);
    app.post('/api/ai-assessment', aiAssessmentHandler);
    app.post('/api/roi-calculator', roiCalculatorHandler);
    app.post('/api/consultation', consultationHandler);
    
    console.log('✅ All 7 API routes configured successfully');
    console.log('📋 Available endpoints:');
    console.log('   GET  /api/health');
    console.log('   POST /api/newsletter');
    console.log('   POST /api/contact');
    console.log('   GET  /api/admin');
    console.log('   POST /api/ai-assessment');
    console.log('   POST /api/roi-calculator');
    console.log('   POST /api/consultation');
  } catch (error) {
    console.error('❌ Error setting up routes:', error);
  }
}

// Start server
async function startServer() {
  await setupRoutes();
  
  app.listen(PORT, () => {
    console.log(`🚀 Test server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  MongoDB URL: ${process.env.MONGO_URL ? 'Set' : 'Not set'}`);
    console.log(`📋 Database Name: ${process.env.DB_NAME}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});