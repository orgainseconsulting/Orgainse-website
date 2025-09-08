const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// MongoDB connection
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  
  const db = client.db(process.env.DB_NAME || 'orgainse-consulting');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

// Regional pricing configuration
const REGION_CONFIG = {
  US: { pppMultiplier: 1.0, currency: 'USD', symbol: '$' },
  IN: { pppMultiplier: 5.5, currency: 'INR', symbol: '₹' },
  GB: { pppMultiplier: 0.85, currency: 'GBP', symbol: '£' },
  AE: { pppMultiplier: 0.75, currency: 'AED', symbol: 'AED' },
  AU: { pppMultiplier: 0.90, currency: 'AUD', symbol: 'A$' },
  NZ: { pppMultiplier: 0.85, currency: 'NZD', symbol: 'NZ$' },
  ZA: { pppMultiplier: 0.35, currency: 'ZAR', symbol: 'R' }
};

// Calculate employee count from range
function getEmployeeCountFromRange(range) {
  const ranges = {
    '1-10': 5,
    '11-50': 30,
    '51-200': 125,
    '201-500': 350,
    '500+': 750
  };
  return ranges[range] || 100;
}

// Calculate base implementation cost based on company size
function calculateBaseCost(employeeCount, timeline) {
  let baseCost = 25000; // Base cost in USD
  
  // Scale by employee count
  if (employeeCount <= 10) {
    baseCost = 15000;
  } else if (employeeCount <= 50) {
    baseCost = 25000;
  } else if (employeeCount <= 200) {
    baseCost = 45000;
  } else if (employeeCount <= 500) {
    baseCost = 75000;
  } else {
    baseCost = 120000;
  }
  
  // Adjust by timeline (faster = more expensive)
  const timelineMultipliers = {
    '1-3 months': 1.3,
    '3-6 months': 1.0,
    '6-12 months': 0.85,
    '12+ months': 0.75
  };
  
  const multiplier = timelineMultipliers[timeline] || 1.0;
  return baseCost * multiplier;
}

// Calculate ROI metrics
function calculateROI(inputs, userRegion = 'US') {
  // Parse inputs
  const annualRevenue = parseFloat(inputs.annual_revenue) || 0;
  const currentPMCosts = (parseFloat(inputs.current_pm_costs) || 0) * 12; // Annual
  const employeeCount = getEmployeeCountFromRange(inputs.employee_count || '11-50');
  
  // AI implementation benefits (based on industry research)
  const efficiencyGain = 0.25; // 25% faster delivery
  const costReduction = 0.45; // 45% cost reduction in operations
  const revenueBoost = 0.15; // 15% revenue increase from faster delivery
  
  // Calculate savings
  const operationalSavings = currentPMCosts * costReduction;
  const revenueIncrease = annualRevenue * revenueBoost;
  const totalAnnualBenefit = operationalSavings + revenueIncrease;
  
  // Calculate implementation costs (region-adjusted)
  const baseCost = calculateBaseCost(employeeCount, inputs.implementation_timeline);
  const regionalConfig = REGION_CONFIG[userRegion] || REGION_CONFIG.US;
  const regionalCost = baseCost * regionalConfig.pppMultiplier;
  
  // ROI calculations
  const roi = totalAnnualBenefit > 0 ? ((totalAnnualBenefit - regionalCost) / regionalCost) * 100 : 0;
  const paybackPeriod = totalAnnualBenefit > 0 ? Math.ceil(regionalCost / (totalAnnualBenefit / 12)) : 0;
  
  return {
    potential_savings: Math.round(totalAnnualBenefit),
    roi_percentage: Math.round(roi),
    payback_period: Math.max(1, paybackPeriod), // Minimum 1 month
    implementation_cost: Math.round(regionalCost),
    monthly_savings: Math.round(totalAnnualBenefit / 12),
    regional_currency: regionalConfig.currency,
    currency_symbol: regionalConfig.symbol,
    efficiency_gain_percent: Math.round(efficiencyGain * 100),
    cost_reduction_percent: Math.round(costReduction * 100),
    revenue_boost_percent: Math.round(revenueBoost * 100)
  };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported for ROI calculations'
    });
  }
  
  try {
    const { db } = await connectToDatabase();
    
    // Validate required fields
    const { 
      company_name, 
      email, 
      annual_revenue, 
      employee_count, 
      current_pm_costs,
      tech_budget,
      implementation_timeline,
      user_region = 'US'
    } = req.body;
    
    if (!company_name || !email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Company name and email are required'
      });
    }
    
    if (!annual_revenue || !current_pm_costs) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Annual revenue and current PM costs are required for ROI calculation'
      });
    }
    
    // Calculate ROI metrics
    const calculatedMetrics = calculateROI(req.body, user_region);
    
    // Prepare ROI calculation data
    const roiData = {
      calculation_id: uuidv4(),
      business_inputs: {
        company_name,
        email,
        annual_revenue: parseFloat(annual_revenue),
        employee_count,
        current_pm_costs: parseFloat(current_pm_costs),
        tech_budget: parseFloat(tech_budget) || null,
        implementation_timeline,
        user_region
      },
      calculated_metrics: calculatedMetrics,
      submitted_at: new Date().toISOString(),
      leadType: "ROI Calculator",
      source: "roi_calculator_tool"
    };
    
    // Insert into MongoDB
    const result = await db.collection('roi_calculator_leads').insertOne(roiData);
    
    // Return response
    return res.status(200).json({
      success: true,
      calculation_id: roiData.calculation_id,
      company_name: company_name,
      potential_savings: calculatedMetrics.potential_savings,
      roi_percentage: calculatedMetrics.roi_percentage,
      payback_period: calculatedMetrics.payback_period,
      implementation_cost: calculatedMetrics.implementation_cost,
      monthly_savings: calculatedMetrics.monthly_savings,
      currency: calculatedMetrics.regional_currency,
      currency_symbol: calculatedMetrics.currency_symbol,
      message: "ROI calculation completed successfully",
      timestamp: roiData.submitted_at,
      detailed_metrics: {
        efficiency_gain: `${calculatedMetrics.efficiency_gain_percent}%`,
        cost_reduction: `${calculatedMetrics.cost_reduction_percent}%`,
        revenue_boost: `${calculatedMetrics.revenue_boost_percent}%`
      }
    });
    
  } catch (error) {
    console.error('ROI Calculator API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process ROI calculation. Please try again.'
    });
  }
}