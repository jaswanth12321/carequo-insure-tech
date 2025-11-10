import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/Sidebar";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Financials({ user, onLogout }) {
  const [financials, setFinancials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: "premium_payment",
    amount: "",
    description: "",
    reference_id: ""
  });

  useEffect(() => {
    fetchFinancials();
    fetchStats();
  }, []);

  const fetchFinancials = async () => {
    try {
      const response = await axios.get(`${API}/financials`);
      setFinancials(response.data);
    } catch (error) {
      toast.error("Error fetching financial records");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/financials`, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success("Transaction added successfully");
      setShowModal(false);
      resetForm();
      fetchFinancials();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error adding transaction");
    }
  };

  const resetForm = () => {
    setFormData({
      transaction_type: "premium_payment",
      amount: "",
      description: "",
      reference_id: ""
    });
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
    <div data-testid="financials-page" className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">Financial Dashboard</h1>
              <p className="text-gray-600 mt-1">Track premiums, payouts, and financial health</p>
            </div>
            <Button
              data-testid="add-transaction-btn"
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card data-testid="total-premiums-card" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Premiums</h3>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-4xl font-bold text-green-600">₹{stats?.total_premiums?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600 mt-2">Total received</p>
            </Card>

            <Card data-testid="total-payouts-card" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Payouts</h3>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-4xl font-bold text-red-600">₹{stats?.total_payouts?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600 mt-2">Total paid out</p>
            </Card>

            <Card data-testid="net-balance-card" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Net Balance</h3>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-4xl font-bold text-blue-600">₹{stats?.net_balance?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600 mt-2">Current balance</p>
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="p-6">
            <h3 className="text-xl font-heading font-semibold text-gray-900 mb-6">Transaction History</h3>
            <div className="space-y-4">
              {financials.length === 0 ? (
                <p data-testid="no-transactions-message" className="text-center text-gray-500 py-8">No transactions found.</p>
              ) : (
                financials.map((transaction) => (
                  <div
                    key={transaction.id}
                    data-testid={`transaction-${transaction.id}`}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        transaction.transaction_type === "premium_payment" 
                          ? "bg-green-100" 
                          : "bg-red-100"
                      }`}>
                        {transaction.transaction_type === "premium_payment" ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {transaction.transaction_type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                        {transaction.reference_id && (
                          <p className="text-xs text-gray-500">Ref: {transaction.reference_id}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        transaction.transaction_type === "premium_payment" 
                          ? "text-green-600" 
                          : "text-red-600"
                      }`}>
                        {transaction.transaction_type === "premium_payment" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card data-testid="add-transaction-modal" className="w-full max-w-md p-8">
            <h2 className="text-2xl font-heading font-bold mb-6">Add Transaction</h2>
            <form data-testid="add-transaction-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="transaction_type">Transaction Type</Label>
                <select
                  id="transaction_type"
                  data-testid="transaction-type-select"
                  value={formData.transaction_type}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="premium_payment">Premium Payment</option>
                  <option value="claim_payout">Claim Payout</option>
                </select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  data-testid="amount-input"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="description-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="reference_id">Reference ID (Optional)</Label>
                <Input
                  id="reference_id"
                  data-testid="reference-id-input"
                  value={formData.reference_id}
                  onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  data-testid="cancel-add-transaction-btn"
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
                  data-testid="submit-add-transaction-btn"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Transaction
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
