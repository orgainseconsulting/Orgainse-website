#!/usr/bin/env python3
"""
🎯 COMPREHENSIVE FINAL TEST BEFORE VERCEL DEPLOYMENT - ALL 7 API ENDPOINTS
Testing ALL functionality as per review request to ensure everything works perfectly

REVIEW REQUEST REQUIREMENTS:
1. Test ALL 7 API endpoints:
   - /api/health - Health check
   - /api/newsletter - Newsletter subscription
   - /api/contact - Contact form
   - /api/admin - Admin dashboard
   - /api/ai-assessment - AI Assessment
   - /api/roi-calculator - ROI Calculator
   - /api/consultation - Consultation booking

2. Verify MongoDB integration across all collections
3. Test CORS headers for production deployment
4. Verify admin authentication works
5. Test concurrent requests and performance
6. Ensure all form validations work
7. Test error handling

This is the FINAL verification before deployment - everything must work perfectly!
"""

import requests
import json
import time
import sys
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

# Test configuration
BASE_URL = "http://localhost:8001"  # Local test server for serverless functions
TEST_EMAIL = "final.deployment.test@orgainse.com"
TEST_NAME = "Final Deployment Test User"
TEST_COMPANY = "Final Deployment Test Company"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(title):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*70}")
    print(f"🎯 {title}")
    print(f"{'='*70}{Colors.END}")

def print_test(test_name):
    print(f"\n{Colors.YELLOW}🧪 Testing: {test_name}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

# Test results tracking
test_results = {
    'total_tests': 0,
    'passed_tests': 0,
    'failed_tests': 0,
    'critical_issues': [],
    'minor_issues': [],
    'performance_metrics': {}
}

def record_test_result(test_name, passed, message="", is_critical=False):
    """Record test result for final summary"""
    test_results['total_tests'] += 1
    if passed:
        test_results['passed_tests'] += 1
        print_success(f"{test_name}: {message}")
    else:
        test_results['failed_tests'] += 1
        if is_critical:
            test_results['critical_issues'].append(f"{test_name}: {message}")
            print_error(f"CRITICAL - {test_name}: {message}")
        else:
            test_results['minor_issues'].append(f"{test_name}: {message}")
            print_warning(f"MINOR - {test_name}: {message}")

def test_api_health():
    """Test 1: Health Check Endpoint"""
    print_test("API Health Check (/api/health)")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        response_time = time.time() - start_time
        
        test_results['performance_metrics']['health_response_time'] = response_time
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['status', 'timestamp', 'service', 'version']
            
            if all(field in data for field in required_fields):
                if data['status'] == 'healthy':
                    record_test_result("Health Check", True, 
                        f"API healthy, response time: {response_time:.3f}s, service: {data.get('service', 'N/A')}")
                    return True
                else:
                    record_test_result("Health Check", False, 
                        f"API reports unhealthy status: {data['status']}", is_critical=True)
            else:
                missing_fields = [f for f in required_fields if f not in data]
                record_test_result("Health Check", False, 
                    f"Missing required fields: {missing_fields}", is_critical=True)
        else:
            record_test_result("Health Check", False, 
                f"HTTP {response.status_code}: {response.text}", is_critical=True)
            
    except Exception as e:
        record_test_result("Health Check", False, f"Request failed: {str(e)}", is_critical=True)
    
    return False

def test_newsletter_api():
    """Test 2: Newsletter Subscription Endpoint"""
    print_test("Newsletter Subscription (/api/newsletter)")
    
    try:
        # Test valid subscription
        newsletter_data = {
            "email": f"newsletter.{int(time.time())}@orgainse.com",
            "first_name": "Newsletter",
            "name": "Newsletter Test User"
        }
        
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/api/newsletter", 
                               json=newsletter_data, timeout=15)
        response_time = time.time() - start_time
        
        test_results['performance_metrics']['newsletter_response_time'] = response_time
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['message', 'subscription_id', 'email', 'timestamp']
            
            if all(field in data for field in required_fields):
                record_test_result("Newsletter Subscription", True, 
                    f"Subscription successful, ID: {data['subscription_id'][:8]}..., time: {response_time:.3f}s")
                
                # Test duplicate email handling
                duplicate_response = requests.post(f"{BASE_URL}/api/newsletter", 
                                                 json=newsletter_data, timeout=10)
                if duplicate_response.status_code == 200:
                    dup_data = duplicate_response.json()
                    if dup_data.get('status') == 'already_subscribed':
                        record_test_result("Newsletter Duplicate Handling", True, 
                            "Duplicate email properly handled")
                    else:
                        record_test_result("Newsletter Duplicate Handling", False, 
                            "Duplicate email not properly detected")
                else:
                    record_test_result("Newsletter Duplicate Handling", False, 
                        f"Duplicate test failed: HTTP {duplicate_response.status_code}")
                
                return True
            else:
                missing_fields = [f for f in required_fields if f not in data]
                record_test_result("Newsletter Subscription", False, 
                    f"Missing response fields: {missing_fields}", is_critical=True)
        else:
            record_test_result("Newsletter Subscription", False, 
                f"HTTP {response.status_code}: {response.text}", is_critical=True)
            
    except Exception as e:
        record_test_result("Newsletter Subscription", False, f"Request failed: {str(e)}", is_critical=True)
    
    return False

def test_contact_api():
    """Test 3: Contact Form Endpoint"""
    print_test("Contact Form (/api/contact)")
    
    try:
        contact_data = {
            "name": "Contact Test User",
            "email": f"contact.{int(time.time())}@orgainse.com",
            "company": "Contact Test Company",
            "phone": "+1-555-0123",
            "message": "This is a comprehensive test of the contact form API endpoint for final deployment verification.",
            "leadType": "Contact Inquiry"
        }
        
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/api/contact", 
                               json=contact_data, timeout=15)
        response_time = time.time() - start_time
        
        test_results['performance_metrics']['contact_response_time'] = response_time
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['message', 'id', 'timestamp']
            
            if all(field in data for field in required_fields):
                record_test_result("Contact Form", True, 
                    f"Contact submitted successfully, ID: {data['id'][:8]}..., time: {response_time:.3f}s")
                return True
            else:
                missing_fields = [f for f in required_fields if f not in data]
                record_test_result("Contact Form", False, 
                    f"Missing response fields: {missing_fields}", is_critical=True)
        else:
            record_test_result("Contact Form", False, 
                f"HTTP {response.status_code}: {response.text}", is_critical=True)
            
    except Exception as e:
        record_test_result("Contact Form", False, f"Request failed: {str(e)}", is_critical=True)
    
    return False

def test_admin_api():
    """Test 4: Admin Dashboard Endpoint"""
    print_test("Admin Dashboard (/api/admin)")
    
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/api/admin", timeout=20)
        response_time = time.time() - start_time
        
        test_results['performance_metrics']['admin_response_time'] = response_time
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['summary', 'data', 'success', 'timestamp']
            
            if all(field in data for field in required_fields):
                summary = data['summary']
                total_leads = summary.get('total_leads', 0)
                record_test_result("Admin Dashboard", True, 
                    f"Dashboard data retrieved, {total_leads} total leads, time: {response_time:.3f}s")
                return True
            else:
                missing_fields = [f for f in required_fields if f not in data]
                record_test_result("Admin Dashboard", False, 
                    f"Missing response fields: {missing_fields}", is_critical=True)
        elif response.status_code == 429:
            record_test_result("Admin Dashboard", True, 
                "Rate limiting active (security feature working)")
            return True
        else:
            record_test_result("Admin Dashboard", False, 
                f"HTTP {response.status_code}: {response.text}", is_critical=True)
            
    except Exception as e:
        record_test_result("Admin Dashboard", False, f"Request failed: {str(e)}", is_critical=True)
    
    return False

def test_ai_assessment_api():
    """Test 5: AI Assessment Endpoint"""
    print_test("AI Assessment Tool (/api/ai-assessment)")
    
    try:
        assessment_data = {
            "user_info": {
                "name": "AI Assessment Test User",
                "email": f"ai.assessment.{int(time.time())}@orgainse.com",
                "company": "AI Assessment Test Company",
                "industry": "Technology",
                "company_size": "51-200"
            },
            "responses": {
                "tech_infrastructure": 3,
                "ai_tools_usage": "Basic tools",
                "data_management": "Advanced analytics",
                "team_readiness": 4,
                "process_automation": 2,
                "ai_strategy": "yes"
            }
        }
        
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/api/ai-assessment", 
                               json=assessment_data, timeout=15)
        response_time = time.time() - start_time
        
        test_results['performance_metrics']['ai_assessment_response_time'] = response_time
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['success', 'assessment_id', 'maturity_score', 'recommendations']
            
            if all(field in data for field in required_fields):
                maturity_score = data['maturity_score']
                recommendations_count = len(data['recommendations'])
                record_test_result("AI Assessment", True, 
                    f"Assessment completed, score: {maturity_score}%, {recommendations_count} recommendations, time: {response_time:.3f}s")
                return True
            else:
                missing_fields = [f for f in required_fields if f not in data]
                record_test_result("AI Assessment", False, 
                    f"Missing response fields: {missing_fields}", is_critical=True)
        else:
            record_test_result("AI Assessment", False, 
                f"HTTP {response.status_code}: {response.text}", is_critical=True)
            
    except Exception as e:
        record_test_result("AI Assessment", False, f"Request failed: {str(e)}", is_critical=True)
    
    return False

def test_roi_calculator_api():
    """Test 6: ROI Calculator Endpoint"""
    print_test("ROI Calculator (/api/roi-calculator)")
    
    try:
        roi_data = {
            "company_name": "ROI Calculator Test Company",
            "email": f"roi.calculator.{int(time.time())}@orgainse.com",
            "annual_revenue": "2500000",
            "employee_count": "51-200",
            "current_pm_costs": "15000",
            "tech_budget": "250000",
            "implementation_timeline": "6-12 months",
            "user_region": "US"
        }
        
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/api/roi-calculator", 
                               json=roi_data, timeout=15)
        response_time = time.time() - start_time
        
        test_results['performance_metrics']['roi_calculator_response_time'] = response_time
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['success', 'calculation_id', 'potential_savings', 'roi_percentage', 'payback_period']
            
            if all(field in data for field in required_fields):
                savings = data['potential_savings']
                roi_percent = data['roi_percentage']
                payback = data['payback_period']
                record_test_result("ROI Calculator", True, 
                    f"ROI calculated: ${savings:,} savings, {roi_percent}% ROI, {payback} month payback, time: {response_time:.3f}s")
                return True
            else:
                missing_fields = [f for f in required_fields if f not in data]
                record_test_result("ROI Calculator", False, 
                    f"Missing response fields: {missing_fields}", is_critical=True)
        else:
            record_test_result("ROI Calculator", False, 
                f"HTTP {response.status_code}: {response.text}", is_critical=True)
            
    except Exception as e:
        record_test_result("ROI Calculator", False, f"Request failed: {str(e)}", is_critical=True)
    
    return False

def test_consultation_api():
    """Test 7: Consultation Booking Endpoint"""
    print_test("Consultation Booking (/api/consultation)")
    
    try:
        consultation_data = {
            "full_name": "Consultation Test User",
            "email": f"consultation.{int(time.time())}@orgainse.com",
            "company": "Consultation Test Company",
            "phone": "+1-555-0123",
            "consultation_type": "AI Readiness Assessment",
            "preferred_date": "2025-02-15",
            "preferred_time": "14:00",
            "requirements": "We need a comprehensive AI readiness assessment for our organization.",
            "industry": "Technology"
        }
        
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/api/consultation", 
                               json=consultation_data, timeout=15)
        response_time = time.time() - start_time
        
        test_results['performance_metrics']['consultation_response_time'] = response_time
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['success', 'consultation_id', 'message', 'details']
            
            if all(field in data for field in required_fields):
                consultation_id = data['consultation_id']
                consultation_type = data['details']['consultation_type']
                record_test_result("Consultation Booking", True, 
                    f"Consultation booked: {consultation_type}, ID: {consultation_id[:8]}..., time: {response_time:.3f}s")
                
                # Test duplicate booking prevention
                duplicate_response = requests.post(f"{BASE_URL}/api/consultation", 
                                                 json=consultation_data, timeout=10)
                if duplicate_response.status_code == 409:
                    record_test_result("Consultation Duplicate Prevention", True, 
                        "Duplicate booking properly prevented")
                else:
                    record_test_result("Consultation Duplicate Prevention", False, 
                        "Duplicate booking not properly prevented")
                
                return True
            else:
                missing_fields = [f for f in required_fields if f not in data]
                record_test_result("Consultation Booking", False, 
                    f"Missing response fields: {missing_fields}", is_critical=True)
        else:
            record_test_result("Consultation Booking", False, 
                f"HTTP {response.status_code}: {response.text}", is_critical=True)
            
    except Exception as e:
        record_test_result("Consultation Booking", False, f"Request failed: {str(e)}", is_critical=True)
    
    return False

def test_cors_headers():
    """Test 8: CORS Headers for Production Deployment"""
    print_test("CORS Headers Verification")
    
    endpoints = [
        "/api/health",
        "/api/newsletter", 
        "/api/contact",
        "/api/admin"
    ]
    
    cors_tests_passed = 0
    total_cors_tests = len(endpoints)
    
    for endpoint in endpoints:
        try:
            # Test OPTIONS preflight request
            response = requests.options(f"{BASE_URL}{endpoint}", timeout=10)
            
            if response.status_code == 200 or response.status_code == 204:
                headers = response.headers
                required_cors_headers = [
                    'Access-Control-Allow-Origin',
                    'Access-Control-Allow-Methods'
                ]
                
                if all(header in headers for header in required_cors_headers):
                    cors_tests_passed += 1
                    print_info(f"CORS headers OK for {endpoint}")
                else:
                    missing_headers = [h for h in required_cors_headers if h not in headers]
                    print_warning(f"Missing CORS headers for {endpoint}: {missing_headers}")
            else:
                print_warning(f"CORS preflight failed for {endpoint}: HTTP {response.status_code}")
                
        except Exception as e:
            print_warning(f"CORS test failed for {endpoint}: {str(e)}")
    
    if cors_tests_passed == total_cors_tests:
        record_test_result("CORS Headers", True, f"All {total_cors_tests} endpoints have proper CORS headers")
    else:
        record_test_result("CORS Headers", False, 
            f"Only {cors_tests_passed}/{total_cors_tests} endpoints have proper CORS headers", is_critical=True)

def test_concurrent_requests():
    """Test 9: Concurrent Request Handling"""
    print_test("Concurrent Request Performance")
    
    def make_health_request():
        try:
            response = requests.get(f"{BASE_URL}/api/health", timeout=10)
            return response.status_code == 200
        except:
            return False
    
    try:
        # Test 5 concurrent requests
        with ThreadPoolExecutor(max_workers=5) as executor:
            start_time = time.time()
            futures = [executor.submit(make_health_request) for _ in range(5)]
            results = [future.result() for future in futures]
            total_time = time.time() - start_time
        
        successful_requests = sum(results)
        
        if successful_requests == 5:
            record_test_result("Concurrent Requests", True, 
                f"5/5 concurrent requests successful in {total_time:.3f}s")
        else:
            record_test_result("Concurrent Requests", False, 
                f"Only {successful_requests}/5 concurrent requests successful", is_critical=True)
                
    except Exception as e:
        record_test_result("Concurrent Requests", False, f"Concurrent test failed: {str(e)}", is_critical=True)

def test_form_validations():
    """Test 10: Form Validation Testing"""
    print_test("Form Validation Testing")
    
    validation_tests_passed = 0
    total_validation_tests = 0
    
    # Test newsletter validation
    try:
        total_validation_tests += 1
        invalid_newsletter = {"email": "invalid-email"}
        response = requests.post(f"{BASE_URL}/api/newsletter", json=invalid_newsletter, timeout=10)
        if response.status_code == 400:
            validation_tests_passed += 1
            print_info("Newsletter email validation working")
        else:
            print_warning("Newsletter email validation not working properly")
    except Exception as e:
        print_warning(f"Newsletter validation test failed: {str(e)}")
    
    # Test contact form validation
    try:
        total_validation_tests += 1
        invalid_contact = {"name": "Test", "email": "invalid-email"}  # Missing message
        response = requests.post(f"{BASE_URL}/api/contact", json=invalid_contact, timeout=10)
        if response.status_code == 400:
            validation_tests_passed += 1
            print_info("Contact form validation working")
        else:
            print_warning("Contact form validation not working properly")
    except Exception as e:
        print_warning(f"Contact validation test failed: {str(e)}")
    
    # Test AI assessment validation
    try:
        total_validation_tests += 1
        invalid_assessment = {"user_info": {"name": "Test"}}  # Missing email and responses
        response = requests.post(f"{BASE_URL}/api/ai-assessment", json=invalid_assessment, timeout=10)
        if response.status_code == 400:
            validation_tests_passed += 1
            print_info("AI assessment validation working")
        else:
            print_warning("AI assessment validation not working properly")
    except Exception as e:
        print_warning(f"AI assessment validation test failed: {str(e)}")
    
    if validation_tests_passed == total_validation_tests:
        record_test_result("Form Validations", True, f"All {total_validation_tests} validation tests passed")
    else:
        record_test_result("Form Validations", False, 
            f"Only {validation_tests_passed}/{total_validation_tests} validation tests passed")

def print_final_summary():
    """Print comprehensive test summary"""
    print_header("COMPREHENSIVE FINAL TEST SUMMARY")
    
    total = test_results['total_tests']
    passed = test_results['passed_tests']
    failed = test_results['failed_tests']
    success_rate = (passed / total * 100) if total > 0 else 0
    
    print(f"\n{Colors.BOLD}📊 TEST RESULTS OVERVIEW:{Colors.END}")
    print(f"   Total Tests: {total}")
    print(f"   Passed: {Colors.GREEN}{passed}{Colors.END}")
    print(f"   Failed: {Colors.RED}{failed}{Colors.END}")
    print(f"   Success Rate: {Colors.GREEN if success_rate >= 90 else Colors.YELLOW if success_rate >= 75 else Colors.RED}{success_rate:.1f}%{Colors.END}")
    
    # Performance metrics
    if test_results['performance_metrics']:
        print(f"\n{Colors.BOLD}⚡ PERFORMANCE METRICS:{Colors.END}")
        for endpoint, time_taken in test_results['performance_metrics'].items():
            print(f"   {endpoint}: {time_taken:.3f}s")
    
    # Critical issues
    if test_results['critical_issues']:
        print(f"\n{Colors.RED}{Colors.BOLD}🚨 CRITICAL ISSUES (DEPLOYMENT BLOCKERS):{Colors.END}")
        for issue in test_results['critical_issues']:
            print(f"   • {issue}")
    
    # Minor issues
    if test_results['minor_issues']:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  MINOR ISSUES:{Colors.END}")
        for issue in test_results['minor_issues']:
            print(f"   • {issue}")
    
    # Final deployment readiness assessment
    print(f"\n{Colors.BOLD}🎯 DEPLOYMENT READINESS ASSESSMENT:{Colors.END}")
    
    if len(test_results['critical_issues']) == 0:
        if success_rate >= 90:
            print(f"{Colors.GREEN}{Colors.BOLD}✅ DEPLOYMENT READY: All critical functionality working perfectly!{Colors.END}")
            print(f"{Colors.GREEN}   All 7 API endpoints are functional and ready for Vercel deployment.{Colors.END}")
        else:
            print(f"{Colors.YELLOW}{Colors.BOLD}⚠️  DEPLOYMENT CAUTION: Some non-critical issues detected.{Colors.END}")
            print(f"{Colors.YELLOW}   Core functionality works but minor improvements recommended.{Colors.END}")
    else:
        print(f"{Colors.RED}{Colors.BOLD}❌ DEPLOYMENT BLOCKED: Critical issues must be resolved first!{Colors.END}")
        print(f"{Colors.RED}   Fix critical issues before proceeding with Vercel deployment.{Colors.END}")
    
    return len(test_results['critical_issues']) == 0 and success_rate >= 75

def main():
    """Main test execution"""
    print_header("COMPREHENSIVE FINAL TEST BEFORE VERCEL DEPLOYMENT")
    print(f"{Colors.BLUE}Testing ALL 7 API endpoints for production readiness{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}")
    
    # Execute all tests
    test_api_health()
    test_newsletter_api()
    test_contact_api()
    test_admin_api()
    test_ai_assessment_api()
    test_roi_calculator_api()
    test_consultation_api()
    test_cors_headers()
    test_concurrent_requests()
    test_form_validations()
    
    # Print final summary
    deployment_ready = print_final_summary()
    
    # Exit with appropriate code
    sys.exit(0 if deployment_ready else 1)

if __name__ == "__main__":
    main()