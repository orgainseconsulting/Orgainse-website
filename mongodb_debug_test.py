#!/usr/bin/env python3
"""
MongoDB Debug Test - Detailed analysis of authentication issues
"""

import urllib.parse
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, OperationFailure, ConfigurationError

def test_password_encodings():
    """Test different password encoding scenarios"""
    print("🔍 Testing different password encoding scenarios...")
    
    # Original password: Mycompany25%MDB
    # URL encoded: Mycompany25%25MDB
    
    base_url = "mongodb+srv://orgainse_db_user:{}@orgainse-consulting.oafulke.mongodb.net/orgainse-consulting?retryWrites=true&w=majority&appName=orgainse-consulting"
    
    password_variants = [
        ("URL Encoded (Current)", "Mycompany25%25MDB"),
        ("Raw Password", "Mycompany25%MDB"),
        ("Double Encoded", "Mycompany25%2525MDB"),
        ("Python URL Encoded", urllib.parse.quote_plus("Mycompany25%MDB")),
    ]
    
    for name, password in password_variants:
        print(f"\n🧪 Testing {name}: {password}")
        url = base_url.format(password)
        
        try:
            client = MongoClient(url, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            print(f"✅ SUCCESS: {name} works!")
            client.close()
            return url  # Return working URL
        except Exception as e:
            print(f"❌ FAILED: {name} - {str(e)}")
    
    return None

def test_connection_components():
    """Test individual components of the connection"""
    print("\n🔍 Testing connection components...")
    
    # Test basic connectivity to cluster
    try:
        # Test without authentication first
        basic_url = "mongodb+srv://orgainse-consulting.oafulke.mongodb.net/?retryWrites=true&w=majority"
        client = MongoClient(basic_url, serverSelectionTimeoutMS=5000)
        # This should fail with auth error, but confirms network connectivity
        client.admin.command('ping')
    except Exception as e:
        if "authentication" in str(e).lower():
            print("✅ Network connectivity OK - authentication required")
        else:
            print(f"❌ Network connectivity issue: {str(e)}")

def main():
    print("🎯 MongoDB Debug Test - Detailed Authentication Analysis")
    print("=" * 60)
    
    # Test password encodings
    working_url = test_password_encodings()
    
    if working_url:
        print(f"\n🎉 Found working connection string:")
        print(f"   {working_url}")
    else:
        print(f"\n🚨 No working password encoding found")
        print(f"   This suggests the credentials may be incorrect")
        print(f"   or there may be IP whitelist/network access issues")
    
    # Test connection components
    test_connection_components()
    
    print("\n📋 Recommendations:")
    print("1. Verify MongoDB Atlas user credentials in the Atlas dashboard")
    print("2. Check Network Access whitelist (add 0.0.0.0/0 for testing)")
    print("3. Verify database user permissions")
    print("4. Check if the cluster is paused or has any issues")

if __name__ == "__main__":
    main()