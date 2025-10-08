"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import {
  AlertTriangle,
  Plus,
  Calendar,
  FileText,
  Clock,
  Shield,
  TrendingDown,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface RestrictivePractice {
  id: string;
  participantId: string;
  participantName: string;
  type: "chemical" | "physical" | "environmental" | "mechanical";
  description: string;
  medication?: string;
  dosage?: string;
  authorization: {
    authorizedBy: string;
    authorizationDate: string;
    expiryDate: string;
    reviewDate: string;
    status: "active" | "expired" | "pending-renewal";
  };
  reductionPlan: {
    hasReductionPlan: boolean;
    goalDescription?: string;
    strategies?: string[];
    targetDate?: string;
    progress?: number;
  };
  usage: {
    lastUsed?: string;
    frequency: number; // uses per month
    trend: "increasing" | "decreasing" | "stable";
  };
  reportedToNDIS: boolean;
  lastReportDate?: string;
  nextReportDue: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
}

export default function RestrictivePracticesPage() {
  return <RestrictivePracticesContent />;
}

function RestrictivePracticesContent() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useStore();
  const [practices, setPractices] = useState<RestrictivePractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Check if user has access (Team Leaders and above)
    if (currentUser.role.level > 3) {
      alert(
        "Access denied: Restrictive Practices Register requires Team Leader access or higher",
      );
      router.push("/dashboard");
      return;
    }

    loadRestrictivePractices();
  }, [currentUser, hasHydrated, router]);

  const loadRestrictivePractices = async () => {
    try {
      // Simulate loading restrictive practices data
      const mockData: RestrictivePractice[] = [
        {
          id: "RP-001",
          participantId: "1",
          participantName: "Michael Brown",
          type: "chemical",
          description: "PRN Medication for behavioral management",
          medication: "Risperidone (PRN)",
          dosage: "0.5mg as required",
          authorization: {
            authorizedBy: "Dr. James Wilson",
            authorizationDate: "2025-01-15",
            expiryDate: "2025-07-15",
            reviewDate: "2025-04-15",
            status: "active",
          },
          reductionPlan: {
            hasReductionPlan: true,
            goalDescription:
              "Reduce PRN usage by 50% over 6 months through positive behavior support strategies",
            strategies: [
              "Implement sensory toolkit",
              "Increase outdoor activities",
              "Identify and avoid triggers",
              "Staff training on de-escalation",
            ],
            targetDate: "2025-07-15",
            progress: 35,
          },
          usage: {
            lastUsed: "2025-10-05",
            frequency: 4, // 4 times this month
            trend: "decreasing",
          },
          reportedToNDIS: true,
          lastReportDate: "2025-09-30",
          nextReportDue: "2025-10-31",
          severity: "high",
          createdAt: "2025-01-15T10:00:00Z",
          updatedAt: "2025-10-05T14:30:00Z",
        },
        {
          id: "RP-002",
          participantId: "1",
          participantName: "Michael Brown",
          type: "environmental",
          description: "Locked door to secure outdoor area at night",
          authorization: {
            authorizedBy: "Sarah Johnson (Team Leader)",
            authorizationDate: "2025-02-01",
            expiryDate: "2025-08-01",
            reviewDate: "2025-05-01",
            status: "active",
          },
          reductionPlan: {
            hasReductionPlan: true,
            goalDescription:
              "Transition to sensor-based monitoring instead of locked door",
            strategies: [
              "Install motion sensors",
              "Implement sleep routine",
              "Staff training on sleep support",
              "Environmental modifications",
            ],
            targetDate: "2025-08-01",
            progress: 20,
          },
          usage: {
            frequency: 30, // Every night
            trend: "stable",
          },
          reportedToNDIS: true,
          lastReportDate: "2025-09-30",
          nextReportDue: "2025-10-31",
          severity: "medium",
          createdAt: "2025-02-01T09:00:00Z",
          updatedAt: "2025-09-30T16:00:00Z",
        },
        {
          id: "RP-003",
          participantId: "2",
          participantName: "Emma Wilson",
          type: "physical",
          description: "Physical guidance during transitions (hand-over-hand)",
          authorization: {
            authorizedBy: "Dr. Maria Rodriguez",
            authorizationDate: "2025-03-10",
            expiryDate: "2025-09-10",
            reviewDate: "2025-06-10",
            status: "active",
          },
          reductionPlan: {
            hasReductionPlan: true,
            goalDescription:
              "Reduce physical prompting by teaching independent transition skills",
            strategies: [
              "Visual schedule implementation",
              "Social stories for transitions",
              "Positive reinforcement",
              "Gradual fading of prompts",
            ],
            targetDate: "2025-09-10",
            progress: 60,
          },
          usage: {
            lastUsed: "2025-10-07",
            frequency: 15, // 15 times this month
            trend: "decreasing",
          },
          reportedToNDIS: true,
          lastReportDate: "2025-09-30",
          nextReportDue: "2025-10-31",
          severity: "low",
          createdAt: "2025-03-10T11:00:00Z",
          updatedAt: "2025-10-07T08:00:00Z",
        },
      ];

      setPractices(mockData);
    } catch (error) {
      console.error("Error loading restrictive practices:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      chemical: "bg-red-100 text-red-800",
      physical: "bg-orange-100 text-orange-800",
      environmental: "bg-yellow-100 text-yellow-800",
      mechanical: "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      "pending-renewal": "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return (
      colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "decreasing")
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (trend === "increasing")
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <AlertCircle className="h-4 w-4 text-gray-600" />;
  };

  const filteredPractices = practices.filter((practice) => {
    const matchesType = filterType === "all" || practice.type === filterType;
    const matchesStatus =
      filterStatus === "all" || practice.authorization.status === filterStatus;
    const matchesSearch =
      practice.participantName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      practice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const totalPractices = practices.length;
  const activePractices = practices.filter(
    (p) => p.authorization.status === "active",
  ).length;
  const expiringDue = practices.filter((p) => {
    const expiry = new Date(p.authorization.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;
  const overdue = practices.filter(
    (p) => p.authorization.status === "expired",
  ).length;

  const handleExport = () => {
    console.log("Exporting restrictive practices register...");
    alert("Generating NDIS-compliant report... (Feature in development)");
  };

  const handleGenerateReport = () => {
    console.log("Generating monthly NDIS Commission report...");
    alert(
      "Generating monthly NDIS Commission report... (Feature in development)",
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading restrictive practices register...
          </p>
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
                <Shield className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Restrictive Practices Register
                </h1>
                <Badge className="bg-red-100 text-red-800">
                  NDIS COMPLIANCE CRITICAL
                </Badge>
              </div>
              <p className="text-gray-600">
                Track and report all restrictive practices in compliance with
                NDIS Commission requirements
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateReport}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <FileText className="h-4 w-4" />
                Generate NDIS Report
              </Button>
              <Button
                onClick={handleExport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Export Register
              </Button>
              <Button
                onClick={() =>
                  alert("Add New Practice form (Feature in development)")
                }
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Add Practice
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Practices</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPractices}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Registered</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Practices</p>
                  <p className="text-2xl font-bold text-green-600">
                    {activePractices}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently authorized
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {expiringDue}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Within 30 days</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdue}</p>
                  <p className="text-xs text-gray-500 mt-1">Requires renewal</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
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
                  placeholder="Search by participant, practice ID, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="chemical">Chemical</option>
                  <option value="physical">Physical</option>
                  <option value="environmental">Environmental</option>
                  <option value="mechanical">Mechanical</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending-renewal">Pending Renewal</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Practices List */}
          <div className="space-y-4">
            {filteredPractices.map((practice) => (
              <Card
                key={practice.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {practice.participantName}
                        </h3>
                        <Badge className={getTypeColor(practice.type)}>
                          {practice.type.charAt(0).toUpperCase() +
                            practice.type.slice(1)}
                        </Badge>
                        <Badge className={getSeverityColor(practice.severity)}>
                          {practice.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {practice.description}
                      </p>
                      {practice.medication && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Medication:</span>{" "}
                          {practice.medication} - {practice.dosage}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Practice ID</p>
                    <p className="text-sm font-mono font-medium">
                      {practice.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Authorization Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Authorization
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-600">By:</span>{" "}
                        <span className="font-medium">
                          {practice.authorization.authorizedBy}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Authorized:</span>{" "}
                        {format(
                          new Date(practice.authorization.authorizationDate),
                          "MMM d, yyyy",
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600">Expires:</span>{" "}
                        {format(
                          new Date(practice.authorization.expiryDate),
                          "MMM d, yyyy",
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600">Next Review:</span>{" "}
                        {format(
                          new Date(practice.authorization.reviewDate),
                          "MMM d, yyyy",
                        )}
                      </div>
                      <Badge
                        className={getStatusColor(
                          practice.authorization.status,
                        )}
                      >
                        {practice.authorization.status
                          .replace("-", " ")
                          .toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Usage Statistics */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Usage This Month
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="font-medium">
                          {practice.usage.frequency} times
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Trend:</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(practice.usage.trend)}
                          <span className="font-medium capitalize">
                            {practice.usage.trend}
                          </span>
                        </div>
                      </div>
                      {practice.usage.lastUsed && (
                        <div>
                          <span className="text-gray-600">Last Used:</span>{" "}
                          {format(
                            new Date(practice.usage.lastUsed),
                            "MMM d, yyyy",
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NDIS Reporting */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      NDIS Reporting
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {practice.reportedToNDIS ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={
                            practice.reportedToNDIS
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {practice.reportedToNDIS
                            ? "Reported"
                            : "Not Reported"}
                        </span>
                      </div>
                      {practice.lastReportDate && (
                        <div>
                          <span className="text-gray-600">Last Report:</span>{" "}
                          {format(
                            new Date(practice.lastReportDate),
                            "MMM d, yyyy",
                          )}
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Next Due:</span>{" "}
                        {format(
                          new Date(practice.nextReportDue),
                          "MMM d, yyyy",
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reduction Plan */}
                {practice.reductionPlan.hasReductionPlan && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-blue-600" />
                      Reduction Plan
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {practice.reductionPlan.goalDescription}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {practice.reductionPlan.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${practice.reductionPlan.progress}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Strategies */}
                    {practice.reductionPlan.strategies &&
                      practice.reductionPlan.strategies.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-2">
                            Strategies:
                          </p>
                          <ul className="grid grid-cols-2 gap-2">
                            {practice.reductionPlan.strategies.map(
                              (strategy, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span>{strategy}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {practice.reductionPlan.targetDate && (
                      <p className="text-xs text-gray-600 mt-2">
                        Target Date:{" "}
                        {format(
                          new Date(practice.reductionPlan.targetDate),
                          "MMM d, yyyy",
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      alert("View Full Details (Feature in development)")
                    }
                  >
                    View Full Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      alert("Record Usage (Feature in development)")
                    }
                  >
                    Record Usage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      alert("Update Reduction Plan (Feature in development)")
                    }
                  >
                    Update Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      alert("Renew Authorization (Feature in development)")
                    }
                  >
                    Renew Authorization
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredPractices.length === 0 && (
            <Card className="p-12 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                No restrictive practices found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search or filter criteria
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
