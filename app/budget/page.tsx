"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Users,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  committed: number;
  available: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

interface NDISFunding {
  id: string;
  participantId: string;
  participantName: string;
  planStart: string;
  planEnd: string;
  totalBudget: number;
  spent: number;
  committed: number;
  available: number;
  categories: {
    name: string;
    budget: number;
    spent: number;
  }[];
  status: "active" | "expiring" | "expired";
}

export default function BudgetPage() {
  return <BudgetContent />;
}

function BudgetContent() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useStore();
  const [activeTab, setActiveTab] = useState<"overview" | "ndis" | "operational" | "forecast">("overview");
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [ndisFunding, setNdisFunding] = useState<NDISFunding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    loadBudgetData();
  }, [currentUser, hasHydrated, router]);

  const loadBudgetData = async () => {
    try {
      // Mock budget categories data
      const mockCategories: BudgetCategory[] = [
        {
          id: "cat-1",
          name: "Staffing & Wages",
          allocated: 450000,
          spent: 315000,
          committed: 85000,
          available: 50000,
          trend: "up",
          trendPercent: 5.2,
        },
        {
          id: "cat-2",
          name: "NDIS Service Delivery",
          allocated: 680000,
          spent: 425000,
          committed: 120000,
          available: 135000,
          trend: "stable",
          trendPercent: 0.8,
        },
        {
          id: "cat-3",
          name: "Training & Development",
          allocated: 45000,
          spent: 28500,
          committed: 8000,
          available: 8500,
          trend: "down",
          trendPercent: -3.5,
        },
        {
          id: "cat-4",
          name: "Facilities & Maintenance",
          allocated: 85000,
          spent: 62000,
          committed: 15000,
          available: 8000,
          trend: "up",
          trendPercent: 8.1,
        },
        {
          id: "cat-5",
          name: "Equipment & Resources",
          allocated: 35000,
          spent: 22000,
          committed: 5000,
          available: 8000,
          trend: "stable",
          trendPercent: 1.2,
        },
        {
          id: "cat-6",
          name: "Administration",
          allocated: 55000,
          spent: 38000,
          committed: 12000,
          available: 5000,
          trend: "up",
          trendPercent: 4.5,
        },
      ];

      // Mock NDIS funding data
      const mockNDIS: NDISFunding[] = [
        {
          id: "ndis-1",
          participantId: "1",
          participantName: "Michael Brown",
          planStart: "2025-07-01",
          planEnd: "2026-06-30",
          totalBudget: 85000,
          spent: 32500,
          committed: 18000,
          available: 34500,
          categories: [
            { name: "Core Supports", budget: 45000, spent: 18000 },
            { name: "Capacity Building", budget: 25000, spent: 9500 },
            { name: "Capital Supports", budget: 15000, spent: 5000 },
          ],
          status: "active",
        },
        {
          id: "ndis-2",
          participantId: "2",
          participantName: "Emma Wilson",
          planStart: "2025-05-15",
          planEnd: "2026-05-14",
          totalBudget: 72000,
          spent: 42000,
          committed: 15000,
          available: 15000,
          categories: [
            { name: "Core Supports", budget: 38000, spent: 22000 },
            { name: "Capacity Building", budget: 22000, spent: 13000 },
            { name: "Capital Supports", budget: 12000, spent: 7000 },
          ],
          status: "active",
        },
        {
          id: "ndis-3",
          participantId: "8",
          participantName: "Ethan Williams",
          planStart: "2025-03-01",
          planEnd: "2026-02-28",
          totalBudget: 95000,
          spent: 68000,
          committed: 20000,
          available: 7000,
          categories: [
            { name: "Core Supports", budget: 52000, spent: 38000 },
            { name: "Capacity Building", budget: 28000, spent: 20000 },
            { name: "Capital Supports", budget: 15000, spent: 10000 },
          ],
          status: "expiring",
        },
      ];

      setBudgetCategories(mockCategories);
      setNdisFunding(mockNDIS);
    } catch (error) {
      console.error("Error loading budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalCommitted = budgetCategories.reduce((sum, cat) => sum + cat.committed, 0);
  const totalAvailable = budgetCategories.reduce((sum, cat) => sum + cat.available, 0);

  const ndisTotal = ndisFunding.reduce((sum, ndis) => sum + ndis.totalBudget, 0);
  const ndisSpent = ndisFunding.reduce((sum, ndis) => sum + ndis.spent, 0);
  const ndisAvailable = ndisFunding.reduce((sum, ndis) => sum + ndis.available, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  Budget & Financial Management
                </h1>
              </div>
              <p className="text-green-50 text-lg">
                Track operational budgets, NDIS funding, and financial performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => alert("Export Financial Report (Feature in development)")}
                size="lg"
                className="flex items-center gap-2 bg-white text-green-600 hover:bg-green-50 shadow-lg"
              >
                <Download className="h-5 w-5" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-white/15 backdrop-blur-lg border-white/30 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-50 mb-2">Total Budget</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    ${(totalAllocated / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-green-100">FY 2025-26</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <PieChart className="h-8 w-8 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/15 backdrop-blur-lg border-white/30 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-50 mb-2">Spent</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    ${(totalSpent / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-green-100">
                    {((totalSpent / totalAllocated) * 100).toFixed(1)}% utilized
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/15 backdrop-blur-lg border-white/30 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-50 mb-2">Committed</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    ${(totalCommitted / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-green-100">Pending payments</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/15 backdrop-blur-lg border-white/30 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-50 mb-2">Available</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    ${(totalAvailable / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-green-100">
                    {((totalAvailable / totalAllocated) * 100).toFixed(1)}% remaining
                  </p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-3 mt-8">
            <Button
              size="lg"
              variant={activeTab === "overview" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("overview")}
              className={activeTab === "overview" ? "bg-white text-green-600 shadow-lg font-semibold" : "text-white hover:bg-white/20 font-medium"}
            >
              Overview
            </Button>
            <Button
              size="lg"
              variant={activeTab === "ndis" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("ndis")}
              className={activeTab === "ndis" ? "bg-white text-green-600 shadow-lg font-semibold" : "text-white hover:bg-white/20 font-medium"}
            >
              NDIS Funding
            </Button>
            <Button
              size="lg"
              variant={activeTab === "operational" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("operational")}
              className={activeTab === "operational" ? "bg-white text-green-600 shadow-lg font-semibold" : "text-white hover:bg-white/20 font-medium"}
            >
              Operational Costs
            </Button>
            <Button
              size="lg"
              variant={activeTab === "forecast" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("forecast")}
              className={activeTab === "forecast" ? "bg-white text-green-600 shadow-lg font-semibold" : "text-white hover:bg-white/20 font-medium"}
            >
              Forecast
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Budget Categories */}
                <Card className="p-8 shadow-xl hover:shadow-2xl transition-shadow border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Budget by Category
                  </h3>
                  <div className="space-y-4">
                    {budgetCategories.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {category.name}
                            </span>
                            {category.trend === "up" && (
                              <ArrowUpRight className="h-4 w-4 text-red-500" />
                            )}
                            {category.trend === "down" && (
                              <ArrowDownRight className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <span className="text-sm text-gray-600">
                            ${(category.spent / 1000).toFixed(0)}K / $
                            {(category.allocated / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              (category.spent / category.allocated) * 100 > 90
                                ? "bg-red-500"
                                : (category.spent / category.allocated) * 100 > 75
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min((category.spent / category.allocated) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {((category.spent / category.allocated) * 100).toFixed(1)}% used
                          </span>
                          <span>${(category.available / 1000).toFixed(1)}K available</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* NDIS Funding Summary */}
                <Card className="p-8 shadow-xl hover:shadow-2xl transition-shadow border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    NDIS Funding Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Total NDIS Budget
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${(ndisTotal / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Spent: </span>
                          <span className="font-medium">${(ndisSpent / 1000).toFixed(0)}K</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Available: </span>
                          <span className="font-medium">${(ndisAvailable / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {ndisFunding.map((ndis) => (
                        <div
                          key={ndis.id}
                          className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {ndis.participantName}
                            </span>
                            <Badge
                              className={
                                ndis.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : ndis.status === "expiring"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {ndis.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                              ${(ndis.spent / 1000).toFixed(0)}K / $
                              {(ndis.totalBudget / 1000).toFixed(0)}K
                            </span>
                            <span>
                              ${(ndis.available / 1000).toFixed(0)}K available
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min((ndis.spent / ndis.totalBudget) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      View All Participants
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Alerts and Warnings */}
              <Card className="p-8 border-l-4 border-l-yellow-500 shadow-xl hover:shadow-2xl transition-shadow bg-yellow-50/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <AlertCircle className="h-7 w-7 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">
                      Budget Alerts
                    </h4>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>Staffing & Wages budget is 70% utilized - consider reviewing for year-end planning</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>Ethan Williams' NDIS plan expires in 3 months - renewal required</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>Facilities & Maintenance spending trending 8.1% higher than forecast</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* NDIS Funding Tab */}
          {activeTab === "ndis" && (
            <div className="space-y-4">
              {ndisFunding.map((ndis) => (
                <Card key={ndis.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ndis.participantName}
                        </h3>
                        <Badge
                          className={
                            ndis.status === "active"
                              ? "bg-green-100 text-green-800"
                              : ndis.status === "expiring"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {ndis.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Plan Period: {format(new Date(ndis.planStart), "MMM d, yyyy")} -{" "}
                        {format(new Date(ndis.planEnd), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Budget</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${ndis.totalBudget.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Spent</p>
                      <p className="text-lg font-semibold text-blue-600">
                        ${ndis.spent.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {((ndis.spent / ndis.totalBudget) * 100).toFixed(1)}% utilized
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Committed</p>
                      <p className="text-lg font-semibold text-yellow-600">
                        ${ndis.committed.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Pending approval</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Available</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${ndis.available.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {((ndis.available / ndis.totalBudget) * 100).toFixed(1)}% remaining
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Category Breakdown
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {ndis.categories.map((cat, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {cat.name}
                            </span>
                            <span className="text-xs text-gray-600">
                              ${(cat.spent / 1000).toFixed(0)}K / $
                              {(cat.budget / 1000).toFixed(0)}K
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Operational Costs Tab */}
          {activeTab === "operational" && (
            <div className="space-y-4">
              {budgetCategories.map((category) => (
                <Card
                  key={category.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          {category.trend === "up" && (
                            <>
                              <ArrowUpRight className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">
                                +{category.trendPercent}%
                              </span>
                            </>
                          )}
                          {category.trend === "down" && (
                            <>
                              <ArrowDownRight className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">
                                {category.trendPercent}%
                              </span>
                            </>
                          )}
                          {category.trend === "stable" && (
                            <span className="text-sm text-gray-600">
                              {category.trendPercent}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Allocated</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${category.allocated.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Spent</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${category.spent.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Committed</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${category.committed.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Available</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${category.available.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Utilization</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {((category.spent / category.allocated) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        (category.spent / category.allocated) * 100 > 90
                          ? "bg-red-500"
                          : (category.spent / category.allocated) * 100 > 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min((category.spent / category.allocated) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Forecast Tab */}
          {activeTab === "forecast" && (
            <Card className="p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Budget Forecasting
              </h3>
              <p className="text-gray-600 mb-6">
                Advanced forecasting and projection tools coming soon
              </p>
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Historical Trends
              </Button>
            </Card>
          )}
      </div>
    </div>
  );
}
