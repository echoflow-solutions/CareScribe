"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataService } from "@/lib/data/service";
import { useStore } from "@/lib/store";
import { Alert } from "@/lib/types";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

// Helper function to safely format dates
function formatAlertDate(dateValue: any): string {
  try {
    if (!dateValue) return "Unknown time";

    if (dateValue instanceof Date) {
      if (isValid(dateValue)) {
        return format(dateValue, "MMM d, h:mm a");
      }
      return "Invalid date";
    }

    const parsedDate = parseISO(String(dateValue));
    if (isValid(parsedDate)) {
      return format(parsedDate, "MMM d, h:mm a");
    }

    const directDate = new Date(dateValue);
    if (isValid(directDate)) {
      return format(directDate, "MMM d, h:mm a");
    }

    return "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error, dateValue);
    return "Invalid date";
  }
}

// Get icon based on alert type
function getAlertIcon(type: string) {
  const iconMap: Record<string, any> = {
    risk: AlertTriangle,
    medication: AlertCircle,
    environmental: Bell,
    default: AlertCircle,
  };
  const Icon = iconMap[type] || iconMap.default;
  return Icon;
}

// Get colors based on severity
function getSeverityColors(severity: string) {
  const colors = {
    critical: {
      border: "border-l-red-600",
      bg: "bg-red-50",
      icon: "text-red-600",
      badge: "bg-red-100 text-red-800",
    },
    warning: {
      border: "border-l-orange-500",
      bg: "bg-orange-50",
      icon: "text-orange-600",
      badge: "bg-orange-100 text-orange-800",
    },
    info: {
      border: "border-l-blue-500",
      bg: "bg-blue-50",
      icon: "text-blue-600",
      badge: "bg-blue-100 text-blue-800",
    },
  };
  return colors[severity as keyof typeof colors] || colors.info;
}

export default function AlertsPage() {
  return <AlertsContent />;
}

function AlertsContent() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    loadAlerts();
  }, [currentUser, hasHydrated, router]);

  const loadAlerts = async () => {
    try {
      const alertData = await DataService.getAlerts();
      setAlerts(alertData);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await DataService.acknowledgeAlert(alertId);
      await loadAlerts();
    } catch (error) {
      console.error("Error acknowledging alert:", error);
    }
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                System Alerts
              </h1>
              <p className="text-gray-600">
                Monitor and manage all system alerts and notifications in
                real-time
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Active Alerts</div>
                <div className="text-2xl font-bold text-red-600">
                  {unacknowledgedAlerts.length}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Today</div>
                <div className="text-2xl font-bold text-gray-900">
                  {alerts.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-7xl">
          {/* Active Alerts Section */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Active Alerts
                </h2>
                <p className="text-sm text-gray-500">
                  Requires immediate attention
                </p>
              </div>
              {unacknowledgedAlerts.length > 0 && (
                <Badge className="ml-auto bg-red-600 text-white px-3 py-1 text-sm">
                  {unacknowledgedAlerts.length} Pending
                </Badge>
              )}
            </div>

            {unacknowledgedAlerts.length === 0 ? (
              <Card className="p-12 text-center bg-white border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    All Clear!
                  </h3>
                  <p className="text-gray-600">
                    No active alerts at this time. All alerts have been
                    acknowledged.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {unacknowledgedAlerts.map((alert) => {
                  const colors = getSeverityColors(alert.severity);
                  const Icon = getAlertIcon(alert.type);

                  return (
                    <Card
                      key={alert.id}
                      className={`${colors.border} ${colors.bg} border-l-4 bg-white shadow-sm hover:shadow-md transition-all duration-200`}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`p-3 rounded-lg ${colors.badge} shrink-0`}
                          >
                            <Icon className={`h-6 w-6 ${colors.icon}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge className={colors.badge}>
                                  {alert.type}
                                </Badge>
                                {alert.severity === "critical" && (
                                  <Badge className="bg-red-600 text-white animate-pulse">
                                    CRITICAL
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  {formatAlertDate(alert.timestamp)}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAcknowledge(alert.id)}
                                className="shrink-0 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Acknowledge
                              </Button>
                            </div>

                            {/* Message */}
                            <p className="text-gray-900 text-base mb-3 leading-relaxed">
                              {alert.message}
                            </p>

                            {/* Participant Info */}
                            {alert.participantId && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-md px-3 py-2 inline-flex">
                                <User className="h-4 w-4" />
                                <span className="font-medium">
                                  Participant:
                                </span>
                                <span>{alert.participantId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Acknowledged Alerts Section */}
          {acknowledgedAlerts.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Acknowledged Alerts
                  </h2>
                  <p className="text-sm text-gray-500">
                    Recently resolved alerts
                  </p>
                </div>
                <Badge className="ml-auto bg-gray-200 text-gray-700 px-3 py-1 text-sm">
                  {acknowledgedAlerts.length} Resolved
                </Badge>
              </div>

              <div className="space-y-3">
                {acknowledgedAlerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className="bg-white border border-gray-200 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Success Icon */}
                        <div className="p-2 bg-green-100 rounded-lg shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {alert.type}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatAlertDate(alert.timestamp)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">
                            {alert.message}
                          </p>
                          {alert.participantId && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                              <User className="h-3 w-3" />
                              <span>Participant: {alert.participantId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
