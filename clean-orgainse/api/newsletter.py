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
        email = body.get('email', '').strip().lower()
        
        if not email or '@' not in email:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Valid email required'})
            }
        
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'orgainse_consulting')
        
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        if db.newsletter_subscriptions.find_one({'email': email}):
            client.close()
            return {
                'statusCode': 409,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Email already subscribed'})
            }
        
        subscription = {
            'id': str(uuid.uuid4()),
            'email': email,
            'first_name': body.get('first_name', '').strip(),
            'subscribed_at': datetime.utcnow(),
            'status': 'active'
        }
        
        db.newsletter_subscriptions.insert_one(subscription)
        client.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Successfully subscribed to newsletter', 'subscription_id': subscription['id']})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }