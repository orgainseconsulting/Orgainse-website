def handler(request):
    import json
    from datetime import datetime
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        'body': json.dumps({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'Orgainse Consulting API'
        })
    }