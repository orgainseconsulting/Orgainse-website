import json
from datetime import datetime
from ._db import json_response, CORS_HEADERS

async def handler(request):
    """Health check endpoint"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
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

# For Vercel runtime
def main(request):
    """Vercel function entry point"""
    import asyncio
    return asyncio.run(handler(request))