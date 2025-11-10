import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, FileText, Heart, Plus, Calendar, LogOut } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EmployeeDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [claims, setClaims] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimData, setClaimData] = useState({
    claim_type: "medical",
    amount: "",
    description: ""
  });

  useEffect(() => {
    fetchClaims();
    fetchBookings();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await axios.get(`${API}/claims`);
      setClaims(response.data);
    } catch (error) {
      toast.error("Error fetching claims");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/claims`, {
        ...claimData,
        amount: parseFloat(claimData.amount),
        documents: []
      });
      toast.success("Claim submitted successfully");
      setShowClaimModal(false);
      resetClaimForm();
      fetchClaims();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error submitting claim");
    }
  };

  const resetClaimForm = () => {
    setClaimData({
      claim_type: "medical",
      amount: "",
      description: ""
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "under_review":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div data-testid="employee-dashboard" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your claims and wellness services</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card data-testid="submit-claim-card" className="p-6 card-hover cursor-pointer" onClick={() => setShowClaimModal(true)}>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-semibold text-gray-900">Submit New Claim</h3>
                <p className="text-gray-600 mt-1">File a new insurance claim</p>
              </div>
            </div>
          </Card>

          <Card data-testid="book-wellness-card" className="p-6 card-hover cursor-pointer" onClick={() => navigate("/wellness")}>
            <div className="flex items-center space-x-4">
              <div className="bg-pink-100 p-4 rounded-full">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-semibold text-gray-900">Book Wellness Service</h3>
                <p className="text-gray-600 mt-1">Schedule a wellness appointment</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Claims */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-heading font-semibold text-gray-900">My Claims</h2>
            <Button
              data-testid="new-claim-btn"
              onClick={() => setShowClaimModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Claim
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {claims.length === 0 ? (
              <Card data-testid="no-claims-message" className="p-12 text-center">
                <p className="text-gray-500">No claims submitted yet. Click the button above to submit your first claim.</p>
              </Card>
            ) : (
              claims.map((claim) => (
                <Card key={claim.id} data-testid={`claim-card-${claim.id}`} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {claim.claim_type.replace('_', ' ')} Claim
                        </h3>
                        <span className={`status-badge status-${claim.status}`}>{claim.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{claim.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="text-lg font-bold text-gray-900">${claim.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Submitted</p>
                          <p className="font-semibold text-gray-900">{new Date(claim.submission_date).toLocaleDateString()}</p>
                        </div>
                        {claim.review_date && (
                          <div>
                            <p className="text-sm text-gray-600">Reviewed</p>
                            <p className="font-semibold text-gray-900">{new Date(claim.review_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                      {claim.reviewer_notes && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Reviewer Notes</p>
                          <p className="text-gray-900">{claim.reviewer_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* My Bookings */}
        {bookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-4">My Wellness Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} data-testid={`booking-card-${booking.id}`} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {booking.service_type.replace('_', ' ')}
                    </h3>
                    <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}</span>
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-gray-600">{booking.notes}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card data-testid="submit-claim-modal" className="w-full max-w-md p-8">
            <h2 className="text-2xl font-heading font-bold mb-6">Submit New Claim</h2>
            <form data-testid="submit-claim-form" onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <Label htmlFor="claim_type">Claim Type</Label>
                <select
                  id="claim_type"
                  data-testid="claim-type-select"
                  value={claimData.claim_type}
                  onChange={(e) => setClaimData({ ...claimData, claim_type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="medical">Medical</option>
                  <option value="dental">Dental</option>
                  <option value="vision">Vision</option>
                  <option value="wellness">Wellness</option>
                </select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  data-testid="claim-amount-input"
                  type="number"
                  step="0.01"
                  value={claimData.amount}
                  onChange={(e) => setClaimData({ ...claimData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="claim-description-input"
                  value={claimData.description}
                  onChange={(e) => setClaimData({ ...claimData, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Describe your claim..."
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  data-testid="cancel-claim-btn"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowClaimModal(false);
                    resetClaimForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  data-testid="submit-claim-btn"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Claim
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
