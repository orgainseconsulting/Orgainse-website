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
    const { email, first_name, leadType, name, source } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // MongoDB connection
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'orgainse-consulting');

    // Check existing subscription
    const existing = await db.collection('newsletter_subscriptions').findOne({ email });
    if (existing) {
      await client.close();
      return res.status(409).json({ error: 'Email already subscribed' });
    }

    // Create subscription
    const subscription = {
      id: Date.now().toString(),
      email,
      first_name: first_name || name || '',
      leadType: leadType || 'Newsletter Subscription',
      source: source || 'Website',
      subscribed_at: new Date(),
      status: 'active',
      timestamp: new Date().toISOString()
    };

    await db.collection('newsletter_subscriptions').insertOne(subscription);
    await client.close();

    res.status(200).json({
      message: 'Successfully subscribed to newsletter',
      subscription_id: subscription.id,
      id: subscription.id,
      email: subscription.email,
      timestamp: subscription.timestamp,
      status: subscription.status
    });

  } catch (error) {
    console.error('Newsletter error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}