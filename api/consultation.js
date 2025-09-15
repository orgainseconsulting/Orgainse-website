import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { securityHeaders, rateLimit, sanitizeInput, validateEmail, validateRequestSize } from './middleware/security.js';

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
    'AI Readiness Assessment': 'We will conduct a comprehensive AI readiness assessment for your organization.',
    'Digital Transformation Planning': 'We will help you create a strategic digital transformation roadmap.',
    'Project Management Optimization': 'We will analyze and optimize your current project management processes.',
    'Custom AI Solution Discussion': 'We will discuss custom AI solutions tailored to your specific needs.',
    'General Business Consultation': 'We will provide general business consultation and strategic guidance.'
  };
  
  const baseMessage = messages[consultationType] || 'We will provide expert consultation tailored to your needs.';
  
  return `Thank you for booking a consultation! ${baseMessage} We will contact you within 24 hours to confirm your preferred time slot${preferredDate ? ` on ${preferredDate}` : ''}.`;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported for consultation booking'
    });
  }
  
  try {
    const { db } = await connectToDatabase();
    
    // Extract and validate required fields
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
    } = req.body;
    
    // Validation
    if (!full_name || full_name.trim().length < 2) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Full name is required and must be at least 2 characters'
      });
    }
    
    if (!email || !isValidEmail(email)) {
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
        message: 'You have already submitted a consultation request in the last 24 hours. We will contact you soon.'
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
        "Our team will contact you within 24 hours", 
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