#!/usr/bin/env python3
"""
PRODUCTION URL TESTING - Testing actual orgainse.com endpoints
As requested in review: Website: https://www.orgainse.com
Testing if API endpoints are accessible from production domain
"""

import requests
import json
import time

# Production URLs from review request
PRODUCTION_WEBSITE = "https://www.orgainse.com"
PRODUCTION_API_ENDPOINTS = [
    f"{PRODUCTION_WEBSITE}/api/health",
    f"{PRODUCTION_WEBSITE}/api/newsletter", 
    f"{PRODUCTION_WEBSITE}/api/contact",
    f"{PRODUCTION_WEBSITE}/api/ai-assessment",
    f"{PRODUCTION_WEBSITE}/api/roi-calculator",
    f"{PRODUCTION_WEBSITE}/api/consultation"
]

print("🌐 PRODUCTION URL TESTING - ORGAINSE.COM")
print("=" * 60)
print(f"🎯 Testing production website: {PRODUCTION_WEBSITE}")
print("🔍 Checking if all API endpoints are accessible from production")
print("=" * 60)

def test_production_endpoint(url, method='GET', data=None):
    """Test production endpoint accessibility"""
    try:
        if method == 'GET':
            response = requests.get(url, timeout=10)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=10)
        
        print(f"✅ {url}")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:100]}...")
        return True
        
    except requests.exceptions.ConnectionError:
        print(f"❌ {url}")
        print(f"   ERROR: Connection failed - endpoint not accessible")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {url}")
        print(f"   ERROR: Request timeout")
        return False
    except Exception as e:
        print(f"❌ {url}")
        print(f"   ERROR: {str(e)}")
        return False

# Test all production endpoints
print("\n🔍 Testing GET endpoints:")
print("-" * 40)

for endpoint in PRODUCTION_API_ENDPOINTS:
    if '/health' in endpoint:
        test_production_endpoint(endpoint, 'GET')
        print()

print("\n🔍 Testing POST endpoints with sample data:")
print("-" * 40)

# Test newsletter endpoint
newsletter_data = {"email": "test@example.com"}
test_production_endpoint(f"{PRODUCTION_WEBSITE}/api/newsletter", 'POST', newsletter_data)
print()

# Test contact endpoint  
contact_data = {
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message"
}
test_production_endpoint(f"{PRODUCTION_WEBSITE}/api/contact", 'POST', contact_data)
print()

print("=" * 60)
print("🏁 PRODUCTION URL TESTING COMPLETE")
print("=" * 60)
print("📝 This test checks if the production website has the API endpoints deployed.")
print("📝 If endpoints return 404, it means Vercel deployment is not complete.")
print("📝 If endpoints are accessible, the backend is successfully deployed to production.")