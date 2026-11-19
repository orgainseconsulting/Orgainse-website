import { Resend } from 'resend';
import { MongoClient } from 'mongodb';
import { securityHeaders, rateLimit, sanitizeInput, validateEmail, validateRequestSize } from '../_middleware/security.js';

// Email alert for ORQYNE guided-pilot requests. Never blocks the saved lead.
async function notifyPilot(db, lead) {
  try {
    const settings = await db.collection('app_settings').findOne({ _id: 'global' });
    const key = (settings?.resend_api_key && settings.resend_api_key.trim()) || process.env.RESEND_API_KEY;
    if (!key) return;
    const senderEmail = settings?.sender_email || process.env.SENDER_EMAIL || 'info@orgainse.com';
    const senderName = settings?.sender_name || process.env.SENDER_NAME || 'Orgainse';
    const esc = (v) => String(v || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const rows = [['Name', lead.name], ['Work email', lead.email], ['Organisation', lead.company], ['Team size', lead.team_size], ['Operating experience', lead.operating_experience], ['Pilot scope', lead.message]];
    const { error } = await new Resend(key).emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: ['support@orgainse.com', 'info@orgainse.com'],
      replyTo: lead.email,
      subject: `ORQYNE Pilot request — ${lead.company || lead.name}`,
      html: `<h2 style="font-family:Arial">New ORQYNE guided-pilot request</h2><table style="font-family:Arial;font-size:14px">${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('')}</table>`,
      text: rows.map(([k, v]) => `${k}: ${v || ''}`).join('\n'),
    });
    if (error) console.error('ORQYNE pilot email error:', error);
  } catch (e) {
    console.error('ORQYNE pilot email failed:', e?.message);
  }
}

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
    const { name, email, company, phone, service_type, message, leadType, team_size, operating_experience } = sanitizedBody;

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
      team_size: String(team_size || '').slice(0, 20),
      operating_experience: String(operating_experience || '').slice(0, 60),
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
      case 'orqyne_pilot':
      case 'ORQYNE Guided Pilot':
        collectionName = 'orqyne_pilot_leads';
        break;
      case 'Newsletter Subscription':
        collectionName = 'newsletter_subscriptions';
        break;
      default:
        collectionName = 'contact_messages';
    }

    // Insert lead data
    const result = await db.collection(collectionName).insertOne(leadData);

    if (collectionName === 'orqyne_pilot_leads') await notifyPilot(db, leadData);
    
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