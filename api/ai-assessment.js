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

// Calculate AI maturity score based on responses
function calculateMaturityScore(responses) {
  let totalScore = 0;
  let questionCount = 0;
  
  // Technology infrastructure (0-100)
  if (responses.tech_infrastructure) {
    totalScore += responses.tech_infrastructure * 20; // Scale 1-5 to 0-100
    questionCount++;
  }
  
  // AI tools usage (0-100)  
  if (responses.ai_tools_usage) {
    const aiToolsScore = {
      'None': 0,
      'Basic tools': 25,
      'Advanced AI': 75,
      'Custom AI solutions': 100
    };
    totalScore += aiToolsScore[responses.ai_tools_usage] || 0;
    questionCount++;
  }
  
  // Data management (0-100)
  if (responses.data_management) {
    const dataScore = {
      'Spreadsheets': 10,
      'Basic databases': 30,
      'Advanced analytics': 70,
      'AI-driven insights': 100
    };
    totalScore += dataScore[responses.data_management] || 0;
    questionCount++;
  }
  
  // Team AI readiness (0-100)
  if (responses.team_readiness) {
    totalScore += responses.team_readiness * 20; // Scale 1-5 to 0-100
    questionCount++;
  }
  
  // Process automation (0-100)
  if (responses.process_automation) {
    totalScore += responses.process_automation * 20; // Scale 1-5 to 0-100
    questionCount++;
  }
  
  // AI strategy (0-100)
  if (responses.ai_strategy === 'yes') {
    totalScore += 100;
  } else if (responses.ai_strategy === 'no') {
    totalScore += 0;
  }
  questionCount++;
  
  return questionCount > 0 ? Math.round(totalScore / questionCount) : 0;
}

// Generate recommendations based on maturity score
function generateRecommendations(score, userInfo) {
  const recommendations = [];
  
  if (score < 25) {
    recommendations.push({
      title: "AI Foundation Building",
      description: "Start with basic AI tools and team training to build fundamental AI capabilities",
      priority: "High",
      timeline: "3-6 months",
      category: "Foundation"
    });
    recommendations.push({
      title: "Data Infrastructure Setup",
      description: "Implement proper data collection and management systems as the foundation for AI",
      priority: "High", 
      timeline: "2-4 months",
      category: "Infrastructure"
    });
  } else if (score >= 25 && score < 50) {
    recommendations.push({
      title: "Process Automation Implementation",
      description: "Implement AI-powered workflow automation to improve efficiency",
      priority: "High",
      timeline: "6-12 months", 
      category: "Automation"
    });
    recommendations.push({
      title: "Team AI Training Program",
      description: "Comprehensive AI training for your team to maximize adoption",
      priority: "Medium",
      timeline: "3-6 months",
      category: "Training"
    });
  } else if (score >= 50 && score < 75) {
    recommendations.push({
      title: "Advanced AI Integration",
      description: "Implement sophisticated AI solutions for predictive analytics and decision support",
      priority: "High",
      timeline: "6-18 months",
      category: "Advanced AI"
    });
    recommendations.push({
      title: "AI Governance Framework",
      description: "Establish proper AI governance and ethics guidelines for responsible AI use",
      priority: "Medium",
      timeline: "3-6 months",
      category: "Governance"
    });
  } else {
    recommendations.push({
      title: "AI Innovation Leadership",
      description: "Lead industry innovation with cutting-edge AI research and development",
      priority: "Strategic",
      timeline: "12+ months",
      category: "Innovation"
    });
    recommendations.push({
      title: "AI Center of Excellence",
      description: "Establish an AI Center of Excellence to drive organization-wide AI initiatives",
      priority: "Medium",
      timeline: "6-12 months", 
      category: "Strategic"
    });
  }
  
  return recommendations;
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
      message: 'Only POST requests are supported for AI assessments'
    });
  }
  
  try {
    const { db } = await connectToDatabase();
    
    // Validate required fields
    const { user_info, responses } = req.body;
    
    if (!user_info || !user_info.name || !user_info.email) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'User information (name, email) is required'
      });
    }
    
    if (!responses) {
      return res.status(400).json({
        error: 'Validation failed', 
        message: 'Assessment responses are required'
      });
    }
    
    // Calculate maturity score
    const maturityScore = calculateMaturityScore(responses);
    
    // Generate recommendations
    const recommendations = generateRecommendations(maturityScore, user_info);
    
    // Prepare assessment data
    const assessmentData = {
      assessment_id: uuidv4(),
      user_info: {
        name: user_info.name,
        email: user_info.email,
        company: user_info.company || null,
        industry: user_info.industry || null,
        company_size: user_info.company_size || null
      },
      responses: responses,
      maturity_score: maturityScore,
      recommendations: recommendations,
      submitted_at: new Date().toISOString(),
      leadType: "AI Assessment",
      source: "ai_assessment_tool"
    };
    
    // Insert into MongoDB
    const result = await db.collection('ai_assessment_leads').insertOne(assessmentData);
    
    // Return response
    return res.status(200).json({
      success: true,
      assessment_id: assessmentData.assessment_id,
      maturity_score: maturityScore,
      recommendations: recommendations,
      message: "AI assessment completed successfully",
      timestamp: assessmentData.submitted_at
    });
    
  } catch (error) {
    console.error('AI Assessment API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process AI assessment. Please try again.'
    });
  }
}