import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EmployeeManagement({ user, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    user_id: "",
    employee_id: "",
    department: "",
    designation: "",
    date_of_joining: "",
    date_of_birth: "",
    phone: "",
    emergency_contact: ""
  });

  useEffect(() => {
    fetchEmployees();
    fetchUsers();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API}/employees`);
      setEmployees(response.data);
    } catch (error) {
      toast.error("Error fetching employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      // In a real app, you'd have an endpoint to fetch all users
      setUsers([response.data]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/employees`, formData);
      toast.success("Employee added successfully");
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error adding employee");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    
    try {
      await axios.delete(`${API}/employees/${id}`);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      toast.error("Error deleting employee");
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      employee_id: "",
      department: "",
      designation: "",
      date_of_joining: "",
      date_of_birth: "",
      phone: "",
      emergency_contact: ""
    });
  };

  const filteredEmployees = employees.filter(emp =>
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar user={user} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="employee-management-page" className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">Employee Management</h1>
              <p className="text-gray-600 mt-1">Manage your organization's employees</p>
            </div>
            <Button
              data-testid="add-employee-btn"
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                data-testid="search-employee-input"
                placeholder="Search by ID, department, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Employee List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredEmployees.length === 0 ? (
              <Card data-testid="no-employees-message" className="p-12 text-center">
                <p className="text-gray-500">No employees found. Add your first employee to get started.</p>
              </Card>
            ) : (
              filteredEmployees.map((employee) => (
                <Card key={employee.id} data-testid={`employee-card-${employee.employee_id}`} className="p-6 card-hover">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Employee ID</p>
                        <p className="font-semibold text-gray-900">{employee.employee_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-semibold text-gray-900">{employee.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Designation</p>
                        <p className="font-semibold text-gray-900">{employee.designation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`status-badge status-${employee.status}`}>{employee.status}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-900">{employee.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Joining Date</p>
                        <p className="font-semibold text-gray-900">{new Date(employee.date_of_joining).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="font-semibold text-gray-900">{new Date(employee.date_of_birth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Emergency Contact</p>
                        <p className="font-semibold text-gray-900">{employee.emergency_contact}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        data-testid={`delete-employee-${employee.employee_id}`}
                        onClick={() => handleDelete(employee.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card data-testid="add-employee-modal" className="w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-heading font-bold mb-6">Add New Employee</h2>
            <form data-testid="add-employee-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    data-testid="employee-id-input"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    data-testid="user-id-input"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    placeholder="User's UUID"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    data-testid="department-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    data-testid="designation-input"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_joining">Date of Joining</Label>
                  <Input
                    id="date_of_joining"
                    data-testid="date-of-joining-input"
                    type="date"
                    value={formData.date_of_joining}
                    onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    data-testid="date-of-birth-input"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    data-testid="phone-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    data-testid="emergency-contact-input"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  data-testid="cancel-add-employee-btn"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  data-testid="submit-add-employee-btn"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Employee
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
