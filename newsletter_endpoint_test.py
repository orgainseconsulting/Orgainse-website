#!/usr/bin/env python3
"""
Newsletter Endpoint Testing for Orgainse Consulting API
Testing the newsletter endpoint that the frontend will now use instead of Google Apps Script
"""

import requests
import json
import time
from datetime import datetime
import uuid

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except:
        pass
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"🚀 Testing Newsletter Endpoint - Orgainse Consulting Backend API")
print(f"📍 Backend URL: {BASE_URL}")
print(f"📍 API URL: {API_URL}")
print("=" * 70)

# Test counters
total_tests = 0
passed_tests = 0
failed_tests = 0
test_results = []

def log_test(test_name, success, details="", response_time=None):
    global total_tests, passed_tests, failed_tests
    total_tests += 1
    
    if success:
        passed_tests += 1
        status = "✅ PASS"
    else:
        failed_tests += 1
        status = "❌ FAIL"
    
    time_info = f" ({response_time:.2f}s)" if response_time else ""
    print(f"{status} {test_name}{time_info}")
    
    if details:
        print(f"    📝 {details}")
    
    test_results.append({
        'test': test_name,
        'success': success,
        'details': details,
        'response_time': response_time
    })
    print()

def test_newsletter_endpoint():
    """Test POST /api/newsletter with newsletter subscription data"""
    print("🔍 Testing Newsletter Endpoint Functionality")
    print("-" * 50)
    
    # Test 1: Basic Newsletter Subscription
    try:
        start_time = time.time()
        
        # Use realistic test data as specified in review request
        test_data = {
            "email": "test@orgainse.com"
        }
        
        response = requests.post(f"{API_URL}/newsletter", json=test_data)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            response_data = response.json()
            
            # Verify response format matches what frontend expects
            required_fields = ['id', 'email', 'timestamp', 'status']
            missing_fields = [field for field in required_fields if field not in response_data]
            
            if not missing_fields:
                log_test("Newsletter Subscription - Basic", True, 
                        f"Email: {response_data['email']}, Status: {response_data['status']}, ID: {response_data['id'][:8]}...", 
                        response_time)
            else:
                log_test("Newsletter Subscription - Basic", False, 
                        f"Missing required fields: {missing_fields}", response_time)
        else:
            log_test("Newsletter Subscription - Basic", False, 
                    f"HTTP {response.status_code}: {response.text}", response_time)
            
    except Exception as e:
        log_test("Newsletter Subscription - Basic", False, f"Exception: {str(e)}")

def test_newsletter_lead_types():
    """Test that the endpoint can handle different lead types"""
    print("🔍 Testing Newsletter Endpoint with Different Lead Types")
    print("-" * 50)
    
    # Test different lead type scenarios
    lead_scenarios = [
        {
            "name": "Newsletter Subscription Lead",
            "data": {
                "email": f"newsletter_{uuid.uuid4().hex[:8]}@orgainse.com"
            }
        },
        {
            "name": "Marketing Campaign Lead", 
            "data": {
                "email": f"marketing_{uuid.uuid4().hex[:8]}@orgainse.com"
            }
        },
        {
            "name": "Website Visitor Lead",
            "data": {
                "email": f"visitor_{uuid.uuid4().hex[:8]}@orgainse.com"
            }
        }
    ]
    
    for scenario in lead_scenarios:
        try:
            start_time = time.time()
            
            response = requests.post(f"{API_URL}/newsletter", json=scenario["data"])
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                response_data = response.json()
                log_test(f"Lead Type - {scenario['name']}", True,
                        f"Successfully processed {scenario['data']['email']}", response_time)
            else:
                log_test(f"Lead Type - {scenario['name']}", False,
                        f"HTTP {response.status_code}: {response.text}", response_time)
                
        except Exception as e:
            log_test(f"Lead Type - {scenario['name']}", False, f"Exception: {str(e)}")

def test_newsletter_cors_headers():
    """Test CORS headers are properly configured"""
    print("🔍 Testing CORS Headers Configuration")
    print("-" * 50)
    
    try:
        start_time = time.time()
        
        # Test OPTIONS request for CORS preflight
        response = requests.options(f"{API_URL}/newsletter")
        response_time = time.time() - start_time
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        # Check if CORS headers are present
        if cors_headers['Access-Control-Allow-Origin']:
            log_test("CORS Headers - OPTIONS Request", True,
                    f"Origin: {cors_headers['Access-Control-Allow-Origin']}, Methods: {cors_headers['Access-Control-Allow-Methods']}", 
                    response_time)
        else:
            log_test("CORS Headers - OPTIONS Request", False,
                    "Missing CORS headers in OPTIONS response", response_time)
            
        # Test actual POST request CORS headers
        start_time = time.time()
        test_data = {"email": f"cors_test_{uuid.uuid4().hex[:8]}@orgainse.com"}
        response = requests.post(f"{API_URL}/newsletter", json=test_data)
        response_time = time.time() - start_time
        
        post_cors_origin = response.headers.get('Access-Control-Allow-Origin')
        if post_cors_origin:
            log_test("CORS Headers - POST Request", True,
                    f"CORS Origin header present: {post_cors_origin}", response_time)
        else:
            log_test("CORS Headers - POST Request", False,
                    "Missing CORS Origin header in POST response", response_time)
            
    except Exception as e:
        log_test("CORS Headers Test", False, f"Exception: {str(e)}")

def test_newsletter_validation():
    """Test newsletter endpoint validation and error handling"""
    print("🔍 Testing Newsletter Endpoint Validation")
    print("-" * 50)
    
    # Test invalid email format
    try:
        start_time = time.time()
        
        invalid_data = {"email": "invalid-email-format"}
        response = requests.post(f"{API_URL}/newsletter", json=invalid_data)
        response_time = time.time() - start_time
        
        if response.status_code == 422:
            log_test("Email Validation - Invalid Format", True,
                    "Correctly rejected invalid email format with 422 status", response_time)
        else:
            log_test("Email Validation - Invalid Format", False,
                    f"Expected 422, got {response.status_code}", response_time)
            
    except Exception as e:
        log_test("Email Validation - Invalid Format", False, f"Exception: {str(e)}")
    
    # Test missing email field
    try:
        start_time = time.time()
        
        empty_data = {}
        response = requests.post(f"{API_URL}/newsletter", json=empty_data)
        response_time = time.time() - start_time
        
        if response.status_code == 422:
            log_test("Email Validation - Missing Field", True,
                    "Correctly rejected missing email field with 422 status", response_time)
        else:
            log_test("Email Validation - Missing Field", False,
                    f"Expected 422, got {response.status_code}", response_time)
            
    except Exception as e:
        log_test("Email Validation - Missing Field", False, f"Exception: {str(e)}")

def test_newsletter_duplicate_handling():
    """Test duplicate email handling"""
    print("🔍 Testing Newsletter Duplicate Email Handling")
    print("-" * 50)
    
    try:
        # First subscription
        unique_email = f"duplicate_test_{uuid.uuid4().hex[:8]}@orgainse.com"
        
        start_time = time.time()
        response1 = requests.post(f"{API_URL}/newsletter", json={"email": unique_email})
        response_time1 = time.time() - start_time
        
        if response1.status_code == 200:
            log_test("Duplicate Test - First Subscription", True,
                    f"Successfully created subscription for {unique_email}", response_time1)
            
            # Try to subscribe same email again
            start_time = time.time()
            response2 = requests.post(f"{API_URL}/newsletter", json={"email": unique_email})
            response_time2 = time.time() - start_time
            
            if response2.status_code == 409:
                log_test("Duplicate Test - Second Subscription", True,
                        "Correctly rejected duplicate email with 409 status", response_time2)
            else:
                log_test("Duplicate Test - Second Subscription", False,
                        f"Expected 409 for duplicate, got {response2.status_code}", response_time2)
        else:
            log_test("Duplicate Test - First Subscription", False,
                    f"Failed to create initial subscription: {response1.status_code}", response_time1)
            
    except Exception as e:
        log_test("Duplicate Email Handling", False, f"Exception: {str(e)}")

def test_newsletter_response_format():
    """Test that response format matches frontend expectations"""
    print("🔍 Testing Newsletter Response Format")
    print("-" * 50)
    
    try:
        start_time = time.time()
        
        test_email = f"format_test_{uuid.uuid4().hex[:8]}@orgainse.com"
        response = requests.post(f"{API_URL}/newsletter", json={"email": test_email})
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            response_data = response.json()
            
            # Check response structure
            expected_structure = {
                'id': str,
                'email': str,
                'timestamp': str,
                'status': str
            }
            
            structure_valid = True
            structure_details = []
            
            for field, expected_type in expected_structure.items():
                if field not in response_data:
                    structure_valid = False
                    structure_details.append(f"Missing field: {field}")
                elif not isinstance(response_data[field], expected_type):
                    structure_valid = False
                    structure_details.append(f"Wrong type for {field}: expected {expected_type.__name__}, got {type(response_data[field]).__name__}")
                else:
                    structure_details.append(f"✓ {field}: {expected_type.__name__}")
            
            if structure_valid:
                log_test("Response Format Validation", True,
                        f"All fields present with correct types. Status: {response_data['status']}", response_time)
            else:
                log_test("Response Format Validation", False,
                        f"Structure issues: {'; '.join(structure_details)}", response_time)
        else:
            log_test("Response Format Validation", False,
                    f"HTTP {response.status_code}: {response.text}", response_time)
            
    except Exception as e:
        log_test("Response Format Validation", False, f"Exception: {str(e)}")

def test_newsletter_performance():
    """Test newsletter endpoint performance"""
    print("🔍 Testing Newsletter Endpoint Performance")
    print("-" * 50)
    
    response_times = []
    
    # Test multiple requests to check performance consistency
    for i in range(5):
        try:
            start_time = time.time()
            
            test_email = f"perf_test_{i}_{uuid.uuid4().hex[:8]}@orgainse.com"
            response = requests.post(f"{API_URL}/newsletter", json={"email": test_email})
            response_time = time.time() - start_time
            response_times.append(response_time)
            
            if response.status_code == 200:
                log_test(f"Performance Test {i+1}/5", True,
                        f"Response time: {response_time:.3f}s", response_time)
            else:
                log_test(f"Performance Test {i+1}/5", False,
                        f"HTTP {response.status_code}", response_time)
                
        except Exception as e:
            log_test(f"Performance Test {i+1}/5", False, f"Exception: {str(e)}")
    
    # Calculate average response time
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        max_time = max(response_times)
        min_time = min(response_times)
        
        performance_acceptable = avg_time < 1.0  # Less than 1 second average
        
        log_test("Performance Summary", performance_acceptable,
                f"Avg: {avg_time:.3f}s, Min: {min_time:.3f}s, Max: {max_time:.3f}s")

def run_all_tests():
    """Run all newsletter endpoint tests"""
    print("🎯 NEWSLETTER ENDPOINT COMPREHENSIVE TESTING")
    print("=" * 70)
    
    # Run all test functions
    test_newsletter_endpoint()
    test_newsletter_lead_types()
    test_newsletter_cors_headers()
    test_newsletter_validation()
    test_newsletter_duplicate_handling()
    test_newsletter_response_format()
    test_newsletter_performance()
    
    # Print final summary
    print("=" * 70)
    print("📊 NEWSLETTER ENDPOINT TEST SUMMARY")
    print("=" * 70)
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"📈 Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    if failed_tests == 0:
        print("\n🎉 ALL NEWSLETTER ENDPOINT TESTS PASSED!")
        print("✅ Newsletter endpoint is ready for frontend integration")
        print("✅ CORS headers properly configured")
        print("✅ All lead types can be handled")
        print("✅ Response format matches frontend expectations")
        print("✅ Validation and error handling working correctly")
    else:
        print(f"\n⚠️  {failed_tests} test(s) failed - review issues above")
    
    return failed_tests == 0

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)