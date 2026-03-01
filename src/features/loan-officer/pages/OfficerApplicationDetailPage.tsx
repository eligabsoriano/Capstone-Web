import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Brain,
  Briefcase,
  CheckCircle,
  Eye,
  FileText,
  GraduationCap,
  Home,
  Loader2,
  MessageSquare,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { parseError } from "@/lib/errors";
import { resolveMediaUrl } from "@/shared/utils/media";
import type { DisburseApplicationResponse } from "@/types/api";
import { requestReupload } from "../api/documentsApi";
import { ApprovalModal } from "../components/ApprovalModal";
import { DisbursementModal } from "../components/DisbursementModal";
import { DisbursementReceiptModal } from "../components/DisbursementReceiptModal";
import { RejectionModal } from "../components/RejectionModal";
import { RequestDocumentsModal } from "../components/RequestDocumentsModal";
import {
  useAddApplicationNote,
  useDisburseApplication,
  useOfficerApplicationDetail,
  useRequestMissingDocuments,
  useReviewApplication,
} from "../hooks";

/**
 * Convert business age from months (canonical unit) to display format
 * Maps to original buckets for consistency with mobile UX
 */
function formatBusinessAge(months: number | null | undefined): string {
  if (!months) return "-";

  // Map months back to original categories
  if (months < 12) return "Less than 1 year";
  if (months <= 24) return "1-2 years";
  if (months <= 60) return "3-5 years";
  if (months <= 120) return "6-10 years";
  return "More than 10 years";
}

export function OfficerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: application,
    isLoading,
    error,
  } = useOfficerApplicationDetail(id || "");
  const reviewMutation = useReviewApplication();
  const disburseMutation = useDisburseApplication();
  const addApplicationNoteMutation = useAddApplicationNote();
  const requestMissingDocumentsMutation = useRequestMissingDocuments();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [disbursementModalOpen, setDisbursementModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [latestDisbursement, setLatestDisbursement] =
    useState<DisburseApplicationResponse | null>(null);
  const [requestDocumentsModalOpen, setRequestDocumentsModalOpen] =
    useState(false);
  const [internalNoteDraft, setInternalNoteDraft] = useState("");

  const requestDocumentsMutation = useMutation({
    mutationFn: ({
      documentId,
      reason,
    }: {
      documentId: string;
      reason: string;
    }) => requestReupload(documentId, { reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["officer-application", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["officer-applications"],
      });
      await queryClient.invalidateQueries({ queryKey: ["officer-documents"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "audit-logs"],
      });
      toast.success("Document request sent to customer");
    },
    onError: (err: unknown) => {
      toast.error(parseError(err));
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Safely format an address that may be a string or an object
   * with keys like {street, barangay, city, province, postal_code}
   */
  const formatAddress = (address: unknown): string => {
    if (!address) return "-";
    if (typeof address === "string") return address;
    if (typeof address === "object" && address !== null) {
      const addr = address as Record<string, unknown>;
      return (
        [addr.street, addr.barangay, addr.city, addr.province, addr.postal_code]
          .filter(Boolean)
          .join(", ") || "-"
      );
    }
    return "-";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "under_review":
        return "secondary";
      case "disbursed":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleApprove = async (amount: number, notes: string) => {
    if (!id) return;
    await reviewMutation.mutateAsync({
      applicationId: id,
      data: { action: "approve", approved_amount: amount, notes },
    });
    setApprovalModalOpen(false);
  };

  const handleReject = async (reason: string, notes: string) => {
    if (!id) return;
    await reviewMutation.mutateAsync({
      applicationId: id,
      data: { action: "reject", rejection_reason: reason, notes },
    });
    setRejectionModalOpen(false);
  };

  const handleDisburse = async (
    method: string,
    reference: string,
    amount: number,
  ) => {
    if (!id) return;
    const response = await disburseMutation.mutateAsync({
      applicationId: id,
      data: { method, reference, amount },
    });
    setDisbursementModalOpen(false);
    if (response.status === "success" && response.data) {
      setLatestDisbursement(response.data);
      setReceiptModalOpen(true);
      toast.success("Loan disbursed successfully");
    }
  };

  const handleRequestDocuments = async (documentId: string, reason: string) => {
    try {
      await requestDocumentsMutation.mutateAsync({ documentId, reason });
      setRequestDocumentsModalOpen(false);
    } catch {
      // Error toast is handled in mutation onError.
    }
  };

  const handleRequestMissingDocuments = async (
    missingDocumentTypes: string[],
    reason: string,
  ) => {
    if (!id) return;
    try {
      await requestMissingDocumentsMutation.mutateAsync({
        applicationId: id,
        data: {
          missing_documents: missingDocumentTypes,
          reason,
        },
      });
      toast.success("Missing documents request sent to customer");
      setRequestDocumentsModalOpen(false);
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const handleAddInternalNote = async () => {
    if (!id) return;

    const note = internalNoteDraft.trim();
    if (!note) {
      toast.error("Please enter a note");
      return;
    }

    try {
      await addApplicationNoteMutation.mutateAsync({
        applicationId: id,
        data: { note },
      });
      toast.success("Internal note saved");
      setInternalNoteDraft("");
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/officer/applications")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load application details.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canReview = ["submitted", "under_review"].includes(application.status);
  const canDisburse = application.status === "approved";
  const requestableDocuments = (application.documents || []).filter(
    (doc) => doc.status !== "approved",
  );
  const uploadedDocumentTypes = new Set(
    (application.documents || []).map((doc) => doc.document_type),
  );
  const missingRequiredDocuments = (
    application.product.required_documents || []
  ).filter((docType) => !uploadedDocumentTypes.has(docType));
  const internalNotes = application.internal_notes || [];
  const scopedLatestDisbursement =
    latestDisbursement?.id === application.id ? latestDisbursement : null;
  const receiptData = scopedLatestDisbursement ?? {
    id: application.id,
    status: application.status,
    disbursed_amount: application.disbursed_amount ?? 0,
    disbursement_method: application.disbursement_method ?? "",
    disbursement_reference: application.disbursement_reference ?? "",
    disbursed_at: application.disbursed_at ?? null,
  };
  const canViewReceipt =
    application.status === "disbursed" &&
    Boolean(
      receiptData.disbursement_reference ||
        receiptData.disbursed_at ||
        receiptData.disbursed_amount,
    );

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/officer/applications")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Application Details
          </h1>
          <p className="text-muted-foreground">
            Application ID: <span className="font-mono">{id}</span>
          </p>
        </div>
        <Badge
          variant={getStatusBadgeVariant(application.status)}
          className="text-base px-3 py-1"
        >
          {application.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{application.product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product Code</p>
                  <p className="font-mono">{application.product.code || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Requested Amount
                  </p>
                  <p className="font-medium text-lg">
                    {formatCurrency(application.requested_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Recommended Amount
                  </p>
                  <p className="font-medium text-lg">
                    {formatCurrency(application.recommended_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Term</p>
                  <p className="font-medium">
                    {application.term_months} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-medium">{application.purpose || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {application.customer?.personal_profile?.first_name}{" "}
                    {application.customer?.personal_profile?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">
                    {application.customer?.email || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {application.customer?.personal_profile?.phone_number ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Civil Status</p>
                  <p className="font-medium capitalize">
                    {application.customer?.personal_profile?.civil_status ||
                      "-"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {[
                      application.customer?.personal_profile?.street_address,
                      application.customer?.personal_profile?.barangay,
                      application.customer?.personal_profile?.city_municipality,
                      application.customer?.personal_profile?.province,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Emergency Contact
                  </p>
                  <p className="font-medium">
                    {application.customer?.personal_profile
                      ?.emergency_contact_name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Emergency Phone
                  </p>
                  <p className="font-medium">
                    {application.customer?.personal_profile
                      ?.emergency_contact_phone || "-"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge
                  variant={
                    application.customer?.personal_profile?.profile_completed
                      ? "default"
                      : "secondary"
                  }
                >
                  {application.customer?.personal_profile?.profile_completed
                    ? "Complete"
                    : `${application.customer?.personal_profile?.completion_percentage || 0}% Complete`}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Business Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium">
                    {application.customer?.business_profile?.business_name ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Type</p>
                  <p className="font-medium capitalize">
                    {application.customer?.business_profile?.business_type ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Years in Operation
                  </p>
                  <p className="font-medium">
                    {formatBusinessAge(
                      application.customer?.business_profile
                        ?.business_age_months,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <Badge
                    variant={
                      application.customer?.business_profile?.is_registered
                        ? "default"
                        : "secondary"
                    }
                  >
                    {application.customer?.business_profile?.is_registered
                      ? "Yes"
                      : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Income Range</p>
                  <p className="font-medium">
                    {application.customer?.business_profile?.income_range ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Est. Monthly Income
                  </p>
                  <p className="font-medium">
                    {application.customer?.business_profile
                      ?.estimated_monthly_income
                      ? formatCurrency(
                          application.customer.business_profile
                            .estimated_monthly_income,
                        )
                      : "-"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Business Address
                  </p>
                  <p className="font-medium">
                    {formatAddress(
                      application.customer?.business_profile?.business_address,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Alternative Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Education Level
                  </p>
                  <p className="font-medium capitalize">
                    {application.customer?.alternative_data?.education_level ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Employment Status
                  </p>
                  <p className="font-medium capitalize">
                    {application.customer?.alternative_data?.employment_status?.replace(
                      /_/g,
                      " ",
                    ) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    <Home className="inline h-4 w-4 mr-1" />
                    Housing Status
                  </p>
                  <p className="font-medium capitalize">
                    {application.customer?.alternative_data?.housing_status ||
                      "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bank Account</p>
                  <Badge
                    variant={
                      application.customer?.alternative_data?.has_bank_account
                        ? "default"
                        : "secondary"
                    }
                  >
                    {application.customer?.alternative_data?.has_bank_account
                      ? "Yes"
                      : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-Wallet</p>
                  <Badge
                    variant={
                      application.customer?.alternative_data?.has_ewallet
                        ? "default"
                        : "secondary"
                    }
                  >
                    {application.customer?.alternative_data?.has_ewallet
                      ? "Yes"
                      : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Existing Loans
                  </p>
                  <Badge
                    variant={
                      application.customer?.alternative_data?.has_existing_loans
                        ? "destructive"
                        : "default"
                    }
                  >
                    {application.customer?.alternative_data?.has_existing_loans
                      ? "Yes"
                      : "No"}
                  </Badge>
                </div>
              </div>
              {application.customer?.alternative_data?.risk_score && (
                <div className="mt-4 pt-4 border-t flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <p className="font-bold text-lg">
                      {application.customer.alternative_data.risk_score}
                    </p>
                  </div>
                  <Badge
                    variant={
                      application.customer.alternative_data.risk_category ===
                      "low"
                        ? "default"
                        : application.customer.alternative_data
                              .risk_category === "medium"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {application.customer.alternative_data.risk_category?.toUpperCase()}{" "}
                    RISK
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Customer Documents ({application.documents?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application.documents && application.documents.length > 0 ? (
                <div className="space-y-3">
                  {application.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {doc.document_type
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.filename}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.ai_analysis?.quality_score !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            AI:{" "}
                            {Math.round(doc.ai_analysis.quality_score * 100)}%
                          </Badge>
                        )}
                        <Badge
                          variant={
                            doc.status === "approved"
                              ? "default"
                              : doc.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {doc.status.toUpperCase()}
                        </Badge>
                        {doc.file_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              doc.file_url &&
                              window.open(
                                resolveMediaUrl(doc.file_url),
                                "_blank",
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No documents uploaded
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          {application.ai_recommendation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Eligibility Status */}
                <div className="flex items-center gap-2">
                  {application.ai_recommendation.eligible ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Eligible
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Eligible
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Recommended:{" "}
                    {formatCurrency(
                      application.ai_recommendation.recommended_amount,
                    )}
                  </span>
                </div>

                {/* Reasoning */}
                {application.ai_recommendation.reasoning && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Reasoning
                    </p>
                    <p className="text-sm">
                      {application.ai_recommendation.reasoning}
                    </p>
                  </div>
                )}

                {/* Strengths */}
                {application.ai_recommendation.strengths?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Strengths
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {application.ai_recommendation.strengths.map(
                        (strength) => (
                          <Badge
                            key={strength}
                            variant="outline"
                            className="border-green-500 text-green-700 dark:text-green-400"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {strength}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {application.ai_recommendation.concerns?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Concerns
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {application.ai_recommendation.concerns.map((concern) => (
                        <Badge
                          key={concern}
                          variant="outline"
                          className="border-yellow-500 text-yellow-700 dark:text-yellow-400"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Requirements */}
                {application.ai_recommendation.missing_requirements?.length >
                  0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Missing Requirements
                    </p>
                    <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                      {application.ai_recommendation.missing_requirements.map(
                        (req) => (
                          <li key={req}>{req}</li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Risk & Actions */}
        <div className="space-y-6">
          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Eligibility Score</span>
                <span className="font-bold text-2xl">
                  {application.eligibility_score}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Risk Category</span>
                <Badge
                  variant={
                    application.risk_category === "low"
                      ? "default"
                      : application.risk_category === "medium"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {application.risk_category?.toUpperCase() || "N/A"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canReview && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => setApprovalModalOpen(true)}
                    disabled={reviewMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => setRejectionModalOpen(true)}
                    disabled={reviewMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setRequestDocumentsModalOpen(true)}
                    disabled={
                      requestDocumentsMutation.isPending ||
                      requestMissingDocumentsMutation.isPending ||
                      (requestableDocuments.length === 0 &&
                        missingRequiredDocuments.length === 0)
                    }
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Request Documents
                  </Button>
                  {requestableDocuments.length === 0 &&
                    missingRequiredDocuments.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center">
                        No missing or re-upload request options available.
                      </p>
                    )}
                </>
              )}
              {canDisburse && (
                <Button
                  className="w-full"
                  onClick={() => setDisbursementModalOpen(true)}
                  disabled={disburseMutation.isPending}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Disburse Loan
                </Button>
              )}
              {canViewReceipt && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setReceiptModalOpen(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Receipt
                </Button>
              )}
              {!canReview && !canDisburse && !canViewReceipt && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No actions available for this application status.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={internalNoteDraft}
                onChange={(e) => setInternalNoteDraft(e.target.value)}
                placeholder="Add review note for officer/admin visibility"
                rows={3}
                disabled={addApplicationNoteMutation.isPending}
              />
              <Button
                className="w-full"
                onClick={handleAddInternalNote}
                disabled={
                  addApplicationNoteMutation.isPending ||
                  !internalNoteDraft.trim()
                }
              >
                {addApplicationNoteMutation.isPending
                  ? "Saving Note..."
                  : "Save Note"}
              </Button>
              {internalNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No internal notes yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {[...internalNotes].reverse().map((note, index) => (
                    <div
                      key={`${note.created_at || "note"}-${index}`}
                      className="rounded-md border p-3"
                    >
                      <p className="text-sm whitespace-pre-wrap break-all">
                        {note.content}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {(note.author_role || "user")
                          .replace(/_/g, " ")
                          .toUpperCase()}{" "}
                        • {formatDate(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {application.decision_date && (
            <Card>
              <CardHeader>
                <CardTitle>Decision Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Decision Date</span>
                  <span>{formatDate(application.decision_date)}</span>
                </div>
                {application.officer_notes && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground mb-1">Notes:</p>
                    <p>{application.officer_notes}</p>
                  </div>
                )}
                {application.rejection_reason && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-destructive">
                      {application.rejection_reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <ApprovalModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onConfirm={handleApprove}
        recommendedAmount={application.recommended_amount}
        requestedAmount={application.requested_amount}
        isPending={reviewMutation.isPending}
      />
      <RejectionModal
        open={rejectionModalOpen}
        onClose={() => setRejectionModalOpen(false)}
        onConfirm={handleReject}
        isPending={reviewMutation.isPending}
      />
      <DisbursementModal
        open={disbursementModalOpen}
        onClose={() => setDisbursementModalOpen(false)}
        onConfirm={handleDisburse}
        approvedAmount={application.recommended_amount}
        isPending={disburseMutation.isPending}
      />
      <DisbursementReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={{
          applicationId: application.id,
          customerName:
            `${application.customer?.personal_profile?.first_name || ""} ${application.customer?.personal_profile?.last_name || ""}`.trim(),
          productName: application.product.name,
          amount: receiptData.disbursed_amount,
          method: receiptData.disbursement_method,
          reference: receiptData.disbursement_reference,
          disbursedAt: receiptData.disbursed_at,
          schedule: receiptData.schedule,
        }}
      />
      <RequestDocumentsModal
        open={requestDocumentsModalOpen}
        onClose={() => setRequestDocumentsModalOpen(false)}
        documents={requestableDocuments.map((doc) => ({
          id: doc.id,
          document_type: doc.document_type,
          filename: doc.filename,
          status: doc.status,
        }))}
        missingDocumentTypes={missingRequiredDocuments}
        isSubmittingMissing={requestMissingDocumentsMutation.isPending}
        isSubmittingReupload={requestDocumentsMutation.isPending}
        onConfirmMissing={handleRequestMissingDocuments}
        onConfirmReupload={handleRequestDocuments}
      />
    </div>
  );
}
