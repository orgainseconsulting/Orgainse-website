#!/usr/bin/env python3
"""
🎯 COMPREHENSIVE ADMIN DASHBOARD TESTING
Testing various scenarios that might cause 404 errors for admin dashboard access

FOCUS: Understanding why user reports 404 NOT_FOUND error when admin endpoint works
"""

import requests
import json
import time
import sys
from datetime import datetime

# Test configuration
PRODUCTION_URL = "https://www.orgainse.com"

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

def test_admin_endpoint_variations():
    """Test different URL variations that user might be trying"""
    print_test("Admin Endpoint URL Variations")
    
    url_variations = [
        "/api/admin",           # Correct endpoint
        "/api/admin/",          # With trailing slash
        "/admin",               # Without /api prefix
        "/admin/",              # Without /api prefix, with slash
        "/api/admin/dashboard", # With dashboard suffix
        "/dashboard",           # Just dashboard
        "/api/dashboard",       # API dashboard
        "/admin/dashboard",     # Admin dashboard
    ]
    
    results = {}
    
    for endpoint in url_variations:
        print_info(f"Testing: {PRODUCTION_URL}{endpoint}")
        
        try:
            response = requests.get(f"{PRODUCTION_URL}{endpoint}", timeout=10)
            status = response.status_code
            results[endpoint] = status
            
            if status == 200:
                print_success(f"{endpoint}: Working (200)")
            elif status == 404:
                print_error(f"{endpoint}: Not Found (404)")
            elif status == 429:
                print_info(f"{endpoint}: Rate Limited (429)")
            else:
                print_info(f"{endpoint}: Status {status}")
                
        except Exception as e:
            print_error(f"{endpoint}: Error - {str(e)}")
            results[endpoint] = "ERROR"
    
    return results

def test_admin_with_different_user_agents():
    """Test admin endpoint with different user agents"""
    print_test("Admin Endpoint with Different User Agents")
    
    user_agents = [
        {
            "name": "Chrome Desktop",
            "agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        },
        {
            "name": "Firefox Desktop", 
            "agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
        },
        {
            "name": "Safari Mobile",
            "agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        },
        {
            "name": "Chrome Mobile",
            "agent": "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        }
    ]
    
    for ua in user_agents:
        print_info(f"Testing with: {ua['name']}")
        
        try:
            response = requests.get(
                f"{PRODUCTION_URL}/api/admin",
                headers={"User-Agent": ua['agent']},
                timeout=10
            )
            
            if response.status_code == 200:
                print_success(f"{ua['name']}: Working (200)")
            elif response.status_code == 404:
                print_error(f"{ua['name']}: Not Found (404)")
            else:
                print_info(f"{ua['name']}: Status {response.status_code}")
                
        except Exception as e:
            print_error(f"{ua['name']}: Error - {str(e)}")

def test_admin_with_different_origins():
    """Test admin endpoint with different origin headers"""
    print_test("Admin Endpoint with Different Origins")
    
    origins = [
        "https://www.orgainse.com",
        "https://orgainse.com", 
        "http://localhost:3000",
        "https://orgainse.vercel.app",
        "https://admin.orgainse.com",
        None  # No origin header
    ]
    
    for origin in origins:
        origin_name = origin if origin else "No Origin"
        print_info(f"Testing with origin: {origin_name}")
        
        headers = {}
        if origin:
            headers["Origin"] = origin
            
        try:
            response = requests.get(
                f"{PRODUCTION_URL}/api/admin",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print_success(f"{origin_name}: Working (200)")
            elif response.status_code == 404:
                print_error(f"{origin_name}: Not Found (404)")
            else:
                print_info(f"{origin_name}: Status {response.status_code}")
                
        except Exception as e:
            print_error(f"{origin_name}: Error - {str(e)}")

def test_admin_with_authentication_headers():
    """Test admin endpoint with various authentication headers"""
    print_test("Admin Endpoint with Authentication Headers")
    
    auth_scenarios = [
        {
            "name": "No Auth Headers",
            "headers": {}
        },
        {
            "name": "Basic Auth (empty)",
            "headers": {"Authorization": "Basic "}
        },
        {
            "name": "Bearer Token (empty)",
            "headers": {"Authorization": "Bearer "}
        },
        {
            "name": "API Key Header",
            "headers": {"X-API-Key": "test-key"}
        },
        {
            "name": "Admin Session",
            "headers": {"X-Admin-Session": "admin-session-token"}
        }
    ]
    
    for scenario in auth_scenarios:
        print_info(f"Testing: {scenario['name']}")
        
        try:
            response = requests.get(
                f"{PRODUCTION_URL}/api/admin",
                headers=scenario['headers'],
                timeout=10
            )
            
            if response.status_code == 200:
                print_success(f"{scenario['name']}: Working (200)")
            elif response.status_code == 401:
                print_info(f"{scenario['name']}: Unauthorized (401)")
            elif response.status_code == 404:
                print_error(f"{scenario['name']}: Not Found (404)")
            else:
                print_info(f"{scenario['name']}: Status {response.status_code}")
                
        except Exception as e:
            print_error(f"{scenario['name']}: Error - {str(e)}")

def test_admin_timing_and_caching():
    """Test admin endpoint timing and caching behavior"""
    print_test("Admin Endpoint Timing and Caching")
    
    print_info("Making multiple requests to check caching behavior...")
    
    response_times = []
    cache_statuses = []
    
    for i in range(3):
        print_info(f"Request {i+1}/3")
        
        try:
            start_time = time.time()
            response = requests.get(f"{PRODUCTION_URL}/api/admin", timeout=10)
            response_time = time.time() - start_time
            
            response_times.append(response_time)
            
            # Check cache headers
            cache_control = response.headers.get('Cache-Control', 'Not set')
            x_vercel_cache = response.headers.get('X-Vercel-Cache', 'Not set')
            etag = response.headers.get('ETag', 'Not set')
            
            cache_statuses.append({
                'cache_control': cache_control,
                'vercel_cache': x_vercel_cache,
                'etag': etag
            })
            
            print_info(f"Response time: {response_time:.3f}s")
            print_info(f"Status: {response.status_code}")
            print_info(f"Cache-Control: {cache_control}")
            print_info(f"X-Vercel-Cache: {x_vercel_cache}")
            
            time.sleep(1)  # Wait between requests
            
        except Exception as e:
            print_error(f"Request {i+1} error: {str(e)}")
    
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        print_info(f"Average response time: {avg_time:.3f}s")
        
        if avg_time > 10:
            print_error("⚠️  Slow response times might cause timeouts")
        else:
            print_success("Response times are acceptable")

def test_admin_data_retrieval():
    """Test admin endpoint data retrieval in detail"""
    print_test("Admin Endpoint Data Retrieval")
    
    try:
        response = requests.get(f"{PRODUCTION_URL}/api/admin", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            print_success("Admin endpoint returning data successfully")
            
            # Analyze the data structure
            print_info("Data structure analysis:")
            print_info(f"- Success: {data.get('success', 'Not set')}")
            print_info(f"- Timestamp: {data.get('timestamp', 'Not set')}")
            
            if 'summary' in data:
                summary = data['summary']
                print_info("Summary statistics:")
                for key, value in summary.items():
                    print_info(f"  - {key}: {value}")
            
            if 'data' in data:
                data_obj = data['data']
                print_info("Data collections:")
                for collection, items in data_obj.items():
                    count = len(items) if isinstance(items, list) else 0
                    print_info(f"  - {collection}: {count} items")
                    
                    # Show sample data if available
                    if isinstance(items, list) and len(items) > 0:
                        sample = items[0]
                        sample_keys = list(sample.keys()) if isinstance(sample, dict) else []
                        print_info(f"    Sample fields: {sample_keys[:5]}")
            
            return True
            
        else:
            print_error(f"Admin endpoint failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Data retrieval test error: {str(e)}")
        return False

def main():
    """Main test execution"""
    print_header("COMPREHENSIVE ADMIN DASHBOARD TESTING")
    print_info(f"Production server: {PRODUCTION_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info("Investigating potential causes of user's 404 error")
    
    # Execute comprehensive tests
    url_results = test_admin_endpoint_variations()
    test_admin_with_different_user_agents()
    test_admin_with_different_origins()
    test_admin_with_authentication_headers()
    test_admin_timing_and_caching()
    data_success = test_admin_data_retrieval()
    
    # Analysis
    print_header("COMPREHENSIVE ANALYSIS")
    
    # Check URL variations
    working_urls = [url for url, status in url_results.items() if status == 200]
    not_found_urls = [url for url, status in url_results.items() if status == 404]
    
    print_info(f"Working URLs: {working_urls}")
    print_info(f"404 URLs: {not_found_urls}")
    
    if "/api/admin" in working_urls:
        print_success("✅ Correct admin endpoint (/api/admin) is working")
    else:
        print_error("❌ Correct admin endpoint (/api/admin) is not working")
    
    # Potential causes analysis
    print_header("POTENTIAL CAUSES OF USER'S 404 ERROR")
    
    if "/api/admin" in working_urls:
        print_info("🔍 Since /api/admin works, user's 404 error might be caused by:")
        print_info("1. User accessing wrong URL (e.g., /admin instead of /api/admin)")
        print_info("2. Intermittent deployment issues (resolved now)")
        print_info("3. Browser caching old 404 responses")
        print_info("4. User accessing from different domain/subdomain")
        print_info("5. Network/CDN issues in user's location")
        print_info("6. User accessing during a brief deployment window")
        
        print_success("✅ RECOMMENDATION: Admin endpoint is working correctly")
        print_info("💡 Advise user to:")
        print_info("   - Clear browser cache")
        print_info("   - Ensure using correct URL: /api/admin")
        print_info("   - Try from different browser/device")
        print_info("   - Check if accessing from correct domain")
        
    else:
        print_error("🚨 CRITICAL: Admin endpoint is actually not working")
        print_error("User's 404 error is legitimate and needs immediate attention")
    
    return data_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)