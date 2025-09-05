import { MongoClient } from 'mongodb';
import { securityHeaders, rateLimit, sanitizeInput, validateEmail, validateRequestSize } from './middleware/security.js';

export default async function handler(req, res) {
  // Apply security headers
  securityHeaders(req, res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting - more restrictive for contact forms
    if (!rateLimit(req, res, { max: 50, windowMs: 15 * 60 * 1000 })) {
      return; // Rate limit exceeded
    }

    // Validate request size
    if (!validateRequestSize(req, res, 10 * 1024)) { // 10KB limit
      return;
    }

    // Sanitize input data
    const sanitizedBody = sanitizeInput(req.body);
    const { name, email, company, phone, service_type, message, leadType } = sanitizedBody;

    // Enhanced validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Required fields missing',
        required: ['name', 'email', 'message']
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Additional field length validation
    if (name.length > 100 || email.length > 254 || message.length > 5000) {
      return res.status(400).json({ 
        error: 'Field length exceeded limits' 
      });
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    
    const db = client.db(process.env.DB_NAME || 'orgainse-consulting');
    
    // Generate secure ID with timestamp
    const leadId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Prepare lead data with enhanced security
    const leadData = {
      id: leadId,
      name: name,
      email: email.toLowerCase(), // Normalize email
      company: company || '',
      phone: phone || '',
      service_type: service_type || '',
      message: message,
      leadType: leadType || 'Contact Inquiry',
      source: req.headers.referer || 'Direct',
      submitted_at: new Date().toISOString(),
      ip_address: req.headers['x-forwarded-for']?.split(',')[0] || 'unknown', // For analytics only
      user_agent: req.headers['user-agent'] || 'unknown',
      status: 'new',
      timestamp: new Date().toISOString()
    };

    // Determine collection based on lead type
    let collectionName = 'contact_messages'; // Default
    
    switch (leadType) {
      case 'AI Assessment':
        collectionName = 'ai_assessment_leads';
        break;
      case 'ROI Calculator':
        collectionName = 'roi_calculator_leads';
        break;
      case 'Service Inquiry':
        collectionName = 'service_inquiries';
        break;
      case 'Consultation':
        collectionName = 'consultation_leads';
        break;
      case 'Newsletter Subscription':
        collectionName = 'newsletter_subscriptions';
        break;
      default:
        collectionName = 'contact_messages';
    }

    // Insert lead data
    const result = await db.collection(collectionName).insertOne(leadData);
    
    await client.close();

    // Success response - don't expose internal details
    res.status(200).json({
      message: 'Thank you for your inquiry. We will contact you soon.',
      id: leadData.id,
      timestamp: leadData.timestamp,
      leadType: leadData.leadType
    });

  } catch (error) {
    console.error('Contact API Error:', error);
    
    // Don't expose internal error details to client
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    });
  }
}