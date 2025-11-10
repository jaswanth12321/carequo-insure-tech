import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/Sidebar";
import EmployeeHeader from "@/components/EmployeeHeader";
import { Heart, Video, Users as UsersIcon, Dumbbell, Brain, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function WellnessPartners({ user, onLogout }) {
  const [partners, setPartners] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    service_type: "video_consultation",
    description: "",
    contact_email: "",
    contact_phone: "",
    availability: "",
    pricing: ""
  });
  const [bookingData, setBookingData] = useState({
    booking_date: "",
    booking_time: "",
    notes: ""
  });

  useEffect(() => {
    fetchPartners();
    if (user?.role === "employee") {
      fetchBookings();
    }
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await axios.get(`${API}/wellness-partners`);
      setPartners(response.data);
    } catch (error) {
      toast.error("Error fetching wellness partners");
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

  const handleAddPartner = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/wellness-partners`, formData);
      toast.success("Wellness partner added successfully");
      setShowAddModal(false);
      resetForm();
      fetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error adding partner");
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/bookings`, {
        ...bookingData,
        partner_id: selectedPartner.id,
        service_type: selectedPartner.service_type
      });
      toast.success("Booking created successfully");
      setShowBookModal(false);
      setSelectedPartner(null);
      resetBookingForm();
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error creating booking");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      service_type: "video_consultation",
      description: "",
      contact_email: "",
      contact_phone: "",
      availability: "",
      pricing: ""
    });
  };

  const resetBookingForm = () => {
    setBookingData({
      booking_date: "",
      booking_time: "",
      notes: ""
    });
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case "video_consultation":
        return <Video className="h-8 w-8 text-blue-600" />;
      case "elder_care":
        return <UsersIcon className="h-8 w-8 text-purple-600" />;
      case "gym":
        return <Dumbbell className="h-8 w-8 text-green-600" />;
      case "mental_health":
        return <Brain className="h-8 w-8 text-pink-600" />;
      default:
        return <Heart className="h-8 w-8 text-red-600" />;
    }
  };

  if (loading) {
    const LoadingContent = (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

    if (user?.role === "employee") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          {LoadingContent}
        </div>
      );
    }

    return (
      <div className="flex h-screen">
        <Sidebar user={user} onLogout={onLogout} />
        {LoadingContent}
      </div>
    );
  }

  // Employee view (without sidebar)
  if (user?.role === "employee") {
    return (
      <div data-testid="wellness-partners-page" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <EmployeeHeader user={user} onLogout={onLogout} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-gray-900">Wellness Partners</h1>
            <p className="text-gray-600 mt-1">Access healthcare and wellness services</p>
          </div>

          {/* My Bookings (for employees) */}
          {user?.role === "employee" && bookings.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">My Bookings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Partners List */}
          <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Available Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.length === 0 ? (
              <Card data-testid="no-partners-message" className="p-12 text-center col-span-full">
                <p className="text-gray-500">No wellness partners available yet.</p>
              </Card>
            ) : (
              partners.map((partner) => (
                <Card key={partner.id} data-testid={`partner-card-${partner.id}`} className="p-6 card-hover">
                  <div className="flex items-center space-x-3 mb-4">
                    {getServiceIcon(partner.service_type)}
                    <h3 className="text-xl font-heading font-semibold text-gray-900">{partner.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{partner.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Type:</span>
                      <span className="font-semibold capitalize">{partner.service_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Availability:</span>
                      <span className="font-semibold">{partner.availability}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pricing:</span>
                      <span className="font-semibold">{partner.pricing}</span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500">Contact: {partner.contact_email}</p>
                    <p className="text-xs text-gray-500">{partner.contact_phone}</p>
                  </div>
                  {user?.role === "employee" && (
                    <Button
                      data-testid={`book-${partner.id}-btn`}
                      onClick={() => {
                        setSelectedPartner(partner);
                        setShowBookModal(true);
                      }}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Book Now
                    </Button>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card data-testid="add-partner-modal" className="w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-heading font-bold mb-6">Add Wellness Partner</h2>
            <form data-testid="add-partner-form" onSubmit={handleAddPartner} className="space-y-4">
              <div>
                <Label htmlFor="name">Partner Name</Label>
                <Input
                  id="name"
                  data-testid="partner-name-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <select
                  id="service_type"
                  data-testid="service-type-select"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="video_consultation">Video Consultation</option>
                  <option value="elder_care">Elder Care</option>
                  <option value="gym">Gym/Fitness</option>
                  <option value="mental_health">Mental Health</option>
                </select>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    data-testid="contact-email-input"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    data-testid="contact-phone-input"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    data-testid="availability-input"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="e.g., Mon-Fri 9AM-5PM"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricing">Pricing</Label>
                  <Input
                    id="pricing"
                    data-testid="pricing-input"
                    value={formData.pricing}
                    onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    placeholder="e.g., Free for employees"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  data-testid="cancel-add-partner-btn"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  data-testid="submit-add-partner-btn"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Partner
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Book Service Modal */}
      {showBookModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card data-testid="book-service-modal" className="w-full max-w-md p-8">
            <h2 className="text-2xl font-heading font-bold mb-6">Book {selectedPartner.name}</h2>
            <form data-testid="book-service-form" onSubmit={handleBooking} className="space-y-4">
              <div>
                <Label htmlFor="booking_date">Date</Label>
                <Input
                  id="booking_date"
                  data-testid="booking-date-input"
                  type="date"
                  value={bookingData.booking_date}
                  onChange={(e) => setBookingData({ ...bookingData, booking_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="booking_time">Time</Label>
                <Input
                  id="booking_time"
                  data-testid="booking-time-input"
                  type="time"
                  value={bookingData.booking_time}
                  onChange={(e) => setBookingData({ ...bookingData, booking_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  data-testid="booking-notes-input"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3}
                  placeholder="Any special requirements or notes..."
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  data-testid="cancel-booking-btn"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBookModal(false);
                    setSelectedPartner(null);
                    resetBookingForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  data-testid="submit-booking-btn"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Book Service
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
