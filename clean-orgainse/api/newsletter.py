def handler(request):
    import json
    import uuid
    import os
    from datetime import datetime
    
    # Handle CORS preflight
    if request.get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': ''
        }
    
    try:
        # Parse request body
        body_str = request.get('body', '{}')
        if isinstance(body_str, bytes):
            body_str = body_str.decode('utf-8')
        body = json.loads(body_str)
        
        email = body.get('email', '').strip().lower()
        first_name = body.get('first_name', '').strip()
        
        if not email or '@' not in email:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Valid email required'})
            }
        
        # Try MongoDB connection
        try:
            from pymongo import MongoClient
            mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
            db_name = os.environ.get('DB_NAME', 'orgainse_consulting')
            
            client = MongoClient(mongo_url)
            db = client[db_name]
            
            # Check existing subscription
            if db.newsletter_subscriptions.find_one({'email': email}):
                client.close()
                return {
                    'statusCode': 409,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    'body': json.dumps({'error': 'Email already subscribed'})
                }
            
            # Create subscription
            subscription = {
                'id': str(uuid.uuid4()),
                'email': email,
                'first_name': first_name,
                'subscribed_at': datetime.utcnow(),
                'status': 'active'
            }
            
            db.newsletter_subscriptions.insert_one(subscription)
            client.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'message': 'Successfully subscribed to newsletter',
                    'subscription_id': subscription['id']
                })
            }
            
        except ImportError:
            # If pymongo not available, return success anyway for testing
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'message': 'Newsletter subscription received (database connection pending)',
                    'email': email
                })
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }