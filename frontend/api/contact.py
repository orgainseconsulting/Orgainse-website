import json
import uuid
from datetime import datetime
from ._db import get_database, json_response, error_response, CORS_HEADERS

async def handler(request):
    """Contact form submission endpoint"""
    
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
        
        name = body.get('name', '').strip()
        email = body.get('email', '').strip().lower()
        company = body.get('company', '').strip()
        phone = body.get('phone', '').strip()
        service_type = body.get('service_type', '').strip()
        message = body.get('message', '').strip()
        region = body.get('region', 'Global')
        
        # Validation
        if not name or not email or not message:
            return error_response('Name, email, and message are required', 400)
        
        # Email validation (basic)
        if '@' not in email or '.' not in email:
            return error_response('Invalid email format', 400)
        
        # Get database
        db = get_database()
        
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
        await db.contact_messages.insert_one(contact_message)
        
        return json_response({
            'message': 'Message sent successfully',
            'contact_id': contact_message['id']
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