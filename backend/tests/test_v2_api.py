"""
V2 API Tests for RE.LE.CO. GROUP Car Rental System
Tests: Agency data, vehicles, auth, dashboard stats, prenotazioni
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://vehicle-reserve-7.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@relecogroup.it"
ADMIN_PASSWORD = "admin123"


class TestAgencyAPI:
    """Test agency data endpoint"""
    
    def test_get_agency_data(self):
        """GET /api/agency returns RE.LE.CO. GROUP data"""
        response = requests.get(f"{BASE_URL}/api/agency")
        assert response.status_code == 200
        
        data = response.json()
        assert data["ragione_sociale"] == "RE.LE.CO. GROUP"
        assert data["comune"] == "Soverato"
        assert data["provincia"] == "CZ"
        assert "sede_checkin" in data
        print("✓ Agency data returned correctly")


class TestVehiclesAPI:
    """Test vehicles endpoints"""
    
    def test_get_available_vehicles(self):
        """GET /api/vehicles/available returns V2 format vehicles"""
        response = requests.get(f"{BASE_URL}/api/vehicles/available")
        assert response.status_code == 200
        
        vehicles = response.json()
        assert isinstance(vehicles, list)
        
        if len(vehicles) > 0:
            v = vehicles[0]
            # Check V2 format fields
            assert "marca" in v
            assert "modello" in v
            assert "targa" in v
            assert "tariffa_giornaliera" in v
            assert "km_inclusi_giorno" in v
            assert "prezzo_km_extra" in v
            print(f"✓ Available vehicles returned: {len(vehicles)} vehicles with V2 format")
        else:
            print("✓ Available vehicles endpoint works (no vehicles)")
    
    def test_get_all_vehicles(self):
        """GET /api/vehicles returns all vehicles"""
        response = requests.get(f"{BASE_URL}/api/vehicles")
        assert response.status_code == 200
        
        vehicles = response.json()
        assert isinstance(vehicles, list)
        print(f"✓ All vehicles returned: {len(vehicles)} vehicles")


class TestAuthAPI:
    """Test authentication endpoints"""
    
    def test_admin_login_success(self):
        """POST /api/auth/login with admin credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print("✓ Admin login successful")
        return data["token"]
    
    def test_admin_login_invalid_credentials(self):
        """POST /api/auth/login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")
    
    def test_get_current_user(self):
        """GET /api/auth/me with valid token"""
        # First login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_response.json()["token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        user = response.json()
        assert user["email"] == ADMIN_EMAIL
        print("✓ Get current user works")


class TestDashboardAPI:
    """Test dashboard stats endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return response.json()["token"]
    
    def test_get_dashboard_stats(self, admin_token):
        """GET /api/dashboard/stats returns correct counts"""
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
        assert "contracts_generated" in stats
        
        # Verify counts are non-negative
        assert stats["total_vehicles"] >= 0
        assert stats["available_vehicles"] >= 0
        print(f"✓ Dashboard stats: {stats['total_vehicles']} vehicles, {stats['available_vehicles']} available")
    
    def test_dashboard_stats_requires_auth(self):
        """GET /api/dashboard/stats without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 403
        print("✓ Dashboard stats requires authentication")


class TestPrenotazioniAPI:
    """Test bookings/prenotazioni endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return response.json()["token"]
    
    def test_get_prenotazioni(self, admin_token):
        """GET /api/prenotazioni returns bookings list"""
        response = requests.get(
            f"{BASE_URL}/api/prenotazioni",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        prenotazioni = response.json()
        assert isinstance(prenotazioni, list)
        print(f"✓ Prenotazioni returned: {len(prenotazioni)} bookings")
    
    def test_prenotazioni_requires_auth(self):
        """GET /api/prenotazioni without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/prenotazioni")
        assert response.status_code == 403
        print("✓ Prenotazioni requires authentication")


class TestClientiAPI:
    """Test clients endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        return response.json()["token"]
    
    def test_get_clienti(self, admin_token):
        """GET /api/clienti returns clients list"""
        response = requests.get(
            f"{BASE_URL}/api/clienti",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        clienti = response.json()
        assert isinstance(clienti, list)
        print(f"✓ Clienti returned: {len(clienti)} clients")


class TestFranchigieServiziAPI:
    """Test franchigie and servizi endpoints"""
    
    def test_get_franchigie(self):
        """GET /api/franchigie returns list"""
        response = requests.get(f"{BASE_URL}/api/franchigie")
        assert response.status_code == 200
        
        franchigie = response.json()
        assert isinstance(franchigie, list)
        print(f"✓ Franchigie returned: {len(franchigie)} items")
    
    def test_get_servizi_supplementari(self):
        """GET /api/servizi-supplementari returns list"""
        response = requests.get(f"{BASE_URL}/api/servizi-supplementari")
        assert response.status_code == 200
        
        servizi = response.json()
        assert isinstance(servizi, list)
        print(f"✓ Servizi supplementari returned: {len(servizi)} items")


class TestCondizioniGeneraliAPI:
    """Test general conditions endpoint"""
    
    def test_get_condizioni_generali(self):
        """GET /api/settings/condizioni-generali returns text"""
        response = requests.get(f"{BASE_URL}/api/settings/condizioni-generali")
        assert response.status_code == 200
        
        data = response.json()
        assert "testo" in data
        assert len(data["testo"]) > 0
        print("✓ Condizioni generali returned")


class TestRegistrationAPI:
    """Test client registration endpoint"""
    
    def test_registration_validation(self):
        """POST /api/auth/register validates required fields"""
        # Test with missing fields
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": "test@test.com"}
        )
        assert response.status_code == 422  # Validation error
        print("✓ Registration validates required fields")
    
    def test_registration_cf_validation(self):
        """POST /api/auth/register validates codice fiscale"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "nome": "Test",
                "cognome": "User",
                "data_nascita": "1990-01-01",
                "luogo_nascita": "Roma",
                "codice_fiscale": "INVALID",  # Invalid CF
                "indirizzo": "Via Test 1",
                "comune": "Roma",
                "provincia": "RM",
                "cap": "00100",
                "cellulare": "3331234567",
                "email": test_email,
                "password": "test123",
                "patente_intestatario_nome": "Test",
                "patente_intestatario_cognome": "User",
                "patente_numero": "AB1234567",
                "patente_categoria": "B",
                "patente_data_rilascio": "2020-01-01",
                "patente_data_scadenza": "2030-01-01",
                "accetta_condizioni": True,
                "accetta_privacy": True,
                "conferma_veridicita": True
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "errors" in data["detail"]
        print("✓ Registration validates codice fiscale format")


class TestSeedAPI:
    """Test seed data endpoint"""
    
    def test_seed_data(self):
        """POST /api/seed creates default data"""
        response = requests.post(f"{BASE_URL}/api/seed")
        assert response.status_code == 200
        
        data = response.json()
        assert "admin_email" in data
        assert data["admin_email"] == ADMIN_EMAIL
        print("✓ Seed data endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
