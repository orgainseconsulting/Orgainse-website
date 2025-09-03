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
    let collectionName = 'contact_messages'; // Default
    
    if (leadType === 'AI Strategy & Automation') {
      collectionName = 'ai_strategy_leads';
    } else if (leadType === 'Digital Transformation') {
      collectionName = 'digital_transformation_leads';
    } else if (leadType === 'Data Analytics & Business Intelligence') {
      collectionName = 'data_analytics_leads';
    } else if (leadType === 'Process Optimization') {
      collectionName = 'process_optimization_leads';
    } else if (leadType === 'Tech Integration & Support') {
      collectionName = 'tech_integration_leads';
    } else if (leadType === 'Training & Change Management') {
      collectionName = 'training_change_leads';
    } else if (leadType === 'Service Inquiry') {
      // Check service_type for more specific collection
      if (service_type) {
        if (service_type.includes('AI Strategy')) collectionName = 'ai_strategy_leads';
        else if (service_type.includes('Digital Transformation')) collectionName = 'digital_transformation_leads';
        else if (service_type.includes('Data Analytics')) collectionName = 'data_analytics_leads';
        else if (service_type.includes('Process Optimization')) collectionName = 'process_optimization_leads';
        else if (service_type.includes('Tech Integration')) collectionName = 'tech_integration_leads';
        else if (service_type.includes('Training')) collectionName = 'training_change_leads';
        else collectionName = 'general_service_inquiries';
      } else {
        collectionName = 'general_service_inquiries';
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