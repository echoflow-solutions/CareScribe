"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { Document } from "@/lib/types";
import {
  FileText,
  Download,
  Upload,
  Search,
  Filter,
  FolderOpen,
  File,
  Eye,
  Trash2,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { format } from "date-fns";

export default function DocumentsPage() {
  return <DocumentsContent />;
}

function DocumentsContent() {
  const router = useRouter();
  const { currentUser, hasHydrated } = useStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!hasHydrated) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    loadDocuments();
  }, [currentUser, hasHydrated, router]);

  const loadDocuments = async () => {
    try {
      // Simulate loading documents
      // In production, this would fetch from Supabase
      const mockData: Document[] = [
        {
          id: "1",
          title: "NDIS Incident Reporting Guidelines 2025",
          description:
            "Updated guidelines for incident reporting under NDIS framework",
          category: "policy",
          fileUrl: "/docs/ndis-guidelines-2025.pdf",
          fileName: "ndis-guidelines-2025.pdf",
          fileSize: 2456789,
          fileType: "application/pdf",
          version: "2.1",
          tags: ["NDIS", "Reporting", "Guidelines", "Compliance"],
          uploadedBy: "user-1",
          uploadedByName: "Tom Anderson",
          uploadedAt: "2025-01-15T10:00:00Z",
          lastAccessedAt: "2025-10-05T14:30:00Z",
          accessCount: 47,
          isArchived: false,
          requiresAcknowledgment: true,
          acknowledgedBy: ["user-1", "user-2", "user-3"],
        },
        {
          id: "2",
          title: "Medication Administration Procedure",
          description:
            "Standard procedure for administering medications to participants",
          category: "procedure",
          fileUrl: "/docs/med-admin-procedure.pdf",
          fileName: "med-admin-procedure.pdf",
          fileSize: 1234567,
          fileType: "application/pdf",
          version: "3.0",
          tags: ["Medication", "Procedure", "Healthcare"],
          uploadedBy: "user-3",
          uploadedByName: "Dr. Maria Rodriguez",
          uploadedAt: "2025-02-01T09:00:00Z",
          lastAccessedAt: "2025-10-06T11:20:00Z",
          accessCount: 89,
          isArchived: false,
          requiresAcknowledgment: true,
          acknowledgedBy: ["user-1", "user-2"],
        },
        {
          id: "3",
          title: "Incident Report Form Template",
          description: "Blank template for manual incident reporting",
          category: "form",
          fileUrl: "/docs/incident-report-template.docx",
          fileName: "incident-report-template.docx",
          fileSize: 89456,
          fileType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          version: "1.5",
          tags: ["Form", "Template", "Incident"],
          uploadedBy: "user-1",
          uploadedByName: "Tom Anderson",
          uploadedAt: "2025-03-10T14:00:00Z",
          accessCount: 156,
          isArchived: false,
          requiresAcknowledgment: false,
        },
        {
          id: "4",
          title: "Emergency Response Training Materials",
          description:
            "Comprehensive training materials for emergency response procedures",
          category: "training",
          fileUrl: "/docs/emergency-training.pdf",
          fileName: "emergency-training.pdf",
          fileSize: 5678901,
          fileType: "application/pdf",
          version: "2.0",
          tags: ["Training", "Emergency", "Safety"],
          uploadedBy: "user-2",
          uploadedByName: "Sarah Chen",
          uploadedAt: "2025-04-05T08:30:00Z",
          accessCount: 67,
          isArchived: false,
          expiryDate: "2025-12-31",
          requiresAcknowledgment: true,
          acknowledgedBy: ["user-1", "user-2", "user-3", "user-4"],
        },
        {
          id: "5",
          title: "Privacy & Confidentiality Policy",
          description:
            "Organization policy on privacy and confidentiality of participant information",
          category: "policy",
          fileUrl: "/docs/privacy-policy.pdf",
          fileName: "privacy-policy.pdf",
          fileSize: 987654,
          fileType: "application/pdf",
          version: "4.2",
          tags: ["Privacy", "Confidentiality", "Policy", "Compliance"],
          uploadedBy: "user-1",
          uploadedByName: "Tom Anderson",
          uploadedAt: "2025-01-20T16:00:00Z",
          accessCount: 134,
          isArchived: false,
          requiresAcknowledgment: true,
          acknowledgedBy: ["user-1", "user-2"],
        },
        {
          id: "6",
          title: "Quality Standards Compliance Checklist",
          description:
            "Monthly checklist for ensuring quality standards compliance",
          category: "compliance",
          fileUrl: "/docs/quality-checklist.xlsx",
          fileName: "quality-checklist.xlsx",
          fileSize: 234567,
          fileType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          version: "1.0",
          tags: ["Quality", "Compliance", "Checklist"],
          uploadedBy: "user-3",
          uploadedByName: "Dr. Maria Rodriguez",
          uploadedAt: "2025-05-01T10:00:00Z",
          accessCount: 45,
          isArchived: false,
          requiresAcknowledgment: false,
        },
      ];

      setDocuments(mockData);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      policy: "bg-purple-100 text-purple-800",
      procedure: "bg-blue-100 text-blue-800",
      form: "bg-green-100 text-green-800",
      template: "bg-cyan-100 text-cyan-800",
      training: "bg-orange-100 text-orange-800",
      compliance: "bg-red-100 text-red-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory =
      filterCategory === "all" || doc.category === filterCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  const totalDocs = documents.length;
  const recentUploads = documents.filter((d) => {
    const uploadDate = new Date(d.uploadedAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return uploadDate > sevenDaysAgo;
  }).length;
  const requiresAck = documents.filter(
    (d) =>
      d.requiresAcknowledgment &&
      !d.acknowledgedBy?.includes(currentUser?.id || ""),
  ).length;
  const totalSize = documents.reduce((sum, d) => sum + d.fileSize, 0);

  const handleDownload = (doc: Document) => {
    console.log(`Downloading: ${doc.fileName}`);
    alert(`Downloading ${doc.fileName}...`);
  };

  const handleView = (doc: Document) => {
    console.log(`Viewing: ${doc.fileName}`);
    alert(`Opening ${doc.fileName} in viewer...`);
  };

  const handleUpload = () => {
    console.log("Upload document");
    alert("Upload document functionality (Feature in development)");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
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
                Document Library
              </h1>
              <p className="text-gray-600">
                Access policies, procedures, forms, and training materials
              </p>
            </div>
            <Button
              onClick={handleUpload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalDocs}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent Uploads</p>
                  <p className="text-2xl font-bold text-green-600">
                    {recentUploads}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Requires Action</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {requiresAck}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatFileSize(totalSize)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <File className="h-6 w-6 text-purple-600" />
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
                  placeholder="Search documents by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="policy">Policy</option>
                  <option value="procedure">Procedure</option>
                  <option value="form">Form</option>
                  <option value="template">Template</option>
                  <option value="training">Training</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className={getCategoryColor(doc.category)}>
                    {doc.category}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {doc.title}
                </h3>

                {doc.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>{doc.uploadedByName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <File className="h-3 w-3" />
                    <span>
                      {formatFileSize(doc.fileSize)} • Version {doc.version}
                    </span>
                  </div>
                </div>

                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {doc.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{doc.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {doc.requiresAcknowledgment &&
                  !doc.acknowledgedBy?.includes(currentUser?.id || "") && (
                    <div className="mb-4">
                      <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1 w-fit">
                        <Tag className="h-3 w-3" />
                        Requires Acknowledgment
                      </Badge>
                    </div>
                  )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(doc)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No documents found</p>
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
