import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/Sidebar";
import { FileText, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ClaimsManagement({ user, onLogout }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    fetchClaims();
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

  const handleReview = async (claimId, status) => {
    try {
      await axios.put(`${API}/claims/${claimId}`, {
        status,
        reviewer_notes: reviewNotes
      });
      toast.success(`Claim ${status === "approved" ? "approved" : "rejected"} successfully`);
      setSelectedClaim(null);
      setReviewNotes("");
      fetchClaims();
    } catch (error) {
      toast.error("Error updating claim");
    }
  };

  const filteredClaims = filterStatus === "all" 
    ? claims 
    : claims.filter(claim => claim.status === filterStatus);

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "under_review":
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-yellow-600" />;
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
    <div data-testid="claims-management-page" className="flex h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900">Claims Management</h1>
            <p className="text-gray-600 mt-1">Review and process employee claims</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <div className="flex space-x-2">
              {["all", "submitted", "under_review", "approved", "rejected"].map((status) => (
                <Button
                  key={status}
                  data-testid={`filter-${status}-btn`}
                  onClick={() => setFilterStatus(status)}
                  variant={filterStatus === status ? "default" : "outline"}
                  className={filterStatus === status ? "bg-blue-600 text-white" : ""}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Claims List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredClaims.length === 0 ? (
              <Card data-testid="no-claims-message" className="p-12 text-center">
                <p className="text-gray-500">No claims found.</p>
              </Card>
            ) : (
              filteredClaims.map((claim) => (
                <Card key={claim.id} data-testid={`claim-card-${claim.id}`} className="p-6 card-hover">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        {getStatusIcon(claim.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {claim.claim_type.replace('_', ' ')} Claim
                          </h3>
                          <p className="text-sm text-gray-600">Submitted on {new Date(claim.submission_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="text-lg font-bold text-gray-900">₹{claim.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span className={`status-badge status-${claim.status}`}>{claim.status.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Employee ID</p>
                          <p className="font-semibold text-gray-900">{claim.employee_id.substring(0, 8)}...</p>
                        </div>
                        {claim.review_date && (
                          <div>
                            <p className="text-sm text-gray-600">Review Date</p>
                            <p className="font-semibold text-gray-900">{new Date(claim.review_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-gray-900">{claim.description}</p>
                      </div>

                      {claim.reviewer_notes && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Reviewer Notes</p>
                          <p className="text-gray-900">{claim.reviewer_notes}</p>
                        </div>
                      )}
                    </div>

                    {claim.status === "submitted" && (
                      <div className="ml-4">
                        <Button
                          data-testid={`review-claim-${claim.id}`}
                          onClick={() => setSelectedClaim(claim)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card data-testid="review-claim-modal" className="w-full max-w-2xl p-8">
            <h2 className="text-2xl font-heading font-bold mb-6">Review Claim</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Claim Type</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{selectedClaim.claim_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-gray-900">₹{selectedClaim.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900">{selectedClaim.description}</p>
              </div>
              <div>
                <Label htmlFor="review_notes">Review Notes</Label>
                <Textarea
                  id="review_notes"
                  data-testid="review-notes-input"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                data-testid="cancel-review-btn"
                variant="outline"
                onClick={() => {
                  setSelectedClaim(null);
                  setReviewNotes("");
                }}
              >
                Cancel
              </Button>
              <Button
                data-testid="reject-claim-btn"
                onClick={() => handleReview(selectedClaim.id, "rejected")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Reject
              </Button>
              <Button
                data-testid="approve-claim-btn"
                onClick={() => handleReview(selectedClaim.id, "approved")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
