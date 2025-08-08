#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Orgainse Consulting API
Testing all endpoints after Odoo dependency removal
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

print(f"🚀 Starting Comprehensive Backend Testing")
print(f"📍 Backend URL: {BACKEND_URL}")
print(f"📍 API Base: {API_BASE}")
print("=" * 80)

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name, success, details=""):
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} | {test_name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
        
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{API_BASE}/health", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            
            details = f"Status: {response.status_code}"
            if success:
                details += f" | Response: {data.get('status', 'N/A')}"
            
            self.log_test("Health Check Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check Endpoint", False, f"Error: {str(e)}")
            return False
    
    def test_contact_form(self):
        """Test contact form submission"""
        try:
            # Test data
            contact_data = {
                "name": "Sarah Johnson",
                "email": "sarah.johnson@techcorp.com",
                "phone": "+1-555-0123",
                "company": "TechCorp Solutions",
                "subject": "AI Project Management Inquiry",
                "message": "We're interested in implementing AI-powered project management for our development team. Could you provide more information about your PMaaS offering?"
            }
            
            response = requests.post(f"{API_BASE}/contact", json=contact_data, timeout=10)
            success = response.status_code == 200
            
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | ID: {data.get('id', 'N/A')[:8]}... | Email: {data.get('email', 'N/A')}"
            
            self.log_test("Contact Form Submission", success, details)
            return success
        except Exception as e:
            self.log_test("Contact Form Submission", False, f"Error: {str(e)}")
            return False
    
    def test_contact_form_validation(self):
        """Test contact form input validation"""
        try:
            # Test with invalid email
            invalid_data = {
                "name": "Test User",
                "email": "invalid-email",
                "subject": "Test",
                "message": "Test message"
            }
            
            response = requests.post(f"{API_BASE}/contact", json=invalid_data, timeout=10)
            success = response.status_code == 422  # Validation error expected
            
            details = f"Status: {response.status_code} (Expected 422 for invalid email)"
            self.log_test("Contact Form Email Validation", success, details)
            return success
        except Exception as e:
            self.log_test("Contact Form Email Validation", False, f"Error: {str(e)}")
            return False
    
    def test_newsletter_subscription(self):
        """Test newsletter subscription"""
        try:
            # Generate unique email for testing
            unique_email = f"newsletter.test.{int(time.time())}@example.com"
            
            newsletter_data = {
                "email": unique_email
            }
            
            response = requests.post(f"{API_BASE}/newsletter", json=newsletter_data, timeout=10)
            success = response.status_code == 200
            
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | ID: {data.get('id', 'N/A')[:8]}... | Email: {data.get('email', 'N/A')}"
            
            self.log_test("Newsletter Subscription", success, details)
            return success, unique_email if success else None
        except Exception as e:
            self.log_test("Newsletter Subscription", False, f"Error: {str(e)}")
            return False, None
    
    def test_newsletter_duplicate_prevention(self, email):
        """Test newsletter duplicate prevention"""
        if not email:
            self.log_test("Newsletter Duplicate Prevention", False, "No email from previous test")
            return False
            
        try:
            newsletter_data = {
                "email": email
            }
            
            response = requests.post(f"{API_BASE}/newsletter", json=newsletter_data, timeout=10)
            success = response.status_code == 409  # Conflict expected for duplicate
            
            details = f"Status: {response.status_code} (Expected 409 for duplicate email)"
            self.log_test("Newsletter Duplicate Prevention", success, details)
            return success
        except Exception as e:
            self.log_test("Newsletter Duplicate Prevention", False, f"Error: {str(e)}")
            return False
    
    def test_consultation_booking(self):
        """Test consultation booking (legacy endpoint)"""
        try:
            consultation_data = {
                "name": "Michael Chen",
                "email": "michael.chen@startup.com",
                "phone": "+1-555-0456",
                "company": "StartupVenture Inc",
                "service_type": "Digital Transformation",
                "preferred_date": "2025-02-15",
                "message": "We're a growing startup looking to implement AI-driven processes across our operations."
            }
            
            response = requests.post(f"{API_BASE}/consultation", json=consultation_data, timeout=10)
            success = response.status_code == 200
            
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | ID: {data.get('id', 'N/A')[:8]}... | Service: {data.get('service_type', 'N/A')}"
            
            self.log_test("Legacy Consultation Booking", success, details)
            return success
        except Exception as e:
            self.log_test("Legacy Consultation Booking", False, f"Error: {str(e)}")
            return False
    
    def test_ai_assessment(self):
        """Test AI Assessment Tool"""
        try:
            assessment_data = {
                "name": "Emma Rodriguez",
                "email": "emma.rodriguez@innovatetech.com",
                "company": "InnovateTech Ltd",
                "phone": "+1-555-0789",
                "responses": [
                    {"question_id": "q1", "answer": "Moderate", "score": 6},
                    {"question_id": "q2", "answer": "Advanced", "score": 8},
                    {"question_id": "q3", "answer": "Basic", "score": 4},
                    {"question_id": "q4", "answer": "Moderate", "score": 6},
                    {"question_id": "q5", "answer": "Advanced", "score": 8}
                ]
            }
            
            response = requests.post(f"{API_BASE}/ai-assessment", json=assessment_data, timeout=10)
            success = response.status_code == 200
            
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                score = data.get('ai_maturity_score', 0)
                recommendations_count = len(data.get('recommendations', []))
                details += f" | Score: {score}/100 | Recommendations: {recommendations_count}"
            
            self.log_test("AI Assessment Tool", success, details)
            return success
        except Exception as e:
            self.log_test("AI Assessment Tool", False, f"Error: {str(e)}")
            return False
    
    def test_roi_calculator(self):
        """Test ROI Calculator"""
        try:
            roi_data = {
                "company_name": "GrowthTech Solutions",
                "email": "ceo@growthtech.com",
                "phone": "+1-555-0321",
                "industry": "Technology",
                "company_size": "51-200",
                "current_project_cost": 75000.0,
                "project_duration_months": 6,
                "current_efficiency_rating": 7,
                "desired_services": ["AI Project Management", "Operational Optimization"]
            }
            
            response = requests.post(f"{API_BASE}/roi-calculator", json=roi_data, timeout=10)
            success = response.status_code == 200
            
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                savings = data.get('potential_savings', 0)
                roi_pct = data.get('roi_percentage', 0)
                payback = data.get('payback_period_months', 0)
                services_count = len(data.get('recommended_services', []))
                details += f" | Savings: ${savings:,.0f} | ROI: {roi_pct:.1f}% | Payback: {payback}mo | Services: {services_count}"
            
            self.log_test("ROI Calculator", success, details)
            return success
        except Exception as e:
            self.log_test("ROI Calculator", False, f"Error: {str(e)}")
            return False
    
    def test_smart_calendar_booking(self):
        """Test Smart Calendar booking"""
        try:
            # Future datetime for booking
            future_date = datetime.now() + timedelta(days=7)
            
            booking_data = {
                "name": "David Kim",
                "email": "david.kim@enterprise.com",
                "phone": "+1-555-0654",
                "company": "Enterprise Solutions Corp",
                "service_type": "AI Project Management",
                "preferred_datetime": future_date.isoformat(),
                "timezone": "America/New_York",
                "message": "Looking to discuss AI implementation for our project management workflows."
            }
            
            response = requests.post(f"{API_BASE}/book-consultation", json=booking_data, timeout=10)
            success = response.status_code == 200
            
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | ID: {data.get('id', 'N/A')[:8]}... | Status: {data.get('status', 'N/A')} | Service: {data.get('service_type', 'N/A')}"
            
            self.log_test("Smart Calendar Booking", success, details)
            return success
        except Exception as e:
            self.log_test("Smart Calendar Booking", False, f"Error: {str(e)}")
            return False
    
    def test_calendar_booking_validation(self):
        """Test calendar booking input validation"""
        try:
            # Test with invalid datetime format
            invalid_booking = {
                "name": "Test User",
                "email": "test@example.com",
                "service_type": "Test Service",
                "preferred_datetime": "invalid-datetime",
                "timezone": "UTC"
            }
            
            response = requests.post(f"{API_BASE}/book-consultation", json=invalid_booking, timeout=10)
            success = response.status_code == 422  # Validation error expected
            
            details = f"Status: {response.status_code} (Expected 422 for invalid datetime)"
            self.log_test("Calendar Booking Validation", success, details)
            return success
        except Exception as e:
            self.log_test("Calendar Booking Validation", False, f"Error: {str(e)}")
            return False
    
    def test_analytics_overview(self):
        """Test analytics overview endpoint"""
        try:
            response = requests.get(f"{API_BASE}/analytics/overview", timeout=10)
            success = response.status_code == 200
            
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                contacts = data.get('total_contacts', 0)
                newsletters = data.get('total_newsletter_subscribers', 0)
                consultations = data.get('total_consultations', 0)
                details += f" | Contacts: {contacts} | Newsletters: {newsletters} | Consultations: {consultations}"
            
            self.log_test("Analytics Overview", success, details)
            return success
        except Exception as e:
            self.log_test("Analytics Overview", False, f"Error: {str(e)}")
            return False
    
    def test_database_connectivity(self):
        """Test database connectivity through data retrieval"""
        try:
            # Test retrieving contact messages
            response = requests.get(f"{API_BASE}/contact", timeout=10)
            success = response.status_code == 200
            
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                count = len(data) if isinstance(data, list) else 0
                details += f" | Retrieved {count} contact messages"
            
            self.log_test("Database Connectivity (Contacts)", success, details)
            return success
        except Exception as e:
            self.log_test("Database Connectivity (Contacts)", False, f"Error: {str(e)}")
            return False
    
    def test_consultation_retrieval(self):
        """Test consultation requests retrieval"""
        try:
            response = requests.get(f"{API_BASE}/consultation", timeout=10)
            success = response.status_code == 200
            
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                count = len(data) if isinstance(data, list) else 0
                details += f" | Retrieved {count} consultation requests"
            
            self.log_test("Database Connectivity (Consultations)", success, details)
            return success
        except Exception as e:
            self.log_test("Database Connectivity (Consultations)", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting Backend API Tests...")
        print("-" * 80)
        
        # Core API Tests
        self.test_health_check()
        self.test_contact_form()
        self.test_contact_form_validation()
        
        # Newsletter tests
        success, email = self.test_newsletter_subscription()
        self.test_newsletter_duplicate_prevention(email)
        
        # Consultation tests
        self.test_consultation_booking()
        
        # Interactive tools tests
        self.test_ai_assessment()
        self.test_roi_calculator()
        self.test_smart_calendar_booking()
        self.test_calendar_booking_validation()
        
        # Database and analytics tests
        self.test_database_connectivity()
        self.test_consultation_retrieval()
        self.test_analytics_overview()
        
        # Print summary
        print("-" * 80)
        print(f"🎯 TESTING COMPLETE")
        print(f"📊 Results: {self.passed_tests}/{self.total_tests} tests passed")
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 EXCELLENT: Backend is production-ready!")
        elif success_rate >= 75:
            print("✅ GOOD: Backend is mostly functional with minor issues")
        else:
            print("⚠️  NEEDS ATTENTION: Multiple critical issues found")
        
        return success_rate, self.test_results

if __name__ == "__main__":
    tester = BackendTester()
    success_rate, results = tester.run_all_tests()