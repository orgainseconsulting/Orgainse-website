from http.server import BaseHTTPRequestHandler
import json
import uuid
import os
from datetime import datetime
from pymongo import MongoClient

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Get request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            email = body.get('email', '').strip().lower()
            first_name = body.get('first_name', '').strip()
            last_name = body.get('last_name', '').strip()
            region = body.get('region', 'Global')
            
            if not email or '@' not in email or '.' not in email:
                self.send_error_response('Valid email is required', 400)
                return
            
            # Database connection  
            mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
            db_name = os.environ.get('DB_NAME', 'orgainse_consulting')
            
            client = MongoClient(mongo_url)
            db = client[db_name]
            
            # Check existing subscription
            existing = db.newsletter_subscriptions.find_one({'email': email})
            if existing:
                self.send_error_response('Email already subscribed', 409)
                return
            
            # Create subscription
            subscription = {
                'id': str(uuid.uuid4()),
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'region': region,
                'subscribed_at': datetime.utcnow(),
                'status': 'active',
                'source': 'website',
                'preferences': {
                    'frequency': 'weekly',
                    'topics': ['ai_insights', 'project_management', 'digital_transformation']
                }
            }
            
            # Save to database
            db.newsletter_subscriptions.insert_one(subscription)
            client.close()
            
            # Send success response
            self.send_json_response({
                'message': 'Successfully subscribed to newsletter',
                'subscription_id': subscription['id'],
                'email': email
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