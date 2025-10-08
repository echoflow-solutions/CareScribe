"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import {
  AnalyticsSummary,
  ParticipantStats,
  StaffStats,
  Trend,
} from "@/lib/types";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  FileText,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
} from "lucide-react";

export default function AnalyticsDashboardPage() {
  return <AnalyticsDashboardContent />;
}

function AnalyticsDashboardContent() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useStore();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "quarter">("month");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    loadAnalytics();
  }, [currentUser, hasHydrated, router, period]);

  const loadAnalytics = async () => {
    try {
      // Simulate loading analytics
      const mockData: AnalyticsSummary = {
        period: period,
        startDate: "2025-09-01",
        endDate: "2025-09-30",
        totalIncidents: 47,
        incidentsByType: {
          behavioral: 23,
          medical: 12,
          property: 8,
          other: 4,
        },
        incidentsBySeverity: {
          low: 15,
          medium: 20,
          high: 12,
        },
        participantStats: [
          {
            participantId: "1",
            participantName: "Michael Brown",
            incidentCount: 8,
            trend: "increasing",
            riskLevel: "high",
          },
          {
            participantId: "2",
            participantName: "Emma Wilson",
            incidentCount: 5,
            trend: "stable",
            riskLevel: "medium",
          },
          {
            participantId: "3",
            participantName: "Lisa Thompson",
            incidentCount: 3,
            trend: "decreasing",
            riskLevel: "low",
          },
        ],
        staffStats: [
          {
            staffId: "user-2",
            staffName: "Sarah Chen",
            reportsSubmitted: 15,
            avgResponseTime: 12,
            incidentsHandled: 18,
          },
          {
            staffId: "user-3",
            staffName: "Dr. Maria Rodriguez",
            reportsSubmitted: 12,
            avgResponseTime: 8,
            incidentsHandled: 14,
          },
          {
            staffId: "user-1",
            staffName: "Tom Anderson",
            reportsSubmitted: 20,
            avgResponseTime: 15,
            incidentsHandled: 25,
          },
        ],
        trends: [
          {
            metric: "Total Incidents",
            value: 47,
            change: 15.5,
            direction: "up",
            timestamp: "2025-09-30",
          },
          {
            metric: "Response Time",
            value: 12,
            change: -8.3,
            direction: "down",
            timestamp: "2025-09-30",
          },
          {
            metric: "Report Quality",
            value: 92,
            change: 5.2,
            direction: "up",
            timestamp: "2025-09-30",
          },
          {
            metric: "Resolved Issues",
            value: 89,
            change: 0,
            direction: "stable",
            timestamp: "2025-09-30",
          },
        ],
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: string) => {
    if (direction === "up") return TrendingUp;
    if (direction === "down") return TrendingDown;
    return Minus;
  };

  const getTrendColor = (direction: string, isGood: boolean = true) => {
    if (direction === "stable") return "text-gray-600";
    if (direction === "up") return isGood ? "text-green-600" : "text-red-600";
    if (direction === "down") return isGood ? "text-red-600" : "text-green-600";
    return "text-gray-600";
  };

  const getRiskColor = (level: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  const handleExport = () => {
    console.log("Exporting analytics...");
    alert("Exporting analytics report... (Feature in development)");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={period}
                  onChange={(e) =>
                    setPeriod(e.target.value as "week" | "month" | "quarter")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                </select>
              </div>
              <Button
                onClick={handleExport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Incidents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalIncidents}
                  </p>
                  {analytics.trends[0] && (
                    <div
                      className={`flex items-center gap-1 mt-1 text-sm ${getTrendColor(analytics.trends[0].direction, false)}`}
                    >
                      {(() => {
                        const Icon = getTrendIcon(
                          analytics.trends[0].direction,
                        );
                        return <Icon className="h-4 w-4" />;
                      })()}
                      <span>{Math.abs(analytics.trends[0].change)}%</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.staffStats.reduce(
                      (sum, s) => sum + s.avgResponseTime,
                      0,
                    ) / analytics.staffStats.length}{" "}
                    min
                  </p>
                  {analytics.trends[1] && (
                    <div
                      className={`flex items-center gap-1 mt-1 text-sm ${getTrendColor(analytics.trends[1].direction, true)}`}
                    >
                      {(() => {
                        const Icon = getTrendIcon(
                          analytics.trends[1].direction,
                        );
                        return <Icon className="h-4 w-4" />;
                      })()}
                      <span>{Math.abs(analytics.trends[1].change)}%</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reports Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.staffStats.reduce(
                      (sum, s) => sum + s.reportsSubmitted,
                      0,
                    )}
                  </p>
                  {analytics.trends[2] && (
                    <div
                      className={`flex items-center gap-1 mt-1 text-sm ${getTrendColor(analytics.trends[2].direction)}`}
                    >
                      {(() => {
                        const Icon = getTrendIcon(
                          analytics.trends[2].direction,
                        );
                        return <Icon className="h-4 w-4" />;
                      })()}
                      <span>{Math.abs(analytics.trends[2].change)}%</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Participants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.participantStats.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Total tracked</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Incidents by Type */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Incidents by Type
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.incidentsByType).map(
                  ([type, count]) => {
                    const percentage = (count / analytics.totalIncidents) * 100;
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {type}
                          </span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </Card>

            {/* Incidents by Severity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Incidents by Severity
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.incidentsBySeverity).map(
                  ([severity, count]) => {
                    const percentage = (count / analytics.totalIncidents) * 100;
                    const color =
                      severity === "high"
                        ? "bg-red-600"
                        : severity === "medium"
                          ? "bg-yellow-600"
                          : "bg-green-600";
                    return (
                      <div key={severity}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {severity}
                          </span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${color} h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </Card>
          </div>

          {/* Participant Performance */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Participant Insights
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Participant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Incidents
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Trend
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Risk Level
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.participantStats.map((participant) => {
                    const TrendIcon = getTrendIcon(participant.trend);
                    return (
                      <tr
                        key={participant.participantId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {participant.participantName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {participant.incidentCount}
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={`flex items-center gap-1 ${getTrendColor(participant.trend, false)}`}
                          >
                            <TrendIcon className="h-4 w-4" />
                            <span className="text-sm capitalize">
                              {participant.trend}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={getRiskColor(participant.riskLevel)}
                          >
                            {participant.riskLevel}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Staff Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Staff Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Staff Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Reports Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Avg Response (min)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Incidents Handled
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.staffStats.map((staff) => (
                    <tr key={staff.staffId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {staff.staffName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {staff.reportsSubmitted}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {staff.avgResponseTime}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {staff.incidentsHandled}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
