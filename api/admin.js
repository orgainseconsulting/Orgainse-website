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

    // Get contact messages (general contact form)
    const contactMessages = await db.collection('contact_messages')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    // Get AI Assessment leads
    const aiAssessmentLeads = await db.collection('ai_assessment_leads')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    // Get ROI Calculator leads
    const roiCalculatorLeads = await db.collection('roi_calculator_leads')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    // Get Service Inquiries (all 6 services combined)
    const serviceInquiries = await db.collection('service_inquiries')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    // Get Consultation leads
    const consultationLeads = await db.collection('consultation_leads')
      .find({})
      .sort({ submitted_at: -1 })
      .toArray();

    await client.close();

    const totalContacts = contactMessages.length + aiAssessmentLeads.length + roiCalculatorLeads.length + serviceInquiries.length + consultationLeads.length;

    const summary = {
      total_newsletters: newsletters.length,
      total_contacts: totalContacts,
      total_leads: newsletters.length + totalContacts,
      breakdown: {
        newsletters: newsletters.length,
        contact_messages: contactMessages.length,
        ai_assessments: aiAssessmentLeads.length,
        roi_calculators: roiCalculatorLeads.length,
        service_inquiries: serviceInquiries.length,
        consultations: consultationLeads.length
      },
      last_updated: new Date().toISOString()
    };

    res.status(200).json({
      summary,
      data: {
        newsletters,
        contact_messages: contactMessages,
        ai_assessment_leads: aiAssessmentLeads,
        roi_calculator_leads: roiCalculatorLeads,
        service_inquiries: serviceInquiries,
        consultation_leads: consultationLeads
      },
      success: true
    });

  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}