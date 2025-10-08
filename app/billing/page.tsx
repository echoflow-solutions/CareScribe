"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { BillingRecord } from "@/lib/types";
import {
  DollarSign,
  Download,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

export default function BillingPage() {
  return <BillingContent />;
}

function BillingContent() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useStore();
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    loadBillingData();
  }, [currentUser, hasHydrated, router]);

  const loadBillingData = async () => {
    try {
      // Simulate loading billing data
      // In production, this would fetch from Supabase
      const mockData: BillingRecord[] = [
        {
          id: "1",
          billingId: "BIL-2025-001",
          reportId: "INC-001",
          reportType: "incident",
          participantId: "1",
          participantName: "Michael Brown",
          facilityId: "facility-1",
          dateOfService: "2025-10-05",
          amount: 125.5,
          serviceCode: "01_015_0107_1_1",
          description: "High risk incident management - 2 hour support",
          status: "pending",
          createdAt: "2025-10-05T14:30:00Z",
          updatedAt: "2025-10-05T14:30:00Z",
        },
        {
          id: "2",
          billingId: "BIL-2025-002",
          reportId: "ABC-004",
          reportType: "abc",
          participantId: "2",
          participantName: "Emma Wilson",
          facilityId: "facility-1",
          dateOfService: "2025-10-04",
          amount: 89.0,
          serviceCode: "01_015_0107_1_1",
          description: "ABC report - Morning medication incident",
          status: "submitted",
          submittedAt: "2025-10-04T16:00:00Z",
          submittedBy: "Tom Anderson",
          createdAt: "2025-10-04T10:00:00Z",
          updatedAt: "2025-10-04T16:00:00Z",
        },
        {
          id: "3",
          billingId: "BIL-2025-003",
          reportId: "INC-002",
          reportType: "combined",
          participantId: "3",
          participantName: "Lisa Thompson",
          facilityId: "facility-1",
          dateOfService: "2025-10-03",
          amount: 215.75,
          serviceCode: "01_015_0107_1_1",
          description: "Environmental incident with behavioral follow-up",
          status: "approved",
          submittedAt: "2025-10-03T17:00:00Z",
          approvedAt: "2025-10-04T09:00:00Z",
          approvedBy: "Finance Team",
          invoiceNumber: "INV-2025-003",
          createdAt: "2025-10-03T15:00:00Z",
          updatedAt: "2025-10-04T09:00:00Z",
        },
        {
          id: "4",
          billingId: "BIL-2025-004",
          reportId: "INC-005",
          reportType: "incident",
          participantId: "1",
          participantName: "Michael Brown",
          facilityId: "facility-1",
          dateOfService: "2025-09-28",
          amount: 156.0,
          serviceCode: "01_015_0107_1_1",
          description: "Support plan review after incident",
          status: "paid",
          submittedAt: "2025-09-28T18:00:00Z",
          approvedAt: "2025-09-29T10:00:00Z",
          paidAt: "2025-10-02T14:00:00Z",
          invoiceNumber: "INV-2025-001",
          paymentReference: "PAY-2025-001",
          createdAt: "2025-09-28T16:00:00Z",
          updatedAt: "2025-10-02T14:00:00Z",
        },
      ];

      setBillingRecords(mockData);
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      paid: "bg-gray-100 text-gray-800",
      disputed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-600",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      submitted: FileText,
      approved: CheckCircle,
      paid: CheckCircle,
      disputed: AlertCircle,
      cancelled: AlertCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const filteredRecords = billingRecords.filter((record) => {
    const matchesStatus =
      filterStatus === "all" || record.status === filterStatus;
    const matchesSearch =
      record.billingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalAmount = filteredRecords.reduce(
    (sum, record) => sum + record.amount,
    0,
  );
  const pendingCount = billingRecords.filter(
    (r) => r.status === "pending",
  ).length;
  const submittedCount = billingRecords.filter(
    (r) => r.status === "submitted",
  ).length;
  const paidAmount = billingRecords
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.amount, 0);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting ${format}...`);
    // Implementation would generate and download the file
    alert(`Exporting to ${format.toUpperCase()}... (Feature in development)`);
  };

  const handleSubmitToFinance = (recordId: string) => {
    console.log(`Submitting record ${recordId} to finance...`);
    alert("Submitted to Finance Department");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Billing & Invoices
              </h1>
              <p className="text-gray-600">
                Manage billing records generated from incident and ABC reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleExport("csv")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => handleExport("excel")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
              <Button
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingCount}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {submittedCount}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Paid This Month</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${paidAmount.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-8 py-6">
        <div className="max-w-7xl">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Billing ID, Participant, or Description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Billing Records Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Billing ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Report Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date of Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {record.billingId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {record.participantName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="capitalize">
                          {record.reportType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {format(
                            new Date(record.dateOfService),
                            "MMM d, yyyy",
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          ${record.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`${getStatusColor(record.status)} flex items-center gap-1 w-fit`}
                        >
                          {getStatusIcon(record.status)}
                          <span className="capitalize">{record.status}</span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {record.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleSubmitToFinance(record.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Submit to Finance
                            </Button>
                          )}
                          {record.invoiceNumber && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    No billing records found
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
