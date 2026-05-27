/**
 * POST /api/ai-assessment
 *
 * Mirrors backend/routers/forms.py::ai_assessment.
 *
 * Frontend (frontend/src/pages/AIAssessmentTool.js) submits:
 *   { name, email, company?, phone?, industry?, company_size?,
 *     responses: [{ question_id, answer, score }, ...] }
 *
 * Scoring: average response.score (1-10) × 10  =>  0-100 maturity score.
 */
import { MongoClient } from 'mongodb';
import {
  securityHeaders,
  rateLimit,
  sanitizeInput,
  validateEmail,
  validateRequestSize,
} from '../_middleware/security.js';

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let cachedClient = null;
let cachedDb = null;
async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const db = client.db(process.env.DB_NAME || 'orgainse-consulting');
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

function calculateMaturityScore(responses) {
  if (!Array.isArray(responses) || responses.length === 0) return 0;
  const total = responses.reduce((acc, r) => acc + (Number(r?.score) || 0), 0);
  const avg = total / responses.length;
  return Math.round(avg * 10);
}

function scoreLabel(score) {
  if (score >= 80) return 'AI Advanced';
  if (score >= 60) return 'AI Ready';
  if (score >= 40) return 'AI Developing';
  return 'AI Beginner';
}

function generateRecommendations(score) {
  if (score < 25) {
    return [
      { title: 'AI Foundation Building', description: 'Start with basic AI tools and team training to build fundamental AI capabilities', priority: 'High', timeline: '3-6 months', category: 'Foundation' },
      { title: 'Data Infrastructure Setup', description: 'Implement proper data collection and management systems as the foundation for AI', priority: 'High', timeline: '2-4 months', category: 'Infrastructure' },
    ];
  }
  if (score < 50) {
    return [
      { title: 'Process Automation Implementation', description: 'Implement AI-powered workflow automation to improve efficiency', priority: 'High', timeline: '6-12 months', category: 'Automation' },
      { title: 'Team AI Training Program', description: 'Comprehensive AI training for your team to maximize adoption', priority: 'Medium', timeline: '3-6 months', category: 'Training' },
    ];
  }
  if (score < 75) {
    return [
      { title: 'Advanced AI Integration', description: 'Implement sophisticated AI solutions for predictive analytics and decision support', priority: 'High', timeline: '6-18 months', category: 'Advanced AI' },
      { title: 'AI Governance Framework', description: 'Establish proper AI governance and ethics guidelines for responsible AI use', priority: 'Medium', timeline: '3-6 months', category: 'Governance' },
    ];
  }
  return [
    { title: 'AI Innovation Leadership', description: 'Lead industry innovation with cutting-edge AI research and development', priority: 'Strategic', timeline: '12+ months', category: 'Innovation' },
    { title: 'AI Center of Excellence', description: 'Establish an AI Center of Excellence to drive organization-wide AI initiatives', priority: 'Medium', timeline: '6-12 months', category: 'Strategic' },
  ];
}

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!rateLimit(req, res, { max: 50, windowMs: 15 * 60 * 1000 })) return;
    if (!validateRequestSize(req, res, 10 * 1024)) return;

    const { db } = await connectToDatabase();
    const data = sanitizeInput(req.body || {});
    const { name, email, company = '', phone = '', industry = '', company_size = '', responses } = data;

    if (!name || !email) {
      return res.status(400).json({ error: 'Validation failed', message: 'Name and email are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ error: 'Validation failed', message: 'Assessment responses are required' });
    }

    const score = calculateMaturityScore(responses);
    const recs = generateRecommendations(score);

    const doc = {
      assessment_id: generateId(),
      user_info: {
        name,
        email: String(email).toLowerCase(),
        company,
        phone,
        industry,
        company_size,
      },
      responses,
      maturity_score: score,
      score_label: scoreLabel(score),
      recommendations: recs,
      leadType: 'AI Assessment',
      source: req.headers?.referer || 'Direct',
      submitted_at: new Date().toISOString(),
      ip_address: req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown',
    };

    await db.collection('ai_assessment_leads').insertOne(doc);

    return res.status(200).json({
      success: true,
      assessment_id: doc.assessment_id,
      maturity_score: score,
      score_label: doc.score_label,
      recommendations: recs,
      message: 'AI assessment completed successfully',
      timestamp: doc.submitted_at,
    });
  } catch (error) {
    console.error('AI Assessment API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: 'Failed to process AI assessment. Please try again.' });
  }
}
