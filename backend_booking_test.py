#!/usr/bin/env python3

import requests
import sys
from datetime import datetime

class BookingSeasonalTariffTester:
    def __init__(self, base_url="https://webapp-import-guide.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
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
            print(f"   ✅ Login successful, token obtained")
            return True
        return False

    def test_create_summer_booking(self):
        """Test creating a booking for summer period (July 2026) - should include seasonal tariff info"""
        vehicle_id = "7aee8096-e295-47b1-a099-8a153ac2c3c2"  # Fiat Panda
        
        booking_data = {
            "veicolo_id": vehicle_id,
            "data_ritiro": "2026-07-10",
            "ora_ritiro": "09:00",
            "data_riconsegna": "2026-07-15",
            "ora_riconsegna": "18:00",
            "conducenti_aggiuntivi": [],
            "note": "Test booking for seasonal tariff verification"
        }
        
        success, response = self.run_test(
            "Create Summer Booking (July 2026)",
            "POST",
            "prenotazioni",
            200,
            data=booking_data
        )
        
        if success:
            # Check if seasonal tariff info is included
            tariffa_stagionale = response.get('tariffa_stagionale')
            tariffa_giornaliera = response.get('tariffa_giornaliera')
            tariffa_base = response.get('tariffa_base')
            durata_giorni = response.get('durata_giorni')
            
            print(f"   Booking ID: {response.get('id')}")
            print(f"   Daily Rate: €{tariffa_giornaliera}")
            print(f"   Duration: {durata_giorni} days")
            print(f"   Base Total: €{tariffa_base}")
            print(f"   Seasonal Tariff Info: {tariffa_stagionale}")
            
            # Verify seasonal tariff is applied
            if tariffa_giornaliera == 75.0:
                print(f"   ✅ Correct seasonal rate applied (€75/day)")
                seasonal_success = True
            else:
                print(f"   ❌ Expected €75/day, got €{tariffa_giornaliera}/day")
                seasonal_success = False
            
            # Verify seasonal tariff info is present
            if tariffa_stagionale and isinstance(tariffa_stagionale, dict):
                nome = tariffa_stagionale.get('nome')
                print(f"   ✅ Seasonal tariff info included: {nome}")
                info_success = True
            else:
                print(f"   ❌ Seasonal tariff info missing or invalid")
                info_success = False
            
            return seasonal_success and info_success, response.get('id')
        
        return False, None

    def test_get_booking_details(self, booking_id):
        """Test getting booking details to verify seasonal tariff is persisted"""
        success, response = self.run_test(
            "Get Booking Details",
            "GET",
            f"prenotazioni/{booking_id}",
            200
        )
        
        if success:
            tariffa_stagionale = response.get('tariffa_stagionale')
            tariffa_giornaliera = response.get('tariffa_giornaliera')
            
            print(f"   Retrieved Daily Rate: €{tariffa_giornaliera}")
            print(f"   Retrieved Seasonal Info: {tariffa_stagionale}")
            
            # Verify data is correctly stored and retrieved
            if tariffa_giornaliera == 75.0 and tariffa_stagionale:
                print(f"   ✅ Seasonal tariff data correctly persisted")
                return True
            else:
                print(f"   ❌ Seasonal tariff data not correctly persisted")
                return False
        
        return False

def main():
    print("🏖️  Summer Booking Seasonal Tariff Test")
    print("=" * 50)
    
    tester = BookingSeasonalTariffTester()
    
    # Test 1: Client Login
    if not tester.test_client_login():
        print("\n❌ Login failed, stopping tests")
        return 1

    # Test 2: Create Summer Booking
    booking_success, booking_id = tester.test_create_summer_booking()
    if not booking_success or not booking_id:
        print("\n❌ Failed to create summer booking with seasonal tariff")
        return 1

    # Test 3: Verify booking details
    details_success = tester.test_get_booking_details(booking_id)

    # Print Results
    print("\n" + "=" * 50)
    print(f"📊 TEST RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    print(f"\n🎯 SEASONAL BOOKING TESTS:")
    print(f"Summer Booking Creation: {'✅ PASS' if booking_success else '❌ FAIL'}")
    print(f"Booking Details Retrieval: {'✅ PASS' if details_success else '❌ FAIL'}")
    
    if booking_success and details_success:
        print(f"\n🎉 All seasonal booking tests PASSED!")
        print(f"   Booking ID for contract testing: {booking_id}")
        return 0
    else:
        print(f"\n⚠️  Some seasonal booking tests FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())