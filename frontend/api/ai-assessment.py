from http.server import BaseHTTPRequestHandler
import json
import uuid
import os
from datetime import datetime
from pymongo import MongoClient

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

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            company_name = body.get('company_name', '').strip()
            industry = body.get('industry', '').strip()
            company_size = body.get('company_size', '').strip()
            current_ai_usage = body.get('current_ai_usage', '').strip()
            email = body.get('email', '').strip().lower()
            responses = body.get('responses', [])
            
            # Validation
            if not email or not responses:
                self.send_error_response('Email and assessment responses are required', 400)
                return
            
            if '@' not in email or '.' not in email:
                self.send_error_response('Invalid email format', 400)
                return
            
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
            
            # Database connection
            mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
            db_name = os.environ.get('DB_NAME', 'orgainse_consulting')
            
            client = MongoClient(mongo_url)
            db = client[db_name]
            
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
            db.ai_assessments.insert_one(assessment)
            client.close()
            
            # Send success response
            self.send_json_response({
                'assessment_id': assessment['id'],
                'score': assessment['score'],
                'level': assessment['level'],
                'recommendations': assessment['recommendations'],
                'message': 'AI Assessment completed successfully'
            })
            
        except json.JSONDecodeError:
            self.send_error_response('Invalid JSON data', 400)
        except Exception as e:
            self.send_error_response(f'Internal server error: {str(e)}', 500)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode('utf-8'))
    
    def send_error_response(self, message, status_code=500):
        self.send_json_response({'error': message}, status_code)