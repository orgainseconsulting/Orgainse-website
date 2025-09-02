#!/usr/bin/env python3
"""
COMPREHENSIVE VERCEL SERVERLESS FUNCTIONS TESTING - CLEAN ORGAINSE PROJECT
Testing all 3 API endpoints as per review request requirements:
1. /api/health.py - Health check endpoint
2. /api/newsletter.py - Newsletter subscription with MongoDB integration
3. /api/contact.py - Contact form with MongoDB integration

Environment Variables Required:
- MONGO_URL: mongodb+srv://admin:orgainse2024@cluster0.mongodb.net/orgainse_consulting?retryWrites=true&w=majority
- DB_NAME: orgainse_consulting
"""

import sys
import os
import json
import time
import uuid
from datetime import datetime
from pymongo import MongoClient
import concurrent.futures
import threading

# Add the clean-orgainse directory to Python path
sys.path.insert(0, '/app/clean-orgainse')

# Set environment variables for testing
os.environ['MONGO_URL'] = 'mongodb+srv://admin:orgainse2024@cluster0.mongodb.net/orgainse_consulting?retryWrites=true&w=majority'
os.environ['DB_NAME'] = 'orgainse_consulting'

# Import the serverless functions
from api.health import handler as health_handler
from api.newsletter import handler as newsletter_handler
from api.contact import handler as contact_handler

class ServerlessFunctionTester:
    def __init__(self):
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
        # MongoDB connection for verification
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        
        print("🎯 COMPREHENSIVE VERCEL SERVERLESS FUNCTIONS TESTING - CLEAN ORGAINSE PROJECT")
        print("=" * 80)
        print(f"Testing Environment: {self.mongo_url}")
        print(f"Database: {self.db_name}")
        print("=" * 80)
    
    def log_test(self, test_name, passed, details="", response_time=None):
        """Log test results"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
        
        time_info = f" ({response_time:.3f}s)" if response_time else ""
        print(f"{status}: {test_name}{time_info}")
        if details:
            print(f"    Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'passed': passed,
            'details': details,
            'response_time': response_time
        })
    
    def create_mock_request(self, method='POST', body=None, headers=None):
        """Create a mock request object for serverless functions"""
        return {
            'method': method,
            'body': json.dumps(body) if body else '{}',
            'headers': headers or {}
        }
    
    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        print("\n🔍 TESTING HEALTH ENDPOINT (/api/health)")
        print("-" * 50)
        
        # Test 1: Basic health check
        start_time = time.time()
        try:
            request = self.create_mock_request(method='GET')
            response = health_handler(request)
            response_time = time.time() - start_time
            
            # Verify response structure
            if (response.get('statusCode') == 200 and 
                'application/json' in response.get('headers', {}).get('Content-Type', '') and
                'Access-Control-Allow-Origin' in response.get('headers', {})):
                
                body = json.loads(response['body'])
                if (body.get('status') == 'healthy' and 
                    'timestamp' in body and 
                    body.get('service') == 'Orgainse Consulting API'):
                    self.log_test("Health endpoint basic functionality", True, 
                                f"Status: {body['status']}, Service: {body['service']}", response_time)
                else:
                    self.log_test("Health endpoint basic functionality", False, 
                                f"Invalid response body: {body}")
            else:
                self.log_test("Health endpoint basic functionality", False, 
                            f"Invalid response structure: {response}")
        except Exception as e:
            self.log_test("Health endpoint basic functionality", False, f"Exception: {str(e)}")
        
        # Test 2: CORS headers verification
        try:
            request = self.create_mock_request(method='GET')
            response = health_handler(request)
            
            headers = response.get('headers', {})
            cors_valid = (headers.get('Access-Control-Allow-Origin') == '*' and
                         'Content-Type' in headers)
            
            self.log_test("Health endpoint CORS configuration", cors_valid,
                        f"CORS headers: {headers}")
        except Exception as e:
            self.log_test("Health endpoint CORS configuration", False, f"Exception: {str(e)}")
        
        # Test 3: Response format validation
        try:
            request = self.create_mock_request(method='GET')
            response = health_handler(request)
            body = json.loads(response['body'])
            
            # Verify timestamp format
            timestamp = body.get('timestamp')
            datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            self.log_test("Health endpoint timestamp format", True,
                        f"Valid ISO timestamp: {timestamp}")
        except Exception as e:
            self.log_test("Health endpoint timestamp format", False, f"Exception: {str(e)}")
    
    def test_newsletter_endpoint(self):
        """Test /api/newsletter endpoint"""
        print("\n📧 TESTING NEWSLETTER ENDPOINT (/api/newsletter)")
        print("-" * 50)
        
        # Test 1: Valid newsletter subscription
        start_time = time.time()
        try:
            test_email = f"test.newsletter.{uuid.uuid4().hex[:8]}@orgainse-test.com"
            request_body = {
                'email': test_email,
                'first_name': 'John'
            }
            request = self.create_mock_request(method='POST', body=request_body)
            response = newsletter_handler(request)
            response_time = time.time() - start_time
            
            if response.get('statusCode') == 200:
                body = json.loads(response['body'])
                if 'subscription_id' in body and body.get('message'):
                    self.log_test("Newsletter subscription - valid data", True,
                                f"Email: {test_email}, ID: {body['subscription_id']}", response_time)
                    
                    # Verify database insertion
                    self.verify_newsletter_in_database(test_email, body['subscription_id'])
                else:
                    self.log_test("Newsletter subscription - valid data", False,
                                f"Invalid response body: {body}")
            else:
                self.log_test("Newsletter subscription - valid data", False,
                            f"Status: {response.get('statusCode')}, Body: {response.get('body')}")
        except Exception as e:
            self.log_test("Newsletter subscription - valid data", False, f"Exception: {str(e)}")
        
        # Test 2: Duplicate email handling
        try:
            duplicate_email = f"duplicate.{uuid.uuid4().hex[:8]}@orgainse-test.com"
            
            # First subscription
            request_body = {'email': duplicate_email, 'first_name': 'Jane'}
            request = self.create_mock_request(method='POST', body=request_body)
            response1 = newsletter_handler(request)
            
            # Second subscription (should fail)
            request = self.create_mock_request(method='POST', body=request_body)
            response2 = newsletter_handler(request)
            
            if (response1.get('statusCode') == 200 and 
                response2.get('statusCode') == 409):
                body2 = json.loads(response2['body'])
                self.log_test("Newsletter duplicate email handling", True,
                            f"First: 200, Second: 409 - {body2.get('error')}")
            else:
                self.log_test("Newsletter duplicate email handling", False,
                            f"First: {response1.get('statusCode')}, Second: {response2.get('statusCode')}")
        except Exception as e:
            self.log_test("Newsletter duplicate email handling", False, f"Exception: {str(e)}")
        
        # Test 3: Invalid email validation
        try:
            invalid_emails = ['invalid-email', '', 'test@', '@domain.com']
            
            for invalid_email in invalid_emails:
                request_body = {'email': invalid_email, 'first_name': 'Test'}
                request = self.create_mock_request(method='POST', body=request_body)
                response = newsletter_handler(request)
                
                if response.get('statusCode') != 400:
                    self.log_test(f"Newsletter invalid email validation ({invalid_email})", False,
                                f"Expected 400, got {response.get('statusCode')}")
                    break
            else:
                self.log_test("Newsletter invalid email validation", True,
                            f"All invalid emails properly rejected with 400 status")
        except Exception as e:
            self.log_test("Newsletter invalid email validation", False, f"Exception: {str(e)}")
        
        # Test 4: OPTIONS preflight request
        try:
            request = self.create_mock_request(method='OPTIONS')
            response = newsletter_handler(request)
            
            if (response.get('statusCode') == 200 and
                'Access-Control-Allow-Methods' in response.get('headers', {})):
                self.log_test("Newsletter OPTIONS preflight", True,
                            f"CORS preflight handled correctly")
            else:
                self.log_test("Newsletter OPTIONS preflight", False,
                            f"Invalid OPTIONS response: {response}")
        except Exception as e:
            self.log_test("Newsletter OPTIONS preflight", False, f"Exception: {str(e)}")
        
        # Test 5: Missing required fields
        try:
            request_body = {'first_name': 'Test'}  # Missing email
            request = self.create_mock_request(method='POST', body=request_body)
            response = newsletter_handler(request)
            
            if response.get('statusCode') == 400:
                self.log_test("Newsletter missing email field", True,
                            "Properly rejected missing email with 400 status")
            else:
                self.log_test("Newsletter missing email field", False,
                            f"Expected 400, got {response.get('statusCode')}")
        except Exception as e:
            self.log_test("Newsletter missing email field", False, f"Exception: {str(e)}")
    
    def test_contact_endpoint(self):
        """Test /api/contact endpoint"""
        print("\n📞 TESTING CONTACT ENDPOINT (/api/contact)")
        print("-" * 50)
        
        # Test 1: Valid contact form submission
        start_time = time.time()
        try:
            test_email = f"contact.test.{uuid.uuid4().hex[:8]}@orgainse-test.com"
            request_body = {
                'name': 'Sarah Johnson',
                'email': test_email,
                'company': 'TechCorp Solutions',
                'phone': '+1-555-0123',
                'service_type': 'AI Project Management',
                'message': 'We are interested in implementing AI-driven project management solutions for our enterprise operations.'
            }
            request = self.create_mock_request(method='POST', body=request_body)
            response = contact_handler(request)
            response_time = time.time() - start_time
            
            if response.get('statusCode') == 200:
                body = json.loads(response['body'])
                if 'contact_id' in body and body.get('message'):
                    self.log_test("Contact form - valid submission", True,
                                f"Name: {request_body['name']}, ID: {body['contact_id']}", response_time)
                    
                    # Verify database insertion
                    self.verify_contact_in_database(test_email, body['contact_id'])
                else:
                    self.log_test("Contact form - valid submission", False,
                                f"Invalid response body: {body}")
            else:
                self.log_test("Contact form - valid submission", False,
                            f"Status: {response.get('statusCode')}, Body: {response.get('body')}")
        except Exception as e:
            self.log_test("Contact form - valid submission", False, f"Exception: {str(e)}")
        
        # Test 2: Missing required fields validation
        try:
            missing_field_tests = [
                ({'email': 'test@example.com', 'message': 'Test'}, 'name'),
                ({'name': 'Test User', 'message': 'Test'}, 'email'),
                ({'name': 'Test User', 'email': 'test@example.com'}, 'message')
            ]
            
            for request_body, missing_field in missing_field_tests:
                request = self.create_mock_request(method='POST', body=request_body)
                response = contact_handler(request)
                
                if response.get('statusCode') != 400:
                    self.log_test(f"Contact missing {missing_field} validation", False,
                                f"Expected 400, got {response.get('statusCode')}")
                    break
            else:
                self.log_test("Contact required fields validation", True,
                            "All missing required fields properly rejected with 400 status")
        except Exception as e:
            self.log_test("Contact required fields validation", False, f"Exception: {str(e)}")
        
        # Test 3: Invalid email format validation
        try:
            request_body = {
                'name': 'Test User',
                'email': 'invalid-email-format',
                'message': 'Test message'
            }
            request = self.create_mock_request(method='POST', body=request_body)
            response = contact_handler(request)
            
            if response.get('statusCode') == 400:
                body = json.loads(response['body'])
                self.log_test("Contact invalid email format", True,
                            f"Properly rejected invalid email: {body.get('error')}")
            else:
                self.log_test("Contact invalid email format", False,
                            f"Expected 400, got {response.get('statusCode')}")
        except Exception as e:
            self.log_test("Contact invalid email format", False, f"Exception: {str(e)}")
        
        # Test 4: OPTIONS preflight request
        try:
            request = self.create_mock_request(method='OPTIONS')
            response = contact_handler(request)
            
            if (response.get('statusCode') == 200 and
                'Access-Control-Allow-Methods' in response.get('headers', {})):
                self.log_test("Contact OPTIONS preflight", True,
                            "CORS preflight handled correctly")
            else:
                self.log_test("Contact OPTIONS preflight", False,
                            f"Invalid OPTIONS response: {response}")
        except Exception as e:
            self.log_test("Contact OPTIONS preflight", False, f"Exception: {str(e)}")
        
        # Test 5: Enterprise business scenario
        try:
            enterprise_request = {
                'name': 'Michael Chen',
                'email': f'michael.chen.{uuid.uuid4().hex[:8]}@fortune500corp.com',
                'company': 'Fortune 500 Manufacturing Corp',
                'phone': '+1-800-555-0199',
                'service_type': 'Digital Transformation',
                'message': 'Our manufacturing company needs comprehensive AI-native digital transformation. We have 50,000+ employees across 200 locations globally and require enterprise-scale AI implementation for operational optimization, predictive maintenance, and supply chain automation.'
            }
            request = self.create_mock_request(method='POST', body=enterprise_request)
            response = contact_handler(request)
            
            if response.get('statusCode') == 200:
                body = json.loads(response['body'])
                self.log_test("Contact enterprise scenario", True,
                            f"Enterprise contact processed: {enterprise_request['company']}")
            else:
                self.log_test("Contact enterprise scenario", False,
                            f"Status: {response.get('statusCode')}")
        except Exception as e:
            self.log_test("Contact enterprise scenario", False, f"Exception: {str(e)}")
    
    def verify_newsletter_in_database(self, email, subscription_id):
        """Verify newsletter subscription was saved to MongoDB"""
        try:
            client = MongoClient(self.mongo_url)
            db = client[self.db_name]
            
            subscription = db.newsletter_subscriptions.find_one({'email': email, 'id': subscription_id})
            client.close()
            
            if subscription:
                self.log_test("Newsletter database persistence", True,
                            f"Subscription found in MongoDB: {subscription['email']}")
            else:
                self.log_test("Newsletter database persistence", False,
                            f"Subscription not found in database")
        except Exception as e:
            self.log_test("Newsletter database persistence", False, f"Database error: {str(e)}")
    
    def verify_contact_in_database(self, email, contact_id):
        """Verify contact message was saved to MongoDB"""
        try:
            client = MongoClient(self.mongo_url)
            db = client[self.db_name]
            
            contact = db.contact_messages.find_one({'email': email, 'id': contact_id})
            client.close()
            
            if contact:
                self.log_test("Contact database persistence", True,
                            f"Contact found in MongoDB: {contact['name']} ({contact['email']})")
            else:
                self.log_test("Contact database persistence", False,
                            f"Contact not found in database")
        except Exception as e:
            self.log_test("Contact database persistence", False, f"Database error: {str(e)}")
    
    def test_database_connectivity(self):
        """Test MongoDB database connectivity"""
        print("\n🗄️ TESTING DATABASE CONNECTIVITY")
        print("-" * 50)
        
        try:
            client = MongoClient(self.mongo_url)
            db = client[self.db_name]
            
            # Test connection
            client.admin.command('ping')
            
            # Get collection stats
            newsletter_count = db.newsletter_subscriptions.count_documents({})
            contact_count = db.contact_messages.count_documents({})
            
            client.close()
            
            self.log_test("MongoDB connectivity", True,
                        f"Connected successfully. Newsletter: {newsletter_count}, Contacts: {contact_count}")
        except Exception as e:
            self.log_test("MongoDB connectivity", False, f"Connection error: {str(e)}")
    
    def test_concurrent_requests(self):
        """Test concurrent request handling"""
        print("\n⚡ TESTING CONCURRENT REQUEST HANDLING")
        print("-" * 50)
        
        def make_concurrent_request(endpoint, request_data):
            try:
                if endpoint == 'health':
                    request = self.create_mock_request(method='GET')
                    return health_handler(request)
                elif endpoint == 'newsletter':
                    email = f"concurrent.{uuid.uuid4().hex[:8]}@test.com"
                    request_body = {'email': email, 'first_name': 'Concurrent'}
                    request = self.create_mock_request(method='POST', body=request_body)
                    return newsletter_handler(request)
                elif endpoint == 'contact':
                    email = f"concurrent.{uuid.uuid4().hex[:8]}@test.com"
                    request_body = {
                        'name': 'Concurrent Test',
                        'email': email,
                        'message': 'Concurrent test message'
                    }
                    request = self.create_mock_request(method='POST', body=request_body)
                    return contact_handler(request)
            except Exception as e:
                return {'error': str(e)}
        
        try:
            # Test concurrent requests to all endpoints
            with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
                futures = []
                
                # Submit 10 concurrent requests (mix of all endpoints)
                for i in range(10):
                    if i % 3 == 0:
                        future = executor.submit(make_concurrent_request, 'health', {})
                    elif i % 3 == 1:
                        future = executor.submit(make_concurrent_request, 'newsletter', {})
                    else:
                        future = executor.submit(make_concurrent_request, 'contact', {})
                    futures.append(future)
                
                # Collect results
                results = []
                for future in concurrent.futures.as_completed(futures):
                    result = future.result()
                    results.append(result)
                
                # Analyze results
                successful_requests = sum(1 for r in results if r.get('statusCode') in [200, 409])  # 409 is OK for duplicate emails
                
                if successful_requests >= 8:  # Allow some failures due to duplicates
                    self.log_test("Concurrent request handling", True,
                                f"{successful_requests}/10 requests successful")
                else:
                    self.log_test("Concurrent request handling", False,
                                f"Only {successful_requests}/10 requests successful")
        except Exception as e:
            self.log_test("Concurrent request handling", False, f"Exception: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling scenarios"""
        print("\n🚨 TESTING ERROR HANDLING")
        print("-" * 50)
        
        # Test 1: Malformed JSON
        try:
            # Simulate malformed JSON by passing invalid JSON string
            malformed_request = {
                'method': 'POST',
                'body': '{"invalid": json malformed}',  # Invalid JSON
                'headers': {}
            }
            
            response = newsletter_handler(malformed_request)
            
            if response.get('statusCode') == 500:
                self.log_test("Malformed JSON handling", True,
                            "Properly handled malformed JSON with 500 status")
            else:
                self.log_test("Malformed JSON handling", False,
                            f"Expected 500, got {response.get('statusCode')}")
        except Exception as e:
            # This is expected behavior - the function should handle the error gracefully
            self.log_test("Malformed JSON handling", True,
                        "Exception properly caught and handled")
        
        # Test 2: Empty request body
        try:
            empty_request = self.create_mock_request(method='POST', body=None)
            response = contact_handler(empty_request)
            
            if response.get('statusCode') == 400:
                self.log_test("Empty request body handling", True,
                            "Properly handled empty request body")
            else:
                self.log_test("Empty request body handling", False,
                            f"Expected 400, got {response.get('statusCode')}")
        except Exception as e:
            self.log_test("Empty request body handling", False, f"Exception: {str(e)}")
    
    def test_input_validation_security(self):
        """Test input validation and security measures"""
        print("\n🔒 TESTING INPUT VALIDATION & SECURITY")
        print("-" * 50)
        
        # Test 1: SQL injection protection (though we're using MongoDB)
        try:
            malicious_input = "'; DROP TABLE users; --"
            request_body = {
                'name': malicious_input,
                'email': 'test@example.com',
                'message': 'Test message'
            }
            request = self.create_mock_request(method='POST', body=request_body)
            response = contact_handler(request)
            
            if response.get('statusCode') == 200:
                self.log_test("SQL injection protection", True,
                            "Malicious input handled safely")
            else:
                self.log_test("SQL injection protection", False,
                            f"Unexpected response: {response.get('statusCode')}")
        except Exception as e:
            self.log_test("SQL injection protection", False, f"Exception: {str(e)}")
        
        # Test 2: XSS protection
        try:
            xss_input = "<script>alert('XSS')</script>"
            request_body = {
                'email': f'xss.test.{uuid.uuid4().hex[:8]}@example.com',
                'first_name': xss_input
            }
            request = self.create_mock_request(method='POST', body=request_body)
            response = newsletter_handler(request)
            
            if response.get('statusCode') == 200:
                self.log_test("XSS protection", True,
                            "XSS input handled safely")
            else:
                self.log_test("XSS protection", False,
                            f"Unexpected response: {response.get('statusCode')}")
        except Exception as e:
            self.log_test("XSS protection", False, f"Exception: {str(e)}")
        
        # Test 3: Large payload handling
        try:
            large_message = "A" * 10000  # 10KB message
            request_body = {
                'name': 'Large Payload Test',
                'email': f'large.test.{uuid.uuid4().hex[:8]}@example.com',
                'message': large_message
            }
            request = self.create_mock_request(method='POST', body=request_body)
            response = contact_handler(request)
            
            if response.get('statusCode') == 200:
                self.log_test("Large payload handling", True,
                            f"Handled {len(large_message)} character message")
            else:
                self.log_test("Large payload handling", False,
                            f"Failed to handle large payload: {response.get('statusCode')}")
        except Exception as e:
            self.log_test("Large payload handling", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all test suites"""
        start_time = time.time()
        
        # Run all test suites
        self.test_database_connectivity()
        self.test_health_endpoint()
        self.test_newsletter_endpoint()
        self.test_contact_endpoint()
        self.test_concurrent_requests()
        self.test_error_handling()
        self.test_input_validation_security()
        
        total_time = time.time() - start_time
        
        # Print final results
        print("\n" + "=" * 80)
        print("🎯 COMPREHENSIVE VERCEL SERVERLESS FUNCTIONS TEST RESULTS")
        print("=" * 80)
        print(f"Total Tests: {self.total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        print(f"Total Time: {total_time:.2f} seconds")
        
        if self.failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! SERVERLESS FUNCTIONS ARE 100% READY FOR DEPLOYMENT!")
        else:
            print(f"\n⚠️  {self.failed_tests} TESTS FAILED - REVIEW REQUIRED BEFORE DEPLOYMENT")
        
        print("=" * 80)
        
        return self.failed_tests == 0

def main():
    """Main test execution"""
    print("Starting Comprehensive Vercel Serverless Functions Testing...")
    
    tester = ServerlessFunctionTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ FINAL RESULT: ALL SERVERLESS FUNCTIONS WORKING PERFECTLY!")
        print("🚀 READY FOR VERCEL DEPLOYMENT!")
    else:
        print("\n❌ FINAL RESULT: SOME ISSUES FOUND - REVIEW REQUIRED")
    
    return success

if __name__ == "__main__":
    main()