/**
 * POST /api/roi-calculator
 *
 * Mirrors backend/routers/forms.py::roi_calculator.
 *
 * Frontend (frontend/src/pages/ROICalculator.js) submits:
 *   { company_name, email, phone?, industry?, company_size,
 *     current_project_cost (number, > 0),
 *     project_duration_months (int 1-60),
 *     current_efficiency_rating (int 1-10),
 *     desired_services: string[], user_region }
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

const REGION_CONFIG = {
  US: { pppMultiplier: 1.0, currency: 'USD', symbol: '$' },
  IN: { pppMultiplier: 5.5, currency: 'INR', symbol: '₹' },
  GB: { pppMultiplier: 0.85, currency: 'GBP', symbol: '£' },
  AE: { pppMultiplier: 0.75, currency: 'AED', symbol: 'AED' },
  AU: { pppMultiplier: 0.90, currency: 'AUD', symbol: 'A$' },
  NZ: { pppMultiplier: 0.85, currency: 'NZD', symbol: 'NZ$' },
  ZA: { pppMultiplier: 0.35, currency: 'ZAR', symbol: 'R' },
  EU: { pppMultiplier: 0.90, currency: 'EUR', symbol: '€' },
};

function baseCostFromSize(size) {
  const map = { '1-10': 15000, '11-50': 25000, '51-200': 45000, '201-500': 75000, '500+': 120000, '200+': 75000 };
  return map[size] || 25000;
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
    const {
      company_name,
      email,
      phone = '',
      industry = '',
      company_size = '11-50',
      current_project_cost,
      project_duration_months,
      current_efficiency_rating,
      desired_services = [],
      user_region = 'US',
    } = data;

    if (!company_name || !email) {
      return res.status(400).json({ error: 'Validation failed', message: 'Company name and email are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const projectCost = parseFloat(current_project_cost);
    const duration = parseInt(project_duration_months, 10);
    const efficiency = parseInt(current_efficiency_rating, 10);

    if (!(projectCost > 0)) {
      return res.status(400).json({ error: 'Validation failed', message: 'current_project_cost must be greater than 0' });
    }
    if (!(duration >= 1 && duration <= 60)) {
      return res.status(400).json({ error: 'Validation failed', message: 'project_duration_months must be 1-60' });
    }
    if (!(efficiency >= 1 && efficiency <= 10)) {
      return res.status(400).json({ error: 'Validation failed', message: 'current_efficiency_rating must be 1-10' });
    }

    const region = REGION_CONFIG[user_region] || REGION_CONFIG.US;
    const efficiencyGainPct = (10 - efficiency) * 5 + 25;
    const costReductionPct = (10 - efficiency) * 3 + 20;
    const revenueBoostPct = 15;

    const annualizedCost = projectCost * (12 / Math.max(duration, 1));
    const annualSavings = annualizedCost * (costReductionPct / 100);
    const revenueIncrease = annualizedCost * (revenueBoostPct / 100);
    const totalAnnualBenefit = annualSavings + revenueIncrease;
    const implementationCost = baseCostFromSize(company_size) * region.pppMultiplier;
    const roiPct = ((totalAnnualBenefit - implementationCost) / Math.max(implementationCost, 1)) * 100;
    const paybackMonths = Math.max(1, Math.round(implementationCost / Math.max(totalAnnualBenefit / 12, 1)));

    const servicesList = Array.isArray(desired_services) && desired_services.length > 0
      ? desired_services
      : ['AI Project Management', 'Digital Transformation'];

    const recommendedServices = servicesList.map((s) => ({
      name: s,
      duration: '3-6 months',
      description: `Tailored ${String(s).toLowerCase()} solution`,
      price: implementationCost / Math.max(servicesList.length, 1),
    }));

    const metrics = {
      potential_savings: Math.round(totalAnnualBenefit),
      roi_percentage: Math.round(roiPct),
      payback_period_months: paybackMonths,
      estimated_project_cost: Math.round(implementationCost),
      monthly_savings: Math.round(totalAnnualBenefit / 12),
      regional_currency: region.currency,
      currency_symbol: region.symbol,
      efficiency_gain_percent: Math.round(efficiencyGainPct),
      cost_reduction_percent: Math.round(costReductionPct),
      revenue_boost_percent: revenueBoostPct,
      recommended_services: recommendedServices,
    };

    const doc = {
      calculation_id: generateId(),
      business_inputs: {
        company_name,
        email: String(email).toLowerCase(),
        phone,
        industry,
        company_size,
        current_project_cost: projectCost,
        project_duration_months: duration,
        current_efficiency_rating: efficiency,
        desired_services: servicesList,
        user_region,
      },
      calculated_metrics: metrics,
      leadType: 'ROI Calculator',
      source: req.headers?.referer || 'Direct',
      submitted_at: new Date().toISOString(),
      ip_address: req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown',
    };

    await db.collection('roi_calculator_leads').insertOne(doc);

    return res.status(200).json({
      success: true,
      calculation_id: doc.calculation_id,
      company_name,
      ...metrics,
      message: 'ROI calculation completed successfully',
      timestamp: doc.submitted_at,
    });
  } catch (error) {
    console.error('ROI Calculator API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: 'Failed to process ROI calculation. Please try again.' });
  }
}
