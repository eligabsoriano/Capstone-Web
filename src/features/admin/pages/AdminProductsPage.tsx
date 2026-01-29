import { Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateProductRequest,
  LoanProduct,
  UpdateProductRequest,
} from "@/types/api";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../hooks/useWorkloadAndProducts";

const initialFormData: CreateProductRequest = {
  name: "",
  code: "",
  description: "",
  min_amount: 10000,
  max_amount: 500000,
  interest_rate: 12,
  min_term_months: 3,
  max_term_months: 36,
  required_documents: [],
};

export function AdminProductsPage() {
  const { data: productsData, isLoading, error, refetch } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(
    null,
  );
  const [deletingProduct, setDeletingProduct] = useState<LoanProduct | null>(
    null,
  );
  const [formData, setFormData] =
    useState<CreateProductRequest>(initialFormData);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: LoanProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      description: product.description,
      min_amount: product.min_amount,
      max_amount: product.max_amount,
      interest_rate: product.interest_rate,
      min_term_months: product.min_term_months,
      max_term_months: product.max_term_months,
      required_documents: product.required_documents,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }

    if (editingProduct) {
      const updateData: UpdateProductRequest = {
        name: formData.name,
        description: formData.description,
        min_amount: formData.min_amount,
        max_amount: formData.max_amount,
        interest_rate: formData.interest_rate,
        min_term_months: formData.min_term_months,
        max_term_months: formData.max_term_months,
      };

      updateMutation.mutate(
        { productId: editingProduct.id, data: updateData },
        {
          onSuccess: () => {
            toast.success("Product updated successfully");
            setIsModalOpen(false);
            refetch();
          },
          onError: (err: Error) => {
            toast.error(err.message || "Failed to update product");
          },
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success("Product created successfully");
          setIsModalOpen(false);
          refetch();
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to create product");
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deletingProduct) return;

    deleteMutation.mutate(deletingProduct.id, {
      onSuccess: () => {
        toast.success("Product deleted successfully");
        setIsDeleteDialogOpen(false);
        setDeletingProduct(null);
        refetch();
      },
      onError: (err: Error) => {
        toast.error(err.message || "Failed to delete product");
      },
    });
  };

  const handleInputChange = (
    field: keyof CreateProductRequest,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Failed to load products</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const products = productsData?.products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loan Products</h1>
          <p className="text-muted-foreground">
            Manage loan products available to customers
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found. Create your first product.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Min Amount</TableHead>
                  <TableHead className="text-right">Max Amount</TableHead>
                  <TableHead className="text-center">Interest</TableHead>
                  <TableHead className="text-center">Term</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.code}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.min_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.max_amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.interest_rate}%
                    </TableCell>
                    <TableCell className="text-center">
                      {product.min_term_months}-{product.max_term_months}mo
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeletingProduct(product);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Create Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product details below."
                : "Fill in the details for the new loan product."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  disabled={!!editingProduct}
                  onChange={(e) =>
                    handleInputChange("code", e.target.value.toUpperCase())
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">Min Amount (₱)</Label>
                <Input
                  id="min_amount"
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) =>
                    handleInputChange("min_amount", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_amount">Max Amount (₱)</Label>
                <Input
                  id="max_amount"
                  type="number"
                  value={formData.max_amount}
                  onChange={(e) =>
                    handleInputChange("max_amount", Number(e.target.value))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest_rate">Interest Rate (%/year)</Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.1"
                value={formData.interest_rate}
                onChange={(e) =>
                  handleInputChange("interest_rate", Number(e.target.value))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_term">Min Term (months)</Label>
                <Input
                  id="min_term"
                  type="number"
                  value={formData.min_term_months}
                  onChange={(e) =>
                    handleInputChange("min_term_months", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_term">Max Term (months)</Label>
                <Input
                  id="max_term"
                  type="number"
                  value={formData.max_term_months}
                  onChange={(e) =>
                    handleInputChange("max_term_months", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingProduct ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This
              will deactivate the product and it will no longer be available for
              new loans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
