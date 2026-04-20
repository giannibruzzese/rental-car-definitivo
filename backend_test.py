#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ContractEditingTester:
    def __init__(self, base_url="https://webapp-import-guide.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.booking_id = "f823c530-aede-42eb-9954-feea1bc72a8a"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=default_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error text: {response.text[:200]}")

            return success, response.json() if response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login and get token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "admin@relecogroup.it", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Admin logged in: {response['user']['nome']} {response['user']['cognome']}")
            return True
        return False

    def test_get_booking(self):
        """Get the specific booking for testing"""
        success, response = self.run_test(
            "Get Test Booking",
            "GET",
            f"api/prenotazioni/{self.booking_id}",
            200
        )
        if success:
            print(f"   Booking: {response.get('veicolo_marca')} {response.get('veicolo_modello')} - {response.get('veicolo_targa')}")
            print(f"   Status: {response.get('status')}")
            print(f"   Period: {response.get('data_ritiro')} to {response.get('data_riconsegna')}")
        return success, response

    def test_admin_update_contract_fields(self):
        """Test updating contract fields via admin-update endpoint"""
        
        # Test data for contract editing
        update_data = {
            # DATI RIENTRO fields
            "rientro_data": "2026-07-20",
            "rientro_ora": "18:30",
            "rientro_km_entrata": 15500,
            "rientro_tacche_carburante": 6,
            
            # ADDEBITI AL RIENTRO fields
            "addebito_danni": 150.00,
            "addebito_gestione_danni": 50.00,
            "addebito_carburante": 25.00,
            "addebito_pulizia": 30.00,
            "addebito_altro": 20.00,
            "totale_addebiti_rientro": 275.00,
            
            # FRANCHIGIE INCLUSE/ESCLUSE
            "franchigia_kasko": 500.00,
            "franchigia_sinistro": 250.00,
            "franchigia_kasko_inclusa": True,
            "franchigia_sinistro_inclusa": False,  # Test excluding this one
            
            # Other contract fields
            "km_uscita": 15000,
            "tacche_carburante_uscita": 8
        }
        
        success, response = self.run_test(
            "Admin Update Contract Fields",
            "PUT",
            f"api/prenotazioni/{self.booking_id}/admin-update",
            200,
            data=update_data
        )
        
        if success:
            print("   ✅ Contract fields updated successfully")
        
        return success

    def test_verify_updated_fields(self):
        """Verify that the updated fields are correctly saved"""
        success, response = self.run_test(
            "Verify Updated Contract Fields",
            "GET",
            f"api/prenotazioni/{self.booking_id}",
            200
        )
        
        if success:
            # Check DATI RIENTRO fields
            rientro_data = response.get('rientro_data')
            rientro_ora = response.get('rientro_ora')
            rientro_km = response.get('rientro_km_entrata')
            rientro_tacche = response.get('rientro_tacche_carburante')
            
            print(f"   Rientro Data: {rientro_data}")
            print(f"   Rientro Ora: {rientro_ora}")
            print(f"   Rientro KM: {rientro_km}")
            print(f"   Rientro Tacche: {rientro_tacche}")
            
            # Check ADDEBITI fields
            addebiti = {
                'danni': response.get('addebito_danni'),
                'gestione': response.get('addebito_gestione_danni'),
                'carburante': response.get('addebito_carburante'),
                'pulizia': response.get('addebito_pulizia'),
                'altro': response.get('addebito_altro'),
                'totale': response.get('totale_addebiti_rientro')
            }
            print(f"   Addebiti: {addebiti}")
            
            # Check FRANCHIGIE fields
            franchigie = {
                'kasko': response.get('franchigia_kasko'),
                'sinistro': response.get('franchigia_sinistro'),
                'kasko_inclusa': response.get('franchigia_kasko_inclusa'),
                'sinistro_inclusa': response.get('franchigia_sinistro_inclusa')
            }
            print(f"   Franchigie: {franchigie}")
            
            # Verify specific values
            verification_passed = True
            if rientro_data != "2026-07-20":
                print(f"   ❌ Rientro data mismatch: expected 2026-07-20, got {rientro_data}")
                verification_passed = False
            if rientro_km != 15500:
                print(f"   ❌ Rientro KM mismatch: expected 15500, got {rientro_km}")
                verification_passed = False
            if response.get('totale_addebiti_rientro') != 275.00:
                print(f"   ❌ Totale addebiti mismatch: expected 275.00, got {response.get('totale_addebiti_rientro')}")
                verification_passed = False
            if response.get('franchigia_sinistro_inclusa') != False:
                print(f"   ❌ Franchigia sinistro should be excluded (False), got {response.get('franchigia_sinistro_inclusa')}")
                verification_passed = False
                
            if verification_passed:
                print("   ✅ All field values verified correctly")
            
            return verification_passed
        
        return False

    def test_contract_calculations(self):
        """Test that contract calculations work correctly"""
        success, response = self.run_test(
            "Verify Contract Calculations",
            "GET",
            f"api/prenotazioni/{self.booking_id}",
            200
        )
        
        if success:
            # Get values for calculation verification
            tariffa_base = response.get('tariffa_base', 0)
            totale_servizi = response.get('totale_servizi', 0)
            totale_addebiti = response.get('totale_addebiti_rientro', 0)
            acconto = response.get('acconto', 0)
            
            # Franchigie calculation (only included ones)
            franchigia_kasko = response.get('franchigia_kasko', 0) if response.get('franchigia_kasko_inclusa', True) else 0
            franchigia_sinistro = response.get('franchigia_sinistro', 0) if response.get('franchigia_sinistro_inclusa', True) else 0
            totale_franchigie_calculated = franchigia_kasko + franchigia_sinistro
            
            # Total calculation
            totale_calculated = tariffa_base + totale_servizi + totale_franchigie_calculated + totale_addebiti
            saldo_calculated = totale_calculated - acconto
            
            print(f"   Tariffa Base: €{tariffa_base}")
            print(f"   Totale Servizi: €{totale_servizi}")
            print(f"   Franchigie Incluse: €{totale_franchigie_calculated} (KASKO: €{franchigia_kasko}, SINISTRO: €{franchigia_sinistro})")
            print(f"   Addebiti Rientro: €{totale_addebiti}")
            print(f"   Acconto: €{acconto}")
            print(f"   Totale Calcolato: €{totale_calculated}")
            print(f"   Saldo alla Consegna: €{saldo_calculated}")
            
            # Verify franchigia exclusion works
            if response.get('franchigia_sinistro_inclusa') == False and franchigia_sinistro == 0:
                print("   ✅ Franchigia sinistro correctly excluded from calculation")
            elif response.get('franchigia_sinistro_inclusa') == False and franchigia_sinistro > 0:
                print("   ❌ Franchigia sinistro should be excluded but is still included in calculation")
                return False
            
            return True
        
        return False

def main():
    """Main test execution"""
    print("🚀 Starting Contract Editing Backend Tests")
    print("=" * 60)
    
    tester = ContractEditingTester()
    
    # Test sequence
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
    
    # Get initial booking state
    success, initial_booking = tester.test_get_booking()
    if not success:
        print("❌ Could not retrieve test booking, stopping tests")
        return 1
    
    # Test contract field updates
    if not tester.test_admin_update_contract_fields():
        print("❌ Contract field update failed")
        return 1
    
    # Verify updates were saved
    if not tester.test_verify_updated_fields():
        print("❌ Field verification failed")
        return 1
    
    # Test calculations
    if not tester.test_contract_calculations():
        print("❌ Contract calculations failed")
        return 1
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Backend Tests Summary: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())