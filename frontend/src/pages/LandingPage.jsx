import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Users, FileText, Heart, TrendingUp, CheckCircle, BarChart3, Building2, Mail, Phone, MapPin } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage({ user, setUser }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("login"); // 'login' or 'signup'
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
      const endpoint = modalType === "login" ? "/auth/login" : "/auth/register";
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("userRole", response.data.user.role);
      setUser(response.data.user);
      
      toast.success(modalType === "login" ? "Login successful!" : "Registration successful!");
      
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

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  useEffect(() => {
    if (user) {
      if (user.role === "employee") {
        navigate("/employee-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareQuo</span>
                <p className="text-xs text-gray-500 font-medium">Enterprise Insurance Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                data-testid="login-btn"
                onClick={() => openModal("login")}
                variant="ghost"
                className="font-semibold"
              >
                Login
              </Button>
              <Button
                data-testid="signup-btn"
                onClick={() => openModal("signup")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 shadow-lg shadow-blue-500/30"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center fade-in">
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full">
              <span className="text-blue-700 font-semibold text-sm">🏆 Trusted by 500+ Enterprises</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-gray-900 mb-6 leading-tight">
              Enterprise Insurance
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                Reimagined for Modern Teams
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Comprehensive insurance platform for corporate companies with intelligent employee management,
              automated claims processing, real-time financial tracking, and integrated wellness services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                data-testid="hero-get-started-btn"
                onClick={() => openModal("signup")}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-7 text-lg font-semibold shadow-2xl shadow-blue-500/30"
              >
                Start Free Trial
              </Button>
              <Button
                onClick={() => openModal("login")}
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 hover:border-blue-600 px-10 py-7 text-lg font-semibold"
              >
                View Demo
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">POWERFUL FEATURES</span>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold mt-3 text-gray-900">
              Everything You Need in One Platform
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card data-testid="feature-employee-management" className="p-8 border-2 hover:border-blue-200 hover:shadow-2xl transition-all duration-300">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">Employee Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive employee profiles with role-based access, department tracking, and real-time status monitoring.
              </p>
            </Card>

            <Card data-testid="feature-claims-processing" className="p-8 border-2 hover:border-green-200 hover:shadow-2xl transition-all duration-300">
              <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">Automated Claims</h3>
              <p className="text-gray-600 leading-relaxed">
                Intelligent claims workflow with automated routing, document management, and instant approval notifications.
              </p>
            </Card>

            <Card data-testid="feature-analytics" className="p-8 border-2 hover:border-purple-200 hover:shadow-2xl transition-all duration-300">
              <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time dashboards with interactive charts, trend analysis, and predictive insights for better decisions.
              </p>
            </Card>

            <Card data-testid="feature-wellness-partners" className="p-8 border-2 hover:border-pink-200 hover:shadow-2xl transition-all duration-300">
              <div className="bg-pink-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">Wellness Ecosystem</h3>
              <p className="text-gray-600 leading-relaxed">
                Integrated wellness partners including telemedicine, elder care, fitness programs, and mental health services.
              </p>
            </Card>

            <Card data-testid="feature-financial" className="p-8 border-2 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300">
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">Financial Control</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete financial oversight with premium tracking, payout management, and comprehensive audit trails.
              </p>
            </Card>

            <Card data-testid="feature-branded" className="p-8 border-2 hover:border-orange-200 hover:shadow-2xl transition-all duration-300">
              <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-gray-900">White-Label Ready</h3>
              <p className="text-gray-600 leading-relaxed">
                Custom branding with your company logo, colors, and identity for a seamless corporate experience.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted Companies Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Trusted By Industry Leaders</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-3 text-gray-900">
              500+ Companies Trust CareQuo
            </h2>
          </div>
          
          {/* Scrolling Logos */}
          <div className="relative">
            <div className="flex overflow-hidden">
              <div className="flex animate-scroll gap-16 items-center">
                <img src="https://customer-assets.emergentagent.com/job_workforce-care/artifacts/bz36qmu5_image.png" alt="Partner Companies" className="h-32 w-auto opacity-60 hover:opacity-100 transition-opacity" />
                <img src="https://customer-assets.emergentagent.com/job_workforce-care/artifacts/bz36qmu5_image.png" alt="Partner Companies" className="h-32 w-auto opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Partners Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Our Insurance Network</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-3 text-gray-900">
              Partnered with Leading Insurance Providers
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              We've partnered with India's top insurance companies to bring you the best coverage options
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {[
              { name: "HDFC Life Insurance", logo: "🏢" },
              { name: "ICICI Prudential", logo: "🏦" },
              { name: "SBI Life Insurance", logo: "🏛️" },
              { name: "Max Life Insurance", logo: "💼" },
              { name: "Bajaj Allianz", logo: "🏢" },
              { name: "LIC of India", logo: "🏛️" },
              { name: "Tata AIA", logo: "🏢" },
              { name: "Aditya Birla Sun Life", logo: "💼" },
              { name: "Star Health Insurance", logo: "⭐" },
              { name: "Reliance General Insurance", logo: "🏢" }
            ].map((partner, index) => (
              <Card key={index} className="p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
                <div className="text-5xl mb-3">{partner.logo}</div>
                <p className="text-sm font-semibold text-gray-700 text-center">{partner.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Client Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">What Our Clients Say</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-3 text-gray-900">
              Trusted by HR Leaders Across Industries
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  R
                </div>
                <div className="ml-4">
                  <p className="font-bold text-gray-900">Rajesh Kumar</p>
                  <p className="text-sm text-gray-600">HR Director, Tech Solutions Ltd</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex gap-1 text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "CareQuo has revolutionized how we manage employee insurance. The automated claims processing saves us hours every week, and our employees love the wellness partner integration."
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  P
                </div>
                <div className="ml-4">
                  <p className="font-bold text-gray-900">Priya Sharma</p>
                  <p className="text-sm text-gray-600">VP Operations, Manufacturing Co</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex gap-1 text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "The financial dashboard gives us complete visibility into our insurance spending. We've reduced claim processing time by 70% and employee satisfaction has increased significantly."
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
                <div className="ml-4">
                  <p className="font-bold text-gray-900">Amit Patel</p>
                  <p className="text-sm text-gray-600">CEO, Retail Chain</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex gap-1 text-yellow-500">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Best insurance platform we've used. The role-based access control is perfect for our multi-location setup, and the wellness partners have been a game-changer for employee health."
              </p>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 text-lg">
              <span className="font-bold text-blue-600">4.9/5</span> average rating from <span className="font-semibold">500+ companies</span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
            Ready to Transform Your Insurance Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join industry leaders who trust CareQuo to manage their corporate insurance programs.
          </p>
          <Button
            data-testid="cta-get-started-btn"
            onClick={() => openModal("signup")}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-7 text-lg font-semibold shadow-2xl"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-heading font-bold text-white">CareQuo</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Enterprise-grade insurance management platform designed for modern corporate teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@carequo.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 CareQuo. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card data-testid="auth-modal" className="w-full max-w-md p-8 relative shadow-2xl">
            <button
              data-testid="close-auth-modal-btn"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-heading font-bold text-gray-900">
                {modalType === "login" ? "Welcome Back" : "Get Started"}
              </h2>
              <p className="text-gray-600 mt-2">
                {modalType === "login" ? "Login to your CareQuo account" : "Create your CareQuo account"}
              </p>
            </div>
            <form data-testid="auth-form" onSubmit={handleSubmit} className="space-y-4">
              {modalType === "signup" && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    data-testid="name-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={modalType === "signup"}
                    className="mt-1 h-11"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1 h-11"
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
                  className="mt-1 h-11"
                />
              </div>
              {modalType === "signup" && (
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    data-testid="role-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? "Processing..." : modalType === "login" ? "Login" : "Create Account"}
              </Button>
            </form>
            <p className="text-center mt-6 text-sm text-gray-600">
              {modalType === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                data-testid="toggle-auth-mode-btn"
                onClick={() => setModalType(modalType === "login" ? "signup" : "login")}
                className="text-blue-600 hover:underline font-semibold"
              >
                {modalType === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
