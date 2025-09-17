import { MongoClient } from 'mongodb';

// Generate UUID-like ID without external dependency
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported for AI assessments'
    });
  }
  
  try {
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
    
    // Simple maturity score calculation
    const maturityScore = 65; // Fixed score for testing
    
    // Simple recommendations
    const recommendations = [
      {
        title: "AI Foundation Building",
        description: "Start with basic AI tools and team training",
        priority: "High",
        timeline: "3-6 months",
        category: "Foundation"
      }
    ];
    
    // Prepare assessment data
    const assessmentData = {
      assessment_id: generateId(),
      user_info: {
        name: user_info.name,
        email: user_info.email,
        company: user_info.company || null
      },
      responses: responses,
      maturity_score: maturityScore,
      recommendations: recommendations,
      submitted_at: new Date().toISOString(),
      leadType: "AI Assessment",
      source: "ai_assessment_tool"
    };
    
    // Return response without MongoDB for testing
    return res.status(200).json({
      success: true,
      assessment_id: assessmentData.assessment_id,
      maturity_score: maturityScore,
      recommendations: recommendations,
      message: "AI assessment completed successfully (simplified version)",
      timestamp: assessmentData.submitted_at
    });
    
  } catch (error) {
    console.error('AI Assessment API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process AI assessment. Please try again.',
      details: error.message
    });
  }
}