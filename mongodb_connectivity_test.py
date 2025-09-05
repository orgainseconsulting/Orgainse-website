#!/usr/bin/env python3
"""
MongoDB Connectivity Test - Verify database connection after founding date corrections
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:3001"

def test_mongodb_connectivity():
    """Test MongoDB connectivity through API endpoints"""
    print("🔍 Testing MongoDB Connectivity...")
    
    # Test 1: Newsletter subscription (writes to MongoDB)
    print("\n1. Testing Newsletter Subscription (MongoDB Write)")
    test_email = f"mongodb_test_{int(time.time())}@orgainse.com"
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json={
                "email": test_email,
                "first_name": "MongoDB Test",
                "name": "MongoDB Test User",
                "leadType": "Connectivity Test"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Newsletter subscription successful: {data.get('message')}")
            print(f"   Subscription ID: {data.get('subscription_id')}")
        else:
            print(f"❌ Newsletter subscription failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Newsletter test error: {str(e)}")
        return False
    
    # Test 2: Contact form submission (writes to MongoDB)
    print("\n2. Testing Contact Form Submission (MongoDB Write)")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json={
                "name": "MongoDB Connectivity Test",
                "email": test_email,
                "company": "Test Company",
                "message": "Testing MongoDB connectivity after founding date corrections",
                "leadType": "Connectivity Test"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Contact form successful: {data.get('message')}")
            print(f"   Contact ID: {data.get('id')}")
        else:
            print(f"❌ Contact form failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Contact test error: {str(e)}")
        return False
    
    # Test 3: Admin API (reads from MongoDB)
    print("\n3. Testing Admin API (MongoDB Read)")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            summary = data.get('summary', {})
            print(f"✅ Admin API successful")
            print(f"   Total newsletters: {summary.get('total_newsletters')}")
            print(f"   Total contacts: {summary.get('total_contacts')}")
            print(f"   Total leads: {summary.get('total_leads')}")
            print(f"   Last updated: {summary.get('last_updated')}")
        else:
            print(f"❌ Admin API failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Admin API test error: {str(e)}")
        return False
    
    print("\n✅ MongoDB connectivity verified - all read/write operations working")
    return True

def test_serverless_functions_health():
    """Test all serverless functions are functioning properly"""
    print("\n🚀 Testing All Serverless Functions Health...")
    
    functions = [
        ("/api/health", "GET", None),
        ("/api/newsletter", "POST", {"email": "health_test@orgainse.com", "first_name": "Health Test"}),
        ("/api/contact", "POST", {"name": "Health Test", "email": "health_test@orgainse.com", "message": "Health check"}),
        ("/api/admin", "GET", None)
    ]
    
    all_healthy = True
    
    for endpoint, method, data in functions:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=5)
            
            if response.status_code in [200, 409]:  # 409 for duplicate emails is OK
                print(f"✅ {endpoint} ({method}): {response.status_code}")
            else:
                print(f"❌ {endpoint} ({method}): {response.status_code}")
                all_healthy = False
                
        except Exception as e:
            print(f"❌ {endpoint} ({method}): Error - {str(e)}")
            all_healthy = False
    
    return all_healthy

def main():
    print("=" * 60)
    print("🎯 MONGODB CONNECTIVITY & SERVERLESS FUNCTIONS TEST")
    print("   After Founding Date Corrections")
    print("=" * 60)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test MongoDB connectivity
    mongodb_ok = test_mongodb_connectivity()
    
    # Test serverless functions health
    functions_ok = test_serverless_functions_health()
    
    print("\n" + "=" * 60)
    print("🎯 FINAL RESULTS")
    print("=" * 60)
    
    if mongodb_ok and functions_ok:
        print("✅ ALL TESTS PASSED")
        print("✅ MongoDB connectivity intact")
        print("✅ All serverless functions functioning properly")
        print("✅ Founding date corrections did not break backend functionality")
        return True
    else:
        print("❌ SOME TESTS FAILED")
        if not mongodb_ok:
            print("❌ MongoDB connectivity issues detected")
        if not functions_ok:
            print("❌ Serverless function health issues detected")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)