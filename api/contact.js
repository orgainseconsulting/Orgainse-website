import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message, company, phone, service_type, leadType, source } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message required' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // MongoDB connection
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'orgainse-consulting');

    // Create contact message
    const contactMessage = {
      id: Date.now().toString(),
      name,
      email,
      company: company || '',
      phone: phone || '',
      service_type: service_type || '',
      leadType: leadType || 'Contact Inquiry',
      source: source || 'Website',
      message,
      submitted_at: new Date(),
      status: 'new',
      timestamp: new Date().toISOString()
    };

    // Determine collection based on lead type for separate tracking
    let collectionName = 'contact_messages'; // Default for general contact inquiries
    
    if (leadType === 'AI Assessment') {
      collectionName = 'ai_assessment_leads';
    } else if (leadType === 'ROI Calculator') {
      collectionName = 'roi_calculator_leads';
    } else if (leadType === 'Consultation') {
      collectionName = 'consultation_leads';
    } else if (leadType === 'Service Inquiry') {
      collectionName = 'service_inquiries'; // All 6 services go here
    } else if (leadType === 'Contact Form') {
      collectionName = 'contact_messages'; // General contact form
    } else {
      // Handle any other specific service types as service inquiries
      if (service_type && (
        service_type.includes('AI Strategy') ||
        service_type.includes('Digital Transformation') ||
        service_type.includes('Data Analytics') ||
        service_type.includes('Process Optimization') ||
        service_type.includes('Tech Integration') ||
        service_type.includes('Training')
      )) {
        collectionName = 'service_inquiries';
      }
    }

    await db.collection(collectionName).insertOne(contactMessage);
    await client.close();

    res.status(200).json({
      message: 'Message sent successfully',
      contact_id: contactMessage.id,
      id: contactMessage.id,
      timestamp: contactMessage.timestamp,
      status: contactMessage.status
    });

  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}