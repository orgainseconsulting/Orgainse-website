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
            
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            message = body.get('message', '').strip()
            
            if not name or not email or not message:
                self.send_error_response('Name, email, and message are required', 400)
                return
            
            if '@' not in email:
                self.send_error_response('Invalid email format', 400)
                return
            
            mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
            db_name = os.environ.get('DB_NAME', 'orgainse_consulting')
            
            client = MongoClient(mongo_url)
            db = client[db_name]
            
            contact_message = {
                'id': str(uuid.uuid4()),
                'name': name,
                'email': email,
                'company': body.get('company', '').strip(),
                'phone': body.get('phone', '').strip(),
                'service_type': body.get('service_type', '').strip(),
                'message': message,
                'submitted_at': datetime.utcnow(),
                'status': 'new'
            }
            
            db.contact_messages.insert_one(contact_message)
            client.close()
            
            self.send_json_response({
                'message': 'Message sent successfully',
                'contact_id': contact_message['id']
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