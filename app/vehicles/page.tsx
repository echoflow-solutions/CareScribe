"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import {
  Car,
  Calendar,
  User,
  CreditCard,
  AlertTriangle,
  Wrench,
  MapPin,
  Plus,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Fuel,
  FileText,
  Navigation,
} from "lucide-react";
import { format, addDays } from "date-fns";

interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  color: string;
  capacity: number;
  wheelchairAccessible: boolean;
  status: "available" | "in-use" | "maintenance" | "out-of-service";
  odometer: number;
  nextService: string;
  insuranceExpiry: string;
  registrationExpiry: string;
  fuelCard: {
    number: string;
    limit: number;
    currentSpend: number;
  };
  assignedFacility: string;
  lastInspection: string;
}

interface Booking {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  participantId?: string;
  participantName?: string;
  purpose: string;
  destination: string;
  startDate: string;
  endDate: string;
  startOdometer?: number;
  endOdometer?: number;
  kilometers?: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  fuelCost?: number;
  tollsCost?: number;
  parkingCost?: number;
  notes?: string;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  type: "service" | "repair" | "inspection" | "cleaning" | "tire-change";
  description: string;
  date: string;
  cost: number;
  provider: string;
  nextDueDate?: string;
  status: "completed" | "scheduled" | "overdue";
}

interface Incident {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  date: string;
  type: "accident" | "breakdown" | "traffic-violation" | "damage" | "near-miss";
  severity: "minor" | "moderate" | "major";
  description: string;
  location: string;
  policeReport: boolean;
  insuranceClaim: boolean;
  status: "reported" | "under-investigation" | "resolved";
}

export default function VehiclesPage() {
  return <VehiclesContent />;
}

function VehiclesContent() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useStore();
  const [activeTab, setActiveTab] = useState<
    "fleet" | "bookings" | "maintenance" | "incidents"
  >("fleet");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    loadVehicleData();
  }, [currentUser, hasHydrated, router]);

  const loadVehicleData = async () => {
    try {
      // Mock vehicle data
      const mockVehicles: Vehicle[] = [
        {
          id: "VEH-001",
          registration: "ABC-123",
          make: "Toyota",
          model: "HiAce Commuter",
          year: 2023,
          color: "White",
          capacity: 12,
          wheelchairAccessible: true,
          status: "available",
          odometer: 45230,
          nextService: "2025-11-15",
          insuranceExpiry: "2026-03-20",
          registrationExpiry: "2026-02-10",
          fuelCard: {
            number: "****1234",
            limit: 500,
            currentSpend: 287.5,
          },
          assignedFacility: "Sunshine Community House",
          lastInspection: "2025-09-15",
        },
        {
          id: "VEH-002",
          registration: "XYZ-789",
          make: "Ford",
          model: "Transit Custom",
          year: 2022,
          color: "Blue",
          capacity: 8,
          wheelchairAccessible: false,
          status: "in-use",
          odometer: 62100,
          nextService: "2025-10-20",
          insuranceExpiry: "2026-01-15",
          registrationExpiry: "2025-12-05",
          fuelCard: {
            number: "****5678",
            limit: 500,
            currentSpend: 412.3,
          },
          assignedFacility: "Riverside Support Centre",
          lastInspection: "2025-08-20",
        },
        {
          id: "VEH-003",
          registration: "DEF-456",
          make: "Kia",
          model: "Carnival",
          year: 2021,
          color: "Silver",
          capacity: 7,
          wheelchairAccessible: false,
          status: "maintenance",
          odometer: 78450,
          nextService: "2025-10-10",
          insuranceExpiry: "2026-04-25",
          registrationExpiry: "2026-03-18",
          fuelCard: {
            number: "****9012",
            limit: 400,
            currentSpend: 98.75,
          },
          assignedFacility: "Lakeside Day Program",
          lastInspection: "2025-07-12",
        },
      ];

      const mockBookings: Booking[] = [
        {
          id: "BOOK-001",
          vehicleId: "VEH-001",
          vehicleReg: "ABC-123",
          driverId: "user-2",
          driverName: "Sarah Chen",
          participantId: "1",
          participantName: "Michael Brown",
          purpose: "Medical Appointment",
          destination: "City Medical Centre",
          startDate: "2025-10-08T09:00:00Z",
          endDate: "2025-10-08T11:30:00Z",
          status: "scheduled",
          notes: "Requires wheelchair access",
        },
        {
          id: "BOOK-002",
          vehicleId: "VEH-002",
          vehicleReg: "XYZ-789",
          driverId: "user-1",
          driverName: "Tom Anderson",
          participantId: "2",
          participantName: "Emma Wilson",
          purpose: "Community Outing",
          destination: "Shopping Centre",
          startDate: "2025-10-07T10:00:00Z",
          endDate: "2025-10-07T14:00:00Z",
          startOdometer: 62050,
          endOdometer: 62100,
          kilometers: 50,
          status: "completed",
          fuelCost: 45.5,
          tollsCost: 0,
          parkingCost: 8.0,
          notes: "Successful outing, Emma enjoyed the trip",
        },
        {
          id: "BOOK-003",
          vehicleId: "VEH-001",
          vehicleReg: "ABC-123",
          driverId: "user-3",
          driverName: "Dr. Maria Rodriguez",
          purpose: "Equipment Pickup",
          destination: "Medical Supplies Warehouse",
          startDate: "2025-10-09T14:00:00Z",
          endDate: "2025-10-09T16:00:00Z",
          status: "scheduled",
        },
      ];

      const mockMaintenance: MaintenanceRecord[] = [
        {
          id: "MAINT-001",
          vehicleId: "VEH-001",
          vehicleReg: "ABC-123",
          type: "service",
          description: "50,000 km major service",
          date: "2025-09-15",
          cost: 580.0,
          provider: "City Toyota Service Centre",
          nextDueDate: "2025-11-15",
          status: "completed",
        },
        {
          id: "MAINT-002",
          vehicleId: "VEH-003",
          vehicleReg: "DEF-456",
          type: "repair",
          description: "Brake pad replacement and rotor machining",
          date: "2025-10-05",
          cost: 420.0,
          provider: "Quick Brake Service",
          status: "completed",
        },
        {
          id: "MAINT-003",
          vehicleId: "VEH-002",
          vehicleReg: "XYZ-789",
          type: "service",
          description: "Scheduled 60,000 km service",
          date: "2025-10-20",
          cost: 650.0,
          provider: "Ford Service Centre",
          nextDueDate: "2025-12-20",
          status: "scheduled",
        },
        {
          id: "MAINT-004",
          vehicleId: "VEH-002",
          vehicleReg: "XYZ-789",
          type: "inspection",
          description: "Pink slip (annual vehicle inspection)",
          date: "2025-08-20",
          cost: 45.0,
          provider: "Licensed Vehicle Inspector",
          nextDueDate: "2026-08-20",
          status: "completed",
        },
      ];

      const mockIncidents: Incident[] = [
        {
          id: "INC-VEH-001",
          vehicleId: "VEH-002",
          vehicleReg: "XYZ-789",
          driverId: "user-1",
          driverName: "Tom Anderson",
          date: "2025-09-22",
          type: "damage",
          severity: "minor",
          description: "Minor scratch on rear bumper from parking",
          location: "Riverside Shopping Centre Car Park",
          policeReport: false,
          insuranceClaim: false,
          status: "resolved",
        },
      ];

      setVehicles(mockVehicles);
      setBookings(mockBookings);
      setMaintenance(mockMaintenance);
      setIncidents(mockIncidents);
    } catch (error) {
      console.error("Error loading vehicle data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      "in-use": "bg-blue-100 text-blue-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      "out-of-service": "bg-red-100 text-red-800",
      scheduled: "bg-blue-100 text-blue-800",
      "in-progress": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
      overdue: "bg-red-100 text-red-800",
      reported: "bg-yellow-100 text-yellow-800",
      "under-investigation": "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(
    (v) => v.status === "available",
  ).length;
  const todayBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.startDate);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  }).length;
  const maintenanceDue = maintenance.filter(
    (m) => m.status === "overdue" || m.status === "scheduled",
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Car className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Vehicle & Transport Management
                </h1>
              </div>
              <p className="text-gray-600">
                Manage fleet, bookings, maintenance, and track kilometers for
                NDIS billing
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() =>
                  alert("Export Vehicle Report (Feature in development)")
                }
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              <Button
                onClick={() => alert("Book Vehicle (Feature in development)")}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Book Vehicle
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Fleet</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalVehicles}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Vehicles</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Now</p>
                  <p className="text-2xl font-bold text-green-600">
                    {availableVehicles}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Ready to use</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {todayBookings}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Scheduled trips</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Maintenance Due</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {maintenanceDue}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Requires attention
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "fleet" ? "default" : "outline"}
              onClick={() => setActiveTab("fleet")}
            >
              <Car className="h-4 w-4 mr-2" />
              Fleet
            </Button>
            <Button
              variant={activeTab === "bookings" ? "default" : "outline"}
              onClick={() => setActiveTab("bookings")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </Button>
            <Button
              variant={activeTab === "maintenance" ? "default" : "outline"}
              onClick={() => setActiveTab("maintenance")}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </Button>
            <Button
              variant={activeTab === "incidents" ? "default" : "outline"}
              onClick={() => setActiveTab("incidents")}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incidents
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 py-6">
        <div className="max-w-7xl">
          {/* Fleet Tab */}
          {activeTab === "fleet" && (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Car className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </h3>
                          <Badge className={getStatusColor(vehicle.status)}>
                            {vehicle.status.replace("-", " ").toUpperCase()}
                          </Badge>
                          {vehicle.wheelchairAccessible && (
                            <Badge className="bg-purple-100 text-purple-800">
                              Wheelchair Accessible
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Registration:{" "}
                          <span className="font-mono font-medium">
                            {vehicle.registration}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          {vehicle.color} • {vehicle.capacity} seats •{" "}
                          {vehicle.assignedFacility}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Odometer</p>
                      <p className="text-lg font-semibold">
                        {vehicle.odometer.toLocaleString()} km
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Next Service</p>
                      <p className="text-sm font-medium">
                        {format(new Date(vehicle.nextService), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Fuel Card</p>
                      <p className="text-sm font-medium">
                        ${vehicle.fuelCard.currentSpend} / $
                        {vehicle.fuelCard.limit}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{
                            width: `${(vehicle.fuelCard.currentSpend / vehicle.fuelCard.limit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">
                        Insurance Expiry
                      </p>
                      <p className="text-sm font-medium">
                        {format(
                          new Date(vehicle.insuranceExpiry),
                          "MMM d, yyyy",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert("View Full Details")}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert("Book Vehicle")}
                    >
                      Book Vehicle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert("Schedule Maintenance")}
                    >
                      Schedule Maintenance
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card
                  key={booking.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.purpose}
                          </h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.replace("-", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Vehicle:</span>{" "}
                          {booking.vehicleReg} •
                          <span className="font-medium ml-2">Driver:</span>{" "}
                          {booking.driverName}
                        </p>
                        {booking.participantName && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Participant:</span>{" "}
                            {booking.participantName}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {booking.destination}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Start Time</p>
                      <p className="text-sm font-medium">
                        {format(
                          new Date(booking.startDate),
                          "MMM d, yyyy HH:mm",
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">End Time</p>
                      <p className="text-sm font-medium">
                        {format(new Date(booking.endDate), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                    {booking.kilometers && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">
                          Distance Traveled
                        </p>
                        <p className="text-sm font-medium">
                          {booking.kilometers} km
                        </p>
                      </div>
                    )}
                  </div>

                  {booking.status === "completed" &&
                    (booking.fuelCost ||
                      booking.tollsCost ||
                      booking.parkingCost) && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Trip Costs (for NDIS Billing)
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {booking.fuelCost && (
                            <div>
                              <span className="text-gray-600">Fuel:</span>{" "}
                              <span className="font-medium">
                                ${booking.fuelCost.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {booking.tollsCost !== undefined && (
                            <div>
                              <span className="text-gray-600">Tolls:</span>{" "}
                              <span className="font-medium">
                                ${booking.tollsCost.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {booking.parkingCost && (
                            <div>
                              <span className="text-gray-600">Parking:</span>{" "}
                              <span className="font-medium">
                                ${booking.parkingCost.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Total: $
                          {(
                            (booking.fuelCost || 0) +
                            (booking.tollsCost || 0) +
                            (booking.parkingCost || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    )}

                  {booking.notes && (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
                      <span className="font-medium">Notes:</span>{" "}
                      {booking.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert("View Booking Details")}
                    >
                      View Details
                    </Button>
                    {booking.status === "scheduled" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert("Edit Booking")}
                        >
                          Edit Booking
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert("Cancel Booking")}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === "maintenance" && (
            <div className="space-y-4">
              {maintenance.map((record) => (
                <Card
                  key={record.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <Wrench className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {record.description}
                          </h3>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.replace("-", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Vehicle:</span>{" "}
                          {record.vehicleReg} •
                          <span className="font-medium ml-2">Type:</span>{" "}
                          {record.type.replace("-", " ").toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Provider:</span>{" "}
                          {record.provider}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Date:</span>{" "}
                          {format(new Date(record.date), "MMM d, yyyy")}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          Cost: ${record.cost.toFixed(2)}
                        </p>
                        {record.nextDueDate && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Next Due:</span>{" "}
                            {format(
                              new Date(record.nextDueDate),
                              "MMM d, yyyy",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Incidents Tab */}
          {activeTab === "incidents" && (
            <div className="space-y-4">
              {incidents.length === 0 ? (
                <Card className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    No vehicle incidents reported
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Keep up the safe driving!
                  </p>
                </Card>
              ) : (
                incidents.map((incident) => (
                  <Card
                    key={incident.id}
                    className="p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {incident.type
                                .split("-")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                )
                                .join(" ")}
                            </h3>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status.replace("-", " ").toUpperCase()}
                            </Badge>
                            <Badge
                              className={
                                incident.severity === "major"
                                  ? "bg-red-100 text-red-800"
                                  : incident.severity === "moderate"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              }
                            >
                              {incident.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {incident.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Vehicle:</span>{" "}
                            {incident.vehicleReg} •
                            <span className="font-medium ml-2">Driver:</span>{" "}
                            {incident.driverName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span>{" "}
                            {incident.location}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Date:</span>{" "}
                            {format(new Date(incident.date), "MMM d, yyyy")}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              {incident.policeReport ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="text-xs text-gray-600">
                                Police Report
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {incident.insuranceClaim ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="text-xs text-gray-600">
                                Insurance Claim
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
