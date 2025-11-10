import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, LayoutDashboard, Users, FileText, DollarSign, Heart, LogOut } from "lucide-react";

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["company_admin", "hr_manager", "super_admin"] },
    { name: "Employees", icon: Users, path: "/employees", roles: ["company_admin", "hr_manager"] },
    { name: "Claims", icon: FileText, path: "/claims", roles: ["company_admin", "hr_manager"] },
    { name: "Financials", icon: DollarSign, path: "/financials", roles: ["company_admin", "super_admin"] },
    { name: "Wellness", icon: Heart, path: "/wellness", roles: ["company_admin", "hr_manager", "employee", "super_admin"] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div data-testid="sidebar" className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-heading font-bold gradient-text">CareQuo</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{user?.name}</p>
        <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              data-testid={`nav-${item.name.toLowerCase()}`}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          data-testid="logout-btn"
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
