import json
import uuid
import os
from datetime import datetime
from pymongo import MongoClient

def handler(request):
    if request.get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'},
            'body': ''
        }
    
    try:
        body = json.loads(request.get('body', '{}'))
        name = body.get('name', '').strip()
        email = body.get('email', '').strip().lower()
        message = body.get('message', '').strip()
        
        if not name or not email or not message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Name, email, and message are required'})
            }
        
        if '@' not in email:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid email format'})
            }
        
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
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Message sent successfully', 'contact_id': contact_message['id']})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }