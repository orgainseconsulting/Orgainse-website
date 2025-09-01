import json
import uuid
from datetime import datetime
from ._db import get_database, json_response, error_response, CORS_HEADERS

def handler(event, context):
    """Consultation booking endpoint - Vercel compatible"""
    
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }
    
    if event.get('httpMethod') != 'POST':
        return error_response('Method not allowed', 405)
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        name = body.get('name', '').strip()
        email = body.get('email', '').strip().lower()
        company = body.get('company', '').strip()
        phone = body.get('phone', '').strip()
        service_type = body.get('service_type', '').strip()
        preferred_datetime = body.get('preferred_datetime', '').strip()
        timezone = body.get('timezone', '').strip()
        message = body.get('message', '').strip()
        region = body.get('region', 'Global')
        
        # Validation
        if not name or not email or not service_type:
            return error_response('Name, email, and service type are required', 400)
        
        # Email validation (basic)
        if '@' not in email or '.' not in email:
            return error_response('Invalid email format', 400)
        
        # Get database
        db = get_database()
        
        # Create consultation request
        consultation = {
            'id': str(uuid.uuid4()),
            'name': name,
            'email': email,
            'company': company,
            'phone': phone,
            'service_type': service_type,
            'preferred_datetime': preferred_datetime,
            'timezone': timezone,
            'message': message,
            'region': region,
            'requested_at': datetime.utcnow(),
            'status': 'pending',
            'source': 'website_consultation_form',
            'priority': 'high',
            'follow_up_required': True
        }
        
        # Save to database
        db.consultation_requests.insert_one(consultation)
        
        return json_response({
            'message': 'Consultation request submitted successfully',
            'consultation_id': consultation['id'],
            'status': 'pending'
        })
        
    except json.JSONDecodeError:
        return error_response('Invalid JSON data', 400)
    except Exception as e:
        return error_response(f'Internal server error: {str(e)}', 500)