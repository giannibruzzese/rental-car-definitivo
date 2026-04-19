#!/usr/bin/env python3

import requests
import sys
from datetime import datetime

class CarRentalAPITester:
    def __init__(self, base_url="https://webapp-import-guide.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.client_user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if params:
            print(f"   Params: {params}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ FAILED - Network Error: {str(e)}")
            return False, {}

    def test_client_login(self):
        """Test client login with test credentials"""
        success, response = self.run_test(
            "Client Login",
            "POST",
            "auth/login",
            200,
            data={"email": "mario.rossi.test@email.com", "password": "password123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.client_user_id = response.get('user', {}).get('id')
            print(f"   ✅ Login successful, token obtained")
            print(f"   User ID: {self.client_user_id}")
            return True
        return False

    def test_get_vehicles(self):
        """Test getting available vehicles"""
        success, response = self.run_test(
            "Get Available Vehicles",
            "GET",
            "vehicles/available",
            200
        )
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} available vehicles")
            # Look for Fiat Panda
            fiat_panda = None
            for vehicle in response:
                if vehicle.get('marca', '').lower() == 'fiat' and 'panda' in vehicle.get('modello', '').lower():
                    fiat_panda = vehicle
                    break
            
            if fiat_panda:
                print(f"   ✅ Found Fiat Panda: {fiat_panda['marca']} {fiat_panda['modello']} - ID: {fiat_panda['id']}")
                print(f"   Base rate: €{fiat_panda.get('tariffa_giornaliera', 'N/A')}/day")
                return True, fiat_panda['id']
            else:
                print(f"   ⚠️  Fiat Panda not found in vehicle list")
                # Return first vehicle for testing
                if response:
                    first_vehicle = response[0]
                    print(f"   Using first vehicle for testing: {first_vehicle['marca']} {first_vehicle['modello']}")
                    return True, first_vehicle['id']
        return False, None

    def test_seasonal_pricing_july(self, vehicle_id):
        """Test seasonal pricing for July dates (should be €75/day)"""
        success, response = self.run_test(
            "Seasonal Pricing - July 2026 (Summer Rate)",
            "GET",
            "calcola-prezzo-dinamico",
            200,
            params={
                "veicolo_id": vehicle_id,
                "data_inizio": "2026-07-01",
                "data_fine": "2026-07-05"
            }
        )
        if success:
            daily_rate = response.get('tariffa_giornaliera')
            tariff_type = response.get('tariffa_applicata')
            tariff_name = response.get('nome_tariffa')
            
            print(f"   Daily Rate: €{daily_rate}")
            print(f"   Tariff Type: {tariff_type}")
            print(f"   Tariff Name: {tariff_name}")
            
            if daily_rate == 75.0:
                print(f"   ✅ Correct seasonal rate applied (€75/day)")
                return True
            else:
                print(f"   ❌ Expected €75/day, got €{daily_rate}/day")
                return False
        return False

    def test_base_pricing_april(self, vehicle_id):
        """Test base pricing for April dates (should be €35/day)"""
        success, response = self.run_test(
            "Base Pricing - April 2026 (Non-seasonal)",
            "GET",
            "calcola-prezzo-dinamico",
            200,
            params={
                "veicolo_id": vehicle_id,
                "data_inizio": "2026-04-01",
                "data_fine": "2026-04-05"
            }
        )
        if success:
            daily_rate = response.get('tariffa_giornaliera')
            tariff_type = response.get('tariffa_applicata')
            
            print(f"   Daily Rate: €{daily_rate}")
            print(f"   Tariff Type: {tariff_type}")
            
            if daily_rate == 35.0:
                print(f"   ✅ Correct base rate applied (€35/day)")
                return True
            else:
                print(f"   ❌ Expected €35/day, got €{daily_rate}/day")
                return False
        return False

    def test_specific_vehicle_pricing(self):
        """Test the specific vehicle ID mentioned in requirements"""
        vehicle_id = "7aee8096-e295-47b1-a099-8a153ac2c3c2"
        success, response = self.run_test(
            "Specific Vehicle Pricing Test",
            "GET",
            "calcola-prezzo-dinamico",
            200,
            params={
                "veicolo_id": vehicle_id,
                "data_inizio": "2026-07-01",
                "data_fine": "2026-07-05"
            }
        )
        if success:
            daily_rate = response.get('tariffa_giornaliera')
            print(f"   Daily Rate for specific vehicle: €{daily_rate}")
            
            if daily_rate == 75.0:
                print(f"   ✅ Specific vehicle test passed (€75/day)")
                return True
            else:
                print(f"   ⚠️  Expected €75/day, got €{daily_rate}/day")
                return False
        return False

    def test_get_vehicle_details(self, vehicle_id):
        """Test getting specific vehicle details"""
        success, response = self.run_test(
            "Get Vehicle Details",
            "GET",
            f"vehicles/{vehicle_id}",
            200
        )
        if success:
            print(f"   Vehicle: {response.get('marca')} {response.get('modello')}")
            print(f"   Base Rate: €{response.get('tariffa_giornaliera')}/day")
            return True
        return False

def main():
    print("🚗 Car Rental Seasonal Pricing API Test")
    print("=" * 50)
    
    tester = CarRentalAPITester()
    
    # Test 1: Client Login
    if not tester.test_client_login():
        print("\n❌ Login failed, stopping tests")
        return 1

    # Test 2: Get Available Vehicles
    vehicles_success, vehicle_id = tester.test_get_vehicles()
    if not vehicles_success or not vehicle_id:
        print("\n❌ Failed to get vehicles, stopping tests")
        return 1

    # Test 3: Get Vehicle Details
    tester.test_get_vehicle_details(vehicle_id)

    # Test 4: Seasonal Pricing (July - should be €75)
    july_success = tester.test_seasonal_pricing_july(vehicle_id)

    # Test 5: Base Pricing (April - should be €35)
    april_success = tester.test_base_pricing_april(vehicle_id)

    # Test 6: Specific Vehicle Test (from requirements)
    specific_success = tester.test_specific_vehicle_pricing()

    # Print Results
    print("\n" + "=" * 50)
    print(f"📊 TEST RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Critical test results
    critical_tests = [july_success, april_success]
    critical_passed = sum(critical_tests)
    
    print(f"\n🎯 CRITICAL SEASONAL PRICING TESTS:")
    print(f"July Seasonal Rate (€75): {'✅ PASS' if july_success else '❌ FAIL'}")
    print(f"April Base Rate (€35): {'✅ PASS' if april_success else '❌ FAIL'}")
    print(f"Specific Vehicle Test: {'✅ PASS' if specific_success else '❌ FAIL'}")
    
    if critical_passed == 2:
        print(f"\n🎉 All critical seasonal pricing tests PASSED!")
        return 0
    else:
        print(f"\n⚠️  {2-critical_passed} critical test(s) FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())