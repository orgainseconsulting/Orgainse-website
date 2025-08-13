#!/usr/bin/env python3
"""
Backend API Testing Suite for Orgainse Consulting
Tests Google Calendar integration and other backend endpoints
"""

import requests
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import sys
import time

# Load environment variables
load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL')

if not BACKEND_URL:
    print("ERROR: REACT_APP_BACKEND_URL not found in frontend/.env")
    sys.exit(1)

# Ensure API prefix
API_BASE_URL = f"{BACKEND_URL}/api"

print(f"Testing backend at: {API_BASE_URL}")

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
    def log_result(self, test_name, success, message=""):
        if success:
            self.test_results['passed'] += 1
            print(f"✅ {test_name}: PASSED {message}")
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
            print(f"❌ {test_name}: FAILED {message}")
    
    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n=== Testing Basic Endpoints ===")
        
        # Test root endpoint
        try:
            response = self.session.get(f"{API_BASE_URL}/")
            if response.status_code == 200:
                data = response.json()
                if "Orgainse Consulting API" in data.get('message', ''):
                    self.log_result("Root endpoint", True, f"- {data.get('message')}")
                else:
                    self.log_result("Root endpoint", False, f"Unexpected message: {data}")
            else:
                self.log_result("Root endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Root endpoint", False, f"Exception: {str(e)}")
        
        # Test health endpoint
        try:
            response = self.session.get(f"{API_BASE_URL}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_result("Health endpoint", True, f"- Status: {data.get('status')}")
                else:
                    self.log_result("Health endpoint", False, f"Unhealthy status: {data}")
            else:
                self.log_result("Health endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("Health endpoint", False, f"Exception: {str(e)}")
    
    def test_google_calendar_auth_login(self):
        """Test Google Calendar OAuth login endpoint"""
        print("\n=== Testing Google Calendar Auth Login ===")
        
        try:
            response = self.session.get(f"{API_BASE_URL}/calendar/auth/login")
            
            if response.status_code == 200:
                data = response.json()
                if 'authorization_url' in data and 'state' in data:
                    auth_url = data['authorization_url']
                    state = data['state']
                    
                    # Validate authorization URL structure
                    if 'accounts.google.com/o/oauth2/auth' in auth_url and 'client_id' in auth_url:
                        self.log_result("Calendar auth login", True, f"- Auth URL generated, State: {state[:16]}...")
                        return state  # Return state for potential callback testing
                    else:
                        self.log_result("Calendar auth login", False, f"Invalid auth URL: {auth_url}")
                else:
                    self.log_result("Calendar auth login", False, f"Missing required fields: {data}")
            else:
                self.log_result("Calendar auth login", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Calendar auth login", False, f"Exception: {str(e)}")
        
        return None
    
    def test_google_calendar_available_slots(self):
        """Test available slots endpoint (without authentication)"""
        print("\n=== Testing Google Calendar Available Slots ===")
        
        try:
            # Test without user_id (should fail with 401)
            response = self.session.get(f"{API_BASE_URL}/calendar/available-slots")
            
            if response.status_code == 422:  # FastAPI validation error for missing user_id
                self.log_result("Available slots (no auth)", True, "- Correctly requires user_id parameter")
            elif response.status_code == 401:
                self.log_result("Available slots (no auth)", True, "- Correctly returns 401 for unauthenticated request")
            else:
                self.log_result("Available slots (no auth)", False, f"Unexpected status: {response.status_code}")
            
            # Test with fake user_id (should fail with 401)
            response = self.session.get(f"{API_BASE_URL}/calendar/available-slots?user_id=fake_user")
            
            if response.status_code == 401:
                data = response.json()
                if "not authenticated" in data.get('detail', '').lower():
                    self.log_result("Available slots (fake auth)", True, "- Correctly validates authentication")
                else:
                    self.log_result("Available slots (fake auth)", False, f"Unexpected error: {data}")
            else:
                self.log_result("Available slots (fake auth)", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_result("Available slots", False, f"Exception: {str(e)}")
    
    def test_google_calendar_book_consultation(self):
        """Test booking consultation endpoint"""
        print("\n=== Testing Google Calendar Book Consultation ===")
        
        # Test booking data
        booking_data = {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "phone": "+1-555-0123",
            "company": "Tech Solutions Inc",
            "service_type": "AI Project Management",
            "start_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z",
            "end_datetime": (datetime.utcnow() + timedelta(days=1, minutes=30)).isoformat() + "Z",
            "timezone": "UTC",
            "message": "Looking forward to discussing AI transformation opportunities"
        }
        
        try:
            # Test without user_id (should fail)
            response = self.session.post(
                f"{API_BASE_URL}/calendar/book-consultation",
                json=booking_data
            )
            
            if response.status_code == 422:  # Missing user_id parameter
                self.log_result("Book consultation (no user_id)", True, "- Correctly requires user_id parameter")
            else:
                self.log_result("Book consultation (no user_id)", False, f"Status: {response.status_code}")
            
            # Test with fake user_id (should fail with 401)
            response = self.session.post(
                f"{API_BASE_URL}/calendar/book-consultation?user_id=fake_user",
                json=booking_data
            )
            
            if response.status_code == 401:
                data = response.json()
                if "not authenticated" in data.get('detail', '').lower():
                    self.log_result("Book consultation (fake auth)", True, "- Correctly validates authentication")
                else:
                    self.log_result("Book consultation (fake auth)", False, f"Unexpected error: {data}")
            else:
                self.log_result("Book consultation (fake auth)", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_result("Book consultation", False, f"Exception: {str(e)}")
    
    def test_google_calendar_bookings(self):
        """Test get bookings endpoint"""
        print("\n=== Testing Google Calendar Bookings ===")
        
        try:
            response = self.session.get(f"{API_BASE_URL}/calendar/bookings")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Calendar bookings", True, f"- Retrieved {len(data)} bookings")
                else:
                    self.log_result("Calendar bookings", False, f"Expected list, got: {type(data)}")
            else:
                self.log_result("Calendar bookings", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Calendar bookings", False, f"Exception: {str(e)}")
    
    def test_analytics_with_calendar_data(self):
        """Test analytics endpoint includes Google Calendar booking counts"""
        print("\n=== Testing Analytics with Calendar Data ===")
        
        try:
            response = self.session.get(f"{API_BASE_URL}/analytics/overview")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for Google Calendar booking count
                if 'total_google_calendar_bookings' in data:
                    count = data['total_google_calendar_bookings']
                    self.log_result("Analytics Google Calendar count", True, f"- Google Calendar bookings: {count}")
                else:
                    self.log_result("Analytics Google Calendar count", False, "Missing total_google_calendar_bookings field")
                
                # Check for other expected fields
                expected_fields = [
                    'total_contacts', 'total_newsletter_subscribers', 'total_consultations',
                    'total_ai_assessments', 'total_roi_calculations', 'total_calendar_bookings'
                ]
                
                missing_fields = [field for field in expected_fields if field not in data]
                if not missing_fields:
                    self.log_result("Analytics completeness", True, "- All expected analytics fields present")
                else:
                    self.log_result("Analytics completeness", False, f"Missing fields: {missing_fields}")
                    
            else:
                self.log_result("Analytics endpoint", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_result("Analytics endpoint", False, f"Exception: {str(e)}")
    
    def test_contact_form_endpoint(self):
        """Test contact form endpoint"""
        print("\n=== Testing Contact Form Endpoint ===")
        
        contact_data = {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "phone": "+1-555-0456",
            "company": "Innovation Corp",
            "subject": "AI Transformation Inquiry",
            "message": "We're interested in learning more about your AI project management services."
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/contact", json=contact_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('name') == contact_data['name'] and data.get('email') == contact_data['email']:
                    self.log_result("Contact form submission", True, f"- Contact saved with ID: {data.get('id')}")
                else:
                    self.log_result("Contact form submission", False, f"Data mismatch: {data}")
            else:
                self.log_result("Contact form submission", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Contact form submission", False, f"Exception: {str(e)}")
    
    def test_newsletter_subscription(self):
        """Test newsletter subscription endpoint"""
        print("\n=== Testing Newsletter Subscription ===")
        
        # Use timestamp to ensure unique email
        timestamp = int(time.time())
        newsletter_data = {
            "email": f"test.user.{timestamp}@example.com"
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/newsletter", json=newsletter_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('email') == newsletter_data['email'] and data.get('status') == 'active':
                    self.log_result("Newsletter subscription", True, f"- Subscription created with ID: {data.get('id')}")
                else:
                    self.log_result("Newsletter subscription", False, f"Data mismatch: {data}")
            else:
                self.log_result("Newsletter subscription", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Newsletter subscription", False, f"Exception: {str(e)}")
    
    def test_consultation_request(self):
        """Test consultation request endpoint"""
        print("\n=== Testing Consultation Request ===")
        
        consultation_data = {
            "name": "Michael Johnson",
            "email": "michael.johnson@example.com",
            "phone": "+1-555-0789",
            "company": "Future Tech LLC",
            "service_type": "Digital Transformation",
            "preferred_date": "2025-02-15",
            "message": "We need help with our digital transformation initiative."
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/consultation", json=consultation_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('name') == consultation_data['name'] and data.get('service_type') == consultation_data['service_type']:
                    self.log_result("Consultation request", True, f"- Request created with ID: {data.get('id')}")
                else:
                    self.log_result("Consultation request", False, f"Data mismatch: {data}")
            else:
                self.log_result("Consultation request", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Consultation request", False, f"Exception: {str(e)}")
    
    def test_ai_assessment_api(self):
        """Test AI Assessment API endpoint"""
        print("\n=== Testing AI Assessment API ===")
        
        assessment_data = {
            "name": "Sarah Wilson",
            "email": "sarah.wilson@example.com",
            "company": "AI Innovations Ltd",
            "phone": "+1-555-0321",
            "responses": [
                {"question_id": "q1", "answer": "Intermediate", "score": 5},
                {"question_id": "q2", "answer": "Advanced", "score": 8},
                {"question_id": "q3", "answer": "Basic", "score": 3},
                {"question_id": "q4", "answer": "Intermediate", "score": 5},
                {"question_id": "q5", "answer": "Advanced", "score": 7}
            ]
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/ai-assessment", json=assessment_data)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get('name') == assessment_data['name'] and 
                    'ai_maturity_score' in data and 
                    'recommendations' in data):
                    score = data.get('ai_maturity_score')
                    recommendations_count = len(data.get('recommendations', []))
                    self.log_result("AI Assessment API", True, f"- Assessment created with score: {score}%, recommendations: {recommendations_count}")
                else:
                    self.log_result("AI Assessment API", False, f"Missing required fields: {data}")
            else:
                self.log_result("AI Assessment API", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("AI Assessment API", False, f"Exception: {str(e)}")
    
    def test_roi_calculator_api(self):
        """Test ROI Calculator API endpoint"""
        print("\n=== Testing ROI Calculator API ===")
        
        roi_data = {
            "company_name": "Growth Enterprises",
            "email": "ceo@growthenterprises.com",
            "phone": "+1-555-0654",
            "industry": "Technology",
            "company_size": "51-200",
            "current_project_cost": 100000.0,
            "project_duration_months": 6,
            "current_efficiency_rating": 6,
            "desired_services": ["AI Project Management", "Digital Transformation"]
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/roi-calculator", json=roi_data)
            
            if response.status_code == 200:
                data = response.json()
                if ('potential_savings' in data and 
                    'roi_percentage' in data and 
                    'payback_period_months' in data and
                    'recommended_services' in data):
                    savings = data.get('potential_savings')
                    roi = data.get('roi_percentage')
                    payback = data.get('payback_period_months')
                    services_count = len(data.get('recommended_services', []))
                    self.log_result("ROI Calculator API", True, f"- Savings: ${savings:,.0f}, ROI: {roi:.1f}%, Payback: {payback} months, Services: {services_count}")
                else:
                    self.log_result("ROI Calculator API", False, f"Missing required fields: {data}")
            else:
                self.log_result("ROI Calculator API", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("ROI Calculator API", False, f"Exception: {str(e)}")
    
    def test_service_inquiry_api(self):
        """Test Service Inquiry Tracking API endpoint"""
        print("\n=== Testing Service Inquiry API ===")
        
        inquiry_data = {
            "service_id": "ai-project-management",
            "service_name": "AI Project Management Service",
            "inquiry_type": "learn_more",
            "source": "website_popup",
            "user_data": {
                "page": "services",
                "session_id": "test_session_123"
            }
        }
        
        try:
            response = self.session.post(f"{API_BASE_URL}/service-inquiry", json=inquiry_data)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get('service_name') == inquiry_data['service_name'] and 
                    data.get('inquiry_type') == inquiry_data['inquiry_type']):
                    self.log_result("Service Inquiry API", True, f"- Inquiry tracked with ID: {data.get('id')}")
                else:
                    self.log_result("Service Inquiry API", False, f"Data mismatch: {data}")
            else:
                self.log_result("Service Inquiry API", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Service Inquiry API", False, f"Exception: {str(e)}")
    
    def test_google_calendar_auth_callback(self):
        """Test Google Calendar OAuth callback endpoint"""
        print("\n=== Testing Google Calendar Auth Callback ===")
        
        try:
            # Test callback without required parameters (should fail with 422)
            response = self.session.get(f"{API_BASE_URL}/calendar/auth/callback")
            
            if response.status_code == 422:
                self.log_result("Calendar auth callback (no params)", True, "- Correctly requires code and state parameters")
            else:
                self.log_result("Calendar auth callback (no params)", False, f"Status: {response.status_code}")
            
            # Test callback with invalid state (should fail with 400)
            response = self.session.get(f"{API_BASE_URL}/calendar/auth/callback?code=fake_code&state=invalid_state")
            
            if response.status_code == 400:
                data = response.json()
                if "invalid" in data.get('detail', '').lower() or "expired" in data.get('detail', '').lower():
                    self.log_result("Calendar auth callback (invalid state)", True, "- Correctly validates state parameter")
                else:
                    self.log_result("Calendar auth callback (invalid state)", False, f"Unexpected error: {data}")
            else:
                self.log_result("Calendar auth callback (invalid state)", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_result("Calendar auth callback", False, f"Exception: {str(e)}")
    
    def test_new_google_calendar_available_slots(self):
        """Test new Google Calendar available slots endpoint (organization calendar)"""
        print("\n=== Testing New Google Calendar Available Slots ===")
        
        try:
            # Test the new organization calendar endpoint
            response = self.session.get(f"{API_BASE_URL}/calendar/available-slots")
            
            # This should return 503 if organization calendar is not configured
            if response.status_code == 503:
                data = response.json()
                if "organization calendar not configured" in data.get('detail', '').lower():
                    self.log_result("New available slots (no org auth)", True, "- Correctly requires organization calendar setup")
                else:
                    self.log_result("New available slots (no org auth)", False, f"Unexpected 503 error: {data}")
            elif response.status_code == 200:
                # If organization is authenticated, should return slots
                data = response.json()
                if 'slots' in data and 'timezone' in data:
                    slots_count = len(data.get('slots', []))
                    self.log_result("New available slots (org authenticated)", True, f"- Retrieved {slots_count} available slots")
                else:
                    self.log_result("New available slots (org authenticated)", False, f"Missing required fields: {data}")
            else:
                self.log_result("New available slots", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("New available slots", False, f"Exception: {str(e)}")
    
    def test_new_google_calendar_book_consultation(self):
        """Test new Google Calendar book consultation endpoint (organization calendar)"""
        print("\n=== Testing New Google Calendar Book Consultation ===")
        
        # Test booking data for organization calendar
        booking_data = {
            "name": "Alex Thompson",
            "email": "alex.thompson@example.com",
            "phone": "+1-555-0987",
            "company": "Digital Solutions Co",
            "service_type": "AI Transformation Consulting",
            "start_datetime": (datetime.utcnow() + timedelta(days=2)).isoformat() + "Z",
            "end_datetime": (datetime.utcnow() + timedelta(days=2, minutes=30)).isoformat() + "Z",
            "timezone": "UTC",
            "message": "Excited to discuss AI implementation strategy"
        }
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/calendar/book-consultation",
                json=booking_data
            )
            
            # This should return 503 if organization calendar is not configured
            if response.status_code == 503:
                data = response.json()
                if "organization calendar not configured" in data.get('detail', '').lower():
                    self.log_result("New book consultation (no org auth)", True, "- Correctly requires organization calendar setup")
                else:
                    self.log_result("New book consultation (no org auth)", False, f"Unexpected 503 error: {data}")
            elif response.status_code == 200:
                # If organization is authenticated, should create booking
                data = response.json()
                if ('event_id' in data and 'html_link' in data and 
                    data.get('name') == booking_data['name']):
                    self.log_result("New book consultation (org authenticated)", True, f"- Booking created with event ID: {data.get('event_id')}")
                else:
                    self.log_result("New book consultation (org authenticated)", False, f"Missing required fields: {data}")
            else:
                self.log_result("New book consultation", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("New book consultation", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests for Orgainse Consulting")
        print(f"Backend URL: {API_BASE_URL}")
        print("=" * 60)
        
        # Test basic endpoints first
        self.test_basic_endpoints()
        
        # Test Google Calendar integration endpoints
        self.test_google_calendar_auth_login()
        self.test_google_calendar_auth_callback()
        self.test_new_google_calendar_available_slots()
        self.test_new_google_calendar_book_consultation()
        self.test_google_calendar_bookings()
        
        # Test legacy Google Calendar endpoints (for backwards compatibility)
        self.test_google_calendar_available_slots()
        self.test_google_calendar_book_consultation()
        
        # Test analytics with calendar data
        self.test_analytics_with_calendar_data()
        
        # Test core business endpoints
        self.test_contact_form_endpoint()
        self.test_newsletter_subscription()
        self.test_consultation_request()
        
        # Test interactive tools
        self.test_ai_assessment_api()
        self.test_roi_calculator_api()
        self.test_service_inquiry_api()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        
        if self.test_results['errors']:
            print("\n🔍 FAILED TESTS:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed'])) * 100
        print(f"\n📊 Success Rate: {success_rate:.1f}%")
        
        return self.test_results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results['failed'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)