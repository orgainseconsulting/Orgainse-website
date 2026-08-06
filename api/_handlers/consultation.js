import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { securityHeaders, rateLimit, sanitizeInput, validateEmail, validateRequestSize } from '../_middleware/security.js';

// MongoDB connection
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  
  const db = client.db(process.env.DB_NAME || 'orgainse-consulting');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (basic international format)
function isValidPhone(phone) {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Generate consultation confirmation message
function generateConfirmationMessage(consultationType, preferredDate) {
  const messages = {
    'AI Readiness Assessment': 'We will review your current execution visibility, governance and data readiness, and share a directional view of gaps and priorities.',
    'Digital Transformation Planning': 'We will map your current workflow, ownership and decision points, and outline a scoped next step.',
    'Project Management Optimization': 'We will review your current project leadership, reporting cadence and risk practice, and identify the practical gaps.',
    'Custom AI Solution Discussion': 'We will discuss where assistive automation removes a specific manual step in your workflow, and where it does not belong.',
    'General Business Consultation': 'We will discuss the execution problem you are dealing with and whether Orgainse is the right fit for it.'
  };
  
  const baseMessage = messages[consultationType] || 'We will discuss the execution problem you are dealing with and the most practical next step.';
  
  return `Thank you for booking a discovery call! ${baseMessage} We will contact you within one business day to confirm your preferred time slot${preferredDate ? ` on ${preferredDate}` : ''}.`;
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
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported for consultation booking'
    });
  }
  
  try {
    // Apply rate limiting
    if (!rateLimit(req, res, { max: 30, windowMs: 15 * 60 * 1000 })) {
      return; // Rate limit exceeded
    }

    // Validate request size
    if (!validateRequestSize(req, res, 10 * 1024)) { // 10KB limit
      return;
    }

    const { db } = await connectToDatabase();
    
    // Sanitize input data
    const sanitizedBody = sanitizeInput(req.body);
    const { 
      full_name,
      email,
      company,
      phone,
      consultation_type,
      preferred_date,
      preferred_time,
      requirements,
      industry
    } = sanitizedBody;
    
    // Validation
    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Full name is required and must be at least 2 characters'
      });
    }
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Valid email address is required'
      });
    }
    
    if (!company || company.trim().length < 2) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Company name is required'
      });
    }
    
    if (!consultation_type) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Consultation type is required'
      });
    }
    
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please provide a valid phone number'
      });
    }
    
    // Prepare consultation data
    const consultationData = {
      consultation_id: uuidv4(),
      consultation_details: {
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        company: company.trim(),
        phone: phone ? phone.trim() : null,
        consultation_type,
        industry: industry || null,
        requirements: requirements ? requirements.trim() : null
      },
      preferred_datetime: preferred_date && preferred_time ? 
        `${preferred_date}T${preferred_time}:00.000Z` : null,
      preferred_date: preferred_date || null,
      preferred_time: preferred_time || null,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      leadType: "Consultation Request",
      source: "smart_calendar"
    };
    
    // Check for duplicate consultation requests (same email within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const existingConsultation = await db.collection('consultation_leads').findOne({
      'consultation_details.email': email.toLowerCase().trim(),
      'submitted_at': { $gte: twentyFourHoursAgo }
    });
    
    if (existingConsultation) {
      return res.status(409).json({
        error: 'Duplicate request', 
        message: 'You have already submitted a discovery call request recently. We will contact you soon.'
      });
    }
    
    // Insert into MongoDB
    const result = await db.collection('consultation_leads').insertOne(consultationData);
    
    // Generate confirmation message
    const confirmationMessage = generateConfirmationMessage(consultation_type, preferred_date);
    
    // Return response
    return res.status(200).json({
      success: true,
      consultation_id: consultationData.consultation_id,
      message: confirmationMessage,
      details: {
        consultation_type,
        preferred_date,
        preferred_time,
        status: 'pending'
      },
      timestamp: consultationData.submitted_at,
      next_steps: [
        "We will review your consultation request",
        "Our team will contact you within one business day", 
        "We will confirm your preferred time slot",
        "You will receive a calendar invitation with meeting details"
      ]
    });
    
  } catch (error) {
    console.error('Consultation API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process consultation request. Please try again.'
    });
  }
}