"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { ReportEscalation, EscalationStage } from "@/lib/types";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  MessageSquare,
  PlayCircle,
  PauseCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function EscalationPage() {
  return <EscalationContent />;
}

function EscalationContent() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useStore();
  const [escalations, setEscalations] = useState<ReportEscalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEscalation, setSelectedEscalation] =
    useState<ReportEscalation | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    loadEscalationData();
  }, [currentUser, hasHydrated, router]);

  const loadEscalationData = async () => {
    try {
      // Simulate loading escalation data
      // In production, this would fetch from Supabase
      const mockData: ReportEscalation[] = [
        {
          id: "1",
          reportId: "INC-001",
          reportType: "incident",
          participantId: "1",
          participantName: "Michael Brown",
          facilityId: "facility-1",
          currentStage: "follow_up",
          priority: "high",
          assignedTo: "user-1",
          assignedToName: "Tom Anderson",
          dueDate: "2025-10-08",
          completedStages: [
            {
              stage: "report_entry",
              completedAt: "2025-10-05T14:30:00Z",
              completedBy: "user-2",
              completedByName: "Sarah Chen",
              notes: "Initial incident report filed",
              duration: 15,
            },
            {
              stage: "provider_notification",
              completedAt: "2025-10-05T15:00:00Z",
              completedBy: "user-1",
              completedByName: "Tom Anderson",
              notes: "Provider notified via phone and email",
              duration: 10,
            },
          ],
          timeline: [
            {
              id: "t1",
              reportEscalationId: "1",
              eventType: "stage_change",
              stage: "report_entry",
              performedBy: "user-2",
              performedByName: "Sarah Chen",
              description: "Report created and entered into system",
              timestamp: "2025-10-05T14:30:00Z",
            },
            {
              id: "t2",
              reportEscalationId: "1",
              eventType: "stage_change",
              stage: "provider_notification",
              performedBy: "user-1",
              performedByName: "Tom Anderson",
              description: "Provider successfully notified",
              timestamp: "2025-10-05T15:00:00Z",
            },
            {
              id: "t3",
              reportEscalationId: "1",
              eventType: "assignment",
              performedBy: "system",
              performedByName: "System",
              description: "Assigned to Tom Anderson for follow-up",
              timestamp: "2025-10-05T15:05:00Z",
            },
          ],
          status: "in_progress",
          createdAt: "2025-10-05T14:30:00Z",
          updatedAt: "2025-10-05T15:05:00Z",
        },
        {
          id: "2",
          reportId: "ABC-004",
          reportType: "abc",
          participantId: "2",
          participantName: "Emma Wilson",
          facilityId: "facility-1",
          currentStage: "complete_report",
          priority: "medium",
          assignedTo: "user-3",
          assignedToName: "Dr. Maria Rodriguez",
          dueDate: "2025-10-09",
          completedStages: [
            {
              stage: "report_entry",
              completedAt: "2025-10-04T10:00:00Z",
              completedBy: "user-2",
              completedByName: "Sarah Chen",
              duration: 20,
            },
            {
              stage: "provider_notification",
              completedAt: "2025-10-04T11:00:00Z",
              completedBy: "user-1",
              completedByName: "Tom Anderson",
              duration: 15,
            },
            {
              stage: "follow_up",
              completedAt: "2025-10-06T14:00:00Z",
              completedBy: "user-3",
              completedByName: "Dr. Maria Rodriguez",
              notes: "Conducted follow-up assessment",
              duration: 45,
            },
            {
              stage: "support_workers",
              completedAt: "2025-10-06T16:00:00Z",
              completedBy: "user-1",
              completedByName: "Tom Anderson",
              notes: "Briefed support workers on incident",
              duration: 30,
            },
          ],
          timeline: [],
          status: "in_progress",
          createdAt: "2025-10-04T10:00:00Z",
          updatedAt: "2025-10-06T16:00:00Z",
        },
        {
          id: "3",
          reportId: "INC-002",
          reportType: "incident",
          participantId: "3",
          participantName: "Lisa Thompson",
          facilityId: "facility-1",
          currentStage: "review_and_close",
          priority: "critical",
          assignedTo: "user-1",
          assignedToName: "Tom Anderson",
          completedStages: [
            {
              stage: "report_entry",
              completedAt: "2025-10-03T15:00:00Z",
              completedBy: "user-2",
              completedByName: "Sarah Chen",
              duration: 25,
            },
            {
              stage: "provider_notification",
              completedAt: "2025-10-03T15:30:00Z",
              completedBy: "user-1",
              completedByName: "Tom Anderson",
              duration: 10,
            },
            {
              stage: "follow_up",
              completedAt: "2025-10-03T17:00:00Z",
              completedBy: "user-3",
              completedByName: "Dr. Maria Rodriguez",
              duration: 60,
            },
            {
              stage: "support_workers",
              completedAt: "2025-10-04T09:00:00Z",
              completedBy: "user-1",
              completedByName: "Tom Anderson",
              duration: 30,
            },
            {
              stage: "complete_report",
              completedAt: "2025-10-04T14:00:00Z",
              completedBy: "user-2",
              completedByName: "Sarah Chen",
              duration: 45,
            },
            {
              stage: "send_to_stakeholders",
              completedAt: "2025-10-05T10:00:00Z",
              completedBy: "user-1",
              completedByName: "Tom Anderson",
              duration: 15,
            },
            {
              stage: "notify_stakeholders",
              completedAt: "2025-10-05T11:00:00Z",
              completedBy: "system",
              completedByName: "System",
              duration: 5,
            },
            {
              stage: "additional_follow_up",
              completedAt: "2025-10-06T15:00:00Z",
              completedBy: "user-3",
              completedByName: "Dr. Maria Rodriguez",
              duration: 40,
            },
          ],
          timeline: [],
          status: "in_progress",
          createdAt: "2025-10-03T15:00:00Z",
          updatedAt: "2025-10-06T15:00:00Z",
        },
      ];

      setEscalations(mockData);
    } catch (error) {
      console.error("Error loading escalation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stageDefinitions = [
    { stage: "report_entry", name: "Report Entry", order: 1 },
    { stage: "provider_notification", name: "Provider Notification", order: 2 },
    { stage: "follow_up", name: "Follow-Up", order: 3 },
    { stage: "support_workers", name: "Support Workers", order: 4 },
    { stage: "complete_report", name: "Complete Report", order: 5 },
    { stage: "send_to_stakeholders", name: "Send to Stakeholders", order: 6 },
    { stage: "notify_stakeholders", name: "Notify Stakeholders", order: 7 },
    { stage: "additional_follow_up", name: "Additional Follow-Up", order: 8 },
    { stage: "review_and_close", name: "Review & Close", order: 9 },
  ];

  const getStageOrder = (stage: EscalationStage) => {
    return stageDefinitions.find((s) => s.stage === stage)?.order || 0;
  };

  const getStageName = (stage: EscalationStage) => {
    return stageDefinitions.find((s) => s.stage === stage)?.name || stage;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      escalated: "bg-red-100 text-red-800",
      on_hold: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.in_progress;
  };

  const filteredEscalations = escalations.filter((esc) => {
    const matchesStatus = filterStatus === "all" || esc.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || esc.priority === filterPriority;
    const matchesSearch =
      esc.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      esc.participantName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const inProgressCount = escalations.filter(
    (e) => e.status === "in_progress",
  ).length;
  const completedCount = escalations.filter(
    (e) => e.status === "completed",
  ).length;
  const criticalCount = escalations.filter(
    (e) => e.priority === "critical",
  ).length;
  const overDueCount = escalations.filter((e) => {
    if (!e.dueDate) return false;
    return new Date(e.dueDate) < new Date();
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading escalation data...</p>
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
                Report Escalation Tracker
              </h1>
              <p className="text-gray-600">
                Track and manage the progression of incident and ABC reports
                through escalation stages
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {inProgressCount}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <PlayCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {completedCount}
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
                  <p className="text-sm text-gray-600">Critical Priority</p>
                  <p className="text-2xl font-bold text-red-600">
                    {criticalCount}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {overDueCount}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
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
                  placeholder="Search by Report ID or Participant..."
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
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="escalated">Escalated</option>
                  <option value="on_hold">On Hold</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Escalation Cards */}
          <div className="space-y-6">
            {filteredEscalations.map((escalation) => (
              <Card key={escalation.id} className="p-6">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {escalation.reportId}
                      </h3>
                      <Badge className={getPriorityColor(escalation.priority)}>
                        {escalation.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(escalation.status)}>
                        {escalation.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {escalation.reportType}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Participant:</span>{" "}
                      {escalation.participantName}
                    </p>
                    {escalation.assignedToName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Assigned to: {escalation.assignedToName}</span>
                      </div>
                    )}
                    {escalation.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Due:{" "}
                          {format(new Date(escalation.dueDate), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedEscalation(escalation)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    View Details
                  </Button>
                </div>

                {/* Visual Workflow Progress */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {stageDefinitions.map((stageDef, index) => {
                      const isCompleted = escalation.completedStages.some(
                        (cs) => cs.stage === stageDef.stage,
                      );
                      const isCurrent =
                        escalation.currentStage === stageDef.stage;
                      const currentOrder = getStageOrder(
                        escalation.currentStage,
                      );
                      const stageOrder = stageDef.order;

                      return (
                        <div
                          key={stageDef.stage}
                          className="flex items-center flex-1"
                        >
                          <div className="flex flex-col items-center relative">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted
                                  ? "bg-green-500 text-white"
                                  : isCurrent
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : isCurrent ? (
                                <PlayCircle className="h-5 w-5" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            <div className="mt-2 text-center">
                              <p
                                className={`text-xs font-medium ${
                                  isCompleted || isCurrent
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                {stageDef.name}
                              </p>
                            </div>
                          </div>
                          {index < stageDefinitions.length - 1 && (
                            <div
                              className={`flex-1 h-1 mx-2 ${
                                stageOrder < currentOrder
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="mt-6 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      Progress:{" "}
                      <span className="font-bold text-gray-900">
                        {escalation.completedStages.length} /{" "}
                        {stageDefinitions.length}
                      </span>{" "}
                      stages completed
                    </span>
                    <span className="text-gray-600">
                      Current Stage:{" "}
                      <span className="font-bold text-blue-600">
                        {getStageName(escalation.currentStage)}
                      </span>
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Add Comment
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredEscalations.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  No escalations found
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
