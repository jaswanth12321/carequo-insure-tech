import requests
import sys
import json
from datetime import datetime

class EmployeeWorkflowTester:
    def __init__(self, base_url="https://workforce-care.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.employee_token = None
        self.employee_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

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

    def test_employee_registration_with_auto_profile(self):
        """Test employee registration that should auto-create employee profile"""
        print("\n🔍 Testing Employee Registration with Auto-Profile Creation...")
        
        # Register employee user
        employee_data = {
            "email": f"employee_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "name": "Test Employee",
            "role": "employee",
            "company_id": "test-company-123"
        }
        
        success, response = self.run_test(
            "Register Employee User",
            "POST",
            "auth/register",
            200,
            data=employee_data
        )
        
        if success and 'access_token' in response:
            self.employee_token = response['access_token']
            self.employee_data = response['user']
            print(f"Employee registered: {self.employee_data['email']}")
            return True
        
        return False

    def test_employee_can_submit_claims_immediately(self):
        """Test that employee can submit claims without separate profile creation"""
        print("\n🔍 Testing Employee Can Submit Claims Immediately...")
        
        if not self.employee_token:
            self.log_test("Employee Claims - No Token", False, "No employee token available")
            return False
        
        # Try to submit a claim immediately after registration
        claim_data = {
            "claim_type": "medical",
            "amount": 250.00,
            "description": "Emergency medical treatment",
            "documents": []
        }
        
        success, response = self.run_test(
            "Submit Claim Without Pre-existing Profile",
            "POST",
            "claims",
            200,
            data=claim_data,
            token=self.employee_token
        )
        
        if success:
            print(f"Claim submitted successfully: {response.get('id', 'Unknown ID')}")
            return True
        
        return False

    def test_employee_can_book_wellness_immediately(self):
        """Test that employee can book wellness services without separate profile creation"""
        print("\n🔍 Testing Employee Can Book Wellness Services Immediately...")
        
        if not self.employee_token:
            self.log_test("Employee Booking - No Token", False, "No employee token available")
            return False
        
        # First create a wellness partner (need admin for this)
        # For testing, we'll assume one exists or create one with admin token
        
        # Try to book a wellness service
        booking_data = {
            "partner_id": "test-partner-123",  # This might fail if partner doesn't exist
            "service_type": "video_consultation",
            "booking_date": "2024-12-31",
            "booking_time": "14:00",
            "notes": "Regular wellness checkup"
        }
        
        success, response = self.run_test(
            "Book Wellness Service Without Pre-existing Profile",
            "POST",
            "bookings",
            200,
            data=booking_data,
            token=self.employee_token
        )
        
        if success:
            print(f"Booking created successfully: {response.get('id', 'Unknown ID')}")
            return True
        
        return False

    def test_employee_profile_auto_created(self):
        """Verify that employee profile was auto-created during registration or first action"""
        print("\n🔍 Testing Employee Profile Auto-Creation...")
        
        if not self.employee_token:
            self.log_test("Employee Profile Check - No Token", False, "No employee token available")
            return False
        
        # Get employee profiles to see if one was created
        success, response = self.run_test(
            "Get Employee Profiles",
            "GET",
            "employees",
            200,
            token=self.employee_token
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            # Check if any profile matches our user
            for employee in response:
                if employee.get('user_id') == self.employee_data.get('id'):
                    print(f"Employee profile found: {employee.get('employee_id')}")
                    self.log_test("Employee Profile Auto-Created", True)
                    return True
            
            self.log_test("Employee Profile Auto-Created", False, "No matching employee profile found")
            return False
        
        self.log_test("Employee Profile Auto-Created", False, "No employee profiles returned")
        return False

    def test_jwt_token_persistence(self):
        """Test JWT token works for multiple requests"""
        print("\n🔍 Testing JWT Token Persistence...")
        
        if not self.employee_token:
            self.log_test("JWT Persistence - No Token", False, "No employee token available")
            return False
        
        # Make multiple authenticated requests
        success1, _ = self.run_test(
            "JWT Token - First Request",
            "GET",
            "auth/me",
            200,
            token=self.employee_token
        )
        
        success2, _ = self.run_test(
            "JWT Token - Second Request",
            "GET",
            "claims",
            200,
            token=self.employee_token
        )
        
        success3, _ = self.run_test(
            "JWT Token - Third Request",
            "GET",
            "bookings",
            200,
            token=self.employee_token
        )
        
        all_success = success1 and success2 and success3
        self.log_test("JWT Token Persistence", all_success, "Token failed on subsequent requests" if not all_success else "")
        
        return all_success

    def run_employee_workflow_tests(self):
        """Run all employee workflow tests"""
        print("🚀 Starting Employee Workflow Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test the complete employee workflow
        if not self.test_employee_registration_with_auto_profile():
            print("❌ Employee registration failed, stopping tests")
            return False
        
        # Test JWT persistence
        self.test_jwt_token_persistence()
        
        # Test immediate claim submission
        self.test_employee_can_submit_claims_immediately()
        
        # Test immediate wellness booking
        self.test_employee_can_book_wellness_immediately()
        
        # Verify profile was auto-created
        self.test_employee_profile_auto_created()
        
        # Print summary
        print(f"\n📊 Employee Workflow Test Summary:")
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
    tester = EmployeeWorkflowTester()
    success = tester.run_employee_workflow_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())