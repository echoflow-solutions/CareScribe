"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { AuditLog } from "@/lib/types";
import {
  Shield,
  Download,
  Search,
  Filter,
  User,
  Calendar,
  Activity,
  FileEdit,
  FileX,
  FilePlus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function AuditPage() {
  return <AuditContent />;
}

function AuditContent() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useStore();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    loadAuditLogs();
  }, [currentUser, hasHydrated, router]);

  const loadAuditLogs = async () => {
    try {
      // Simulate loading audit logs
      const mockData: AuditLog[] = [
        {
          id: "1",
          entityType: "incident",
          entityId: "INC-001",
          action: "create",
          performedBy: "user-2",
          performedByName: "Sarah Chen",
          timestamp: "2025-10-07T14:30:00Z",
          changes: [
            { field: "status", oldValue: null, newValue: "draft" },
            { field: "severity", oldValue: null, newValue: "high" },
          ],
          metadata: { reportType: "incident", participantId: "1" },
        },
        {
          id: "2",
          entityType: "billing",
          entityId: "BIL-2025-001",
          action: "update",
          performedBy: "user-1",
          performedByName: "Tom Anderson",
          timestamp: "2025-10-07T15:00:00Z",
          changes: [
            { field: "status", oldValue: "pending", newValue: "submitted" },
          ],
          metadata: { billingId: "BIL-2025-001" },
        },
        {
          id: "3",
          entityType: "participant",
          entityId: "1",
          action: "update",
          performedBy: "user-3",
          performedByName: "Dr. Maria Rodriguez",
          timestamp: "2025-10-07T13:45:00Z",
          changes: [
            { field: "riskLevel", oldValue: "medium", newValue: "high" },
            { field: "supportPlan", oldValue: "Plan A", newValue: "Plan B" },
          ],
          metadata: { participantName: "Michael Brown" },
        },
        {
          id: "4",
          entityType: "medication",
          entityId: "med-123",
          action: "create",
          performedBy: "user-3",
          performedByName: "Dr. Maria Rodriguez",
          timestamp: "2025-10-07T12:00:00Z",
          changes: [
            { field: "name", oldValue: null, newValue: "Medication X" },
            { field: "dosage", oldValue: null, newValue: "10mg" },
          ],
          metadata: { participantId: "2" },
        },
        {
          id: "5",
          entityType: "user",
          entityId: "user-5",
          action: "create",
          performedBy: "user-1",
          performedByName: "Tom Anderson",
          timestamp: "2025-10-07T10:00:00Z",
          changes: [
            { field: "role", oldValue: null, newValue: "Support Worker" },
            { field: "facilityId", oldValue: null, newValue: "facility-1" },
          ],
          metadata: { email: "newuser@example.com" },
        },
        {
          id: "6",
          entityType: "incident",
          entityId: "INC-002",
          action: "approve",
          performedBy: "user-1",
          performedByName: "Tom Anderson",
          timestamp: "2025-10-07T09:30:00Z",
          changes: [
            { field: "status", oldValue: "submitted", newValue: "approved" },
          ],
          metadata: { reportType: "combined" },
        },
        {
          id: "7",
          entityType: "billing",
          entityId: "BIL-2025-003",
          action: "export",
          performedBy: "user-1",
          performedByName: "Tom Anderson",
          timestamp: "2025-10-06T16:45:00Z",
          metadata: { exportFormat: "PDF", recordCount: 15 },
        },
      ];

      setAuditLogs(mockData);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityColor = (entityType: string) => {
    const colors = {
      incident: "bg-red-100 text-red-800",
      participant: "bg-blue-100 text-blue-800",
      medication: "bg-green-100 text-green-800",
      billing: "bg-purple-100 text-purple-800",
      user: "bg-orange-100 text-orange-800",
      shift: "bg-cyan-100 text-cyan-800",
    };
    return (
      colors[entityType as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getActionIcon = (action: string) => {
    const icons = {
      create: FilePlus,
      update: FileEdit,
      delete: FileX,
      submit: CheckCircle,
      approve: CheckCircle,
      reject: XCircle,
      export: Download,
    };
    return icons[action as keyof typeof icons] || Activity;
  };

  const getActionColor = (action: string) => {
    const colors = {
      create: "text-green-600",
      update: "text-blue-600",
      delete: "text-red-600",
      submit: "text-purple-600",
      approve: "text-green-600",
      reject: "text-red-600",
      export: "text-gray-600",
    };
    return colors[action as keyof typeof colors] || "text-gray-600";
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesEntity =
      filterEntity === "all" || log.entityType === filterEntity;
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesSearch =
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEntity && matchesAction && matchesSearch;
  });

  const totalLogs = auditLogs.length;
  const todayLogs = auditLogs.filter((log) => {
    const logDate = new Date(log.timestamp);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;
  const uniqueUsers = new Set(auditLogs.map((log) => log.performedBy)).size;
  const criticalActions = auditLogs.filter(
    (log) => log.action === "delete" || log.action === "reject",
  ).length;

  const handleExport = () => {
    console.log("Exporting audit logs...");
    alert("Exporting audit logs to CSV... (Feature in development)");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit logs...</p>
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
                Audit Trail
              </h1>
              <p className="text-gray-600">
                Complete history of all system activities and changes
              </p>
            </div>
            <Button
              onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalLogs}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Activities</p>
                  <p className="text-2xl font-bold text-green-600">
                    {todayLogs}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {uniqueUsers}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Critical Actions</p>
                  <p className="text-2xl font-bold text-red-600">
                    {criticalActions}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
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
                  placeholder="Search by entity ID, user, or entity type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={filterEntity}
                  onChange={(e) => setFilterEntity(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Entities</option>
                  <option value="incident">Incident</option>
                  <option value="participant">Participant</option>
                  <option value="medication">Medication</option>
                  <option value="billing">Billing</option>
                  <option value="user">User</option>
                  <option value="shift">Shift</option>
                </select>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="submit">Submit</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="export">Export</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Timeline */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <div
                    key={log.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${getActionColor(log.action)} bg-opacity-10`}
                      >
                        <ActionIcon
                          className={`h-5 w-5 ${getActionColor(log.action)}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge className={getEntityColor(log.entityType)}>
                              {log.entityType}
                            </Badge>
                            <span className="font-mono text-sm font-medium text-gray-900">
                              {log.entityId}
                            </span>
                            <span className="text-sm text-gray-600 capitalize">
                              {log.action}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(
                              new Date(log.timestamp),
                              "MMM d, yyyy HH:mm:ss",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <User className="h-4 w-4" />
                          <span>
                            Performed by{" "}
                            <span className="font-medium">
                              {log.performedByName}
                            </span>
                          </span>
                        </div>
                        {log.changes && log.changes.length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Changes:
                            </p>
                            <div className="space-y-1">
                              {log.changes.map((change, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-xs text-gray-600"
                                >
                                  <span className="font-medium">
                                    {change.field}:
                                  </span>
                                  {change.oldValue !== null && (
                                    <>
                                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                                        {String(change.oldValue)}
                                      </span>
                                      <span>→</span>
                                    </>
                                  )}
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                                    {String(change.newValue)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No audit logs found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
