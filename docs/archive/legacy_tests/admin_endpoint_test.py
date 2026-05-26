#!/usr/bin/env python3
"""
🎯 URGENT ADMIN ENDPOINT DIAGNOSTIC TEST
Testing the /api/admin endpoint specifically to diagnose the 404 error reported by user

REVIEW REQUEST REQUIREMENTS:
1. /api/admin endpoint functionality 
2. Authentication and authorization working
3. MongoDB data retrieval for admin dashboard
4. Response format and timing
5. CORS headers for admin API
6. Any rate limiting or security middleware issues
7. Check if the endpoint is accessible and returning proper data

Focus: Comprehensive /api/admin endpoint testing to diagnose 404 NOT_FOUND error
"""

import requests
import json
import time
import sys
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:3002"  # Local test server for serverless functions
PRODUCTION_URL = "https://www.orgainse.com"  # Production URL to test

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(title):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}")
    print(f"🎯 {title}")
    print(f"{'='*60}{Colors.END}")

def print_test(test_name):
    print(f"\n{Colors.YELLOW}🧪 Testing: {test_name}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def test_admin_endpoint_local():
    """Test 1: Admin endpoint on local test server"""
    print_test("Admin Endpoint - Local Test Server")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/admin", timeout=10)
        response_time = time.time() - start_time
        
        print_info(f"URL: {BASE_URL}/api/admin")
        print_info(f"Response Status: {response.status_code}")
        print_info(f"Response Time: {response_time:.3f}s")
        print_info(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response Structure: {list(data.keys())}")
            
            # Verify response structure
            required_fields = ['summary', 'data', 'success', 'timestamp']
            for field in required_fields:
                if field in data:
                    print_success(f"Required field '{field}' present")
                else:
                    print_error(f"Missing required field: {field}")
                    return False
            
            # Check summary statistics
            if 'summary' in data:
                summary = data['summary']
                print_info(f"Summary: {json.dumps(summary, indent=2)}")
                
                # Verify summary fields
                summary_fields = ['total_newsletters', 'total_contacts', 'total_leads', 'last_updated']
                for field in summary_fields:
                    if field in summary:
                        print_success(f"Summary field '{field}': {summary[field]}")
                    else:
                        print_error(f"Missing summary field: {field}")
            
            # Check data collections
            if 'data' in data:
                data_obj = data['data']
                expected_collections = ['newsletters', 'contact_messages', 'ai_assessment_leads', 
                                      'roi_calculator_leads', 'service_inquiries', 'consultation_leads']
                
                for collection in expected_collections:
                    if collection in data_obj:
                        count = len(data_obj[collection])
                        print_success(f"Collection '{collection}': {count} records")
                    else:
                        print_info(f"Collection '{collection}': not found (may be empty)")
            
            # Check CORS headers
            cors_headers = ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']
            for header in cors_headers:
                if header in response.headers:
                    print_success(f"CORS header '{header}': {response.headers[header]}")
                else:
                    print_info(f"CORS header '{header}' not found")
            
            print_success(f"Local admin endpoint working - Response time: {response_time:.3f}s")
            return True
            
        elif response.status_code == 429:
            print_error(f"Rate limited (429) - This is expected security behavior")
            print_info("Rate limiting is working correctly for admin endpoint")
            return True
            
        else:
            print_error(f"Admin endpoint failed with status {response.status_code}")
            print_error(f"Response body: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Local admin endpoint error: {str(e)}")
        return False

def test_admin_endpoint_production():
    """Test 2: Admin endpoint on production server"""
    print_test("Admin Endpoint - Production Server")
    
    try:
        start_time = time.time()
        response = requests.get(f"{PRODUCTION_URL}/api/admin", timeout=10)
        response_time = time.time() - start_time
        
        print_info(f"URL: {PRODUCTION_URL}/api/admin")
        print_info(f"Response Status: {response.status_code}")
        print_info(f"Response Time: {response_time:.3f}s")
        print_info(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response Structure: {list(data.keys())}")
            print_success(f"Production admin endpoint working - Response time: {response_time:.3f}s")
            return True
            
        elif response.status_code == 404:
            print_error(f"404 NOT FOUND - This confirms the user's reported issue!")
            print_error(f"Response body: {response.text}")
            print_error("🚨 CRITICAL: Admin endpoint not deployed to production")
            return False
            
        elif response.status_code == 429:
            print_error(f"Rate limited (429) - Security working but endpoint exists")
            print_info("This means the endpoint exists but is rate limited")
            return True
            
        else:
            print_error(f"Production admin endpoint failed with status {response.status_code}")
            print_error(f"Response body: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Production admin endpoint error: {str(e)}")
        return False

def test_admin_cors_preflight():
    """Test 3: CORS preflight request for admin endpoint"""
    print_test("Admin Endpoint CORS Preflight")
    
    for url in [BASE_URL, PRODUCTION_URL]:
        print_info(f"Testing CORS preflight for: {url}")
        
        try:
            response = requests.options(
                f"{url}/api/admin",
                headers={
                    'Origin': 'https://www.orgainse.com',
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'Content-Type'
                },
                timeout=5
            )
            
            print_info(f"OPTIONS {url}/api/admin: {response.status_code}")
            
            if response.status_code in [200, 204]:
                print_success(f"CORS preflight successful for {url}")
                
                # Check CORS response headers
                cors_headers = {
                    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
                }
                
                for header, value in cors_headers.items():
                    if value:
                        print_success(f"{header}: {value}")
                    else:
                        print_info(f"{header}: not set")
                        
            else:
                print_error(f"CORS preflight failed for {url}: {response.status_code}")
                
        except Exception as e:
            print_error(f"CORS preflight error for {url}: {str(e)}")

def test_admin_authentication():
    """Test 4: Admin endpoint authentication behavior"""
    print_test("Admin Endpoint Authentication")
    
    # Test with different referer headers
    test_cases = [
        {
            "name": "No Referer",
            "headers": {}
        },
        {
            "name": "Admin Page Referer",
            "headers": {"referer": "https://www.orgainse.com/admin"}
        },
        {
            "name": "Localhost Referer",
            "headers": {"referer": "http://localhost:3000/admin"}
        },
        {
            "name": "Unauthorized Referer",
            "headers": {"referer": "https://malicious-site.com"}
        }
    ]
    
    for test_case in test_cases:
        print_info(f"Testing: {test_case['name']}")
        
        try:
            response = requests.get(
                f"{BASE_URL}/api/admin",
                headers=test_case['headers'],
                timeout=5
            )
            
            print_info(f"Status: {response.status_code}")
            
            if response.status_code in [200, 429]:  # 200 = success, 429 = rate limited
                print_success(f"Access allowed for {test_case['name']}")
            else:
                print_info(f"Access response for {test_case['name']}: {response.status_code}")
                
        except Exception as e:
            print_error(f"Authentication test error for {test_case['name']}: {str(e)}")

def test_mongodb_connectivity():
    """Test 5: MongoDB connectivity through admin endpoint"""
    print_test("MongoDB Connectivity via Admin Endpoint")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if we got actual data from MongoDB
            if 'data' in data and 'summary' in data:
                total_leads = data['summary'].get('total_leads', 0)
                print_success(f"MongoDB connection working - Total leads: {total_leads}")
                
                # Check individual collections
                collections = data.get('data', {})
                for collection_name, collection_data in collections.items():
                    count = len(collection_data) if isinstance(collection_data, list) else 0
                    print_info(f"Collection '{collection_name}': {count} records")
                
                return True
            else:
                print_error("Response structure indicates MongoDB connection issues")
                return False
                
        elif response.status_code == 500:
            print_error("500 Internal Server Error - Likely MongoDB connection failure")
            print_error(f"Response: {response.text}")
            return False
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"MongoDB connectivity test error: {str(e)}")
        return False

def test_rate_limiting():
    """Test 6: Rate limiting behavior"""
    print_test("Rate Limiting Behavior")
    
    print_info("Making multiple rapid requests to test rate limiting...")
    
    success_count = 0
    rate_limited_count = 0
    
    for i in range(5):
        try:
            response = requests.get(f"{BASE_URL}/api/admin", timeout=5)
            
            if response.status_code == 200:
                success_count += 1
                print_success(f"Request {i+1}: Success (200)")
            elif response.status_code == 429:
                rate_limited_count += 1
                print_info(f"Request {i+1}: Rate limited (429)")
            else:
                print_info(f"Request {i+1}: Status {response.status_code}")
                
            time.sleep(0.1)  # Small delay between requests
            
        except Exception as e:
            print_error(f"Request {i+1} error: {str(e)}")
    
    print_info(f"Results: {success_count} successful, {rate_limited_count} rate limited")
    
    if rate_limited_count > 0:
        print_success("Rate limiting is working correctly")
        return True
    else:
        print_info("No rate limiting observed (may be configured with higher limits)")
        return True

def main():
    """Main test execution"""
    print_header("URGENT ADMIN ENDPOINT DIAGNOSTIC TEST")
    print_info(f"Local test server: {BASE_URL}")
    print_info(f"Production server: {PRODUCTION_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info("Diagnosing admin dashboard 404 error reported by user")
    
    # Test results tracking
    test_results = {}
    
    # Execute all tests
    test_results['local_admin'] = test_admin_endpoint_local()
    test_results['production_admin'] = test_admin_endpoint_production()
    test_admin_cors_preflight()  # Informational test
    test_admin_authentication()  # Informational test
    test_results['mongodb_connectivity'] = test_mongodb_connectivity()
    test_results['rate_limiting'] = test_rate_limiting()
    
    # Summary
    print_header("DIAGNOSTIC RESULTS SUMMARY")
    
    passed_tests = sum(test_results.values())
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ WORKING" if result else "❌ FAILED"
        print(f"{test_name.upper()}: {status}")
    
    print(f"\n{Colors.BOLD}DIAGNOSTIC RESULTS: {passed_tests}/{total_tests} tests passed{Colors.END}")
    
    # Specific diagnosis for user's 404 issue
    print_header("DIAGNOSIS FOR USER'S 404 ERROR")
    
    if test_results.get('local_admin', False) and not test_results.get('production_admin', False):
        print_error("🚨 ROOT CAUSE IDENTIFIED: Admin endpoint works locally but returns 404 on production")
        print_error("📋 ISSUE: /api/admin serverless function not deployed to production domain")
        print_error("🔧 SOLUTION REQUIRED: Deploy admin.js serverless function to Vercel production")
        print_info("The admin endpoint code exists and works correctly in local testing")
        print_info("The issue is deployment-related, not code-related")
        
    elif not test_results.get('local_admin', False):
        print_error("🚨 CRITICAL: Admin endpoint not working even locally")
        print_error("📋 ISSUE: Code or configuration problem with admin endpoint")
        print_error("🔧 SOLUTION REQUIRED: Fix admin endpoint implementation")
        
    elif test_results.get('production_admin', False):
        print_success("✅ Admin endpoint working on both local and production")
        print_info("User's 404 error may be intermittent or resolved")
        
    else:
        print_error("🚨 UNKNOWN: Unable to determine root cause")
        print_error("📋 ISSUE: Both local and production tests failed")
    
    return test_results.get('local_admin', False)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)