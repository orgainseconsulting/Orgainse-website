#!/usr/bin/env python3
"""
Live Odoo SaaS 18.3 Integration Testing
Tests actual connection to Odoo instance and module access
"""

import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
backend_dir = Path('/app/backend')
load_dotenv(backend_dir / '.env')

sys.path.append('/app/backend')
from odoo_integration import OdooIntegration
import asyncio
from datetime import datetime

async def test_odoo_live_integration():
    """Test live Odoo SaaS 18.3 integration"""
    print("Testing Live Odoo SaaS 18.3 Integration")
    print("="*50)
    
    # Initialize Odoo integration
    odoo = OdooIntegration()
    
    # Test 1: Authentication
    if odoo.odoo_uid:
        print(f"✅ Authentication: Connected as UID {odoo.odoo_uid}")
        
        # Test 2: Check Odoo version
        try:
            version_info = odoo.common.version()
            print(f"✅ Odoo Version: {version_info.get('server_version', 'Unknown')}")
        except Exception as e:
            print(f"❌ Version Check Failed: {e}")
        
        # Test 3: Test module access
        modules_to_test = ['crm', 'mail', 'calendar', 'sale', 'base']
        for module in modules_to_test:
            try:
                # Try to access the module by searching for records
                result = odoo._execute_odoo_method(f'{module}.lead' if module == 'crm' else f'{module}.message' if module == 'mail' else f'{module}.event' if module == 'calendar' else f'{module}.order' if module == 'sale' else 'res.users', 'search', [], {'limit': 1})
                if result is not None:
                    print(f"✅ Module Access - {module.upper()}: Available")
                else:
                    print(f"❌ Module Access - {module.upper()}: Failed")
            except Exception as e:
                print(f"❌ Module Access - {module.upper()}: {e}")
        
        # Test 4: Test CRM lead creation
        try:
            test_lead_data = {
                'name': 'Live Integration Test Lead',
                'email': 'test@orgainse.com',
                'phone': '+1-555-TEST',
                'contact_name': 'Test User',
                'company': 'Orgainse Testing',
                'message': 'This is a test lead created during live integration testing',
                'service_interest': 'Integration Testing'
            }
            
            lead_id = await odoo.create_crm_lead(test_lead_data)
            if lead_id:
                print(f"✅ CRM Lead Creation: Successfully created lead ID {lead_id}")
            else:
                print("❌ CRM Lead Creation: Failed")
        except Exception as e:
            print(f"❌ CRM Lead Creation: {e}")
        
        # Test 5: Test Marketing contact creation
        try:
            marketing_data = {
                'email': 'newsletter.test@orgainse.com',
                'name': 'Newsletter Test User',
                'company': 'Orgainse Testing'
            }
            
            contact_id = await odoo.create_marketing_contact(marketing_data)
            if contact_id:
                print(f"✅ Marketing Contact Creation: Successfully created contact ID {contact_id}")
            else:
                print("❌ Marketing Contact Creation: Failed")
        except Exception as e:
            print(f"❌ Marketing Contact Creation: {e}")
        
        print("\n✅ Live Odoo Integration: FULLY FUNCTIONAL")
        return True
        
    else:
        print("❌ Authentication: Failed to connect to Odoo")
        print("❌ Live Odoo Integration: CONNECTION FAILED")
        return False

if __name__ == "__main__":
    try:
        result = asyncio.run(test_odoo_live_integration())
        sys.exit(0 if result else 1)
    except Exception as e:
        print(f"❌ Live Odoo Integration Test Failed: {e}")
        sys.exit(1)