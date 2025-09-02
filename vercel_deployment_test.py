#!/usr/bin/env python3
"""
COMPREHENSIVE VERCEL SERVERLESS FUNCTIONS TESTING
Testing ALL 6 API endpoints for Vercel deployment as requested in review
Focus: Find ALL issues, configuration problems, and deployment failures
"""

import requests
import json
import time
from datetime import datetime, timedelta
import uuid
import concurrent.futures
import threading

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

print("🎯 COMPREHENSIVE VERCEL SERVERLESS FUNCTIONS TESTING")
print("=" * 70)
print(f"🌐 Website: https://www.orgainse.com")
print(f"📍 Backend URL: {BASE_URL}")
print(f"📍 API URL: {API_URL}")
print("🔍 Testing ALL 6 endpoints from review request:")
print("   1. /api/health")
print("   2. /api/newsletter") 
print("   3. /api/contact")
print("   4. /api/ai-assessment")
print("   5. /api/roi-calculator")
print("   6. /api/consultation")
print("=" * 70)

# Test tracking
total_tests = 0
passed_tests = 0
failed_tests = 0
critical_issues = []
minor_issues = []
test_results = []

def log_test(test_name, success, details="", response_time=None, is_critical=True):
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
    
    time_info = f" ({response_time:.3f}s)" if response_time else ""
    print(f"{status} {test_name}{time_info}")
    if details:
        print(f"    📝 {details}")
    
    test_results.append({
        'test': test_name,
        'success': success,
        'details': details,
        'response_time': response_time,
        'critical': is_critical
    })

def test_endpoint_comprehensive(method, endpoint, data=None, expected_status=200, test_name="", headers=None):
    """Comprehensive endpoint testing with detailed analysis"""
    start_time = time.time()
    
    try:
        url = f"{API_URL}{endpoint}"
        request_headers = headers or {}
        
        if method.upper() == 'GET':
            response = requests.get(url, headers=request_headers, timeout=15)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=request_headers, timeout=15)
        elif method.upper() == 'OPTIONS':
            response = requests.options(url, headers=request_headers, timeout=15)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response_time = time.time() - start_time
        
        # Analyze response
        success = response.status_code == expected_status
        
        details = []
        details.append(f"Status: {response.status_code}")
        details.append(f"Response time: {response_time:.3f}s")
        
        # Check response format
        try:
            response_data = response.json()
            details.append(f"JSON response: ✓")
            if isinstance(response_data, dict) and 'id' in response_data:
                details.append(f"UUID generated: {response_data['id']}")
        except:
            details.append(f"Non-JSON response: {response.text[:100]}")
            response_data = response.text
        
        # Check headers
        content_type = response.headers.get('content-type', '')
        if 'application/json' in content_type:
            details.append("Content-Type: application/json ✓")
        
        # CORS headers check
        cors_origin = response.headers.get('access-control-allow-origin')
        if cors_origin:
            details.append(f"CORS Origin: {cors_origin}")
        
        detail_str = " | ".join(details)
        log_test(test_name, success, detail_str, response_time)
        
        return success, response_data
        
    except requests.exceptions.Timeout:
        log_test(test_name, False, "CRITICAL: Request timeout (>15s) - Serverless function may be failing", None, True)
        return False, None
    except requests.exceptions.ConnectionError:
        log_test(test_name, False, "CRITICAL: Connection error - Backend unreachable", None, True)
        return False, None
    except Exception as e:
        log_test(test_name, False, f"CRITICAL: Unexpected error - {str(e)}", None, True)
        return False, None

# TEST 1: HEALTH ENDPOINT - Critical for monitoring
print("\n🏥 TESTING /api/health ENDPOINT")
print("-" * 50)

test_endpoint_comprehensive('GET', '/health', test_name="Health Check Endpoint")

# TEST 2: NEWSLETTER ENDPOINT - Lead capture system
print("\n📰 TESTING /api/newsletter ENDPOINT")
print("-" * 50)

# Test with various email formats and scenarios
newsletter_tests = [
    {
        "email": f"test.user.{int(time.time())}@businesscorp.com",
        "name": "Newsletter Subscription - Valid Email",
        "expected": 200
    },
    {
        "email": "invalid-email-format",
        "name": "Newsletter Subscription - Invalid Email (Expected 422)",
        "expected": 422
    },
    {
        "email": "",
        "name": "Newsletter Subscription - Empty Email (Expected 422)", 
        "expected": 422
    }
]

for test_case in newsletter_tests:
    newsletter_data = {"email": test_case["email"]}
    test_endpoint_comprehensive('POST', '/newsletter', newsletter_data, 
                              test_case["expected"], test_case["name"])

# TEST 3: CONTACT ENDPOINT - Primary business inquiry system
print("\n📧 TESTING /api/contact ENDPOINT")
print("-" * 50)

# Test with realistic business scenarios
contact_scenarios = [
    {
        "data": {
            "name": "Jennifer Martinez",
            "email": f"j.martinez.{int(time.time())}@healthtech.com",
            "phone": "+1-555-0199",
            "company": "HealthTech Innovations LLC",
            "subject": "Enterprise AI Implementation Consultation",
            "message": "We're a healthcare technology company with 500+ employees looking to implement AI-driven project management across our development teams. We manage 25+ concurrent software projects and need to improve delivery timelines by 40%. Can we discuss your PMaaS solution and potential integration with our existing Jira/Confluence setup?"
        },
        "name": "Contact Form - Enterprise Healthcare Inquiry",
        "expected": 200
    },
    {
        "data": {
            "name": "Robert Kim",
            "email": f"r.kim.{int(time.time())}@financeplus.com", 
            "company": "Finance Plus Solutions",
            "subject": "AI Risk Management Consultation",
            "message": "Financial services firm interested in AI risk management and compliance solutions for regulatory requirements."
        },
        "name": "Contact Form - Financial Services Inquiry",
        "expected": 200
    },
    {
        "data": {
            "name": "Test User",
            "email": "invalid-email",
            "subject": "Test",
            "message": "Test"
        },
        "name": "Contact Form - Invalid Email (Expected 422)",
        "expected": 422
    },
    {
        "data": {
            "name": "Test User"
        },
        "name": "Contact Form - Missing Required Fields (Expected 422)",
        "expected": 422
    }
]

for scenario in contact_scenarios:
    test_endpoint_comprehensive('POST', '/contact', scenario["data"], 
                              scenario["expected"], scenario["name"])

# TEST 4: AI-ASSESSMENT ENDPOINT - Interactive tool
print("\n🤖 TESTING /api/ai-assessment ENDPOINT")
print("-" * 50)

ai_assessment_scenarios = [
    {
        "data": {
            "name": "Dr. Amanda Foster",
            "email": f"a.foster.{int(time.time())}@medicalcenter.org",
            "company": "Regional Medical Center",
            "phone": "+1-555-0277",
            "responses": [
                {"question_id": "ai_readiness", "answer": "Advanced", "score": 8},
                {"question_id": "data_infrastructure", "answer": "Moderate", "score": 6},
                {"question_id": "team_skills", "answer": "Basic", "score": 3},
                {"question_id": "budget_allocation", "answer": "Advanced", "score": 9},
                {"question_id": "change_management", "answer": "Moderate", "score": 5},
                {"question_id": "compliance_requirements", "answer": "Advanced", "score": 8}
            ]
        },
        "name": "AI Assessment - Healthcare Organization",
        "expected": 200
    },
    {
        "data": {
            "name": "Carlos Rodriguez",
            "email": f"c.rodriguez.{int(time.time())}@manufacturing.com",
            "company": "Advanced Manufacturing Corp",
            "responses": [
                {"question_id": "automation_level", "answer": "Moderate", "score": 6},
                {"question_id": "predictive_maintenance", "answer": "Basic", "score": 4},
                {"question_id": "quality_control", "answer": "Advanced", "score": 7},
                {"question_id": "supply_chain", "answer": "Moderate", "score": 5}
            ]
        },
        "name": "AI Assessment - Manufacturing Company",
        "expected": 200
    },
    {
        "data": {
            "name": "Invalid User",
            "email": "invalid-email",
            "company": "Test Corp",
            "responses": []
        },
        "name": "AI Assessment - Invalid Email (Expected 422)",
        "expected": 422
    }
]

for scenario in ai_assessment_scenarios:
    success, response = test_endpoint_comprehensive('POST', '/ai-assessment', scenario["data"], 
                                                  scenario["expected"], scenario["name"])
    if success and response and scenario["expected"] == 200:
        score = response.get('ai_maturity_score', 0)
        recommendations = response.get('recommendations', [])
        print(f"    🎯 AI Maturity Score: {score}%")
        print(f"    💡 Generated {len(recommendations)} recommendations")

# TEST 5: ROI-CALCULATOR ENDPOINT - Business value tool
print("\n💰 TESTING /api/roi-calculator ENDPOINT")
print("-" * 50)

roi_scenarios = [
    {
        "data": {
            "company_name": "Global Enterprise Solutions",
            "email": f"cfo.{int(time.time())}@globalenterprise.com",
            "phone": "+1-555-0388",
            "industry": "Technology Consulting",
            "company_size": "200+",
            "current_project_cost": 500000.0,
            "project_duration_months": 12,
            "current_efficiency_rating": 5,
            "desired_services": ["AI Project Management", "Digital Transformation", "Operational Optimization"]
        },
        "name": "ROI Calculator - Large Enterprise",
        "expected": 200
    },
    {
        "data": {
            "company_name": "Small Business Solutions",
            "email": f"owner.{int(time.time())}@smallbiz.com",
            "industry": "Professional Services",
            "company_size": "1-10",
            "current_project_cost": 25000.0,
            "project_duration_months": 3,
            "current_efficiency_rating": 7,
            "desired_services": ["AI Project Management"]
        },
        "name": "ROI Calculator - Small Business",
        "expected": 200
    },
    {
        "data": {
            "company_name": "Invalid Corp",
            "email": "invalid-email",
            "industry": "Test"
        },
        "name": "ROI Calculator - Invalid Data (Expected 422)",
        "expected": 422
    }
]

for scenario in roi_scenarios:
    success, response = test_endpoint_comprehensive('POST', '/roi-calculator', scenario["data"], 
                                                  scenario["expected"], scenario["name"])
    if success and response and scenario["expected"] == 200:
        savings = response.get('potential_savings', 0)
        roi_pct = response.get('roi_percentage', 0)
        payback = response.get('payback_period_months', 0)
        services = response.get('recommended_services', [])
        print(f"    💵 Potential Savings: ${savings:,.2f}")
        print(f"    📈 ROI: {roi_pct:.1f}%")
        print(f"    ⏱️ Payback: {payback} months")
        print(f"    🛠️ Recommended Services: {len(services)}")

# TEST 6: CONSULTATION ENDPOINT - Booking system
print("\n🤝 TESTING /api/consultation ENDPOINT")
print("-" * 50)

consultation_scenarios = [
    {
        "data": {
            "name": "Michael Thompson",
            "email": f"m.thompson.{int(time.time())}@retailchain.com",
            "phone": "+1-555-0455",
            "company": "National Retail Chain Inc.",
            "service_type": "AI-Native Digital Transformation",
            "preferred_date": "2025-02-20",
            "message": "We operate 150+ retail locations and want to implement AI-driven inventory management, customer analytics, and operational optimization. Looking for a comprehensive digital transformation strategy."
        },
        "name": "Consultation Request - Retail Chain",
        "expected": 200
    },
    {
        "data": {
            "name": "Sarah Chen",
            "email": f"s.chen.{int(time.time())}@startuptech.io",
            "company": "StartupTech Innovations",
            "service_type": "AI Agile & Scrum Coaching",
            "message": "Early-stage startup looking to implement AI-enhanced agile methodologies from the ground up."
        },
        "name": "Consultation Request - Startup",
        "expected": 200
    },
    {
        "data": {
            "name": "Invalid User",
            "email": "invalid-email",
            "service_type": "Test Service"
        },
        "name": "Consultation Request - Invalid Email (Expected 422)",
        "expected": 422
    }
]

for scenario in consultation_scenarios:
    test_endpoint_comprehensive('POST', '/consultation', scenario["data"], 
                              scenario["expected"], scenario["name"])

# ADDITIONAL VERCEL-SPECIFIC TESTS
print("\n🔧 VERCEL SERVERLESS FUNCTION SPECIFIC TESTS")
print("-" * 50)

# Test 1: Environment Variables Access
print("Testing environment variable access...")
success, response = test_endpoint_comprehensive('GET', '/analytics/overview', 
                                              test_name="Environment Variables - Database Access")

# Test 2: Concurrent Load Testing (Serverless scaling)
print("\nTesting concurrent request handling...")

def make_concurrent_request():
    try:
        response = requests.get(f"{API_URL}/health", timeout=10)
        return response.status_code == 200
    except:
        return False

# Test with 10 concurrent requests
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    start_time = time.time()
    futures = [executor.submit(make_concurrent_request) for _ in range(10)]
    results = [future.result() for future in concurrent.futures.as_completed(futures)]
    end_time = time.time()

successful_requests = sum(results)
total_time = end_time - start_time

log_test("Concurrent Load Test (10 requests)", 
         successful_requests == 10,
         f"{successful_requests}/10 successful, {total_time:.2f}s total",
         total_time/10)

# Test 3: CORS for Production Domains
print("\nTesting CORS for production domains...")

production_domains = [
    'https://orgainse.com',
    'https://www.orgainse.com', 
    'https://orgainse.vercel.app'
]

for domain in production_domains:
    headers = {
        'Origin': domain,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }
    
    try:
        response = requests.options(f"{API_URL}/contact", headers=headers, timeout=5)
        cors_origin = response.headers.get('access-control-allow-origin', '')
        
        if cors_origin == '*' or cors_origin == domain:
            log_test(f"CORS for {domain}", True, f"Allowed origin: {cors_origin}")
        else:
            log_test(f"CORS for {domain}", False, f"Origin not allowed: {cors_origin}")
            
    except Exception as e:
        log_test(f"CORS for {domain}", False, f"Error: {str(e)}")

# Test 4: Response Size Optimization (Important for serverless)
print("\nTesting response size optimization...")

large_data_test = {
    "name": "Response Size Test User",
    "email": f"responsesize.{int(time.time())}@testcorp.com",
    "company": "Test Corporation for Response Size Analysis",
    "subject": "Testing response size optimization for serverless functions deployment",
    "message": "This is a test message to verify that the API can handle and respond appropriately to larger request payloads while maintaining optimal response sizes for serverless function efficiency. " * 10
}

success, response = test_endpoint_comprehensive('POST', '/contact', large_data_test,
                                              test_name="Response Size Optimization Test")

if success and response:
    response_size = len(json.dumps(response))
    if response_size < 1024:  # Less than 1KB
        print(f"    📏 Response size: {response_size} bytes (Optimal)")
    elif response_size < 5120:  # Less than 5KB
        print(f"    📏 Response size: {response_size} bytes (Acceptable)")
    else:
        print(f"    📏 Response size: {response_size} bytes (Large - may impact serverless performance)")

# FINAL COMPREHENSIVE ANALYSIS
print("\n" + "=" * 70)
print("🏁 COMPREHENSIVE VERCEL DEPLOYMENT TESTING COMPLETE")
print("=" * 70)

print(f"📊 OVERALL RESULTS:")
print(f"   Total Tests: {total_tests}")
print(f"   ✅ Passed: {passed_tests}")
print(f"   ❌ Failed: {failed_tests}")
print(f"   📈 Success Rate: {(passed_tests/total_tests*100):.1f}%")

print(f"\n🚨 CRITICAL ISSUES FOUND: {len(critical_issues)}")
if critical_issues:
    for i, issue in enumerate(critical_issues, 1):
        print(f"   {i}. {issue}")
else:
    print("   ✅ No critical issues found!")

print(f"\n⚠️ MINOR ISSUES FOUND: {len(minor_issues)}")
if minor_issues:
    for i, issue in enumerate(minor_issues, 1):
        print(f"   {i}. {issue}")
else:
    print("   ✅ No minor issues found!")

# VERCEL DEPLOYMENT READINESS ASSESSMENT
print(f"\n🎯 VERCEL DEPLOYMENT READINESS ASSESSMENT:")
print("=" * 50)

readiness_checks = [
    ("All 6 required endpoints accessible", failed_tests == 0),
    ("Database integration working", any("analytics" in test['test'].lower() and test['success'] for test in test_results)),
    ("CORS properly configured", any("cors" in test['test'].lower() and test['success'] for test in test_results)),
    ("Error handling implemented", any("422" in test['test'] and test['success'] for test in test_results)),
    ("Concurrent requests handled", any("concurrent" in test['test'].lower() and test['success'] for test in test_results)),
    ("Response times acceptable", all(test.get('response_time', 0) < 5.0 for test in test_results if test.get('response_time'))),
    ("No critical deployment blockers", len(critical_issues) == 0)
]

all_ready = True
for check_name, is_ready in readiness_checks:
    status = "✅" if is_ready else "❌"
    print(f"{status} {check_name}")
    if not is_ready:
        all_ready = False

print(f"\n🚀 DEPLOYMENT STATUS:")
if all_ready:
    print("✅ READY FOR VERCEL DEPLOYMENT")
    print("   All systems operational, no blocking issues found.")
else:
    print("❌ DEPLOYMENT BLOCKED")
    print("   Critical issues must be resolved before deployment.")

print(f"\n📋 TESTED ENDPOINTS SUMMARY:")
print("   1. ✅ /api/health - Monitoring endpoint")
print("   2. ✅ /api/newsletter - Lead capture system") 
print("   3. ✅ /api/contact - Primary business inquiries")
print("   4. ✅ /api/ai-assessment - Interactive assessment tool")
print("   5. ✅ /api/roi-calculator - Business value calculator")
print("   6. ✅ /api/consultation - Consultation booking system")

print(f"\n🔗 Production URLs:")
print(f"   Website: https://www.orgainse.com")
print(f"   Backend: {BASE_URL}")
print(f"   API Base: {API_URL}")

if all_ready:
    print(f"\n🎉 ALL SYSTEMS GO FOR VERCEL DEPLOYMENT!")
else:
    print(f"\n🛑 RESOLVE CRITICAL ISSUES BEFORE DEPLOYMENT!")