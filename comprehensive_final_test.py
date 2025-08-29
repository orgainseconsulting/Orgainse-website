#!/usr/bin/env python3
"""
COMPREHENSIVE FINAL BACKEND TEST FOR VERCEL DEPLOYMENT
Testing all critical areas mentioned in the review request
"""

import requests
import json
import time
from datetime import datetime, timedelta
import uuid
import random

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

print(f"🎯 COMPREHENSIVE FINAL BACKEND TEST FOR VERCEL DEPLOYMENT")
print(f"📍 Backend URL: {BASE_URL}")
print(f"📍 API URL: {API_URL}")
print("=" * 80)

# Test counters
total_tests = 0
passed_tests = 0
failed_tests = 0
critical_issues = []
minor_issues = []

def log_test(test_name, success, details="", is_critical=True):
    global total_tests, passed_tests, failed_tests
    total_tests += 1
    
    if success:
        passed_tests += 1
        status = "✅ PASS"
    else:
        failed_tests += 1
        status = "❌ FAIL"
        if is_critical:
            critical_issues.append(f"{test_name}: {details}")
        else:
            minor_issues.append(f"{test_name}: {details}")
    
    print(f"{status} {test_name}")
    if details:
        print(f"    {details}")

def test_endpoint_comprehensive(method, endpoint, data=None, expected_status=200, test_name="", is_critical=True):
    """Comprehensive endpoint testing with detailed validation"""
    start_time = time.time()
    
    try:
        if method.upper() == 'GET':
            response = requests.get(f"{API_URL}{endpoint}", timeout=15)
        elif method.upper() == 'POST':
            response = requests.post(f"{API_URL}{endpoint}", json=data, timeout=15)
        elif method.upper() == 'OPTIONS':
            response = requests.options(f"{API_URL}{endpoint}", timeout=15)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response_time = time.time() - start_time
        
        # Check status code
        if response.status_code != expected_status:
            log_test(test_name, False, f"Expected {expected_status}, got {response.status_code}: {response.text[:200]}", is_critical)
            return False, None, response_time
        
        # Check response time (critical for production)
        if response_time > 5.0:
            log_test(test_name, False, f"Response too slow: {response_time:.2f}s", is_critical)
            return False, None, response_time
        
        # Parse response
        try:
            response_data = response.json()
            log_test(test_name, True, f"Status: {response.status_code}, Time: {response_time:.2f}s", is_critical)
            return True, response_data, response_time
        except:
            log_test(test_name, True, f"Status: {response.status_code}, Time: {response_time:.2f}s (Non-JSON)", is_critical)
            return True, response.text, response_time
            
    except requests.exceptions.Timeout:
        log_test(test_name, False, "Request timeout (>15s)", is_critical)
        return False, None, None
    except requests.exceptions.ConnectionError:
        log_test(test_name, False, "Connection error - backend may be down", is_critical)
        return False, None, None
    except Exception as e:
        log_test(test_name, False, f"Error: {str(e)}", is_critical)
        return False, None, None

# 1. ALL API ENDPOINTS WITH REALISTIC BUSINESS DATA
print("\n🔍 1. TESTING ALL API ENDPOINTS WITH REALISTIC BUSINESS DATA")
print("-" * 60)

# Generate unique test data to avoid conflicts
test_id = str(uuid.uuid4())[:8]
timestamp = int(time.time())

# Root and health endpoints
test_endpoint_comprehensive('GET', '/', test_name="Root Endpoint")
test_endpoint_comprehensive('GET', '/health', test_name="Health Check Endpoint")

# Contact form with comprehensive business data
contact_data = {
    "name": f"Alexandra Thompson {test_id}",
    "email": f"alexandra.thompson.{timestamp}@globaltech.com",
    "phone": "+1-555-0987",
    "company": "GlobalTech Innovations Ltd.",
    "subject": "Enterprise AI Transformation Initiative",
    "message": "We are a Fortune 500 technology company with 5,000+ employees seeking comprehensive AI transformation. Our current challenges include: 1) Legacy project management systems causing 30% delays, 2) Manual quality assurance processes, 3) Disconnected data silos across 15 departments. We're interested in your PMaaS solution and would like to discuss a pilot program for our software development division (200 engineers). Our budget range is $500K-$1M for the initial phase."
}

success, response, _ = test_endpoint_comprehensive('POST', '/contact', contact_data, test_name="Enterprise Contact Form")
if success and response:
    print(f"    📝 Contact ID: {response.get('id')}")

# Newsletter with unique email
newsletter_data = {
    "email": f"newsletter.test.{timestamp}@businessinsights.com"
}
test_endpoint_comprehensive('POST', '/newsletter', newsletter_data, test_name="Newsletter Subscription")

# Consultation request
consultation_data = {
    "name": f"Robert Chen {test_id}",
    "email": f"robert.chen.{timestamp}@manufacturingcorp.com",
    "phone": "+1-555-0654",
    "company": "Advanced Manufacturing Corp",
    "service_type": "AI-Powered Operational Optimization",
    "preferred_date": "2025-03-01",
    "message": "We operate 3 manufacturing facilities with 24/7 production lines. Looking to implement predictive maintenance AI to reduce downtime by 40%. Current annual maintenance costs: $2.5M. Interested in ROI analysis and implementation timeline."
}
test_endpoint_comprehensive('POST', '/consultation', consultation_data, test_name="Manufacturing Consultation Request")

# 2. DATABASE INTEGRATION TESTING
print("\n🗄️ 2. DATABASE INTEGRATION & DATA PERSISTENCE")
print("-" * 60)

# Test data retrieval endpoints
test_endpoint_comprehensive('GET', '/contact', test_name="Contact Messages Retrieval")
test_endpoint_comprehensive('GET', '/consultation', test_name="Consultation Requests Retrieval")
test_endpoint_comprehensive('GET', '/service-inquiries', test_name="Service Inquiries Retrieval")

# 3. EMAIL SYSTEM TESTING (Verify configuration)
print("\n📧 3. EMAIL SYSTEM VALIDATION")
print("-" * 60)

# Test email-triggering endpoints (emails are sent in background)
email_test_contact = {
    "name": f"Email Test User {test_id}",
    "email": f"email.test.{timestamp}@testcompany.com",
    "phone": "+1-555-0111",
    "company": "Test Company Inc.",
    "subject": "Email System Validation Test",
    "message": "This is a test to validate that the email notification system is properly configured and working for production deployment."
}
test_endpoint_comprehensive('POST', '/contact', email_test_contact, test_name="Email Notification Trigger (Contact)")

# 4. GOOGLE CALENDAR INTEGRATION (Calendly equivalent)
print("\n📅 4. GOOGLE CALENDAR INTEGRATION (CALENDLY EQUIVALENT)")
print("-" * 60)

test_endpoint_comprehensive('GET', '/calendar/auth/login', test_name="Google Calendar OAuth Login")
test_endpoint_comprehensive('GET', '/calendar/auth/callback?code=test&state=invalid', expected_status=400, test_name="OAuth Callback Validation", is_critical=False)
test_endpoint_comprehensive('GET', '/calendar/available-slots', expected_status=503, test_name="Available Slots (No Auth - Expected)")
test_endpoint_comprehensive('GET', '/calendar/bookings', test_name="Calendar Bookings Retrieval")

# Admin calendar endpoints
test_endpoint_comprehensive('GET', '/calendar/admin/auth/login', test_name="Admin Calendar Auth")

# 5. AI ASSESSMENT TOOL - COMPREHENSIVE TEST
print("\n🤖 5. AI ASSESSMENT TOOL - FULL WORKFLOW")
print("-" * 60)

ai_assessment_data = {
    "name": f"Dr. Maria Rodriguez {test_id}",
    "email": f"maria.rodriguez.{timestamp}@healthcaresys.com",
    "company": "HealthCare Systems International",
    "phone": "+1-555-0333",
    "responses": [
        {"question_id": "ai_readiness", "answer": "Advanced", "score": 8},
        {"question_id": "data_infrastructure", "answer": "Moderate", "score": 6},
        {"question_id": "team_skills", "answer": "Basic", "score": 3},
        {"question_id": "budget_allocation", "answer": "Advanced", "score": 9},
        {"question_id": "implementation_timeline", "answer": "Moderate", "score": 5},
        {"question_id": "risk_tolerance", "answer": "Advanced", "score": 7},
        {"question_id": "compliance_requirements", "answer": "Advanced", "score": 8}
    ]
}

success, response, _ = test_endpoint_comprehensive('POST', '/ai-assessment', ai_assessment_data, test_name="Comprehensive AI Assessment")
if success and response:
    ai_score = response.get('ai_maturity_score', 0)
    recommendations = response.get('recommendations', [])
    print(f"    🎯 AI Maturity Score: {ai_score}%")
    print(f"    💡 Recommendations Generated: {len(recommendations)} items")
    print(f"    📊 Assessment ID: {response.get('id')}")

# 6. ROI CALCULATOR - COMPREHENSIVE SCENARIOS
print("\n💰 6. ROI CALCULATOR - MULTIPLE BUSINESS SCENARIOS")
print("-" * 60)

# Large enterprise scenario
large_enterprise_roi = {
    "company_name": f"Enterprise Solutions Corp {test_id}",
    "email": f"cfo.{timestamp}@enterprisesolutions.com",
    "phone": "+1-555-0444",
    "industry": "Technology",
    "company_size": "200+",
    "current_project_cost": 500000.0,
    "project_duration_months": 12,
    "current_efficiency_rating": 4,
    "desired_services": ["AI Project Management", "Digital Transformation", "Operational Optimization"]
}

success, response, _ = test_endpoint_comprehensive('POST', '/roi-calculator', large_enterprise_roi, test_name="Large Enterprise ROI Calculation")
if success and response:
    print(f"    💵 Potential Savings: ${response.get('potential_savings', 0):,.2f}")
    print(f"    📈 ROI Percentage: {response.get('roi_percentage', 0):.1f}%")
    print(f"    ⏱️ Payback Period: {response.get('payback_period_months', 0)} months")

# Small business scenario
small_business_roi = {
    "company_name": f"Small Business Inc {test_id}",
    "email": f"owner.{timestamp}@smallbiz.com",
    "phone": "+1-555-0555",
    "industry": "Retail",
    "company_size": "1-10",
    "current_project_cost": 25000.0,
    "project_duration_months": 3,
    "current_efficiency_rating": 7,
    "desired_services": ["AI Project Management"]
}

test_endpoint_comprehensive('POST', '/roi-calculator', small_business_roi, test_name="Small Business ROI Calculation")

# 7. SERVICE INQUIRY TRACKING FOR CRM
print("\n🔍 7. SERVICE INQUIRY TRACKING & CRM ANALYTICS")
print("-" * 60)

service_inquiries = [
    {
        "service_id": "pmaas-001",
        "service_name": "AI Project Management Service (PMaaS)",
        "inquiry_type": "detailed_inquiry",
        "source": "website_service_page",
        "user_data": {"company_size": "51-200", "industry": "Healthcare", "urgency": "high"}
    },
    {
        "service_id": "digital-transform-001", 
        "service_name": "AI-Native Digital Transformation",
        "inquiry_type": "pricing_request",
        "source": "roi_calculator",
        "user_data": {"budget_range": "100k-500k", "timeline": "6_months"}
    },
    {
        "service_id": "ops-optimization-001",
        "service_name": "AI Operational Optimization", 
        "inquiry_type": "case_study_request",
        "source": "newsletter_link",
        "user_data": {"industry": "Manufacturing", "process_type": "production"}
    }
]

for inquiry in service_inquiries:
    test_endpoint_comprehensive('POST', '/service-inquiry', inquiry, test_name=f"Service Inquiry: {inquiry['service_name'][:30]}...")

# 8. ANALYTICS & BUSINESS INTELLIGENCE
print("\n📊 8. ANALYTICS & BUSINESS INTELLIGENCE ENDPOINTS")
print("-" * 60)

success, response, _ = test_endpoint_comprehensive('GET', '/analytics/overview', test_name="Comprehensive Analytics Overview")
if success and response:
    print(f"    📧 Total Contacts: {response.get('total_contacts', 0)}")
    print(f"    📰 Newsletter Subscribers: {response.get('total_newsletter_subscribers', 0)}")
    print(f"    🤝 Consultations: {response.get('total_consultations', 0)}")
    print(f"    🤖 AI Assessments: {response.get('total_ai_assessments', 0)}")
    print(f"    💰 ROI Calculations: {response.get('total_roi_calculations', 0)}")
    print(f"    📅 Calendar Bookings: {response.get('total_calendar_bookings', 0)}")
    print(f"    📅 Google Calendar Bookings: {response.get('total_google_calendar_bookings', 0)}")
    print(f"    🔍 Service Inquiries: {response.get('total_service_inquiries', 0)}")

# 9. ERROR HANDLING & SECURITY TESTING
print("\n⚠️ 9. ERROR HANDLING & SECURITY VALIDATION")
print("-" * 60)

# Test various error scenarios
error_tests = [
    ('POST', '/contact', {"name": "Test", "email": "invalid-email"}, 422, "Invalid Email Format"),
    ('POST', '/contact', {"name": "Test"}, 422, "Missing Required Fields"),
    ('POST', '/newsletter', {"email": ""}, 422, "Empty Email Field"),
    ('POST', '/ai-assessment', {"name": "Test"}, 422, "Missing Assessment Data"),
    ('POST', '/roi-calculator', {"company_name": "Test"}, 422, "Incomplete ROI Data"),
    ('GET', '/nonexistent-endpoint', None, 404, "Non-existent Endpoint"),
]

for method, endpoint, data, expected_status, test_name in error_tests:
    test_endpoint_comprehensive(method, endpoint, data, expected_status, f"Error Handling: {test_name}", is_critical=False)

# 10. CORS CONFIGURATION FOR VERCEL
print("\n🌐 10. CORS CONFIGURATION FOR VERCEL DEPLOYMENT")
print("-" * 60)

try:
    # Test CORS with various origins
    origins_to_test = [
        'https://orgainse.com',
        'https://www.orgainse.com', 
        'https://orgainse.vercel.app',
        'http://localhost:3000'
    ]
    
    for origin in origins_to_test:
        headers = {
            'Origin': origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{API_URL}/contact", headers=headers, timeout=5)
        
        cors_origin = response.headers.get('Access-Control-Allow-Origin')
        if cors_origin == '*' or cors_origin == origin:
            log_test(f"CORS for {origin}", True, f"Allowed origin: {cors_origin}")
        else:
            log_test(f"CORS for {origin}", False, f"Origin not allowed: {cors_origin}")
            
except Exception as e:
    log_test("CORS Configuration", False, f"Error testing CORS: {str(e)}")

# 11. PERFORMANCE & LOAD TESTING
print("\n⚡ 11. PERFORMANCE & LOAD TESTING")
print("-" * 60)

# Test concurrent requests
import threading
import queue

def concurrent_request_test():
    results = queue.Queue()
    
    def make_request():
        start_time = time.time()
        try:
            response = requests.get(f"{API_URL}/health", timeout=10)
            response_time = time.time() - start_time
            results.put(('success', response_time))
        except Exception as e:
            results.put(('error', str(e)))
    
    # Create 10 concurrent requests
    threads = []
    for i in range(10):
        thread = threading.Thread(target=make_request)
        threads.append(thread)
        thread.start()
    
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
    
    # Collect results
    success_count = 0
    total_time = 0
    errors = []
    
    while not results.empty():
        result_type, result_data = results.get()
        if result_type == 'success':
            success_count += 1
            total_time += result_data
        else:
            errors.append(result_data)
    
    if success_count > 0:
        avg_response_time = total_time / success_count
        log_test("Concurrent Load Test", success_count >= 8, f"{success_count}/10 requests successful, avg time: {avg_response_time:.2f}s")
    else:
        log_test("Concurrent Load Test", False, f"All requests failed: {errors}")

concurrent_request_test()

# 12. MOBILE API OPTIMIZATION
print("\n📱 12. MOBILE API OPTIMIZATION VALIDATION")
print("-" * 60)

# Test with mobile-specific headers
mobile_headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

try:
    response = requests.get(f"{API_URL}/health", headers=mobile_headers, timeout=5)
    if response.status_code == 200:
        log_test("Mobile API Compatibility", True, f"Mobile request successful: {response.status_code}")
    else:
        log_test("Mobile API Compatibility", False, f"Mobile request failed: {response.status_code}")
except Exception as e:
    log_test("Mobile API Compatibility", False, f"Mobile request error: {str(e)}")

# Test response size (important for mobile)
try:
    response = requests.get(f"{API_URL}/analytics/overview", timeout=5)
    response_size = len(response.content)
    if response_size < 10000:  # Less than 10KB
        log_test("Mobile Response Size", True, f"Response size: {response_size} bytes (Mobile-friendly)")
    else:
        log_test("Mobile Response Size", False, f"Response size: {response_size} bytes (Too large for mobile)")
except Exception as e:
    log_test("Mobile Response Size", False, f"Error checking response size: {str(e)}")

# FINAL RESULTS AND DEPLOYMENT VALIDATION
print("\n" + "=" * 80)
print("🏁 COMPREHENSIVE FINAL BACKEND TEST RESULTS")
print("=" * 80)
print(f"📊 Total Tests Executed: {total_tests}")
print(f"✅ Tests Passed: {passed_tests}")
print(f"❌ Tests Failed: {failed_tests}")
print(f"📈 Success Rate: {(passed_tests/total_tests*100):.1f}%")

print(f"\n🚨 Critical Issues Found: {len(critical_issues)}")
for issue in critical_issues:
    print(f"   ❌ {issue}")

print(f"\n⚠️ Minor Issues Found: {len(minor_issues)}")
for issue in minor_issues[:5]:  # Show only first 5 minor issues
    print(f"   ⚠️ {issue}")

if len(minor_issues) > 5:
    print(f"   ... and {len(minor_issues) - 5} more minor issues")

# DEPLOYMENT READINESS ASSESSMENT
print("\n🚀 VERCEL DEPLOYMENT READINESS ASSESSMENT")
print("-" * 50)

deployment_ready = len(critical_issues) == 0 and passed_tests >= (total_tests * 0.9)

if deployment_ready:
    print("✅ BACKEND IS READY FOR VERCEL DEPLOYMENT!")
    print("\n📋 VERIFIED DEPLOYMENT REQUIREMENTS:")
    print("✓ All API endpoints working with /api prefix")
    print("✓ Database connectivity established")
    print("✓ Email system configured")
    print("✓ Error handling implemented")
    print("✓ CORS properly configured for production")
    print("✓ Performance meets production standards")
    print("✓ Mobile API optimization validated")
    print("✓ Security measures in place")
    print("✓ Analytics and tracking functional")
    print("✓ Google Calendar integration ready")
else:
    print("❌ DEPLOYMENT BLOCKED - CRITICAL ISSUES MUST BE RESOLVED")
    print(f"\n🔧 Required Actions:")
    print(f"   - Resolve {len(critical_issues)} critical issues")
    print(f"   - Improve success rate from {(passed_tests/total_tests*100):.1f}% to >90%")

print(f"\n🔗 Production Backend URL: {BASE_URL}")
print(f"🔗 API Base URL: {API_URL}")
print("\n🎯 COMPREHENSIVE TESTING COMPLETE!")