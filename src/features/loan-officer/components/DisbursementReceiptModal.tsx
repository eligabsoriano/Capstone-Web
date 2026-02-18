import { Printer, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ReceiptScheduleSummary {
  monthly_payment: number;
  total_amount: number;
  term_months: number;
}

interface DisbursementReceiptData {
  applicationId: string;
  customerName: string;
  productName: string;
  amount: number;
  method: string;
  reference: string;
  disbursedAt: string | null;
  schedule?: ReceiptScheduleSummary;
}

interface DisbursementReceiptModalProps {
  open: boolean;
  onClose: () => void;
  receipt: DisbursementReceiptData | null;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function DisbursementReceiptModal({
  open,
  onClose,
  receipt,
}: DisbursementReceiptModalProps) {
  if (!open || !receipt) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const prettyMethod = receipt.method.replace(/_/g, " ").toUpperCase();

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Disbursement Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
    h1 { margin: 0 0 8px 0; font-size: 24px; }
    .muted { color: #6b7280; font-size: 12px; }
    .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 16px; }
    .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .row:last-child { border-bottom: none; }
    .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    .value { font-weight: 600; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>Disbursement Receipt</h1>
  <div class="muted">Generated ${escapeHtml(new Date().toLocaleString("en-PH"))}</div>
  <div class="box">
    <div class="row"><div class="label">Application ID</div><div class="value">${escapeHtml(receipt.applicationId)}</div></div>
    <div class="row"><div class="label">Customer</div><div class="value">${escapeHtml(receipt.customerName || "-")}</div></div>
    <div class="row"><div class="label">Product</div><div class="value">${escapeHtml(receipt.productName || "-")}</div></div>
    <div class="row"><div class="label">Disbursed Amount</div><div class="value">${escapeHtml(formatCurrency(receipt.amount))}</div></div>
    <div class="row"><div class="label">Method</div><div class="value">${escapeHtml(prettyMethod)}</div></div>
    <div class="row"><div class="label">Reference</div><div class="value">${escapeHtml(receipt.reference || "-")}</div></div>
    <div class="row"><div class="label">Disbursed At</div><div class="value">${escapeHtml(formatDate(receipt.disbursedAt))}</div></div>
    ${
      receipt.schedule
        ? `
    <div class="row"><div class="label">Monthly Payment</div><div class="value">${escapeHtml(formatCurrency(receipt.schedule.monthly_payment))}</div></div>
    <div class="row"><div class="label">Term</div><div class="value">${escapeHtml(String(receipt.schedule.term_months))} months</div></div>
    <div class="row"><div class="label">Total Repayable</div><div class="value">${escapeHtml(formatCurrency(receipt.schedule.total_amount))}</div></div>`
        : ""
    }
  </div>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">
            Disbursement Receipt
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="rounded-md border p-4 space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Application ID</span>
              <span className="font-mono break-all">
                {receipt.applicationId}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-right">
                {receipt.customerName || "-"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Product</span>
              <span className="font-medium text-right">
                {receipt.productName || "-"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Disbursed Amount</span>
              <span className="font-semibold">
                {formatCurrency(receipt.amount)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">{prettyMethod}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono break-all">
                {receipt.reference || "-"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Disbursed At</span>
              <span className="font-medium text-right">
                {formatDate(receipt.disbursedAt)}
              </span>
            </div>
            {receipt.schedule && (
              <>
                <div className="pt-2 border-t mt-2" />
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Monthly Payment</span>
                  <span className="font-medium">
                    {formatCurrency(receipt.schedule.monthly_payment)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Term</span>
                  <span className="font-medium">
                    {receipt.schedule.term_months} months
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Total Repayable</span>
                  <span className="font-medium">
                    {formatCurrency(receipt.schedule.total_amount)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
