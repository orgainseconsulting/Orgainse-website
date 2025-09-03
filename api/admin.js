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

    // Get all contact messages from different collections
    const contactMessages = await db.collection('contact_messages')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    // Get service-specific leads
    const aiStrategyLeads = await db.collection('ai_strategy_leads')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    const digitalTransformationLeads = await db.collection('digital_transformation_leads')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    const dataAnalyticsLeads = await db.collection('data_analytics_leads')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    const processOptimizationLeads = await db.collection('process_optimization_leads')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    const techIntegrationLeads = await db.collection('tech_integration_leads')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    const trainingChangeLeads = await db.collection('training_change_leads')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    const generalServiceInquiries = await db.collection('general_service_inquiries')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    // Combine all contacts
    const allContacts = [
      ...contactMessages,
      ...aiStrategyLeads,
      ...digitalTransformationLeads,
      ...dataAnalyticsLeads,
      ...processOptimizationLeads,
      ...techIntegrationLeads,
      ...trainingChangeLeads,
      ...generalServiceInquiries
    ].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

    await client.close();

    const summary = {
      total_newsletters: newsletters.length,
      total_contacts: allContacts.length,
      total_leads: newsletters.length + allContacts.length,
      service_breakdown: {
        ai_strategy: aiStrategyLeads.length,
        digital_transformation: digitalTransformationLeads.length,
        data_analytics: dataAnalyticsLeads.length,
        process_optimization: processOptimizationLeads.length,
        tech_integration: techIntegrationLeads.length,
        training_change: trainingChangeLeads.length,
        general_inquiries: generalServiceInquiries.length,
        general_contacts: contactMessages.length
      },
      last_updated: new Date().toISOString()
    };

    res.status(200).json({
      summary,
      newsletters,
      contacts: allContacts,
      service_specific: {
        ai_strategy_leads: aiStrategyLeads,
        digital_transformation_leads: digitalTransformationLeads,
        data_analytics_leads: dataAnalyticsLeads,
        process_optimization_leads: processOptimizationLeads,
        tech_integration_leads: techIntegrationLeads,
        training_change_leads: trainingChangeLeads,
        general_service_inquiries: generalServiceInquiries,
        general_contacts: contactMessages
      },
      success: true
    });

  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}