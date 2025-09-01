import json
import uuid
from datetime import datetime
from ._db import get_database, json_response, error_response, CORS_HEADERS

def calculate_ai_maturity_score(responses):
    """Calculate AI maturity score based on responses"""
    total_score = 0
    max_score = len(responses) * 4  # Assuming 4-point scale
    
    for response in responses:
        score = response.get('score', 0)
        total_score += score
    
    return (total_score / max_score) * 100 if max_score > 0 else 0

def generate_recommendations(score, responses):
    """Generate AI recommendations based on score and responses"""
    recommendations = []
    
    if score < 30:
        recommendations.extend([
            "Start with basic data collection and organization",
            "Implement simple automation tools for repetitive tasks",
            "Train team on AI fundamentals and terminology",
            "Establish data quality and governance processes"
        ])
    elif score < 60:
        recommendations.extend([
            "Pilot AI solutions in specific business areas",
            "Develop AI strategy and roadmap",
            "Invest in data infrastructure and analytics",
            "Build AI talent through hiring or training"
        ])
    elif score < 80:
        recommendations.extend([
            "Scale successful AI pilots across the organization",
            "Implement advanced machine learning models",
            "Develop AI ethics and governance framework",
            "Create centers of excellence for AI innovation"
        ])
    else:
        recommendations.extend([
            "Lead industry innovation with cutting-edge AI",
            "Develop proprietary AI algorithms and models",
            "Establish AI partnerships and ecosystems",
            "Focus on AI-driven business transformation"
        ])
    
    return recommendations[:4]  # Return top 4 recommendations

async def handler(request):
    """AI Assessment endpoint"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }
    
    if request.method != 'POST':
        return error_response('Method not allowed', 405)
    
    try:
        # Parse request body
        body = json.loads(request.body) if hasattr(request, 'body') else request
        
        company_name = body.get('company_name', '').strip()
        industry = body.get('industry', '').strip()
        company_size = body.get('company_size', '').strip()
        current_ai_usage = body.get('current_ai_usage', '').strip()
        email = body.get('email', '').strip().lower()
        responses = body.get('responses', [])
        
        # Validation
        if not email or not responses:
            return error_response('Email and assessment responses are required', 400)
        
        # Calculate AI maturity score
        score = calculate_ai_maturity_score(responses)
        
        # Generate recommendations
        recommendations = generate_recommendations(score, responses)
        
        # Determine maturity level
        if score < 25:
            level = "Beginner"
        elif score < 50:
            level = "Developing"
        elif score < 75:
            level = "Intermediate"
        else:
            level = "Advanced"
        
        # Get database
        db = get_database()
        
        # Create assessment record
        assessment = {
            'id': str(uuid.uuid4()),
            'company_name': company_name,
            'industry': industry,
            'company_size': company_size,
            'current_ai_usage': current_ai_usage,
            'email': email,
            'responses': responses,
            'score': round(score, 1),
            'level': level,
            'recommendations': recommendations,
            'completed_at': datetime.utcnow(),
            'source': 'website_ai_assessment'
        }
        
        # Save to database
        await db.ai_assessments.insert_one(assessment)
        
        return json_response({
            'assessment_id': assessment['id'],
            'score': assessment['score'],
            'level': assessment['level'],
            'recommendations': assessment['recommendations'],
            'message': 'AI Assessment completed successfully'
        })
        
    except json.JSONDecodeError:
        return error_response('Invalid JSON data', 400)
    except Exception as e:
        return error_response(f'Internal server error: {str(e)}', 500)

# For Vercel runtime
def main(request):
    """Vercel function entry point"""
    import asyncio
    return asyncio.run(handler(request))