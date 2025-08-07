#!/usr/bin/env python3
"""
ODOO LIVE INTEGRATION TEST SUITE
Tests live Odoo SaaS 18.3 connection with provided credentials
"""

import sys
import os
import json
import requests
import xmlrpc.client
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

# Add backend to path for imports
sys.path.append('/app/backend')
from odoo_integration import OdooIntegration

class OdooLiveIntegrationTester:
    """Test live Odoo SaaS 18.3 integration"""
    
    def __init__(self):
        self.base_url = "https://90b13770-ead2-4e15-acab-2d51fff9a1f3.preview.emergentagent.com"
        self.api_url = f"{self.base_url}/api"
        
        # Odoo credentials from environment
        self.odoo_url = "https://orgainse.odoo.com"
        self.odoo_db = "orgainse"
        self.odoo_username = "orgainse@gmail.com"
        self.odoo_password = "Orgainse25%swag"
        
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Initialize Odoo integration
        self.odoo_integration = None
        
    def log_test_result(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name}")
        
        if details:
            print(f"   {details}")
            
        self.test_results.append({
            'name': name,
            'success': success,
            'details': details
        })
    
    def test_odoo_authentication(self) -> bool:
        """Test 1: Odoo Authentication Test"""
        print("\n🔐 Testing Odoo Authentication...")
        
        try:
            # Test direct XML-RPC connection
            common = xmlrpc.client.ServerProxy(f'{self.odoo_url}/xmlrpc/2/common')
            
            # Get version info
            version_info = common.version()
            self.log_test_result(
                "Odoo Server Connection", 
                True, 
                f"Connected to Odoo {version_info.get('server_version', 'Unknown')} - Series: {version_info.get('server_serie', 'Unknown')}"
            )
            
            # Test authentication
            uid = common.authenticate(self.odoo_db, self.odoo_username, self.odoo_password, {})
            
            if uid:
                self.log_test_result(
                    "Odoo Authentication", 
                    True, 
                    f"Successfully authenticated with UID: {uid}"
                )
                
                # Test database access
                models = xmlrpc.client.ServerProxy(f'{self.odoo_url}/xmlrpc/2/object')
                
                # Test basic read access
                user_info = models.execute_kw(
                    self.odoo_db, uid, self.odoo_password,
                    'res.users', 'read', [uid], {'fields': ['name', 'login']}
                )
                
                if user_info:
                    self.log_test_result(
                        "Database Access Test", 
                        True, 
                        f"User: {user_info[0].get('name')} ({user_info[0].get('login')})"
                    )
                    return True
                else:
                    self.log_test_result("Database Access Test", False, "Could not read user information")
                    return False
            else:
                self.log_test_result("Odoo Authentication", False, "Authentication failed - invalid credentials")
                return False
                
        except Exception as e:
            self.log_test_result("Odoo Authentication", False, f"Connection error: {str(e)}")
            return False
    
    def test_odoo_modules_access(self) -> bool:
        """Test 2: Verify access to required Odoo modules"""
        print("\n📦 Testing Odoo Modules Access...")
        
        try:
            common = xmlrpc.client.ServerProxy(f'{self.odoo_url}/xmlrpc/2/common')
            uid = common.authenticate(self.odoo_db, self.odoo_username, self.odoo_password, {})
            
            if not uid:
                self.log_test_result("Module Access Test", False, "Authentication failed")
                return False
            
            models = xmlrpc.client.ServerProxy(f'{self.odoo_url}/xmlrpc/2/object')
            
            # Test access to required modules
            required_models = [
                ('crm.lead', 'CRM Module'),
                ('mailing.contact', 'Email Marketing Module'),
                ('calendar.event', 'Calendar Module'),
                ('sale.order', 'Sales Module'),
                ('res.partner', 'Contacts Module')
            ]
            
            all_modules_accessible = True
            
            for model_name, module_description in required_models:
                try:
                    # Test if we can search the model (basic access test)
                    result = models.execute_kw(
                        self.odoo_db, uid, self.odoo_password,
                        model_name, 'search', [[]], {'limit': 1}
                    )
                    
                    self.log_test_result(
                        f"{module_description} Access", 
                        True, 
                        f"Model '{model_name}' accessible"
                    )
                    
                except Exception as e:
                    self.log_test_result(
                        f"{module_description} Access", 
                        False, 
                        f"Model '{model_name}' not accessible: {str(e)}"
                    )
                    all_modules_accessible = False
            
            return all_modules_accessible
            
        except Exception as e:
            self.log_test_result("Module Access Test", False, f"Error: {str(e)}")
            return False
    
    def test_crm_integration(self) -> bool:
        """Test 3: CRM Integration Test"""
        print("\n👥 Testing CRM Integration...")
        
        try:
            # Test contact form submission with Odoo CRM sync
            contact_data = {
                "name": "John Smith",
                "email": f"john.smith.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@testcompany.com",
                "phone": "+1-555-123-4567",
                "company": "Test Company Ltd",
                "subject": "AI Consultation Inquiry",
                "message": "Interested in AI project management services for our growing tech startup."
            }
            
            # Submit contact form via API
            response = requests.post(
                f"{self.api_url}/contact",
                json=contact_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                response_data = response.json()
                self.log_test_result(
                    "Contact Form API", 
                    True, 
                    f"Contact created with ID: {response_data.get('id')}"
                )
                
                # Test AI Assessment with CRM integration
                assessment_data = {
                    "name": "Sarah Johnson",
                    "email": f"sarah.johnson.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@techcorp.com",
                    "company": "TechCorp Solutions",
                    "phone": "+1-555-234-5678",
                    "responses": [
                        {"question_id": "ai_readiness", "answer": "We have basic automation", "score": 6},
                        {"question_id": "data_management", "answer": "We collect data but struggle with analysis", "score": 4},
                        {"question_id": "team_skills", "answer": "Some team members have AI knowledge", "score": 5},
                        {"question_id": "budget_allocation", "answer": "We have allocated budget for AI", "score": 7},
                        {"question_id": "strategic_vision", "answer": "AI is part of our 3-year strategy", "score": 8}
                    ]
                }
                
                assessment_response = requests.post(
                    f"{self.api_url}/ai-assessment",
                    json=assessment_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if assessment_response.status_code == 200:
                    assessment_result = assessment_response.json()
                    self.log_test_result(
                        "AI Assessment CRM Integration", 
                        True, 
                        f"Assessment created with score: {assessment_result.get('ai_maturity_score')}/100"
                    )
                    return True
                else:
                    self.log_test_result(
                        "AI Assessment CRM Integration", 
                        False, 
                        f"Assessment API failed: {assessment_response.status_code}"
                    )
                    return False
            else:
                self.log_test_result(
                    "Contact Form API", 
                    False, 
                    f"Contact form failed: {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test_result("CRM Integration Test", False, f"Error: {str(e)}")
            return False
    
    def test_marketing_integration(self) -> bool:
        """Test 4: Marketing Integration Test"""
        print("\n📧 Testing Marketing Integration...")
        
        try:
            # Test newsletter subscription with Odoo Marketing sync
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            newsletter_data = {
                "email": f"newsletter.test.{timestamp}@example.com"
            }
            
            response = requests.post(
                f"{self.api_url}/newsletter",
                json=newsletter_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                response_data = response.json()
                self.log_test_result(
                    "Newsletter Subscription API", 
                    True, 
                    f"Subscription created with ID: {response_data.get('id')}"
                )
                
                # Test duplicate prevention
                duplicate_response = requests.post(
                    f"{self.api_url}/newsletter",
                    json=newsletter_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if duplicate_response.status_code == 409:
                    self.log_test_result(
                        "Newsletter Duplicate Prevention", 
                        True, 
                        "Duplicate subscription correctly rejected"
                    )
                    return True
                else:
                    self.log_test_result(
                        "Newsletter Duplicate Prevention", 
                        False, 
                        f"Expected 409, got {duplicate_response.status_code}"
                    )
                    return False
            else:
                self.log_test_result(
                    "Newsletter Subscription API", 
                    False, 
                    f"Newsletter API failed: {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test_result("Marketing Integration Test", False, f"Error: {str(e)}")
            return False
    
    def test_calendar_integration(self) -> bool:
        """Test 5: Calendar Integration Test"""
        print("\n📅 Testing Calendar Integration...")
        
        try:
            # Test consultation booking with Odoo Calendar sync
            booking_datetime = datetime.now() + timedelta(days=7)
            booking_datetime = booking_datetime.replace(hour=14, minute=0, second=0, microsecond=0)
            
            booking_data = {
                "name": "Michael Chen",
                "email": f"michael.chen.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@startup.com",
                "phone": "+1-555-456-7890",
                "company": "StartupVenture Inc",
                "service_type": "AI Project Management",
                "preferred_datetime": booking_datetime.isoformat(),
                "timezone": "America/New_York",
                "message": "Looking to implement AI-powered project management for our growing team"
            }
            
            response = requests.post(
                f"{self.api_url}/book-consultation",
                json=booking_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                response_data = response.json()
                self.log_test_result(
                    "Calendar Booking API", 
                    True, 
                    f"Booking created with ID: {response_data.get('id')}, Status: {response_data.get('status')}"
                )
                
                # Test regular consultation booking (legacy endpoint)
                consultation_data = {
                    "name": "Test Consultant",
                    "email": f"consultant.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
                    "phone": "+1-555-987-6543",
                    "company": "Consulting Test Co",
                    "service_type": "Business Strategy Development",
                    "preferred_date": "2025-02-15",
                    "message": "Looking for strategic consulting services."
                }
                
                consultation_response = requests.post(
                    f"{self.api_url}/consultation",
                    json=consultation_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if consultation_response.status_code == 200:
                    consultation_result = consultation_response.json()
                    self.log_test_result(
                        "Consultation Booking API", 
                        True, 
                        f"Consultation created with ID: {consultation_result.get('id')}"
                    )
                    return True
                else:
                    self.log_test_result(
                        "Consultation Booking API", 
                        False, 
                        f"Consultation API failed: {consultation_response.status_code}"
                    )
                    return False
            else:
                self.log_test_result(
                    "Calendar Booking API", 
                    False, 
                    f"Calendar booking failed: {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test_result("Calendar Integration Test", False, f"Error: {str(e)}")
            return False
    
    def test_sales_integration(self) -> bool:
        """Test 6: Sales Integration Test (ROI Calculator)"""
        print("\n💰 Testing Sales Integration...")
        
        try:
            # Test ROI Calculator with Odoo Sales quotation integration
            roi_data = {
                "company_name": "InnovateTech Ltd",
                "email": f"ceo.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@innovatetech.com",
                "phone": "+1-555-345-6789",
                "industry": "Technology",
                "company_size": "51-200",
                "current_project_cost": 50000.0,
                "project_duration_months": 6,
                "current_efficiency_rating": 6,
                "desired_services": [
                    "AI Project Management",
                    "Digital Transformation",
                    "Operational Optimization"
                ]
            }
            
            response = requests.post(
                f"{self.api_url}/roi-calculator",
                json=roi_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                response_data = response.json()
                potential_savings = response_data.get('potential_savings', 0)
                roi_percentage = response_data.get('roi_percentage', 0)
                estimated_cost = response_data.get('estimated_project_cost', 0)
                
                self.log_test_result(
                    "ROI Calculator API", 
                    True, 
                    f"ROI: {roi_percentage:.1f}%, Savings: ${potential_savings:,.2f}, Cost: ${estimated_cost:,.2f}"
                )
                
                # Verify recommended services
                recommended_services = response_data.get('recommended_services', [])
                if len(recommended_services) > 0:
                    self.log_test_result(
                        "ROI Calculator Services", 
                        True, 
                        f"Generated {len(recommended_services)} service recommendations"
                    )
                    return True
                else:
                    self.log_test_result(
                        "ROI Calculator Services", 
                        False, 
                        "No service recommendations generated"
                    )
                    return False
            else:
                self.log_test_result(
                    "ROI Calculator API", 
                    False, 
                    f"ROI Calculator failed: {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test_result("Sales Integration Test", False, f"Error: {str(e)}")
            return False
    
    def test_production_readiness(self) -> bool:
        """Test 7: Production Readiness Test"""
        print("\n🚀 Testing Production Readiness...")
        
        try:
            # Test all critical endpoints
            endpoints_to_test = [
                ("GET", "", "Root API"),
                ("GET", "health", "Health Check"),
                ("GET", "analytics/overview", "Analytics")
            ]
            
            all_endpoints_working = True
            
            for method, endpoint, name in endpoints_to_test:
                try:
                    url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
                    response = requests.get(url, timeout=10)
                    
                    if response.status_code == 200:
                        self.log_test_result(f"{name} Endpoint", True, f"Status: {response.status_code}")
                    else:
                        self.log_test_result(f"{name} Endpoint", False, f"Status: {response.status_code}")
                        all_endpoints_working = False
                        
                except Exception as e:
                    self.log_test_result(f"{name} Endpoint", False, f"Error: {str(e)}")
                    all_endpoints_working = False
            
            # Test error handling
            try:
                # Test invalid endpoint
                response = requests.get(f"{self.api_url}/nonexistent", timeout=10)
                if response.status_code == 404:
                    self.log_test_result("Error Handling", True, "404 correctly returned for invalid endpoint")
                else:
                    self.log_test_result("Error Handling", False, f"Expected 404, got {response.status_code}")
                    all_endpoints_working = False
                    
                # Test invalid data validation
                invalid_contact = {
                    "name": "Test",
                    "email": "invalid-email",
                    "subject": "Test",
                    "message": "Test"
                }
                
                response = requests.post(
                    f"{self.api_url}/contact",
                    json=invalid_contact,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 422:
                    self.log_test_result("Data Validation", True, "422 correctly returned for invalid email")
                else:
                    self.log_test_result("Data Validation", False, f"Expected 422, got {response.status_code}")
                    all_endpoints_working = False
                    
            except Exception as e:
                self.log_test_result("Error Handling Test", False, f"Error: {str(e)}")
                all_endpoints_working = False
            
            return all_endpoints_working
            
        except Exception as e:
            self.log_test_result("Production Readiness Test", False, f"Error: {str(e)}")
            return False
    
    def run_comprehensive_odoo_test(self):
        """Run comprehensive Odoo integration test suite"""
        print("🎯 ODOO SAAS 18.3 LIVE INTEGRATION TEST SUITE")
        print("=" * 60)
        print(f"Testing against: {self.odoo_url}")
        print(f"Database: {self.odoo_db}")
        print(f"Username: {self.odoo_username}")
        print("=" * 60)
        
        # Run all tests
        test_results = []
        
        test_results.append(self.test_odoo_authentication())
        test_results.append(self.test_odoo_modules_access())
        test_results.append(self.test_crm_integration())
        test_results.append(self.test_marketing_integration())
        test_results.append(self.test_calendar_integration())
        test_results.append(self.test_sales_integration())
        test_results.append(self.test_production_readiness())
        
        # Print final results
        print("\n" + "=" * 60)
        print("📊 ODOO INTEGRATION TEST RESULTS")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        success_rate = (self.tests_passed/self.tests_run)*100 if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test.get('success', False)]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test.get('details', 'No details')}")
        
        # Overall assessment
        print("\n🎯 PRODUCTION READINESS ASSESSMENT:")
        if success_rate >= 90:
            print("✅ EXCELLENT - System is production ready")
        elif success_rate >= 75:
            print("⚠️  GOOD - Minor issues need attention")
        elif success_rate >= 50:
            print("🔧 NEEDS WORK - Several issues need fixing")
        else:
            print("❌ NOT READY - Major issues need resolution")
        
        return success_rate >= 75

def main():
    """Main test execution"""
    tester = OdooLiveIntegrationTester()
    
    try:
        success = tester.run_comprehensive_odoo_test()
        return 0 if success else 1
    except Exception as e:
        print(f"\n💥 Test suite failed with error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())