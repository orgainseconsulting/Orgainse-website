from http.server import BaseHTTPRequestHandler
import json
import uuid
import os
from datetime import datetime
from pymongo import MongoClient

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            email = body.get('email', '').strip().lower()
            first_name = body.get('first_name', '').strip()
            
            if not email or '@' not in email:
                self.send_error_response('Valid email required', 400)
                return
            
            mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
            db_name = os.environ.get('DB_NAME', 'orgainse_consulting')
            
            client = MongoClient(mongo_url)
            db = client[db_name]
            
            if db.newsletter_subscriptions.find_one({'email': email}):
                client.close()
                self.send_error_response('Email already subscribed', 409)
                return
            
            subscription = {
                'id': str(uuid.uuid4()),
                'email': email,
                'first_name': first_name,
                'subscribed_at': datetime.utcnow(),
                'status': 'active'
            }
            
            db.newsletter_subscriptions.insert_one(subscription)
            client.close()
            
            self.send_json_response({
                'message': 'Successfully subscribed to newsletter',
                'subscription_id': subscription['id']
            })
            
        except Exception as e:
            self.send_error_response(f'Server error: {str(e)}', 500)
    
    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def send_error_response(self, message, status_code):
        self.send_json_response({'error': message}, status_code)