import json
import uuid
from datetime import datetime
from ._db import get_database, json_response, error_response, CORS_HEADERS

async def handler(request):
    """Newsletter subscription endpoint"""
    
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
        
        email = body.get('email', '').strip().lower()
        first_name = body.get('first_name', '').strip()
        last_name = body.get('last_name', '').strip()
        region = body.get('region', 'Global')
        
        if not email:
            return error_response('Email is required', 400)
        
        # Get database
        db = get_database()
        
        # Check for existing subscription
        existing = await db.newsletter_subscriptions.find_one({'email': email})
        if existing:
            return error_response('Email already subscribed', 409)
        
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
        await db.newsletter_subscriptions.insert_one(subscription)
        
        return json_response({
            'message': 'Successfully subscribed to newsletter',
            'subscription_id': subscription['id'],
            'email': email
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