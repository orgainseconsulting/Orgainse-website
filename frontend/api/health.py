from datetime import datetime
import json

def handler(request):
    """Health check endpoint for Vercel"""
    
    response_data = {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'Orgainse Consulting API',
        'version': '1.0.0'
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        'body': json.dumps(response_data)
    }