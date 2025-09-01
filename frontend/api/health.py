import json
from datetime import datetime
from ._db import json_response, CORS_HEADERS

def handler(event, context):
    """Health check endpoint - Vercel compatible"""
    
    # Handle CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }
    
    return json_response({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'Orgainse Consulting API',
        'version': '1.0.0'
    })