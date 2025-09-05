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
    // Apply rate limiting - slightly more permissive for newsletter
    if (!rateLimit(req, res, { max: 100, windowMs: 15 * 60 * 1000 })) {
      return; // Rate limit exceeded
    }

    // Validate request size
    if (!validateRequestSize(req, res, 5 * 1024)) { // 5KB limit for newsletter
      return;
    }

    // Sanitize input data
    const sanitizedBody = sanitizeInput(req.body);
    const { email, first_name, name } = sanitizedBody;

    // Enhanced validation
    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required',
        required: ['email']
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Field length validation
    if ((first_name && first_name.length > 50) || (name && name.length > 100)) {
      return res.status(400).json({ 
        error: 'Name field length exceeded limits' 
      });
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    
    const db = client.db(process.env.DB_NAME || 'orgainse-consulting');
    
    // Check if email already exists
    const existingSubscription = await db.collection('newsletter_subscriptions')
      .findOne({ email: email.toLowerCase() });

    if (existingSubscription) {
      await client.close();
      return res.status(200).json({
        message: 'You are already subscribed to our newsletter!',
        status: 'already_subscribed'
      });
    }

    // Generate secure ID
    const subscriptionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Create subscription data with enhanced security
    const subscriptionData = {
      id: subscriptionId,
      email: email.toLowerCase(), // Normalize email
      first_name: first_name || '',
      name: name || first_name || '',
      leadType: 'Newsletter Subscription',
      source: req.headers.referer || 'Direct',
      subscribed_at: new Date().toISOString(),
      ip_address: req.headers['x-forwarded-for']?.split(',')[0] || 'unknown', // For analytics only
      user_agent: req.headers['user-agent'] || 'unknown',
      status: 'active',
      timestamp: new Date().toISOString(),
      confirmed: false // For future email confirmation feature
    };

    // Insert subscription
    await db.collection('newsletter_subscriptions').insertOne(subscriptionData);
    
    await client.close();

    // Success response
    res.status(200).json({
      message: 'Successfully subscribed to newsletter!',
      subscription_id: subscriptionData.id,
      email: subscriptionData.email,
      timestamp: subscriptionData.timestamp,
      status: subscriptionData.status
    });

  } catch (error) {
    console.error('Newsletter API Error:', error);
    
    // Don't expose internal error details
    res.status(500).json({ 
      error: 'Internal server error. Please try again later.' 
    });
  }
}