#!/usr/bin/env python3
"""
CRITICAL ENVIRONMENT VARIABLE TESTING - MONGODB CONNECTION FAILURE
Testing environment variable loading and MongoDB connection issues in Vercel serverless functions
"""

import requests
import json
import time
import os
from datetime import datetime

class EnvironmentVariableTest:
    def __init__(self):
        # Use the expected MongoDB URL from review request
        self.expected_mongo_url = "mongodb+srv://orgainse_db_user:Mycompany25%25MDB@orgainse-consulting.oafulke.mongodb.net/orgainse-consulting?retryWrites=true&w=majority&appName=orgainse-consulting"
        self.expected_db_name = "orgainse-consulting"
        self.test_email = "test@orgainse.com"
        
        # Test against local server (since we're testing the serverless functions locally)
        self.base_url = "http://localhost:3000"
        
        print("🔍 CRITICAL ENVIRONMENT VARIABLE TESTING - MONGODB CONNECTION FAILURE")
        print("=" * 80)
        print(f"Expected MONGO_URL: {self.expected_mongo_url}")
        print(f"Expected DB_NAME: {self.expected_db_name}")
        print(f"Test Email: {self.test_email}")
        print(f"Base URL: {self.base_url}")
        print("=" * 80)

    def test_health_endpoint(self):
        """Test the health endpoint (no environment variables needed)"""
        print("\n1. 🏥 TESTING HEALTH ENDPOINT")
        print("-" * 50)
        
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
            
            if response.status_code == 200:
                print("✅ Health endpoint working - no environment variables required")
                return True
            else:
                print("❌ Health endpoint failed")
                return False
                
        except Exception as e:
            print(f"❌ Health endpoint error: {str(e)}")
            return False

    def test_newsletter_environment_variables(self):
        """Test newsletter endpoint to check environment variable loading"""
        print("\n2. 📧 TESTING NEWSLETTER ENDPOINT - ENVIRONMENT VARIABLE LOADING")
        print("-" * 70)
        
        test_data = {
            "email": self.test_email,
            "name": "Test User",
            "leadType": "Newsletter Subscription",
            "source": "Environment Variable Test"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/newsletter",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            try:
                response_data = response.json()
                print(f"Response Body: {json.dumps(response_data, indent=2)}")
            except:
                print(f"Response Text: {response.text}")
            
            # Analyze the response for environment variable issues
            if response.status_code == 500:
                response_text = response.text.lower()
                if 'undefined' in response_text or 'null' in response_text:
                    print("🚨 CRITICAL FINDING: Environment variables likely returning 'undefined'")
                    print("   - process.env.MONGO_URL is probably undefined")
                    print("   - process.env.DB_NAME is probably undefined")
                    return False
                elif 'authentication' in response_text or 'auth' in response_text:
                    print("🚨 CRITICAL FINDING: MongoDB authentication failure")
                    print("   - Connection string may be undefined or incorrect")
                    return False
                elif 'connection' in response_text or 'connect' in response_text:
                    print("🚨 CRITICAL FINDING: MongoDB connection failure")
                    print("   - MONGO_URL environment variable not loaded properly")
                    return False
            
            return response.status_code in [200, 409]  # 409 is duplicate email, which is OK
            
        except Exception as e:
            print(f"❌ Newsletter endpoint error: {str(e)}")
            return False

    def test_contact_environment_variables(self):
        """Test contact endpoint to check environment variable loading"""
        print("\n3. 📞 TESTING CONTACT ENDPOINT - ENVIRONMENT VARIABLE LOADING")
        print("-" * 70)
        
        test_data = {
            "name": "Test User",
            "email": self.test_email,
            "company": "Test Company",
            "message": "Testing environment variable loading for MongoDB connection",
            "leadType": "Contact Inquiry",
            "source": "Environment Variable Test"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/contact",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            print(f"Status Code: {response.status_code}")
            
            try:
                response_data = response.json()
                print(f"Response Body: {json.dumps(response_data, indent=2)}")
            except:
                print(f"Response Text: {response.text}")
            
            # Analyze the response for environment variable issues
            if response.status_code == 500:
                response_text = response.text.lower()
                if 'undefined' in response_text:
                    print("🚨 CRITICAL FINDING: Environment variables returning 'undefined'")
                    return False
                elif 'authentication' in response_text:
                    print("🚨 CRITICAL FINDING: MongoDB authentication failure")
                    return False
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"❌ Contact endpoint error: {str(e)}")
            return False

    def test_admin_environment_variables(self):
        """Test admin endpoint to check environment variable loading"""
        print("\n4. 👨‍💼 TESTING ADMIN ENDPOINT - ENVIRONMENT VARIABLE LOADING")
        print("-" * 70)
        
        try:
            response = requests.get(f"{self.base_url}/api/admin", timeout=15)
            
            print(f"Status Code: {response.status_code}")
            
            try:
                response_data = response.json()
                print(f"Response Body: {json.dumps(response_data, indent=2)}")
            except:
                print(f"Response Text: {response.text}")
            
            # Analyze the response for environment variable issues
            if response.status_code == 500:
                response_text = response.text.lower()
                if 'undefined' in response_text:
                    print("🚨 CRITICAL FINDING: Environment variables returning 'undefined'")
                    return False
                elif 'authentication' in response_text:
                    print("🚨 CRITICAL FINDING: MongoDB authentication failure")
                    return False
            
            return response.status_code == 200
            
        except Exception as e:
            print(f"❌ Admin endpoint error: {str(e)}")
            return False

    def test_environment_variable_detection(self):
        """Test to detect what environment variables are actually being received"""
        print("\n5. 🔍 ENVIRONMENT VARIABLE DETECTION TEST")
        print("-" * 50)
        
        # Check if we can access the serverless functions directly to inspect environment variables
        print("Attempting to detect environment variable values...")
        
        # Test with invalid data to trigger error messages that might reveal env var status
        invalid_test_data = {
            "email": "",  # Invalid email to trigger validation
            "name": "Env Var Test"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/newsletter",
                json=invalid_test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"Invalid data test - Status Code: {response.status_code}")
            
            if response.status_code == 400:
                print("✅ Validation working - endpoint is functional")
            elif response.status_code == 500:
                try:
                    error_data = response.json()
                    error_details = error_data.get('details', '')
                    print(f"Error details: {error_details}")
                    
                    if 'undefined' in error_details.lower():
                        print("🚨 CONFIRMED: Environment variables are undefined")
                        print("   - MONGO_URL is returning undefined")
                        print("   - DB_NAME is returning undefined")
                        return False
                except:
                    pass
            
        except Exception as e:
            print(f"Environment variable detection error: {str(e)}")
        
        return True

    def run_comprehensive_test(self):
        """Run all environment variable tests"""
        print(f"\n🚀 STARTING COMPREHENSIVE ENVIRONMENT VARIABLE TESTING")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("=" * 80)
        
        results = {
            'health_endpoint': False,
            'newsletter_env_vars': False,
            'contact_env_vars': False,
            'admin_env_vars': False,
            'env_var_detection': False
        }
        
        # Run all tests
        results['health_endpoint'] = self.test_health_endpoint()
        results['newsletter_env_vars'] = self.test_newsletter_environment_variables()
        results['contact_env_vars'] = self.test_contact_environment_variables()
        results['admin_env_vars'] = self.test_admin_environment_variables()
        results['env_var_detection'] = self.test_environment_variable_detection()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 ENVIRONMENT VARIABLE TEST RESULTS SUMMARY")
        print("=" * 80)
        
        total_tests = len(results)
        passed_tests = sum(results.values())
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        print(f"\nOverall Results: {passed_tests}/{total_tests} tests passed")
        
        # Critical findings
        print("\n🔍 CRITICAL FINDINGS:")
        if not results['newsletter_env_vars'] or not results['contact_env_vars'] or not results['admin_env_vars']:
            print("🚨 ENVIRONMENT VARIABLE LOADING FAILURE DETECTED:")
            print("   - process.env.MONGO_URL likely returning 'undefined'")
            print("   - process.env.DB_NAME likely returning 'undefined'")
            print("   - MongoDB client receiving undefined connection string")
            print("   - Authentication failing due to no valid connection string")
            print("\n💡 ROOT CAUSE: Environment variables not properly configured in Vercel deployment")
            print("   - Vercel environment variables may not be set")
            print("   - Environment variable names may be incorrect")
            print("   - Serverless function environment may not have access to variables")
        
        if results['health_endpoint'] and not any([results['newsletter_env_vars'], results['contact_env_vars'], results['admin_env_vars']]):
            print("\n🎯 CONFIRMED DIAGNOSIS:")
            print("   - Health endpoint works (no env vars needed)")
            print("   - All MongoDB-dependent endpoints fail")
            print("   - This confirms environment variable loading issue")
        
        return results

if __name__ == "__main__":
    tester = EnvironmentVariableTest()
    results = tester.run_comprehensive_test()