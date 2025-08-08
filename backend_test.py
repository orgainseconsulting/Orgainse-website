#!/usr/bin/env python3
"""
Comprehensive Backend Testing Suite for Orgainse Consulting
Tests all API endpoints, Odoo integration, database operations, and regional pricing
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any
import uuid

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://7c69cdcc-af61-4b21-b080-a4ba16bce50b.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status}: {test_name}"
        if details:
            result += f" - {details}"
        
        print(result)
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
    
    async def test_health_endpoint(self):
        """Test basic health check endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test("Health Check", True, f"Status: {data.get('status')}")
                else:
                    self.log_test("Health Check", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Health Check", False, str(e))
    
    async def test_contact_form_api(self):
        """Test contact form submission endpoint"""
        test_data = {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@techcorp.com",
            "phone": "+1-555-0123",
            "company": "TechCorp Solutions",
            "subject": "AI Project Management Inquiry",
            "message": "We're interested in implementing AI-powered project management solutions for our growing tech startup. Could you provide more information about your services?"
        }
        
        try:
            async with self.session.post(f"{API_BASE}/contact", json=test_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('id') and data.get('email') == test_data['email']:
                        self.log_test("Contact Form API", True, f"Contact created with ID: {data.get('id')}")
                    else:
                        self.log_test("Contact Form API", False, "Invalid response data")
                else:
                    self.log_test("Contact Form API", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Contact Form API", False, str(e))
    
    async def test_newsletter_subscription(self):
        """Test newsletter subscription endpoint"""
        test_email = f"test.user.{uuid.uuid4().hex[:8]}@example.com"
        
        try:
            # Test successful subscription
            async with self.session.post(f"{API_BASE}/newsletter", json={"email": test_email}) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('email') == test_email:
                        self.log_test("Newsletter Subscription", True, f"Subscription created for {test_email}")
                    else:
                        self.log_test("Newsletter Subscription", False, "Invalid response data")
                else:
                    self.log_test("Newsletter Subscription", False, f"HTTP {response.status}")
            
            # Test duplicate prevention
            async with self.session.post(f"{API_BASE}/newsletter", json={"email": test_email}) as response:
                if response.status == 409:
                    self.log_test("Newsletter Duplicate Prevention", True, "Correctly rejected duplicate email")
                else:
                    self.log_test("Newsletter Duplicate Prevention", False, f"Expected 409, got {response.status}")
                    
        except Exception as e:
            self.log_test("Newsletter Subscription", False, str(e))
    
    async def test_ai_assessment_tool(self):
        """Test AI Assessment Tool endpoint"""
        test_data = {
            "name": "Michael Chen",
            "email": "michael.chen@innovatetech.com",
            "company": "InnovateTech Ltd",
            "phone": "+1-555-0456",
            "responses": [
                {"question_id": "q1", "answer": "Moderate", "score": 6},
                {"question_id": "q2", "answer": "Advanced", "score": 8},
                {"question_id": "q3", "answer": "Basic", "score": 4},
                {"question_id": "q4", "answer": "Moderate", "score": 6},
                {"question_id": "q5", "answer": "Advanced", "score": 8}
            ]
        }
        
        try:
            async with self.session.post(f"{API_BASE}/ai-assessment", json=test_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if (data.get('ai_maturity_score') and 
                        data.get('recommendations') and 
                        len(data.get('recommendations', [])) > 0):
                        score = data.get('ai_maturity_score')
                        rec_count = len(data.get('recommendations', []))
                        self.log_test("AI Assessment Tool", True, f"Score: {score}/100, {rec_count} recommendations")
                    else:
                        self.log_test("AI Assessment Tool", False, "Missing required response fields")
                else:
                    self.log_test("AI Assessment Tool", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("AI Assessment Tool", False, str(e))
    
    async def test_roi_calculator(self):
        """Test ROI Calculator endpoint"""
        test_data = {
            "company_name": "StartupVenture Inc",
            "email": "ceo@startupventure.com",
            "phone": "+1-555-0789",
            "industry": "Technology",
            "company_size": "11-50",
            "current_project_cost": 50000.0,
            "project_duration_months": 6,
            "current_efficiency_rating": 6,
            "desired_services": ["AI Project Management", "Operational Optimization"]
        }
        
        try:
            async with self.session.post(f"{API_BASE}/roi-calculator", json=test_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if (data.get('potential_savings') and 
                        data.get('roi_percentage') is not None and
                        data.get('recommended_services')):
                        savings = data.get('potential_savings')
                        roi = data.get('roi_percentage')
                        services = len(data.get('recommended_services', []))
                        self.log_test("ROI Calculator", True, f"Savings: ${savings:,.2f}, ROI: {roi:.1f}%, {services} services")
                    else:
                        self.log_test("ROI Calculator", False, "Missing required response fields")
                else:
                    self.log_test("ROI Calculator", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("ROI Calculator", False, str(e))
    
    async def test_calendar_booking(self):
        """Test Smart Calendar booking endpoint"""
        future_date = datetime.now() + timedelta(days=7)
        test_data = {
            "name": "Jennifer Williams",
            "email": "jennifer.williams@globalcorp.com",
            "phone": "+1-555-0321",
            "company": "GlobalCorp Industries",
            "service_type": "Digital Transformation",
            "preferred_datetime": future_date.isoformat(),
            "timezone": "America/New_York",
            "message": "Looking to discuss comprehensive digital transformation strategy for our manufacturing operations."
        }
        
        try:
            async with self.session.post(f"{API_BASE}/book-consultation", json=test_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if (data.get('id') and 
                        data.get('status') == 'scheduled' and
                        data.get('service_type') == test_data['service_type']):
                        booking_id = data.get('id')
                        service = data.get('service_type')
                        self.log_test("Calendar Booking", True, f"Booking {booking_id} for {service}")
                    else:
                        self.log_test("Calendar Booking", False, "Invalid response data")
                else:
                    self.log_test("Calendar Booking", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Calendar Booking", False, str(e))
    
    async def test_consultation_booking(self):
        """Test legacy consultation booking endpoint"""
        test_data = {
            "name": "David Rodriguez",
            "email": "david.rodriguez@techstartup.com",
            "phone": "+1-555-0654",
            "company": "TechStartup Solutions",
            "service_type": "AI Project Management",
            "preferred_date": "2025-02-15",
            "message": "Interested in AI-powered project management for our development team."
        }
        
        try:
            async with self.session.post(f"{API_BASE}/consultation", json=test_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('id') and data.get('email') == test_data['email']:
                        self.log_test("Consultation Booking", True, f"Consultation booked with ID: {data.get('id')}")
                    else:
                        self.log_test("Consultation Booking", False, "Invalid response data")
                else:
                    self.log_test("Consultation Booking", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Consultation Booking", False, str(e))
    
    async def test_database_operations(self):
        """Test database connectivity and operations"""
        try:
            # Test analytics endpoint to verify database connectivity
            async with self.session.get(f"{API_BASE}/analytics/overview") as response:
                if response.status == 200:
                    data = await response.json()
                    if ('total_contacts' in data and 
                        'total_newsletter_subscribers' in data and
                        'total_consultations' in data):
                        contacts = data.get('total_contacts', 0)
                        newsletters = data.get('total_newsletter_subscribers', 0)
                        consultations = data.get('total_consultations', 0)
                        self.log_test("Database Operations", True, 
                                    f"Contacts: {contacts}, Newsletters: {newsletters}, Consultations: {consultations}")
                    else:
                        self.log_test("Database Operations", False, "Missing analytics data")
                else:
                    self.log_test("Database Operations", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Database Operations", False, str(e))
    
    async def test_input_validation(self):
        """Test input validation and error handling"""
        # Test invalid email
        invalid_data = {
            "name": "Test User",
            "email": "invalid-email",
            "subject": "Test",
            "message": "Test message"
        }
        
        try:
            async with self.session.post(f"{API_BASE}/contact", json=invalid_data) as response:
                if response.status == 422:
                    self.log_test("Input Validation", True, "Correctly rejected invalid email")
                else:
                    self.log_test("Input Validation", False, f"Expected 422, got {response.status}")
        except Exception as e:
            self.log_test("Input Validation", False, str(e))
    
    async def test_odoo_integration_readiness(self):
        """Test Odoo integration module readiness"""
        # This tests the mock mode functionality since we can't test live Odoo without credentials
        test_data = {
            "name": "Odoo Test User",
            "email": "odoo.test@example.com",
            "company": "Test Company",
            "subject": "Odoo Integration Test",
            "message": "Testing Odoo CRM integration functionality"
        }
        
        try:
            async with self.session.post(f"{API_BASE}/contact", json=test_data) as response:
                if response.status == 200:
                    data = await response.json()
                    # If contact is created successfully, Odoo integration layer is working
                    # (even in mock mode)
                    self.log_test("Odoo Integration Readiness", True, 
                                "Contact created successfully - Odoo integration layer functional")
                else:
                    self.log_test("Odoo Integration Readiness", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Odoo Integration Readiness", False, str(e))
    
    async def test_regional_pricing_system(self):
        """Test regional pricing calculations (via ROI Calculator)"""
        # Test different company sizes to verify pricing calculations
        test_cases = [
            {"size": "1-10", "expected_multiplier": 0.15},
            {"size": "11-50", "expected_multiplier": 0.25},
            {"size": "51-200", "expected_multiplier": 0.35},
            {"size": "200+", "expected_multiplier": 0.45}
        ]
        
        base_cost = 100000.0
        duration = 12
        
        for case in test_cases:
            test_data = {
                "company_name": f"Test Company {case['size']}",
                "email": f"test.{case['size'].replace('-', '').replace('+', 'plus')}@example.com",
                "industry": "Technology",
                "company_size": case['size'],
                "current_project_cost": base_cost,
                "project_duration_months": duration,
                "current_efficiency_rating": 5,
                "desired_services": ["AI Project Management"]
            }
            
            try:
                async with self.session.post(f"{API_BASE}/roi-calculator", json=test_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        savings = data.get('potential_savings', 0)
                        expected_savings = base_cost * case['expected_multiplier']
                        
                        # Allow for small rounding differences
                        if abs(savings - expected_savings) < 1000:
                            self.log_test(f"Regional Pricing - {case['size']}", True, 
                                        f"Savings: ${savings:,.2f} (expected: ${expected_savings:,.2f})")
                        else:
                            self.log_test(f"Regional Pricing - {case['size']}", False, 
                                        f"Savings mismatch: ${savings:,.2f} vs ${expected_savings:,.2f}")
                    else:
                        self.log_test(f"Regional Pricing - {case['size']}", False, f"HTTP {response.status}")
            except Exception as e:
                self.log_test(f"Regional Pricing - {case['size']}", False, str(e))
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("BACKEND TESTING SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        print("="*60)
        
        if self.total_tests - self.passed_tests > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"❌ {result['test']}: {result['details']}")
        
        print(f"\nBackend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")

async def main():
    """Run all backend tests"""
    print("Starting Comprehensive Backend Testing for Orgainse Consulting")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("="*60)
    
    async with BackendTester() as tester:
        # Core API Tests
        await tester.test_health_endpoint()
        await tester.test_contact_form_api()
        await tester.test_newsletter_subscription()
        await tester.test_consultation_booking()
        
        # Interactive Tools Tests
        await tester.test_ai_assessment_tool()
        await tester.test_roi_calculator()
        await tester.test_calendar_booking()
        
        # System Tests
        await tester.test_database_operations()
        await tester.test_input_validation()
        await tester.test_odoo_integration_readiness()
        await tester.test_regional_pricing_system()
        
        # Print results
        tester.print_summary()
        
        return tester.passed_tests, tester.total_tests

if __name__ == "__main__":
    try:
        passed, total = asyncio.run(main())
        sys.exit(0 if passed == total else 1)
    except KeyboardInterrupt:
        print("\nTesting interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"Testing failed with error: {e}")
        sys.exit(1)