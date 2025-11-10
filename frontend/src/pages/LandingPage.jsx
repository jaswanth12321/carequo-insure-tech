import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Users, FileText, Heart, TrendingUp, CheckCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage({ user, setUser }) {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "employee"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("userRole", response.data.user.role);
      setUser(response.data.user);
      
      toast.success(isLogin ? "Login successful!" : "Registration successful!");
      
      // Redirect based on role
      if (response.data.user.role === "employee") {
        navigate("/employee-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    if (user.role === "employee") {
      navigate("/employee-dashboard");
    } else {
      navigate("/dashboard");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-heading font-bold gradient-text">CareQuo</span>
          </div>
          <Button
            data-testid="get-started-btn"
            onClick={() => setShowAuth(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 btn-animate"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-gray-900 mb-6">
              Enterprise Insurance Management
              <span className="block gradient-text mt-2">Simplified for Corporate Teams</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Comprehensive insurance platform for corporate companies with employee management,
              claims processing, financial tracking, and wellness partner integration.
            </p>
            <Button
              data-testid="hero-get-started-btn"
              onClick={() => setShowAuth(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg btn-animate"
            >
              Start Managing Today
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center mb-12 text-gray-900">
            Everything You Need to Manage Corporate Insurance
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card data-testid="feature-employee-management" className="p-6 card-hover">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">Employee Management</h3>
              <p className="text-gray-600">
                Add, manage, and assign roles to employees. Track employee status and maintain comprehensive profiles.
              </p>
            </Card>

            <Card data-testid="feature-claims-processing" className="p-6 card-hover">
              <FileText className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">Claims Processing</h3>
              <p className="text-gray-600">
                Streamlined claims submission, review, and approval workflow with document management.
              </p>
            </Card>

            <Card data-testid="feature-wellness-partners" className="p-6 card-hover">
              <Heart className="h-12 w-12 text-pink-600 mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">Wellness Partners</h3>
              <p className="text-gray-600">
                Access to video consultations, elder care, gym partnerships, and mental health services.
              </p>
            </Card>

            <Card data-testid="feature-financial-tracking" className="p-6 card-hover">
              <TrendingUp className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">Financial Dashboard</h3>
              <p className="text-gray-600">
                Track premiums, payouts, and financial health with comprehensive reporting.
              </p>
            </Card>

            <Card data-testid="feature-role-based-access" className="p-6 card-hover">
              <Shield className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Secure access control with roles for Super Admin, Company Admin, HR Manager, and Employees.
              </p>
            </Card>

            <Card data-testid="feature-real-time-insights" className="p-6 card-hover">
              <CheckCircle className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-heading font-semibold mb-2">Real-time Insights</h3>
              <p className="text-gray-600">
                Live dashboards with statistics on claims, employees, and financial metrics.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-6">
            Ready to Transform Your Insurance Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join leading companies using CareQuo to simplify their insurance operations.
          </p>
          <Button
            data-testid="cta-get-started-btn"
            onClick={() => setShowAuth(true)}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg btn-animate"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card data-testid="auth-modal" className="w-full max-w-md p-8 relative">
            <button
              data-testid="close-auth-modal-btn"
              onClick={() => setShowAuth(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-2xl font-heading font-bold mb-6 text-center">
              {isLogin ? "Login to CareQuo" : "Create Account"}
            </h2>
            <form data-testid="auth-form" onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    data-testid="name-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={!isLogin}
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              {!isLogin && (
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    data-testid="role-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="company_admin">Company Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              )}
              <Button
                data-testid="submit-auth-btn"
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Processing..." : isLogin ? "Login" : "Register"}
              </Button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                data-testid="toggle-auth-mode-btn"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline font-semibold"
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
