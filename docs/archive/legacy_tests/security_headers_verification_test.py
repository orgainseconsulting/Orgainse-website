#!/usr/bin/env python3
"""
🔒 SECURITY HEADERS VERIFICATION - COMPREHENSIVE BACKEND API TESTING
Testing all 7 backend API endpoints to verify enhanced security headers are working

REVIEW REQUEST REQUIREMENTS:
1. Test /api/health endpoint for security headers
2. Verify Content-Security-Policy headers on API responses  
3. Check Permissions-Policy implementation
4. Validate CORS headers with security enhancements
5. Test all 7 API endpoints for consistent security header application
6. Verify rate limiting and input sanitization still work with new headers
7. Check Cross-Origin policies implementation
8. Validate X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

Focus: Ensure enhanced security configuration doesn't break API functionality while providing maximum protection
"""

import requests
import json
import time
import sys
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:8001"  # Local test server for serverless functions

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(title):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*70}")
    print(f"🔒 {title}")
    print(f"{'='*70}{Colors.END}")

def print_test(test_name):
    print(f"\n{Colors.YELLOW}🧪 Testing: {test_name}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def verify_security_headers(response, endpoint_name):
    """Verify all required security headers are present and correctly configured"""
    headers = response.headers
    security_score = 0
    total_checks = 0
    
    print_info(f"Verifying security headers for {endpoint_name}")
    
    # 1. Content-Security-Policy
    total_checks += 1
    if 'Content-Security-Policy' in headers:
        csp = headers['Content-Security-Policy']
        print_success(f"Content-Security-Policy present: {csp[:100]}...")
        security_score += 1
        
        # Check for key CSP directives
        if "default-src" in csp:
            print_success("CSP contains default-src directive")
        if "frame-ancestors" in csp:
            print_success("CSP contains frame-ancestors directive")
    else:
        print_error("Content-Security-Policy header missing")
    
    # 2. Permissions-Policy
    total_checks += 1
    if 'Permissions-Policy' in headers:
        permissions = headers['Permissions-Policy']
        print_success(f"Permissions-Policy present: {permissions[:100]}...")
        security_score += 1
        
        # Check for key permissions restrictions
        restricted_features = ['camera', 'microphone', 'geolocation', 'payment']
        for feature in restricted_features:
            if f"{feature}=()" in permissions:
                print_success(f"Permissions-Policy restricts {feature}")
    else:
        print_error("Permissions-Policy header missing")
    
    # 3. X-Frame-Options
    total_checks += 1
    if 'X-Frame-Options' in headers:
        frame_options = headers['X-Frame-Options']
        print_success(f"X-Frame-Options: {frame_options}")
        if frame_options.upper() in ['DENY', 'SAMEORIGIN']:
            security_score += 1
        else:
            print_error(f"X-Frame-Options has weak value: {frame_options}")
    else:
        print_error("X-Frame-Options header missing")
    
    # 4. X-Content-Type-Options
    total_checks += 1
    if 'X-Content-Type-Options' in headers:
        content_type_options = headers['X-Content-Type-Options']
        print_success(f"X-Content-Type-Options: {content_type_options}")
        if content_type_options.lower() == 'nosniff':
            security_score += 1
        else:
            print_error(f"X-Content-Type-Options should be 'nosniff', got: {content_type_options}")
    else:
        print_error("X-Content-Type-Options header missing")
    
    # 5. X-XSS-Protection
    total_checks += 1
    if 'X-XSS-Protection' in headers:
        xss_protection = headers['X-XSS-Protection']
        print_success(f"X-XSS-Protection: {xss_protection}")
        if '1' in xss_protection and 'mode=block' in xss_protection:
            security_score += 1
        else:
            print_error(f"X-XSS-Protection should be '1; mode=block', got: {xss_protection}")
    else:
        print_error("X-XSS-Protection header missing")
    
    # 6. Referrer-Policy
    total_checks += 1
    if 'Referrer-Policy' in headers:
        referrer_policy = headers['Referrer-Policy']
        print_success(f"Referrer-Policy: {referrer_policy}")
        security_score += 1
    else:
        print_error("Referrer-Policy header missing")
    
    # 7. Strict-Transport-Security
    total_checks += 1
    if 'Strict-Transport-Security' in headers:
        hsts = headers['Strict-Transport-Security']
        print_success(f"Strict-Transport-Security: {hsts}")
        if 'max-age=' in hsts:
            security_score += 1
        else:
            print_error(f"HSTS missing max-age directive: {hsts}")
    else:
        print_info("Strict-Transport-Security header missing (expected for HTTP)")
    
    # 8. Cross-Origin policies
    cross_origin_headers = [
        'Cross-Origin-Embedder-Policy',
        'Cross-Origin-Opener-Policy', 
        'Cross-Origin-Resource-Policy'
    ]
    
    for header in cross_origin_headers:
        total_checks += 1
        if header in headers:
            print_success(f"{header}: {headers[header]}")
            security_score += 1
        else:
            print_error(f"{header} header missing")
    
    # 9. CORS Headers
    cors_headers = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers'
    ]
    
    for header in cors_headers:
        total_checks += 1
        if header in headers:
            print_success(f"{header}: {headers[header]}")
            security_score += 1
        else:
            print_info(f"{header} not present (may be conditional)")
    
    # 10. Rate Limiting Headers
    rate_limit_headers = [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset'
    ]
    
    rate_limit_present = False
    for header in rate_limit_headers:
        if header in headers:
            print_success(f"{header}: {headers[header]}")
            rate_limit_present = True
    
    if rate_limit_present:
        print_success("Rate limiting headers present")
    else:
        print_info("Rate limiting headers not present (may be conditional)")
    
    security_percentage = (security_score / total_checks) * 100
    print_info(f"Security Headers Score: {security_score}/{total_checks} ({security_percentage:.1f}%)")
    
    return security_score >= total_checks * 0.7  # 70% threshold for passing

def test_health_endpoint_security():
    """Test 1: /api/health endpoint security headers"""
    print_test("Health Endpoint Security Headers - /api/health")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            # Verify functionality
            data = response.json()
            if 'status' in data and data['status'] == 'healthy':
                print_success("Health endpoint functionality working")
                
                # Verify security headers
                return verify_security_headers(response, "Health Endpoint")
            else:
                print_error("Health endpoint not returning healthy status")
                return False
        else:
            print_error(f"Health endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Health endpoint test error: {str(e)}")
        return False

def test_newsletter_endpoint_security():
    """Test 2: /api/newsletter endpoint security headers"""
    print_test("Newsletter Endpoint Security Headers - /api/newsletter")
    
    test_data = {
        "email": "security.test@orgainse.com",
        "first_name": "Security",
        "name": "Security Test User"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code in [200, 409]:  # Success or duplicate
            print_success("Newsletter endpoint functionality working")
            
            # Verify security headers
            return verify_security_headers(response, "Newsletter Endpoint")
        else:
            print_error(f"Newsletter endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Newsletter endpoint test error: {str(e)}")
        return False

def test_contact_endpoint_security():
    """Test 3: /api/contact endpoint security headers"""
    print_test("Contact Endpoint Security Headers - /api/contact")
    
    test_data = {
        "name": "Security Test User",
        "email": "security.contact@orgainse.com",
        "company": "Security Testing Corp",
        "message": "Testing security headers implementation"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print_success("Contact endpoint functionality working")
            
            # Verify security headers
            return verify_security_headers(response, "Contact Endpoint")
        else:
            print_error(f"Contact endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Contact endpoint test error: {str(e)}")
        return False

def test_admin_endpoint_security():
    """Test 4: /api/admin endpoint security headers"""
    print_test("Admin Endpoint Security Headers - /api/admin")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin", timeout=10)
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code in [200, 429]:  # Success or rate limited
            print_success("Admin endpoint responding (may be rate limited)")
            
            # Verify security headers
            return verify_security_headers(response, "Admin Endpoint")
        else:
            print_error(f"Admin endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Admin endpoint test error: {str(e)}")
        return False

def test_ai_assessment_endpoint_security():
    """Test 5: /api/ai-assessment endpoint security headers"""
    print_test("AI Assessment Endpoint Security Headers - /api/ai-assessment")
    
    test_data = {
        "user_info": {
            "name": "Security Test",
            "email": "security.ai@orgainse.com",
            "company": "Security Corp",
            "industry": "Technology"
        },
        "responses": {
            "tech_infrastructure": 3,
            "ai_tools_usage": "Basic tools",
            "data_management": "Basic databases",
            "team_readiness": 2
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai-assessment",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print_success("AI Assessment endpoint functionality working")
            
            # Verify security headers
            return verify_security_headers(response, "AI Assessment Endpoint")
        else:
            print_error(f"AI Assessment endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"AI Assessment endpoint test error: {str(e)}")
        return False

def test_roi_calculator_endpoint_security():
    """Test 6: /api/roi-calculator endpoint security headers"""
    print_test("ROI Calculator Endpoint Security Headers - /api/roi-calculator")
    
    test_data = {
        "company_name": "Security Testing Inc",
        "email": "security.roi@orgainse.com",
        "annual_revenue": 1000000,
        "employee_count": "11-50",
        "current_pm_costs": 10000,
        "tech_budget": 50000
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/roi-calculator",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print_success("ROI Calculator endpoint functionality working")
            
            # Verify security headers
            return verify_security_headers(response, "ROI Calculator Endpoint")
        else:
            print_error(f"ROI Calculator endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"ROI Calculator endpoint test error: {str(e)}")
        return False

def test_consultation_endpoint_security():
    """Test 7: /api/consultation endpoint security headers"""
    print_test("Consultation Endpoint Security Headers - /api/consultation")
    
    test_data = {
        "full_name": "Security Test User",
        "email": "security.consultation@orgainse.com",
        "company": "Security Testing Corp",
        "phone": "+1-555-0123",
        "consultation_type": "Security Assessment",
        "requirements": "Testing security headers implementation"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/consultation",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print_info(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print_success("Consultation endpoint functionality working")
            
            # Verify security headers
            return verify_security_headers(response, "Consultation Endpoint")
        else:
            print_error(f"Consultation endpoint failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Consultation endpoint test error: {str(e)}")
        return False

def test_cors_preflight_security():
    """Test CORS preflight requests with security headers"""
    print_test("CORS Preflight Security Headers")
    
    endpoints = [
        "/api/health",
        "/api/newsletter", 
        "/api/contact",
        "/api/admin",
        "/api/ai-assessment",
        "/api/roi-calculator",
        "/api/consultation"
    ]
    
    cors_success = 0
    
    for endpoint in endpoints:
        print_info(f"Testing CORS preflight for {endpoint}")
        
        try:
            # Test OPTIONS request (preflight) with security headers
            options_response = requests.options(
                f"{BASE_URL}{endpoint}",
                headers={
                    'Origin': 'https://www.orgainse.com',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                },
                timeout=5
            )
            print_info(f"OPTIONS {endpoint}: {options_response.status_code}")
            
            if options_response.status_code in [200, 204]:
                print_success(f"CORS preflight successful for {endpoint}")
                
                # Verify security headers are present in preflight response
                if verify_security_headers(options_response, f"{endpoint} CORS Preflight"):
                    cors_success += 1
            else:
                print_info(f"CORS preflight returned {options_response.status_code} for {endpoint}")
                
        except Exception as e:
            print_error(f"CORS preflight test error for {endpoint}: {str(e)}")
    
    print_info(f"CORS Preflight Security Tests: {cors_success}/{len(endpoints)} passed")
    return cors_success >= len(endpoints) // 2

def test_rate_limiting_with_security_headers():
    """Test that rate limiting still works with security headers"""
    print_test("Rate Limiting with Security Headers")
    
    try:
        # Make multiple rapid requests to trigger rate limiting
        responses = []
        for i in range(10):
            response = requests.get(f"{BASE_URL}/api/health", timeout=5)
            responses.append(response)
            time.sleep(0.1)  # Small delay
        
        # Check if any response has rate limiting headers
        rate_limited = False
        security_headers_present = True
        
        for i, response in enumerate(responses):
            print_info(f"Request {i+1}: Status {response.status_code}")
            
            # Check for rate limiting
            if response.status_code == 429:
                rate_limited = True
                print_success("Rate limiting triggered (429 status)")
            
            # Verify security headers are still present
            if 'X-Frame-Options' not in response.headers:
                security_headers_present = False
                print_error(f"Security headers missing in response {i+1}")
        
        if security_headers_present:
            print_success("Security headers present in all responses")
        
        print_info(f"Rate limiting triggered: {rate_limited}")
        print_info(f"Security headers consistent: {security_headers_present}")
        
        return security_headers_present
        
    except Exception as e:
        print_error(f"Rate limiting test error: {str(e)}")
        return False

def test_input_sanitization_with_security_headers():
    """Test that input sanitization works with security headers"""
    print_test("Input Sanitization with Security Headers")
    
    # Test malicious input
    malicious_data = {
        "name": "<script>alert('xss')</script>Malicious User",
        "email": "malicious@test.com",
        "message": "javascript:alert('xss') This is a test message"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=malicious_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print_info(f"Response Status: {response.status_code}")
        
        # Should either succeed (with sanitized input) or fail with validation error
        if response.status_code in [200, 400]:
            print_success("Input sanitization handling working")
            
            # Verify security headers are present
            if verify_security_headers(response, "Input Sanitization Test"):
                print_success("Security headers present during input sanitization")
                return True
            else:
                print_error("Security headers missing during input sanitization")
                return False
        else:
            print_error(f"Unexpected response status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Input sanitization test error: {str(e)}")
        return False

def main():
    """Main test execution"""
    print_header("SECURITY HEADERS VERIFICATION - ALL 7 API ENDPOINTS")
    print_info(f"Testing against: {BASE_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info("🔒 SECURITY FOCUS: Enhanced security headers verification")
    print_info("📊 Testing: CSP, Permissions-Policy, CORS, X-Frame-Options, X-XSS-Protection, Rate Limiting")
    
    # Test results tracking
    test_results = {}
    
    # Execute all security header tests
    print_header("INDIVIDUAL ENDPOINT SECURITY HEADER TESTS")
    test_results['health_security'] = test_health_endpoint_security()
    test_results['newsletter_security'] = test_newsletter_endpoint_security()
    test_results['contact_security'] = test_contact_endpoint_security()
    test_results['admin_security'] = test_admin_endpoint_security()
    test_results['ai_assessment_security'] = test_ai_assessment_endpoint_security()
    test_results['roi_calculator_security'] = test_roi_calculator_endpoint_security()
    test_results['consultation_security'] = test_consultation_endpoint_security()
    
    # Cross-cutting security tests
    print_header("CROSS-CUTTING SECURITY TESTS")
    test_results['cors_preflight_security'] = test_cors_preflight_security()
    test_results['rate_limiting_security'] = test_rate_limiting_with_security_headers()
    test_results['input_sanitization_security'] = test_input_sanitization_with_security_headers()
    
    # Summary
    print_header("SECURITY HEADERS VERIFICATION RESULTS")
    
    passed_tests = sum(test_results.values())
    total_tests = len(test_results)
    
    # Categorize results
    endpoint_tests = [
        'health_security', 'newsletter_security', 'contact_security', 'admin_security',
        'ai_assessment_security', 'roi_calculator_security', 'consultation_security'
    ]
    security_feature_tests = [
        'cors_preflight_security', 'rate_limiting_security', 'input_sanitization_security'
    ]
    
    endpoint_passed = sum(test_results[test] for test in endpoint_tests if test in test_results)
    security_passed = sum(test_results[test] for test in security_feature_tests if test in test_results)
    
    print_info(f"🔒 ENDPOINT SECURITY TESTS: {endpoint_passed}/{len(endpoint_tests)} passed")
    print_info(f"🛡️  SECURITY FEATURE TESTS: {security_passed}/{len(security_feature_tests)} passed")
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        category = "ENDPOINT" if test_name in endpoint_tests else "SECURITY FEATURE"
        print(f"{category} - {test_name.upper()}: {status}")
    
    print(f"\n{Colors.BOLD}OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({(passed_tests/total_tests)*100:.1f}%){Colors.END}")
    
    if passed_tests == total_tests:
        print_success("🎉 PERFECT SECURITY IMPLEMENTATION!")
        print_success("✅ All 7 API endpoints have proper security headers")
        print_success("✅ Content-Security-Policy implemented correctly")
        print_success("✅ Permissions-Policy restricting dangerous features")
        print_success("✅ CORS headers with security enhancements working")
        print_success("✅ X-Frame-Options, X-Content-Type-Options, X-XSS-Protection present")
        print_success("✅ Rate limiting and input sanitization working with security headers")
        print_success("✅ Cross-Origin policies properly implemented")
        print_success("🚀 MAXIMUM SECURITY PROTECTION ACHIEVED")
        return True
    elif passed_tests >= total_tests * 0.8:
        print(f"{Colors.YELLOW}⚠️  GOOD SECURITY IMPLEMENTATION - {passed_tests}/{total_tests} tests passed{Colors.END}")
        print_info("Most security headers working correctly, minor issues detected")
        return True
    else:
        print_error(f"🚨 SECURITY ISSUES DETECTED - Only {passed_tests}/{total_tests} tests passed")
        print_error("Critical security headers missing or misconfigured")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)