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
  if (score >= 80) return 'Governed Execution';
  if (score >= 60) return 'Structured Execution';
  if (score >= 40) return 'Developing Visibility';
  return 'Reactive Execution';
}

function generateRecommendations(score) {
  if (score < 25) {
    return [
      { title: 'Establish a single delivery view', description: 'Consolidate work into one shared view so status stops being reconstructed manually before each review', priority: 'High', timeline: '1-3 months', category: 'Visibility' },
      { title: 'Define ownership and cadence', description: 'Name owners for projects, risks and decisions, and agree a reporting cadence leadership will actually use', priority: 'High', timeline: '1-2 months', category: 'Governance' },
    ];
  }
  if (score < 50) {
    return [
      { title: 'Stand up risk and action registers', description: 'Track risks, actions and dependencies against named owners so issues surface before they affect commitments', priority: 'High', timeline: '2-4 months', category: 'Governance' },
      { title: 'Remove manual reporting steps', description: 'Generate reporting from the working data instead of assembling it by hand each week', priority: 'Medium', timeline: '2-4 months', category: 'Reporting' },
    ];
  }
  if (score < 75) {
    return [
      { title: 'Portfolio-level delivery health', description: 'Roll project data up to a portfolio view so capacity, forecast and delivery health are visible in one place', priority: 'High', timeline: '3-6 months', category: 'Portfolio' },
      { title: 'Assistive automation with human review', description: 'Apply retrieval-based assistance to summaries and drafting where it removes a specific manual step, with review before anything is relied on', priority: 'Medium', timeline: '3-6 months', category: 'Automation' },
    ];
  }
  return [
    { title: 'Make governance a repeatable standard', description: 'Document the operating rhythm so new projects and teams inherit it without a rebuild', priority: 'Strategic', timeline: '6-12 months', category: 'Operating Model' },
    { title: 'Decision quality and forecast reliability', description: 'Review decision turnaround and forecast accuracy as standing measures of delivery health', priority: 'Medium', timeline: '6-12 months', category: 'Continuous Improvement' },
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
