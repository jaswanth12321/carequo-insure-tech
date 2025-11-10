import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { Users, FileText, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error("Error fetching dashboard statistics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
    <div data-testid="dashboard-page" className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="stat-employees" className="p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.employee_count || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card data-testid="stat-claims" className="p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Claims</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_claims || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card data-testid="stat-claim-amount" className="p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Claim Amount</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.total_claim_amount?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card data-testid="stat-net-balance" className="p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Net Balance</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.net_balance?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Claims Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card data-testid="pending-claims-card" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Claims</h3>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-4xl font-bold text-yellow-600">{stats?.pending_claims || 0}</p>
              <p className="text-sm text-gray-600 mt-2">Awaiting review</p>
            </Card>

            <Card data-testid="approved-claims-card" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Approved Claims</h3>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-4xl font-bold text-green-600">{stats?.approved_claims || 0}</p>
              <p className="text-sm text-gray-600 mt-2">${stats?.approved_claim_amount?.toLocaleString() || 0} paid out</p>
            </Card>

            <Card data-testid="rejected-claims-card" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Rejected Claims</h3>
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-4xl font-bold text-red-600">{stats?.rejected_claims || 0}</p>
              <p className="text-sm text-gray-600 mt-2">Declined</p>
            </Card>
          </div>

          {/* Financial Overview */}
          <Card data-testid="financial-overview-card" className="p-6">
            <h3 className="text-xl font-heading font-semibold text-gray-900 mb-6">Financial Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <p className="text-sm text-gray-600 font-medium">Total Premiums</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${stats?.total_premiums?.toLocaleString() || 0}</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <p className="text-sm text-gray-600 font-medium">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${stats?.total_payouts?.toLocaleString() || 0}</p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <p className="text-sm text-gray-600 font-medium">Net Balance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${stats?.net_balance?.toLocaleString() || 0}</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-xl font-heading font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                data-testid="view-employees-btn"
                onClick={() => navigate("/employees")}
                className="bg-blue-600 hover:bg-blue-700 text-white h-12"
              >
                Manage Employees
              </Button>
              <Button
                data-testid="view-claims-btn"
                onClick={() => navigate("/claims")}
                className="bg-green-600 hover:bg-green-700 text-white h-12"
              >
                Review Claims
              </Button>
              <Button
                data-testid="view-financials-btn"
                onClick={() => navigate("/financials")}
                className="bg-purple-600 hover:bg-purple-700 text-white h-12"
              >
                View Financials
              </Button>
              <Button
                data-testid="view-wellness-btn"
                onClick={() => navigate("/wellness")}
                className="bg-pink-600 hover:bg-pink-700 text-white h-12"
              >
                Wellness Partners
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
