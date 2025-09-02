import json
import uuid
import os
from datetime import datetime
from pymongo import MongoClient

def handler(request):
    """Contact form submission endpoint for Vercel"""
    
    # Handle CORS preflight
    if request.get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            'body': ''
        }
    
    try:
        # Parse request body
        body_str = request.get('body', '{}')
        if isinstance(body_str, bytes):
            body_str = body_str.decode('utf-8')
        body = json.loads(body_str)
        
        name = body.get('name', '').strip()
        email = body.get('email', '').strip().lower()
        company = body.get('company', '').strip()
        phone = body.get('phone', '').strip()
        service_type = body.get('service_type', '').strip()
        message = body.get('message', '').strip()
        region = body.get('region', 'Global')
        
        # Validation
        if not name or not email or not message:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Name, email, and message are required'})
            }
        
        if '@' not in email or '.' not in email:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Invalid email format'})
            }
        
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
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'message': 'Message sent successfully',
                'contact_id': contact_message['id']
            }, default=str)
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': 'Invalid JSON data'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }