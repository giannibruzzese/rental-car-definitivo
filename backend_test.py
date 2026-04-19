import requests
import sys
from datetime import datetime, timedelta
import json

class AutoRentAPITester:
    def __init__(self, base_url="https://vehicle-reserve-7.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.client_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Test seeding initial data"""
        print("\n🌱 Testing seed data...")
        success, response = self.run_test(
            "Seed initial data",
            "POST",
            "seed",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔐 Testing admin authentication...")
        success, response = self.run_test(
            "Admin login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@autorent.it", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_client_registration(self):
        """Test client registration"""
        print("\n👤 Testing client registration...")
        client_data = {
            "email": f"test_client_{datetime.now().strftime('%H%M%S')}@test.com",
            "name": "Test Client",
            "password": "testpass123",
            "phone": "+39 123 456 7890",
            "address": "Via Test 123, Milano",
            "license_number": "MI123456789"
        }
        
        success, response = self.run_test(
            "Client registration",
            "POST",
            "auth/register",
            200,
            data=client_data
        )
        if success and 'token' in response:
            self.client_token = response['token']
            self.client_email = client_data['email']
            print(f"   Client token obtained: {self.client_token[:20]}...")
            return True
        return False

    def test_vehicles_api(self):
        """Test vehicle management APIs"""
        print("\n🚗 Testing vehicle APIs...")
        
        # Test public vehicles endpoint
        self.run_test(
            "Get public vehicles",
            "GET",
            "vehicles/public",
            200
        )
        
        # Test admin vehicles endpoint
        self.run_test(
            "Get all vehicles (admin)",
            "GET",
            "vehicles",
            200,
            token=self.admin_token
        )
        
        # Test adding a new vehicle
        vehicle_data = {
            "brand": "Test Brand",
            "model": "Test Model",
            "year": 2024,
            "license_plate": f"TEST{datetime.now().strftime('%H%M')}",
            "category": "economy",
            "daily_rate": 45.00,
            "fuel_type": "gasoline",
            "transmission": "manual",
            "seats": 5,
            "image_url": "https://example.com/test.jpg",
            "insurance_expiry": "2026-12-31",
            "mileage": 10000
        }
        
        success, response = self.run_test(
            "Add new vehicle",
            "POST",
            "vehicles",
            200,
            data=vehicle_data,
            token=self.admin_token
        )
        
        if success and 'id' in response:
            vehicle_id = response['id']
            
            # Test updating vehicle
            update_data = {**vehicle_data, "daily_rate": 50.00}
            self.run_test(
                "Update vehicle",
                "PUT",
                f"vehicles/{vehicle_id}",
                200,
                data=update_data,
                token=self.admin_token
            )
            
            # Test vehicle status update
            self.run_test(
                "Update vehicle status",
                "PATCH",
                f"vehicles/{vehicle_id}/status?status=maintenance",
                200,
                token=self.admin_token
            )
            
            # Test get single vehicle
            self.run_test(
                "Get single vehicle",
                "GET",
                f"vehicles/{vehicle_id}",
                200
            )
            
            return vehicle_id
        return None

    def test_bookings_api(self, vehicle_id=None):
        """Test booking management APIs"""
        print("\n📅 Testing booking APIs...")
        
        if not vehicle_id:
            # Get first available vehicle
            success, response = self.run_test(
                "Get vehicles for booking",
                "GET",
                "vehicles/public",
                200
            )
            if success and response:
                vehicle_id = response[0]['id']
        
        if vehicle_id:
            # Test creating a booking
            booking_data = {
                "vehicle_id": vehicle_id,
                "pickup_date": (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
                "return_date": (datetime.now() + timedelta(days=4)).strftime('%Y-%m-%d'),
                "pickup_location": "Sede principale",
                "return_location": "Sede principale",
                "notes": "Test booking"
            }
            
            success, response = self.run_test(
                "Create booking",
                "POST",
                "bookings",
                200,
                data=booking_data,
                token=self.client_token
            )
            
            if success and 'id' in response:
                booking_id = response['id']
                
                # Test get bookings
                self.run_test(
                    "Get client bookings",
                    "GET",
                    "bookings",
                    200,
                    token=self.client_token
                )
                
                self.run_test(
                    "Get all bookings (admin)",
                    "GET",
                    "bookings",
                    200,
                    token=self.admin_token
                )
                
                # Test get single booking
                self.run_test(
                    "Get single booking",
                    "GET",
                    f"bookings/{booking_id}",
                    200,
                    token=self.client_token
                )
                
                # Test admin booking status update
                self.run_test(
                    "Update booking status to confirmed",
                    "PATCH",
                    f"bookings/{booking_id}/status?status=confirmed",
                    200,
                    token=self.admin_token
                )
                
                return booking_id
        return None

    def test_contracts_api(self, booking_id=None):
        """Test contract management APIs"""
        print("\n📄 Testing contract APIs...")
        
        if booking_id:
            # Test creating contract from booking
            success, response = self.run_test(
                "Create contract from booking",
                "POST",
                f"contracts/from-booking/{booking_id}",
                200,
                token=self.admin_token
            )
            
            if success and 'id' in response:
                contract_id = response['id']
                
                # Test get contracts
                self.run_test(
                    "Get all contracts (admin)",
                    "GET",
                    "contracts",
                    200,
                    token=self.admin_token
                )
                
                self.run_test(
                    "Get client contracts",
                    "GET",
                    "contracts",
                    200,
                    token=self.client_token
                )
                
                # Test get single contract
                self.run_test(
                    "Get single contract",
                    "GET",
                    f"contracts/{contract_id}",
                    200,
                    token=self.client_token
                )
                
                # Test contract signing
                self.run_test(
                    "Sign contract",
                    "PATCH",
                    f"contracts/{contract_id}/sign",
                    200,
                    token=self.client_token
                )
                
                # Test PDF generation
                self.run_test(
                    "Generate contract PDF",
                    "GET",
                    f"contracts/{contract_id}/pdf",
                    200,
                    token=self.client_token
                )
                
                return contract_id
        return None

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n📊 Testing dashboard APIs...")
        
        self.run_test(
            "Get dashboard stats",
            "GET",
            "dashboard/stats",
            200,
            token=self.admin_token
        )

    def test_clients_api(self):
        """Test client management APIs"""
        print("\n👥 Testing client management APIs...")
        
        self.run_test(
            "Get all clients (admin)",
            "GET",
            "clients",
            200,
            token=self.admin_token
        )
        
        # Test profile update
        profile_data = {
            "name": "Updated Test Client",
            "phone": "+39 987 654 3210"
        }
        
        self.run_test(
            "Update client profile",
            "PUT",
            "profile",
            200,
            data=profile_data,
            token=self.client_token
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AutoRent API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Seed data first
        if not self.test_seed_data():
            print("❌ Failed to seed data, continuing with existing data...")
        
        # Test authentication
        if not self.test_admin_login():
            print("❌ Admin login failed, stopping tests")
            return False
            
        if not self.test_client_registration():
            print("❌ Client registration failed, stopping tests")
            return False
        
        # Test main APIs
        vehicle_id = self.test_vehicles_api()
        booking_id = self.test_bookings_api(vehicle_id)
        contract_id = self.test_contracts_api(booking_id)
        
        # Test additional APIs
        self.test_dashboard_stats()
        self.test_clients_api()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = AutoRentAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())