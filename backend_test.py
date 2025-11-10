import requests
import sys
import json
from datetime import datetime

class CareQuoAPITester:
    def __init__(self, base_url="https://workforce-care.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})
        
        self.test_results.append({
            "test_name": name,
            "status": "PASSED" if success else "FAILED",
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details if not success else "")
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration for different roles"""
        print("\n🔍 Testing User Registration...")
        
        # Test company admin registration
        admin_data = {
            "email": f"admin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "name": "Test Admin",
            "role": "company_admin",
            "company_id": "test-company-123"
        }
        
        success, response = self.run_test(
            "Register Company Admin",
            "POST",
            "auth/register",
            200,
            data=admin_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            return True
        
        return False

    def test_user_login(self):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        if not self.user_data:
            return False
            
        login_data = {
            "email": self.user_data['email'],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        
        return False

    def test_auth_me(self):
        """Test get current user"""
        print("\n🔍 Testing Auth Me...")
        
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        return success

    def test_employee_management(self):
        """Test employee CRUD operations"""
        print("\n🔍 Testing Employee Management...")
        
        # Create employee
        employee_data = {
            "user_id": self.user_data['id'],
            "employee_id": f"EMP{datetime.now().strftime('%H%M%S')}",
            "department": "IT",
            "designation": "Software Engineer",
            "date_of_joining": "2024-01-01",
            "date_of_birth": "1990-01-01",
            "phone": "+1234567890",
            "emergency_contact": "+0987654321"
        }
        
        success, response = self.run_test(
            "Create Employee",
            "POST",
            "employees",
            200,
            data=employee_data
        )
        
        employee_id = None
        if success and 'id' in response:
            employee_id = response['id']
        
        # Get employees
        self.run_test(
            "Get Employees",
            "GET",
            "employees",
            200
        )
        
        # Get specific employee
        if employee_id:
            self.run_test(
                "Get Employee by ID",
                "GET",
                f"employees/{employee_id}",
                200
            )
        
        return employee_id

    def test_claims_management(self, employee_id):
        """Test claims CRUD operations"""
        print("\n🔍 Testing Claims Management...")
        
        # Create claim
        claim_data = {
            "claim_type": "medical",
            "amount": 500.00,
            "description": "Medical checkup and tests",
            "documents": []
        }
        
        success, response = self.run_test(
            "Create Claim",
            "POST",
            "claims",
            200,
            data=claim_data
        )
        
        claim_id = None
        if success and 'id' in response:
            claim_id = response['id']
        
        # Get claims
        self.run_test(
            "Get Claims",
            "GET",
            "claims",
            200
        )
        
        # Update claim (approve)
        if claim_id:
            update_data = {
                "status": "approved",
                "reviewer_notes": "Approved after review"
            }
            
            self.run_test(
                "Update Claim Status",
                "PUT",
                f"claims/{claim_id}",
                200,
                data=update_data
            )
        
        return claim_id

    def test_wellness_partners(self):
        """Test wellness partners management"""
        print("\n🔍 Testing Wellness Partners...")
        
        # Create wellness partner
        partner_data = {
            "name": "Test Wellness Center",
            "service_type": "video_consultation",
            "description": "Online medical consultations",
            "contact_email": "contact@wellness.com",
            "contact_phone": "+1234567890",
            "availability": "Mon-Fri 9AM-5PM",
            "pricing": "Free for employees"
        }
        
        success, response = self.run_test(
            "Create Wellness Partner",
            "POST",
            "wellness-partners",
            200,
            data=partner_data
        )
        
        partner_id = None
        if success and 'id' in response:
            partner_id = response['id']
        
        # Get wellness partners
        self.run_test(
            "Get Wellness Partners",
            "GET",
            "wellness-partners",
            200
        )
        
        return partner_id

    def test_bookings(self, partner_id):
        """Test booking management"""
        print("\n🔍 Testing Bookings...")
        
        if not partner_id:
            print("⚠️ Skipping booking tests - no partner ID available")
            return
        
        # Create booking
        booking_data = {
            "partner_id": partner_id,
            "service_type": "video_consultation",
            "booking_date": "2024-12-31",
            "booking_time": "10:00",
            "notes": "Regular checkup"
        }
        
        success, response = self.run_test(
            "Create Booking",
            "POST",
            "bookings",
            200,
            data=booking_data
        )
        
        # Get bookings
        self.run_test(
            "Get Bookings",
            "GET",
            "bookings",
            200
        )

    def test_financials(self):
        """Test financial management"""
        print("\n🔍 Testing Financials...")
        
        # Create financial transaction
        financial_data = {
            "transaction_type": "premium_payment",
            "amount": 1000.00,
            "description": "Monthly premium payment",
            "reference_id": "REF123456"
        }
        
        success, response = self.run_test(
            "Create Financial Transaction",
            "POST",
            "financials",
            200,
            data=financial_data
        )
        
        # Get financials
        self.run_test(
            "Get Financial Records",
            "GET",
            "financials",
            200
        )

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n🔍 Testing Dashboard Stats...")
        
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success:
            expected_fields = ['employee_count', 'total_claims', 'total_premiums', 'net_balance']
            for field in expected_fields:
                if field not in response:
                    self.log_test(f"Dashboard Stats - {field} field", False, f"Missing field: {field}")
                else:
                    self.log_test(f"Dashboard Stats - {field} field", True)

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting CareQuo API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test authentication flow
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
        
        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return False
        
        self.test_auth_me()
        
        # Test core functionality
        employee_id = self.test_employee_management()
        claim_id = self.test_claims_management(employee_id)
        partner_id = self.test_wellness_partners()
        self.test_bookings(partner_id)
        self.test_financials()
        self.test_dashboard_stats()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return len(self.failed_tests) == 0

def main():
    tester = CareQuoAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())