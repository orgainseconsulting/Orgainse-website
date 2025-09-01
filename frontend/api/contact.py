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
            
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            company = body.get('company', '').strip()
            phone = body.get('phone', '').strip()
            service_type = body.get('service_type', '').strip()
            message = body.get('message', '').strip()
            region = body.get('region', 'Global')
            
            # Validation
            if not name or not email or not message:
                self.send_error_response('Name, email, and message are required', 400)
                return
            
            if '@' not in email or '.' not in email:
                self.send_error_response('Invalid email format', 400)
                return
            
            # Database connection
            mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
            db_name = os.environ.get('DB_NAME', 'orgainse_consulting')
            
            client = MongoClient(mongo_url)
            db = client[db_name]
            
            # Create contact message
            contact_message = {
                'id': str(uuid.uuid4()),
                'name': name,
                'email': email,
                'company': company,
                'phone': phone,
                'service_type': service_type,
                'message': message,
                'region': region,
                'submitted_at': datetime.utcnow(),
                'status': 'new',
                'source': 'website_contact_form',
                'priority': 'medium',
                'tags': []
            }
            
            # Add service-specific tags
            if service_type:
                contact_message['tags'].append(f'service_{service_type.lower().replace(" ", "_")}')
            
            # Save to database
            db.contact_messages.insert_one(contact_message)
            client.close()
            
            # Send success response
            self.send_json_response({
                'message': 'Message sent successfully',
                'contact_id': contact_message['id']
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