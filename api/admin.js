import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // MongoDB connection
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'orgainse-consulting');

    // Get all newsletter subscriptions
    const newsletters = await db.collection('newsletter_subscriptions')
      .find({})
      .sort({ subscribed_at: -1 })
      .toArray();

    // Get all contact messages
    const contacts = await db.collection('contact_messages')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    await client.close();

    const summary = {
      total_newsletters: newsletters.length,
      total_contacts: contacts.length,
      total_leads: newsletters.length + contacts.length,
      last_updated: new Date().toISOString()
    };

    res.status(200).json({
      summary,
      newsletters,
      contacts,
      success: true
    });

  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}