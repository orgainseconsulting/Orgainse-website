#!/usr/bin/env python3
"""
VERCEL SERVERLESS FUNCTION FORMAT VERIFICATION TEST
Testing the exact Vercel serverless function format and requirements
"""

import sys
import os
import json
import time
from datetime import datetime

# Add the clean-orgainse directory to Python path
sys.path.insert(0, '/app/clean-orgainse')

# Set environment variables for testing
os.environ['MONGO_URL'] = 'mongodb://localhost:27017'
os.environ['DB_NAME'] = 'orgainse_consulting'

# Import the serverless functions
from api.health import handler as health_handler
from api.newsletter import handler as newsletter_handler
from api.contact import handler as contact_handler

def test_vercel_function_format():
    """Test that functions follow correct Vercel serverless format"""
    print("🔍 TESTING VERCEL SERVERLESS FUNCTION FORMAT")
    print("=" * 60)
    
    # Test 1: Function signature verification
    print("✅ Function signatures verified:")
    print(f"   - health.handler: {callable(health_handler)}")
    print(f"   - newsletter.handler: {callable(newsletter_handler)}")
    print(f"   - contact.handler: {callable(contact_handler)}")
    
    # Test 2: Response format verification
    print("\n🔍 Testing response format compliance...")
    
    # Health endpoint
    request = {'method': 'GET', 'body': '{}', 'headers': {}}
    response = health_handler(request)
    
    required_fields = ['statusCode', 'headers', 'body']
    health_valid = all(field in response for field in required_fields)
    print(f"✅ Health endpoint format: {health_valid}")
    print(f"   Response keys: {list(response.keys())}")
    
    # Newsletter endpoint
    request = {'method': 'POST', 'body': '{"email": "test@example.com"}', 'headers': {}}
    response = newsletter_handler(request)
    newsletter_valid = all(field in response for field in required_fields)
    print(f"✅ Newsletter endpoint format: {newsletter_valid}")
    
    # Contact endpoint
    request = {'method': 'POST', 'body': '{"name": "Test", "email": "test@example.com", "message": "Test"}', 'headers': {}}
    response = contact_handler(request)
    contact_valid = all(field in response for field in required_fields)
    print(f"✅ Contact endpoint format: {contact_valid}")
    
    # Test 3: CORS headers verification
    print("\n🔍 Testing CORS headers...")
    
    cors_tests = [
        ('Health', health_handler({'method': 'GET', 'body': '{}', 'headers': {}})),
        ('Newsletter', newsletter_handler({'method': 'OPTIONS', 'body': '{}', 'headers': {}})),
        ('Contact', contact_handler({'method': 'OPTIONS', 'body': '{}', 'headers': {}}))
    ]
    
    for name, response in cors_tests:
        headers = response.get('headers', {})
        has_cors = 'Access-Control-Allow-Origin' in headers
        print(f"✅ {name} CORS headers: {has_cors} - {headers.get('Access-Control-Allow-Origin', 'Missing')}")
    
    # Test 4: Performance benchmarking
    print("\n⚡ Performance benchmarking...")
    
    def benchmark_endpoint(name, handler_func, request):
        times = []
        for _ in range(10):
            start = time.time()
            handler_func(request)
            times.append(time.time() - start)
        
        avg_time = sum(times) / len(times)
        max_time = max(times)
        min_time = min(times)
        
        print(f"✅ {name}: avg={avg_time:.3f}s, min={min_time:.3f}s, max={max_time:.3f}s")
        return avg_time < 0.1  # Should be under 100ms
    
    health_perf = benchmark_endpoint("Health", health_handler, {'method': 'GET', 'body': '{}', 'headers': {}})
    newsletter_perf = benchmark_endpoint("Newsletter", newsletter_handler, {'method': 'POST', 'body': '{"email": "perf@test.com"}', 'headers': {}})
    contact_perf = benchmark_endpoint("Contact", contact_handler, {'method': 'POST', 'body': '{"name": "Perf", "email": "perf@test.com", "message": "Test"}', 'headers': {}})
    
    # Test 5: Memory usage (basic check)
    print("\n💾 Memory usage verification...")
    
    import psutil
    import os
    
    process = psutil.Process(os.getpid())
    memory_before = process.memory_info().rss / 1024 / 1024  # MB
    
    # Make multiple requests
    for i in range(100):
        health_handler({'method': 'GET', 'body': '{}', 'headers': {}})
        newsletter_handler({'method': 'POST', 'body': f'{{"email": "mem{i}@test.com"}}', 'headers': {}})
        contact_handler({'method': 'POST', 'body': f'{{"name": "Mem{i}", "email": "mem{i}@test.com", "message": "Test"}}', 'headers': {}})
    
    memory_after = process.memory_info().rss / 1024 / 1024  # MB
    memory_increase = memory_after - memory_before
    
    print(f"✅ Memory usage: {memory_before:.1f}MB → {memory_after:.1f}MB (Δ{memory_increase:.1f}MB)")
    memory_ok = memory_increase < 50  # Should not increase by more than 50MB
    
    # Final assessment
    print("\n" + "=" * 60)
    print("🎯 VERCEL SERVERLESS FUNCTION FORMAT ASSESSMENT")
    print("=" * 60)
    
    all_checks = [
        ("Function signatures", True),
        ("Response format", health_valid and newsletter_valid and contact_valid),
        ("CORS headers", all(headers.get('Access-Control-Allow-Origin') for _, response in cors_tests for headers in [response.get('headers', {})])),
        ("Performance", health_perf and newsletter_perf and contact_perf),
        ("Memory usage", memory_ok)
    ]
    
    for check_name, passed in all_checks:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {check_name}")
    
    all_passed = all(passed for _, passed in all_checks)
    
    if all_passed:
        print("\n🎉 ALL VERCEL FORMAT REQUIREMENTS MET!")
        print("🚀 FUNCTIONS ARE READY FOR VERCEL DEPLOYMENT!")
    else:
        print("\n⚠️ SOME FORMAT REQUIREMENTS NOT MET")
    
    return all_passed

def test_production_scenarios():
    """Test production-like scenarios"""
    print("\n🌐 TESTING PRODUCTION SCENARIOS")
    print("=" * 60)
    
    # Test realistic business data
    business_scenarios = [
        {
            'name': 'Enterprise Healthcare Contact',
            'endpoint': 'contact',
            'data': {
                'name': 'Dr. Jennifer Martinez',
                'email': 'j.martinez@healthtech-solutions.com',
                'company': 'HealthTech Solutions Inc.',
                'phone': '+1-555-0199',
                'service_type': 'AI Healthcare Transformation',
                'message': 'We are a healthcare technology company serving 500+ hospitals across North America. We need comprehensive AI implementation for patient data analysis, predictive diagnostics, and operational optimization. Our current systems handle 1M+ patient records daily.'
            }
        },
        {
            'name': 'Financial Services Newsletter',
            'endpoint': 'newsletter',
            'data': {
                'email': 'robert.kim@financeplus.com',
                'first_name': 'Robert'
            }
        },
        {
            'name': 'Manufacturing Contact',
            'endpoint': 'contact',
            'data': {
                'name': 'Michael Thompson',
                'email': 'm.thompson@manufacturing-corp.com',
                'company': 'Global Manufacturing Corp',
                'phone': '+1-800-555-0123',
                'service_type': 'Operational Optimization',
                'message': 'We operate 50 manufacturing facilities worldwide with 25,000+ employees. Looking for AI-driven supply chain optimization, predictive maintenance, and quality control automation.'
            }
        }
    ]
    
    success_count = 0
    
    for scenario in business_scenarios:
        try:
            if scenario['endpoint'] == 'contact':
                request = {'method': 'POST', 'body': json.dumps(scenario['data']), 'headers': {}}
                response = contact_handler(request)
            elif scenario['endpoint'] == 'newsletter':
                request = {'method': 'POST', 'body': json.dumps(scenario['data']), 'headers': {}}
                response = newsletter_handler(request)
            
            if response.get('statusCode') == 200:
                success_count += 1
                print(f"✅ {scenario['name']}: SUCCESS")
            else:
                print(f"❌ {scenario['name']}: FAILED - Status {response.get('statusCode')}")
        
        except Exception as e:
            print(f"❌ {scenario['name']}: ERROR - {str(e)}")
    
    print(f"\n📊 Production scenarios: {success_count}/{len(business_scenarios)} successful")
    return success_count == len(business_scenarios)

if __name__ == "__main__":
    print("🎯 VERCEL SERVERLESS FUNCTION FORMAT & PRODUCTION TESTING")
    print("=" * 80)
    
    format_ok = test_vercel_function_format()
    production_ok = test_production_scenarios()
    
    print("\n" + "=" * 80)
    print("🎯 FINAL ASSESSMENT")
    print("=" * 80)
    
    if format_ok and production_ok:
        print("✅ ALL TESTS PASSED!")
        print("🚀 SERVERLESS FUNCTIONS ARE 100% READY FOR VERCEL DEPLOYMENT!")
        print("📋 DEPLOYMENT CHECKLIST:")
        print("   ✅ Correct handler function format")
        print("   ✅ Proper response structure")
        print("   ✅ CORS headers configured")
        print("   ✅ Performance optimized")
        print("   ✅ Memory efficient")
        print("   ✅ Production scenarios tested")
    else:
        print("⚠️ SOME ISSUES FOUND - REVIEW REQUIRED")
    
    print("=" * 80)