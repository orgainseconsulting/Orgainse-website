#!/usr/bin/env python3
"""
🎯 FINAL VERIFICATION: SEO FIXES IMPACT ON LEAD CAPTURE FUNCTIONALITY
Testing that SEO optimizations did NOT break the perfectly working lead capture system

REVIEW REQUEST REQUIREMENTS:
1. Newsletter API - verify still working after SEO fixes
2. Contact form API - verify still working  
3. AI Assessment API - verify still working
4. ROI Calculator API - verify still working

Focus: Confirm the SEO optimizations (title, meta description, canonical links, 
language fixes, content expansion, internal links) did NOT impact the perfectly 
working lead capture system.
"""

import requests
import json
import time
import sys
from datetime import datetime

# Test configuration - Use correct production URL
BASE_URL = "https://www.orgainse.com"  # Production URL for SEO fixes verification
TEST_EMAIL = "seo.verification@orgainse.com"
TEST_NAME = "SEO Verification User"
TEST_COMPANY = "SEO Test Company"

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

def test_newsletter_api():
    """Test Newsletter API - Core lead capture functionality"""
    print_test("Newsletter API - SEO Fixes Impact Verification")
    
    try:
        # Test data with realistic business information
        newsletter_data = {
            "email": f"newsletter.{int(time.time())}@orgainse.com",
            "first_name": "Sarah",
            "name": "Sarah Johnson"
        }
        
        # Make API request
        response = requests.post(
            f"{BASE_URL}/api/newsletter",
            json=newsletter_data,
            headers={
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': f"{BASE_URL}/"
            },
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {response.elapsed.total_seconds():.3f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify response structure
            required_fields = ['message', 'subscription_id', 'email', 'timestamp', 'status']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_error(f"Missing response fields: {missing_fields}")
                return False
            
            print_success("Newsletter API working perfectly after SEO fixes")
            return True
        else:
            print_error(f"Newsletter API failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Newsletter API error: {str(e)}")
        return False

def test_contact_api():
    """Test Contact Form API - Core lead capture functionality"""
    print_test("Contact Form API - SEO Fixes Impact Verification")
    
    try:
        # Test data with realistic business inquiry
        contact_data = {
            "name": "Michael Chen",
            "email": f"contact.{int(time.time())}@orgainse.com",
            "company": "Healthcare Innovations Inc",
            "phone": "+1-555-0123",
            "message": "Interested in AI transformation for our healthcare operations. Looking for consultation on implementing AI-driven patient management systems.",
            "leadType": "Contact Inquiry"
        }
        
        # Make API request
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=contact_data,
            headers={
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': f"{BASE_URL}/"
            },
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {response.elapsed.total_seconds():.3f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify response structure
            required_fields = ['message', 'id', 'timestamp', 'leadType']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_error(f"Missing response fields: {missing_fields}")
                return False
            
            print_success("Contact Form API working perfectly after SEO fixes")
            return True
        else:
            print_error(f"Contact API failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Contact API error: {str(e)}")
        return False

def test_ai_assessment_api():
    """Test AI Assessment API - Interactive tool functionality"""
    print_test("AI Assessment API - SEO Fixes Impact Verification")
    
    try:
        # Test data with realistic AI assessment
        assessment_data = {
            "user_info": {
                "name": "Jennifer Martinez",
                "email": f"ai.assessment.{int(time.time())}@orgainse.com",
                "company": "Global Investment Group",
                "industry": "Financial Services",
                "company_size": "201-500"
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
        
        # Make API request
        response = requests.post(
            f"{BASE_URL}/api/ai-assessment",
            json=assessment_data,
            headers={
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': f"{BASE_URL}/"
            },
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {response.elapsed.total_seconds():.3f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify response structure
            required_fields = ['success', 'assessment_id', 'maturity_score', 'recommendations', 'message', 'timestamp']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_error(f"Missing response fields: {missing_fields}")
                return False
            
            # Verify maturity score calculation
            if not isinstance(data.get('maturity_score'), int) or data['maturity_score'] < 0 or data['maturity_score'] > 100:
                print_error(f"Invalid maturity score: {data.get('maturity_score')}")
                return False
            
            # Verify recommendations
            if not isinstance(data.get('recommendations'), list) or len(data['recommendations']) == 0:
                print_error("No recommendations generated")
                return False
            
            print_success(f"AI Assessment API working perfectly - {data['maturity_score']}% maturity score, {len(data['recommendations'])} recommendations")
            return True
        else:
            print_error(f"AI Assessment API failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print_error(f"AI Assessment API error: {str(e)}")
        return False

def test_roi_calculator_api():
    """Test ROI Calculator API - Business value tool functionality"""
    print_test("ROI Calculator API - SEO Fixes Impact Verification")
    
    try:
        # Test data with realistic business scenario
        roi_data = {
            "company_name": "Manufacturing Solutions Inc",
            "email": f"roi.calculator.{int(time.time())}@orgainse.com",
            "annual_revenue": "5000000",  # $5M annual revenue
            "employee_count": "201-500",
            "current_pm_costs": "15000",  # $15K monthly PM costs
            "tech_budget": "200000",  # $200K tech budget
            "implementation_timeline": "6-12 months",
            "user_region": "US"
        }
        
        # Make API request
        response = requests.post(
            f"{BASE_URL}/api/roi-calculator",
            json=roi_data,
            headers={
                'Content-Type': 'application/json',
                'Origin': BASE_URL,
                'Referer': f"{BASE_URL}/"
            },
            timeout=15
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {response.elapsed.total_seconds():.3f}s")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Verify response structure
            required_fields = ['success', 'calculation_id', 'company_name', 'potential_savings', 'roi_percentage', 'payback_period', 'message', 'timestamp']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_error(f"Missing response fields: {missing_fields}")
                return False
            
            # Verify calculation results
            if not isinstance(data.get('potential_savings'), int) or data['potential_savings'] <= 0:
                print_error(f"Invalid potential savings: {data.get('potential_savings')}")
                return False
            
            if not isinstance(data.get('roi_percentage'), int):
                print_error(f"Invalid ROI percentage: {data.get('roi_percentage')}")
                return False
            
            if not isinstance(data.get('payback_period'), int) or data['payback_period'] <= 0:
                print_error(f"Invalid payback period: {data.get('payback_period')}")
                return False
            
            print_success(f"ROI Calculator API working perfectly - ${data['potential_savings']:,} savings, {data['roi_percentage']}% ROI, {data['payback_period']}-month payback")
            return True
        else:
            print_error(f"ROI Calculator API failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print_error(f"ROI Calculator API error: {str(e)}")
        return False

def main():
    """Main test execution"""
    print_header("SEO FIXES VERIFICATION - LEAD CAPTURE FUNCTIONALITY TEST")
    print_info(f"Testing against: {BASE_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    tests = []
    
    # Execute all tests
    tests.append(("Newsletter API", test_newsletter_api()))
    tests.append(("Contact Form API", test_contact_api()))
    tests.append(("AI Assessment API", test_ai_assessment_api()))
    tests.append(("ROI Calculator API", test_roi_calculator_api()))
    
    # Summary
    print_header("TEST RESULTS SUMMARY")
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, result in tests:
        if result:
            print_success(f"{test_name}: PASSED")
            passed_tests += 1
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\n{Colors.BOLD}Overall Results:{Colors.END}")
    print(f"✅ Passed: {passed_tests}/{total_tests}")
    print(f"❌ Failed: {total_tests - passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print_success("🎉 ALL TESTS PASSED - SEO fixes did NOT break lead capture functionality!")
        return True
    else:
        print_error("⚠️  Some tests failed - SEO fixes may have impacted lead capture functionality")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)