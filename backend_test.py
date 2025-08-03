import requests
import sys
import json
from datetime import datetime

class OrgainseAPITester:
    def __init__(self, base_url="https://2254e36b-ed2d-4d39-8d3a-666e92001c91.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            self.test_results.append({
                'name': name,
                'success': success,
                'status_code': response.status_code,
                'expected_status': expected_status,
                'response': response.text[:500] if not success else "Success"
            })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                'name': name,
                'success': False,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET", 
            "health",
            200
        )

    def test_create_contact_message(self):
        """Test creating a contact message"""
        test_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+1-555-123-4567",
            "company": "Test Company",
            "subject": "Test Subject",
            "message": "This is a test message from the API test suite."
        }
        
        success, response = self.run_test(
            "Create Contact Message",
            "POST",
            "contact",
            200,
            data=test_data
        )
        
        if success and 'id' in response:
            self.contact_id = response['id']
            return True, response
        return False, {}

    def test_get_contact_messages(self):
        """Test retrieving contact messages"""
        return self.run_test(
            "Get Contact Messages",
            "GET",
            "contact", 
            200
        )

    def test_newsletter_subscription(self):
        """Test newsletter subscription"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        test_data = {
            "email": f"newsletter-test-{timestamp}@example.com"
        }
        
        return self.run_test(
            "Newsletter Subscription",
            "POST",
            "newsletter",
            200,
            data=test_data
        )

    def test_duplicate_newsletter_subscription(self):
        """Test duplicate newsletter subscription (should fail)"""
        test_data = {
            "email": "duplicate@example.com"
        }
        
        # First subscription should succeed
        self.run_test(
            "First Newsletter Subscription",
            "POST", 
            "newsletter",
            200,
            data=test_data
        )
        
        # Second subscription should fail with 409
        return self.run_test(
            "Duplicate Newsletter Subscription",
            "POST",
            "newsletter", 
            409,
            data=test_data
        )

    def test_consultation_booking(self):
        """Test consultation booking"""
        test_data = {
            "name": "Test Consultant",
            "email": "consultant@example.com",
            "phone": "+1-555-987-6543",
            "company": "Consulting Test Co",
            "service_type": "Business Strategy Development",
            "preferred_date": "2025-02-15",
            "message": "Looking for strategic consulting services."
        }
        
        return self.run_test(
            "Consultation Booking",
            "POST",
            "consultation",
            200,
            data=test_data
        )

    def test_get_consultation_requests(self):
        """Test retrieving consultation requests"""
        return self.run_test(
            "Get Consultation Requests",
            "GET",
            "consultation",
            200
        )

    def test_status_check_legacy(self):
        """Test legacy status check endpoint"""
        test_data = {
            "client_name": "Test Client"
        }
        
        return self.run_test(
            "Legacy Status Check",
            "POST",
            "status",
            200,
            data=test_data
        )

    def test_get_status_checks(self):
        """Test retrieving status checks"""
        return self.run_test(
            "Get Status Checks",
            "GET",
            "status",
            200
        )

    def test_analytics_overview(self):
        """Test analytics overview endpoint"""
        return self.run_test(
            "Analytics Overview",
            "GET",
            "analytics/overview",
            200
        )

    def test_invalid_endpoint(self):
        """Test invalid endpoint (should return 404)"""
        return self.run_test(
            "Invalid Endpoint",
            "GET",
            "nonexistent",
            404
        )

    def test_invalid_contact_data(self):
        """Test contact form with invalid data"""
        invalid_data = {
            "name": "Test",
            "email": "invalid-email",  # Invalid email format
            "subject": "Test",
            "message": "Test message"
        }
        
        return self.run_test(
            "Invalid Contact Data",
            "POST",
            "contact",
            422,  # Validation error
            data=invalid_data
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Orgainse Consulting API Tests")
        print("=" * 50)
        
        # Basic endpoint tests
        self.test_root_endpoint()
        self.test_health_check()
        
        # Contact form tests
        self.test_create_contact_message()
        self.test_get_contact_messages()
        self.test_invalid_contact_data()
        
        # Newsletter tests
        self.test_newsletter_subscription()
        self.test_duplicate_newsletter_subscription()
        
        # Consultation tests
        self.test_consultation_booking()
        self.test_get_consultation_requests()
        
        # Legacy status tests
        self.test_status_check_legacy()
        self.test_get_status_checks()
        
        # Analytics tests
        self.test_analytics_overview()
        
        # Error handling tests
        self.test_invalid_endpoint()
        
        # Print final results
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        success_rate = (self.tests_passed/self.tests_run)*100 if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        # Print failed tests details
        failed_tests = [test for test in self.test_results if not test.get('success', False)]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                error_msg = test.get('error', '')
                if not error_msg:
                    status_code = test.get('status_code', 'unknown')
                    expected_status = test.get('expected_status', 'unknown')
                    error_msg = f'Status {status_code} (expected {expected_status})'
                print(f"  - {test['name']}: {error_msg}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = OrgainseAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"\n💥 Test suite failed with error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())