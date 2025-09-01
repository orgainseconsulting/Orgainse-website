import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

# Global database connection
_client: Optional[AsyncIOMotorClient] = None
_db = None

def get_database():
    """Get database connection for serverless functions"""
    global _client, _db
    
    if _client is None:
        # MongoDB connection for serverless
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'orgainse_consulting')
        
        _client = AsyncIOMotorClient(mongo_url)
        _db = _client[db_name]
    
    return _db

# CORS headers for all responses
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

def json_response(data, status_code=200):
    """Create standardized JSON response with CORS headers"""
    import json
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps(data, default=str)
    }

def error_response(message, status_code=500):
    """Create standardized error response"""
    return json_response({'error': message}, status_code)