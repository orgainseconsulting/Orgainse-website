#!/usr/bin/env python3
"""
CRITICAL ADMIN DASHBOARD DATA ANALYSIS - Diagnose Display Issues and Current State

This test analyzes the admin API response structure and identifies the root cause
of the display issue where individual category counts show 0 despite total being 26.
"""

import requests
import json
import time
from datetime import datetime

def test_admin_api_response_structure():
    """Test /api/admin endpoint and examine exact response structure"""
    print("🔍 ADMIN API RESPONSE STRUCTURE ANALYSIS")
    print("=" * 60)
    
    try:
        # Test the admin API endpoint
        response = requests.get('http://localhost:8001/api/admin', timeout=10)
        
        print(f"✅ Admin API Response Status: {response.status_code}")
        print(f"✅ Response Time: {response.elapsed.total_seconds():.3f}s")
        
        if response.status_code == 200:
            data = response.json()
            
            # Document the exact response structure
            print("\n📊 EXACT BACKEND RESPONSE STRUCTURE:")
            print("-" * 40)
            
            # Check if summary exists
            if 'summary' in data:
                print("✅ Summary section found:")
                summary = data['summary']
                for key, value in summary.items():
                    print(f"   {key}: {value}")
                
                # Check for breakdown structure
                if 'breakdown' in summary:
                    print("\n✅ Breakdown structure found in summary:")
                    breakdown = summary['breakdown']
                    for key, value in breakdown.items():
                        print(f"   breakdown.{key}: {value}")
                else:
                    print("\n❌ NO 'breakdown' field found in summary!")
                    print("   Available summary fields:", list(summary.keys()))
            else:
                print("❌ NO 'summary' section found in response!")
            
            # Check data structure
            if 'data' in data:
                print("\n✅ Data section found:")
                data_section = data['data']
                for collection_name, collection_data in data_section.items():
                    count = len(collection_data) if isinstance(collection_data, list) else 0
                    print(f"   data.{collection_name}: {count} items")
            else:
                print("\n❌ NO 'data' section found in response!")
            
            # Full response structure for documentation
            print(f"\n📋 COMPLETE RESPONSE STRUCTURE:")
            print("-" * 40)
            print(json.dumps(data, indent=2, default=str)[:1000] + "..." if len(str(data)) > 1000 else json.dumps(data, indent=2, default=str))
            
            return data
            
        else:
            print(f"❌ Admin API failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Admin API test failed: {str(e)}")
        return None

def analyze_frontend_backend_mapping(backend_data):
    """Compare backend response structure with frontend expectations"""
    print("\n🔄 FRONTEND-BACKEND DATA MAPPING ANALYSIS")
    print("=" * 60)
    
    if not backend_data:
        print("❌ No backend data to analyze")
        return
    
    # What the frontend expects (from AdminDashboard.js lines 209-214)
    frontend_expectations = {
        'data?.summary?.breakdown?.newsletters': 'Newsletter count',
        'data?.summary?.breakdown?.contact_messages': 'Contact messages count',
        'data?.summary?.breakdown?.ai_assessments': 'AI assessments count',
        'data?.summary?.breakdown?.roi_calculators': 'ROI calculators count',
        'data?.summary?.breakdown?.service_inquiries': 'Service inquiries count',
        'data?.summary?.breakdown?.consultations': 'Consultations count'
    }
    
    # What the backend actually provides
    backend_provides = {}
    if 'summary' in backend_data:
        summary = backend_data['summary']
        for key, value in summary.items():
            backend_provides[f'data.summary.{key}'] = value
    
    print("🎯 FRONTEND EXPECTATIONS vs BACKEND REALITY:")
    print("-" * 50)
    
    for frontend_path, description in frontend_expectations.items():
        print(f"\n📱 Frontend expects: {frontend_path}")
        print(f"   Description: {description}")
        
        # Check if this path exists in backend response
        path_exists = False
        if 'summary' in backend_data and 'breakdown' in backend_data['summary']:
            breakdown = backend_data['summary']['breakdown']
            field_name = frontend_path.split('.')[-1]  # Get last part (e.g., 'newsletters')
            if field_name in breakdown:
                path_exists = True
                print(f"   ✅ Backend provides: {breakdown[field_name]}")
            else:
                print(f"   ❌ Backend does NOT provide this field")
        else:
            print(f"   ❌ Backend does NOT have breakdown structure")
    
    print(f"\n🔧 BACKEND ACTUALLY PROVIDES:")
    print("-" * 30)
    for key, value in backend_provides.items():
        print(f"   {key}: {value}")

def verify_mongodb_data_counts(backend_data):
    """Verify actual data count in each collection"""
    print("\n📊 MONGODB DATA VERIFICATION")
    print("=" * 60)
    
    if not backend_data or 'data' not in backend_data:
        print("❌ No data section in backend response")
        return
    
    data_section = backend_data['data']
    total_actual = 0
    
    print("📋 ACTUAL DATA COUNTS BY COLLECTION:")
    print("-" * 40)
    
    collections_mapping = {
        'newsletters': 'newsletter_subscriptions',
        'contact_messages': 'contact_messages', 
        'ai_assessment_leads': 'ai_assessment_leads',
        'roi_calculator_leads': 'roi_calculator_leads',
        'service_inquiries': 'service_inquiries',
        'consultation_leads': 'consultation_leads'
    }
    
    for display_name, collection_name in collections_mapping.items():
        if collection_name in data_section:
            count = len(data_section[collection_name])
            total_actual += count
            print(f"   {display_name}: {count} items")
            
            # Show sample data if available
            if count > 0 and isinstance(data_section[collection_name], list):
                sample = data_section[collection_name][0]
                print(f"      Sample fields: {list(sample.keys())[:5]}...")
        else:
            print(f"   {display_name}: Collection not found")
    
    print(f"\n📊 TOTAL CALCULATED: {total_actual}")
    
    # Compare with backend summary
    if 'summary' in backend_data and 'total_leads' in backend_data['summary']:
        backend_total = backend_data['summary']['total_leads']
        print(f"📊 BACKEND REPORTS: {backend_total}")
        
        if total_actual == backend_total:
            print("✅ Data counts match!")
        else:
            print(f"❌ Data count mismatch! Calculated: {total_actual}, Backend: {backend_total}")

def identify_root_cause(backend_data):
    """Identify the exact cause of the 0 counts display issue"""
    print("\n🎯 ROOT CAUSE ANALYSIS")
    print("=" * 60)
    
    if not backend_data:
        print("❌ Cannot analyze - no backend data")
        return
    
    print("🔍 ANALYZING THE DISPLAY ISSUE:")
    print("-" * 35)
    
    # Check if breakdown exists
    has_breakdown = 'summary' in backend_data and 'breakdown' in backend_data['summary']
    
    if not has_breakdown:
        print("🚨 ROOT CAUSE IDENTIFIED:")
        print("   ❌ Backend does NOT provide 'breakdown' structure in summary")
        print("   ❌ Frontend expects: data.summary.breakdown.newsletters")
        print("   ❌ Backend provides: data.summary.total_newsletters")
        print()
        print("💡 SOLUTION REQUIRED:")
        print("   1. Backend needs to add 'breakdown' object to summary")
        print("   2. OR Frontend needs to use direct summary fields")
        print()
        print("🔧 BACKEND SHOULD PROVIDE:")
        print("   summary: {")
        print("     breakdown: {")
        print("       newsletters: X,")
        print("       contact_messages: Y,")
        print("       ai_assessments: Z,")
        print("       roi_calculators: A,")
        print("       service_inquiries: B,")
        print("       consultations: C")
        print("     }")
        print("   }")
        
        # Show what backend currently provides
        if 'summary' in backend_data:
            print(f"\n🔧 BACKEND CURRENTLY PROVIDES:")
            summary = backend_data['summary']
            for key, value in summary.items():
                if key.startswith('total_'):
                    frontend_field = key.replace('total_', '')
                    if frontend_field == 'contacts':
                        frontend_field = 'contact_messages'
                    elif frontend_field == 'ai_assessments':
                        frontend_field = 'ai_assessments'
                    elif frontend_field == 'roi_calculators':
                        frontend_field = 'roi_calculators'
                    elif frontend_field == 'service_inquiries':
                        frontend_field = 'service_inquiries'
                    elif frontend_field == 'consultations':
                        frontend_field = 'consultations'
                    print(f"   {key}: {value} → should be breakdown.{frontend_field}")
    else:
        print("✅ Backend provides breakdown structure")
        breakdown = backend_data['summary']['breakdown']
        print("   Breakdown fields:", list(breakdown.keys()))

def main():
    """Main test execution"""
    print("🎯 CRITICAL ADMIN DASHBOARD DATA ANALYSIS")
    print("=" * 70)
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test 1: Admin API Response Structure Analysis
    backend_data = test_admin_api_response_structure()
    
    # Test 2: Frontend-Backend Data Mapping Issues
    analyze_frontend_backend_mapping(backend_data)
    
    # Test 3: MongoDB Data Verification
    verify_mongodb_data_counts(backend_data)
    
    # Test 4: Root Cause Identification
    identify_root_cause(backend_data)
    
    print("\n" + "=" * 70)
    print("🎯 ADMIN DASHBOARD DATA ANALYSIS COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    main()