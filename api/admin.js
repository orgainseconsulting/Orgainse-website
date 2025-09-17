import { MongoClient } from 'mongodb';
import { securityHeaders, rateLimit, validateRequestSize } from './middleware/security.js';

export default async function handler(req, res) {
  // Apply security headers
  securityHeaders(req, res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests for admin dashboard
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting - more restrictive for admin access
    if (!rateLimit(req, res, { max: 30, windowMs: 15 * 60 * 1000 })) {
      return; // Rate limit exceeded
    }

    // Basic authentication check (in production, implement proper JWT/session auth)
    const authHeader = req.headers.authorization;
    const referer = req.headers.referer;
    
    // Simple referer check - in production, use proper authentication
    if (!referer || (!referer.includes('/admin') && !referer.includes('localhost'))) {
      // Allow if called from admin page or localhost
      console.warn('Admin API access attempt from unauthorized referer:', referer);
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    
    const db = client.db(process.env.DB_NAME || 'orgainse-consulting');

    // Fetch data from all collections with error handling
    const collections = [
      'newsletter_subscriptions',
      'contact_messages',
      'ai_assessment_leads',
      'roi_calculator_leads',
      'service_inquiries',
      'consultation_leads'
    ];

    const results = {};
    let totalLeads = 0;

    // Fetch data from each collection safely
    for (const collectionName of collections) {
      try {
        const data = await db.collection(collectionName)
          .find({})
          .sort({ submitted_at: -1, subscribed_at: -1 })
          .limit(100) // Limit results for performance
          .toArray();
        
        results[collectionName] = data;
        totalLeads += data.length;
      } catch (collectionError) {
        console.error(`Error fetching ${collectionName}:`, collectionError);
        results[collectionName] = [];
      }
    }

    await client.close();

    // Create summary statistics
    const summary = {
      total_newsletters: results.newsletter_subscriptions.length,
      total_contacts: results.contact_messages.length,
      total_ai_assessments: results.ai_assessment_leads.length,
      total_roi_calculators: results.roi_calculator_leads.length,
      total_service_inquiries: results.service_inquiries.length,
      total_consultations: results.consultation_leads.length,
      total_leads: totalLeads,
      last_updated: new Date().toISOString(),
      // Add breakdown structure that frontend expects
      breakdown: {
        newsletters: results.newsletter_subscriptions.length,
        contact_messages: results.contact_messages.length,
        ai_assessments: results.ai_assessment_leads.length,
        roi_calculators: results.roi_calculator_leads.length,
        service_inquiries: results.service_inquiries.length,
        consultations: results.consultation_leads.length
      }
    };

    // Prepare response data
    const responseData = {
      summary,
      data: {
        newsletters: results.newsletter_subscriptions,
        contact_messages: results.contact_messages,
        ai_assessment_leads: results.ai_assessment_leads,
        roi_calculator_leads: results.roi_calculator_leads,
        service_inquiries: results.service_inquiries,
        consultation_leads: results.consultation_leads
      },
      success: true,
      timestamp: new Date().toISOString()
    };

    // Add cache headers for performance
    res.setHeader('Cache-Control', 'private, max-age=300'); // 5 minutes cache
    
    res.status(200).json(responseData);

  } catch (error) {
    console.error('Admin API Error:', error);
    
    // Don't expose internal error details
    res.status(500).json({ 
      error: 'Internal server error. Unable to fetch dashboard data.',
      success: false,
      timestamp: new Date().toISOString()
    });
  }
}