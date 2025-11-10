import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Pages
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import EmployeeManagement from "@/pages/EmployeeManagement";
import ClaimsManagement from "@/pages/ClaimsManagement";
import Financials from "@/pages/Financials";
import WellnessPartners from "@/pages/WellnessPartners";
import EmployeeDashboard from "@/pages/EmployeeDashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Axios interceptor for auth
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, user }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "employee") {
      return <Navigate to="/employee-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
      localStorage.setItem("userRole", response.data.role);
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setUser(null);
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<LandingPage user={user} setUser={setUser} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["company_admin", "hr_manager", "super_admin"]} user={user}>
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={["company_admin", "hr_manager"]} user={user}>
                <EmployeeManagement user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claims"
            element={
              <ProtectedRoute allowedRoles={["company_admin", "hr_manager"]} user={user}>
                <ClaimsManagement user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financials"
            element={
              <ProtectedRoute allowedRoles={["company_admin", "super_admin"]} user={user}>
                <Financials user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wellness"
            element={
              <ProtectedRoute user={user}>
                <WellnessPartners user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute allowedRoles={["employee"]} user={user}>
                <EmployeeDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
