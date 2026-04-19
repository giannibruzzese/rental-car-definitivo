"""
RE.LE.CO. GROUP Car Rental API Tests
Tests for: Registration, Login, Vehicles, Bookings, Admin functions
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://registration-flow-12.preview.emergentagent.com')

# Test data
ADMIN_EMAIL = "admin@relecogroup.it"
ADMIN_PASSWORD = "admin123"
TEST_CLIENT_EMAIL = f"test.client.{uuid.uuid4().hex[:8]}@email.com"
TEST_CLIENT_PASSWORD = "password123"

class TestHealthAndBasics:
    """Basic API health and availability tests"""
    
    def test_api_available(self):
        """Test that API is reachable"""
        response = requests.get(f"{BASE_URL}/api/vehicles/available")
        assert response.status_code == 200
        print(f"✓ API is available, returned {len(response.json())} vehicles")
    
    def test_agency_data(self):
        """Test agency data endpoint"""
        response = requests.get(f"{BASE_URL}/api/agency")
        assert response.status_code == 200
        data = response.json()
        assert data["ragione_sociale"] == "RE.LE.CO. GROUP"
        assert "indirizzo" in data
        assert "piva" in data
        print(f"✓ Agency data: {data['ragione_sociale']}")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful: {data['user']['email']}")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_client_registration_success(self):
        """Test client registration with valid data"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "nome": "Mario",
            "cognome": "Rossi",
            "data_nascita": "1985-05-15",
            "luogo_nascita": "Roma",
            "codice_fiscale": "RSSMRA85E15H501Z",
            "indirizzo": "Via Roma 123",
            "comune": "Roma",
            "provincia": "RM",
            "cap": "00100",
            "stato": "Italia",
            "cellulare": "+39 333 1234567",
            "email": TEST_CLIENT_EMAIL,
            "password": TEST_CLIENT_PASSWORD,
            "patente_intestatario_nome": "Mario",
            "patente_intestatario_cognome": "Rossi",
            "patente_numero": "AB1234567X",
            "patente_categoria": "B",
            "patente_data_rilascio": "2010-01-01",
            "patente_data_scadenza": "2030-01-01",
            "patente_paese_rilascio": "Italia",
            "accetta_condizioni": True,
            "accetta_privacy": True,
            "conferma_veridicita": True
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "client"
        assert data["user"]["registrazione_completa"] == True
        print(f"✓ Client registration successful: {data['user']['email']}")
    
    def test_registration_invalid_cf(self):
        """Test registration with invalid codice fiscale"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "nome": "Test",
            "cognome": "User",
            "data_nascita": "1990-01-01",
            "luogo_nascita": "Roma",
            "codice_fiscale": "INVALID",  # Invalid CF
            "indirizzo": "Via Test",
            "comune": "Roma",
            "provincia": "RM",
            "cap": "00100",
            "cellulare": "+39 333 1234567",
            "email": f"invalid.cf.{uuid.uuid4().hex[:8]}@email.com",
            "password": "password123",
            "patente_intestatario_nome": "Test",
            "patente_intestatario_cognome": "User",
            "patente_numero": "AB1234567X",
            "patente_categoria": "B",
            "patente_data_rilascio": "2010-01-01",
            "patente_data_scadenza": "2030-01-01",
            "accetta_condizioni": True,
            "accetta_privacy": True,
            "conferma_veridicita": True
        })
        assert response.status_code == 400
        print("✓ Invalid codice fiscale correctly rejected")
    
    def test_registration_expired_license(self):
        """Test registration with expired license"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "nome": "Test",
            "cognome": "User",
            "data_nascita": "1990-01-01",
            "luogo_nascita": "Roma",
            "codice_fiscale": "TSTUSR90A01H501Z",
            "indirizzo": "Via Test",
            "comune": "Roma",
            "provincia": "RM",
            "cap": "00100",
            "cellulare": "+39 333 1234567",
            "email": f"expired.license.{uuid.uuid4().hex[:8]}@email.com",
            "password": "password123",
            "patente_intestatario_nome": "Test",
            "patente_intestatario_cognome": "User",
            "patente_numero": "AB1234567X",
            "patente_categoria": "B",
            "patente_data_rilascio": "2010-01-01",
            "patente_data_scadenza": "2020-01-01",  # Expired
            "accetta_condizioni": True,
            "accetta_privacy": True,
            "conferma_veridicita": True
        })
        assert response.status_code == 400
        print("✓ Expired license correctly rejected")


class TestVehicles:
    """Vehicle management tests"""
    
    def test_get_available_vehicles(self):
        """Test getting available vehicles"""
        response = requests.get(f"{BASE_URL}/api/vehicles/available")
        assert response.status_code == 200
        vehicles = response.json()
        assert isinstance(vehicles, list)
        if len(vehicles) > 0:
            v = vehicles[0]
            assert "id" in v
            assert "marca" in v
            assert "modello" in v
            assert "tariffa_giornaliera" in v
        print(f"✓ Got {len(vehicles)} available vehicles")
    
    def test_get_all_vehicles(self):
        """Test getting all vehicles"""
        response = requests.get(f"{BASE_URL}/api/vehicles")
        assert response.status_code == 200
        vehicles = response.json()
        assert isinstance(vehicles, list)
        print(f"✓ Got {len(vehicles)} total vehicles")
    
    def test_vehicle_normalization(self):
        """Test that vehicles are normalized to Italian schema"""
        response = requests.get(f"{BASE_URL}/api/vehicles/available")
        assert response.status_code == 200
        vehicles = response.json()
        if len(vehicles) > 0:
            v = vehicles[0]
            # Check Italian field names
            assert "marca" in v
            assert "modello" in v
            assert "tariffa_giornaliera" in v
            assert "deposito_cauzionale" in v
            assert "km_inclusi_giorno" in v
            print(f"✓ Vehicle normalization working: {v['marca']} {v['modello']}")


class TestBookings:
    """Booking management tests"""
    
    @pytest.fixture
    def client_token(self):
        """Get client token for authenticated requests"""
        # First try to login with existing test client
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "mario.rossi.test@email.com",
            "password": "password123"
        })
        if response.status_code == 200:
            return response.json()["token"]
        
        # If not exists, register new client
        email = f"booking.test.{uuid.uuid4().hex[:8]}@email.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "nome": "Booking",
            "cognome": "Tester",
            "data_nascita": "1985-05-15",
            "luogo_nascita": "Roma",
            "codice_fiscale": "BKGTST85E15H501Z",
            "indirizzo": "Via Test 123",
            "comune": "Roma",
            "provincia": "RM",
            "cap": "00100",
            "cellulare": "+39 333 1234567",
            "email": email,
            "password": "password123",
            "patente_intestatario_nome": "Booking",
            "patente_intestatario_cognome": "Tester",
            "patente_numero": "BK1234567X",
            "patente_categoria": "B",
            "patente_data_rilascio": "2010-01-01",
            "patente_data_scadenza": "2030-01-01",
            "accetta_condizioni": True,
            "accetta_privacy": True,
            "conferma_veridicita": True
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    @pytest.fixture
    def vehicle_id(self):
        """Get a vehicle ID for booking"""
        response = requests.get(f"{BASE_URL}/api/vehicles/available")
        assert response.status_code == 200
        vehicles = response.json()
        assert len(vehicles) > 0
        return vehicles[0]["id"]
    
    def test_create_booking(self, client_token, vehicle_id):
        """Test creating a booking"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        day_after = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        
        response = requests.post(
            f"{BASE_URL}/api/prenotazioni",
            headers={"Authorization": f"Bearer {client_token}"},
            json={
                "veicolo_id": vehicle_id,
                "data_ritiro": tomorrow,
                "ora_ritiro": "10:00",
                "data_riconsegna": day_after,
                "ora_riconsegna": "10:00",
                "conducenti_aggiuntivi": [],
                "note": "Test booking from pytest"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "bozza"
        assert data["veicolo_id"] == vehicle_id
        assert data["durata_giorni"] == 2
        print(f"✓ Booking created: {data['id'][:8]}... - €{data['tariffa_base']}")
        return data["id"]
    
    def test_get_bookings_as_client(self, client_token):
        """Test getting bookings as client"""
        response = requests.get(
            f"{BASE_URL}/api/prenotazioni",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        assert response.status_code == 200
        bookings = response.json()
        assert isinstance(bookings, list)
        print(f"✓ Client can see {len(bookings)} bookings")
    
    def test_get_bookings_as_admin(self, admin_token):
        """Test getting all bookings as admin"""
        response = requests.get(
            f"{BASE_URL}/api/prenotazioni",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        bookings = response.json()
        assert isinstance(bookings, list)
        print(f"✓ Admin can see {len(bookings)} bookings")
    
    def test_change_booking_status(self, admin_token, client_token, vehicle_id):
        """Test changing booking status as admin"""
        # Create a booking first
        tomorrow = (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d")
        day_after = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        create_response = requests.post(
            f"{BASE_URL}/api/prenotazioni",
            headers={"Authorization": f"Bearer {client_token}"},
            json={
                "veicolo_id": vehicle_id,
                "data_ritiro": tomorrow,
                "ora_ritiro": "10:00",
                "data_riconsegna": day_after,
                "ora_riconsegna": "10:00"
            }
        )
        assert create_response.status_code == 200
        booking_id = create_response.json()["id"]
        
        # Change status to in_verifica
        response = requests.patch(
            f"{BASE_URL}/api/prenotazioni/{booking_id}/status?status=in_verifica",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"✓ Booking status changed to in_verifica")
        
        # Change status to approvata
        response = requests.patch(
            f"{BASE_URL}/api/prenotazioni/{booking_id}/status?status=approvata",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        print(f"✓ Booking status changed to approvata")


class TestAdminFunctions:
    """Admin-specific function tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_dashboard_stats(self, admin_token):
        """Test dashboard statistics endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        stats = response.json()
        assert "total_vehicles" in stats
        assert "available_vehicles" in stats
        assert "active_rentals" in stats
        assert "pending_bookings" in stats
        assert "total_clients" in stats
        print(f"✓ Dashboard stats: {stats['total_vehicles']} vehicles, {stats['total_clients']} clients")
    
    def test_get_clients(self, admin_token):
        """Test getting client list"""
        response = requests.get(
            f"{BASE_URL}/api/clienti",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        clients = response.json()
        assert isinstance(clients, list)
        print(f"✓ Got {len(clients)} clients")
    
    def test_get_franchigie(self, admin_token):
        """Test getting franchigie list"""
        response = requests.get(f"{BASE_URL}/api/franchigie")
        assert response.status_code == 200
        franchigie = response.json()
        assert isinstance(franchigie, list)
        print(f"✓ Got {len(franchigie)} franchigie")
    
    def test_get_servizi_supplementari(self, admin_token):
        """Test getting supplementary services"""
        response = requests.get(f"{BASE_URL}/api/servizi-supplementari")
        assert response.status_code == 200
        servizi = response.json()
        assert isinstance(servizi, list)
        print(f"✓ Got {len(servizi)} servizi supplementari")
    
    def test_get_condizioni_generali(self):
        """Test getting general conditions"""
        response = requests.get(f"{BASE_URL}/api/settings/condizioni-generali")
        assert response.status_code == 200
        data = response.json()
        assert "testo" in data
        print(f"✓ Got condizioni generali ({len(data['testo'])} chars)")


class TestContractGeneration:
    """Contract generation tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    @pytest.fixture
    def client_token(self):
        """Get client token"""
        email = f"contract.test.{uuid.uuid4().hex[:8]}@email.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "nome": "Contract",
            "cognome": "Tester",
            "data_nascita": "1985-05-15",
            "luogo_nascita": "Roma",
            "codice_fiscale": "CNTTST85E15H501Z",
            "indirizzo": "Via Test 123",
            "comune": "Roma",
            "provincia": "RM",
            "cap": "00100",
            "cellulare": "+39 333 1234567",
            "email": email,
            "password": "password123",
            "patente_intestatario_nome": "Contract",
            "patente_intestatario_cognome": "Tester",
            "patente_numero": "CT1234567X",
            "patente_categoria": "B",
            "patente_data_rilascio": "2010-01-01",
            "patente_data_scadenza": "2030-01-01",
            "accetta_condizioni": True,
            "accetta_privacy": True,
            "conferma_veridicita": True
        })
        assert response.status_code == 200
        return response.json()["token"]
    
    def test_generate_contract(self, admin_token, client_token):
        """Test contract generation flow"""
        # Get a vehicle
        vehicles_response = requests.get(f"{BASE_URL}/api/vehicles/available")
        assert vehicles_response.status_code == 200
        vehicle_id = vehicles_response.json()[0]["id"]
        
        # Create booking
        tomorrow = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        day_after = (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
        
        booking_response = requests.post(
            f"{BASE_URL}/api/prenotazioni",
            headers={"Authorization": f"Bearer {client_token}"},
            json={
                "veicolo_id": vehicle_id,
                "data_ritiro": tomorrow,
                "ora_ritiro": "10:00",
                "data_riconsegna": day_after,
                "ora_riconsegna": "10:00"
            }
        )
        assert booking_response.status_code == 200
        booking_id = booking_response.json()["id"]
        
        # Approve booking
        approve_response = requests.patch(
            f"{BASE_URL}/api/prenotazioni/{booking_id}/status?status=approvata",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert approve_response.status_code == 200
        
        # Generate contract
        contract_response = requests.post(
            f"{BASE_URL}/api/prenotazioni/{booking_id}/genera-contratto",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert contract_response.status_code == 200
        data = contract_response.json()
        assert "contratto_id" in data
        print(f"✓ Contract generated: {data['contratto_id'][:8]}...")
        
        # Verify booking status updated
        booking_check = requests.get(
            f"{BASE_URL}/api/prenotazioni/{booking_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert booking_check.status_code == 200
        assert booking_check.json()["contratto_generato"] == True
        assert booking_check.json()["status"] == "contratto_generato"
        print("✓ Booking status updated to contratto_generato")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
