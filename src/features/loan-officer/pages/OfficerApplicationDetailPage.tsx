import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Brain,
  CheckCircle,
  FileText,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovalModal } from "../components/ApprovalModal";
import { DisbursementModal } from "../components/DisbursementModal";
import { RejectionModal } from "../components/RejectionModal";
import {
  useDisburseApplication,
  useOfficerApplicationDetail,
  useReviewApplication,
} from "../hooks";

export function OfficerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: application,
    isLoading,
    error,
  } = useOfficerApplicationDetail(id || "");
  const reviewMutation = useReviewApplication();
  const disburseMutation = useDisburseApplication();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [disbursementModalOpen, setDisbursementModalOpen] = useState(false);

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
    await disburseMutation.mutateAsync({
      applicationId: id,
      data: { method, reference, amount },
    });
    setDisbursementModalOpen(false);
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

          {/* Customer Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Customer ID</p>
                  <p className="font-mono">{application.customer_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted At</p>
                  <p className="font-medium">
                    {formatDate(application.submitted_at)}
                  </p>
                </div>
              </div>
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
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {application.ai_recommendation}
                </p>
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
              {!canReview && !canDisburse && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No actions available for this application status.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Decision Info (if available) */}
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
    </div>
  );
}
