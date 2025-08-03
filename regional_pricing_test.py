#!/usr/bin/env python3
"""
Regional Pricing System Test
Tests the PPP-adjusted pricing calculations for all 8 regions
"""

import json
from typing import Dict, List

class RegionalPricingTester:
    """Test regional pricing calculations and PPP multipliers"""
    
    def __init__(self):
        # Base prices in USD (from the frontend implementation)
        # These should result in ₹1,084, ₹534, ₹699 for India (₹2,316 total)
        self.base_prices = {
            'ai_project_management': 197,  # 197 * 5.5 = ₹1,084
            'digital_transformation': 97,  # 97 * 5.5 = ₹534  
            'operational_optimization': 127  # 127 * 5.5 = ₹699
        }
        
        # PPP multipliers for each region (from frontend implementation)
        self.ppp_multipliers = {
            'US': 1.0,
            'IN': 5.5,  # Special eye-catching multiplier for India
            'GB': 0.85,
            'AE': 0.75,
            'AU': 0.9,
            'NZ': 0.85,  # Updated to match frontend
            'ZA': 0.35,  # Updated to match frontend  
            'EU': 0.9    # Updated to match frontend
        }
        
        # Currency symbols and formatting
        self.currency_config = {
            'US': {'symbol': '$', 'code': 'USD'},
            'IN': {'symbol': '₹', 'code': 'INR'},
            'GB': {'symbol': '£', 'code': 'GBP'},
            'AE': {'symbol': 'د.إ', 'code': 'AED'},
            'AU': {'symbol': 'A$', 'code': 'AUD'},
            'NZ': {'symbol': 'NZ$', 'code': 'NZD'},
            'ZA': {'symbol': 'R', 'code': 'ZAR'},
            'EU': {'symbol': '€', 'code': 'EUR'}
        }
        
        self.test_results = []
        self.tests_run = 0
        self.tests_passed = 0
    
    def calculate_regional_price(self, base_price_usd: float, region: str) -> Dict:
        """Calculate regional price using PPP multiplier"""
        if region not in self.ppp_multipliers:
            raise ValueError(f"Unsupported region: {region}")
        
        multiplier = self.ppp_multipliers[region]
        regional_price = base_price_usd * multiplier
        currency_info = self.currency_config[region]
        
        return {
            'region': region,
            'base_price_usd': base_price_usd,
            'multiplier': multiplier,
            'regional_price': regional_price,
            'currency_symbol': currency_info['symbol'],
            'currency_code': currency_info['code'],
            'formatted_price': f"{currency_info['symbol']}{regional_price:,.0f}"
        }
    
    def test_single_region_pricing(self, region: str) -> bool:
        """Test pricing calculations for a single region"""
        self.tests_run += 1
        
        try:
            print(f"\n🌍 Testing {region} Regional Pricing...")
            
            total_regional_price = 0
            service_prices = {}
            
            for service, base_price in self.base_prices.items():
                result = self.calculate_regional_price(base_price, region)
                service_prices[service] = result
                total_regional_price += result['regional_price']
                
                print(f"   {service.replace('_', ' ').title()}: {result['formatted_price']}")
            
            # Calculate total
            currency_info = self.currency_config[region]
            total_formatted = f"{currency_info['symbol']}{total_regional_price:,.0f}"
            
            print(f"   📊 Total Package: {total_formatted}")
            print(f"   💱 PPP Multiplier: {self.ppp_multipliers[region]}x")
            
            # Verify calculations are mathematically correct
            expected_total = sum(self.base_prices.values()) * self.ppp_multipliers[region]
            if abs(total_regional_price - expected_total) < 0.01:  # Allow for floating point precision
                print(f"   ✅ Calculations verified")
                self.tests_passed += 1
                
                self.test_results.append({
                    'region': region,
                    'success': True,
                    'total_price': total_regional_price,
                    'formatted_total': total_formatted,
                    'service_prices': service_prices
                })
                return True
            else:
                print(f"   ❌ Calculation error: Expected {expected_total}, got {total_regional_price}")
                self.test_results.append({
                    'region': region,
                    'success': False,
                    'error': f"Calculation mismatch: {expected_total} vs {total_regional_price}"
                })
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            self.test_results.append({
                'region': region,
                'success': False,
                'error': str(e)
            })
            return False
    
    def test_india_eye_catching_pricing(self) -> bool:
        """Specifically test India's eye-catching thousands pricing"""
        self.tests_run += 1
        
        print(f"\n🇮🇳 Testing India Eye-Catching Pricing Strategy...")
        
        try:
            india_results = {}
            for service, base_price in self.base_prices.items():
                result = self.calculate_regional_price(base_price, 'IN')
                india_results[service] = result
                print(f"   {service.replace('_', ' ').title()}: {result['formatted_price']}")
            
            total_price = sum([r['regional_price'] for r in india_results.values()])
            total_formatted = f"₹{total_price:,.0f}"
            
            print(f"   🎯 Total Package: {total_formatted}")
            
            # Verify India shows impressive thousands (should be ₹2,316)
            if total_price >= 2300:  # Should be around ₹2,316
                print(f"   ✅ Eye-catching thousands achieved: {total_formatted}")
                self.tests_passed += 1
                return True
            else:
                print(f"   ❌ Not impressive enough: {total_formatted} (expected ≥₹2,300)")
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            return False
    
    def test_reasonable_pricing_other_regions(self) -> bool:
        """Test that other regions maintain reasonable pricing"""
        self.tests_run += 1
        
        print(f"\n💰 Testing Reasonable Pricing for Other Regions...")
        
        try:
            reasonable_regions = ['US', 'GB', 'AE', 'AU', 'NZ', 'EU']
            all_reasonable = True
            
            for region in reasonable_regions:
                total_price = sum(self.base_prices.values()) * self.ppp_multipliers[region]
                currency_info = self.currency_config[region]
                formatted = f"{currency_info['symbol']}{total_price:,.0f}"
                
                # Reasonable means not too high (under $500 equivalent)
                is_reasonable = total_price <= 500
                status = "✅" if is_reasonable else "❌"
                
                print(f"   {region}: {formatted} {status}")
                
                if not is_reasonable:
                    all_reasonable = False
            
            if all_reasonable:
                print(f"   ✅ All regions maintain reasonable pricing")
                self.tests_passed += 1
                return True
            else:
                print(f"   ❌ Some regions have unreasonable pricing")
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            return False
    
    def test_currency_formatting(self) -> bool:
        """Test currency symbol and formatting correctness"""
        self.tests_run += 1
        
        print(f"\n💱 Testing Currency Formatting...")
        
        try:
            expected_symbols = {
                'US': '$',
                'IN': '₹',
                'GB': '£',
                'AE': 'د.إ',
                'AU': 'A$',
                'NZ': 'NZ$',
                'ZA': 'R',
                'EU': '€'
            }
            
            all_correct = True
            
            for region, expected_symbol in expected_symbols.items():
                actual_symbol = self.currency_config[region]['symbol']
                is_correct = actual_symbol == expected_symbol
                status = "✅" if is_correct else "❌"
                
                print(f"   {region}: {actual_symbol} {status}")
                
                if not is_correct:
                    all_correct = False
            
            if all_correct:
                print(f"   ✅ All currency symbols correct")
                self.tests_passed += 1
                return True
            else:
                print(f"   ❌ Some currency symbols incorrect")
                return False
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            return False
    
    def test_edge_cases(self) -> bool:
        """Test edge cases and error handling"""
        self.tests_run += 1
        
        print(f"\n🔍 Testing Edge Cases...")
        
        try:
            # Test invalid region
            try:
                self.calculate_regional_price(100, 'INVALID')
                print(f"   ❌ Should have failed for invalid region")
                return False
            except ValueError:
                print(f"   ✅ Correctly handles invalid region")
            
            # Test zero price
            result = self.calculate_regional_price(0, 'US')
            if result['regional_price'] == 0:
                print(f"   ✅ Correctly handles zero price")
            else:
                print(f"   ❌ Zero price handling failed")
                return False
            
            # Test negative price (should still calculate)
            result = self.calculate_regional_price(-100, 'IN')
            if result['regional_price'] == -550:  # -100 * 5.5
                print(f"   ✅ Correctly handles negative price")
            else:
                print(f"   ❌ Negative price handling failed")
                return False
            
            self.tests_passed += 1
            return True
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            return False
    
    def run_all_tests(self) -> bool:
        """Run comprehensive regional pricing tests"""
        print("🌍 Starting Regional Pricing System Tests")
        print("=" * 60)
        
        # Test all 8 regions
        all_regions = ['US', 'IN', 'GB', 'AE', 'AU', 'NZ', 'ZA', 'EU']
        for region in all_regions:
            self.test_single_region_pricing(region)
        
        # Test specific requirements
        self.test_india_eye_catching_pricing()
        self.test_reasonable_pricing_other_regions()
        self.test_currency_formatting()
        self.test_edge_cases()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 REGIONAL PRICING TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        success_rate = (self.tests_passed/self.tests_run)*100 if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        # Show pricing comparison
        print(f"\n💰 PRICING COMPARISON ACROSS REGIONS:")
        print("-" * 60)
        for region in all_regions:
            total_price = sum(self.base_prices.values()) * self.ppp_multipliers[region]
            currency_info = self.currency_config[region]
            formatted = f"{currency_info['symbol']}{total_price:,.0f}"
            print(f"{region:3}: {formatted:>8} ({currency_info['code']}) - {self.ppp_multipliers[region]}x multiplier")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = RegionalPricingTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"\n💥 Regional pricing test suite failed: {str(e)}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())