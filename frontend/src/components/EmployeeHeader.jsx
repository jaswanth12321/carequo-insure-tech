import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Heart, LogOut } from "lucide-react";

export default function EmployeeHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-heading font-bold gradient-text">CareQuo</span>
          </div>
          <nav className="flex items-center space-x-2">
            <Button
              data-testid="nav-dashboard-btn"
              onClick={() => navigate("/employee-dashboard")}
              variant={location.pathname === "/employee-dashboard" ? "default" : "ghost"}
              size="sm"
              className={location.pathname === "/employee-dashboard" ? "bg-blue-600 text-white" : ""}
            >
              Dashboard
            </Button>
            <Button
              data-testid="nav-wellness-btn"
              onClick={() => navigate("/wellness")}
              variant={location.pathname === "/wellness" ? "default" : "ghost"}
              size="sm"
              className={location.pathname === "/wellness" ? "bg-blue-600 text-white" : ""}
            >
              <Heart className="h-4 w-4 mr-1" />
              Wellness
            </Button>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Employee</p>
            </div>
            <Button
              data-testid="employee-logout-btn"
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
