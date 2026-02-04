import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Document,
  getDocuments,
  requestReupload,
  verifyDocument,
} from "../api/documentsApi";
import { DocumentVerifyModal } from "../components/DocumentVerifyModal";
import { RequestReuploadModal } from "../components/RequestReuploadModal";

export function OfficerDocumentsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [reuploadModalOpen, setReuploadModalOpen] = useState(false);

  // Fetch documents
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["officer-documents"],
    queryFn: () => getDocuments(),
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: ({
      documentId,
      status,
      notes,
    }: {
      documentId: string;
      status: "approved" | "rejected";
      notes?: string;
    }) => verifyDocument(documentId, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officer-documents"] });
      setVerifyModalOpen(false);
      setSelectedDocument(null);
    },
  });

  // Reupload request mutation
  const reuploadMutation = useMutation({
    mutationFn: ({
      documentId,
      reason,
    }: {
      documentId: string;
      reason: string;
    }) => requestReupload(documentId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["officer-documents"] });
      setReuploadModalOpen(false);
      setSelectedDocument(null);
    },
  });

  const documents = data?.data?.documents ?? [];

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    // Status filter
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        doc.filename.toLowerCase().includes(query) ||
        doc.document_type.toLowerCase().includes(query) ||
        doc.customer_id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getQualityBadgeColor = (score: number | undefined) => {
    if (!score) return "outline";
    if (score >= 0.8) return "default";
    if (score >= 0.5) return "secondary";
    return "destructive";
  };

  const formatDocumentType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleVerify = (doc: Document) => {
    setSelectedDocument(doc);
    setVerifyModalOpen(true);
  };

  const handleRequestReupload = (doc: Document) => {
    setSelectedDocument(doc);
    setReuploadModalOpen(true);
  };

  const handleConfirmVerify = async (
    status: "approved" | "rejected",
    notes: string,
  ) => {
    if (!selectedDocument) return;
    await verifyMutation.mutateAsync({
      documentId: selectedDocument.id,
      status,
      notes,
    });
  };

  const handleConfirmReupload = async (reason: string) => {
    if (!selectedDocument) return;
    await reuploadMutation.mutateAsync({
      documentId: selectedDocument.id,
      reason,
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Review</h1>
          <p className="text-muted-foreground">
            Review and verify customer documents
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load documents. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Review</h1>
          <p className="text-muted-foreground">
            Review and verify customer documents
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="all">All Documents</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename, type, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documents ({filteredDocuments.length})
          </CardTitle>
          <CardDescription>
            Click on a document to review and verify
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[200px]">
                          {doc.filename}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatDocumentType(doc.document_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 rounded">
                        {doc.customer_id.slice(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      {doc.ai_analysis ? (
                        <Badge
                          variant={getQualityBadgeColor(
                            doc.ai_analysis.quality_score,
                          )}
                        >
                          {Math.round(doc.ai_analysis.quality_score * 100)}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          N/A
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(doc.status)}>
                        {doc.status.toUpperCase()}
                      </Badge>
                      {doc.reupload_requested && (
                        <Badge variant="destructive" className="ml-1">
                          Reupload
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(doc.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {doc.file_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(doc.file_url, "_blank")}
                            title="View Document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {doc.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleVerify(doc)}
                              title="Verify Document"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRequestReupload(doc)}
                              title="Request Re-upload"
                              className="text-amber-600 hover:text-amber-700"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedDocument && (
        <>
          <DocumentVerifyModal
            open={verifyModalOpen}
            onOpenChange={setVerifyModalOpen}
            document={selectedDocument}
            onConfirm={handleConfirmVerify}
            isLoading={verifyMutation.isPending}
          />
          <RequestReuploadModal
            open={reuploadModalOpen}
            onOpenChange={setReuploadModalOpen}
            document={selectedDocument}
            onConfirm={handleConfirmReupload}
            isLoading={reuploadMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
