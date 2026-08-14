"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AdminProduct } from "@/lib/admin/types";
import { useAdminProducts, useAdminUpdateProduct } from "@/lib/admin/hooks";
import { Search, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const STOCK_THRESHOLD = 10;

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [newStock, setNewStock] = useState(0);

  const { data: products = [], isLoading } = useAdminProducts();
  const typedProducts = products as AdminProduct[];

  const updateMutation = useAdminUpdateProduct();

  const filtered: AdminProduct[] = useMemo(() => {
    return typedProducts.filter((p: AdminProduct) => {
      const q = search.toLowerCase();
      if (q) return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      if (filterStock === "low" && (p._stock ?? 0) >= STOCK_THRESHOLD) return false;
      if (filterStock === "out" && (p._stock ?? 0) > 0) return false;
      if (filterStock === "in" && (p._stock ?? 0) <= 0) return false;
      return true;
    });
  }, [typedProducts, search, filterStock]);

  const stats = useMemo(() => {
    const total = typedProducts.length;
    const low = typedProducts.filter((p) => (p._stock ?? 0) > 0 && (p._stock ?? 0) < STOCK_THRESHOLD).length;
    const out = typedProducts.filter((p) => (p._stock ?? 0) <= 0).length;
    const totalStock = typedProducts.reduce((s, p) => s + (p._stock ?? 0), 0);
    return { total, low, out, totalStock };
  }, [typedProducts]);

  const openEdit = (p: AdminProduct) => {
    setEditingProduct(p);
    setNewStock(p._stock ?? 0);
  };

  const handleSave = () => {
    if (!editingProduct) return;
    updateMutation.mutate({
      slug: editingProduct.slug,
      data: { _stock: newStock },
    }, {
      onSuccess: () => {
        toast.success("Stock updated");
        setEditingProduct(null);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-light">Inventory</h1>
          <p className="text-sm text-muted-foreground">Track and manage product stock levels</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="mt-2 text-2xl font-medium">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Stock Units</p>
              <p className="mt-2 text-2xl font-medium">{stats.totalStock}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock
              </p>
              <p className="mt-2 text-2xl font-medium text-amber-600">{stats.low}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" /> Out of Stock
              </p>
              <p className="mt-2 text-2xl font-medium text-red-600">{stats.out}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "low", label: "Low Stock" },
                  { key: "out", label: "Out of Stock" },
                  { key: "in", label: "In Stock" },
                ].map((f) => (
                  <Button
                    key={f.key}
                    variant={filterStock === f.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStock(f.key)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No products found.</TableCell></TableRow>
                ) : (
                  filtered.map((p) => {
                    const stock = p._stock ?? 0;
                    const isLow = stock > 0 && stock < STOCK_THRESHOLD;
                    const isOut = stock <= 0;
                    return (
                      <TableRow key={p.slug}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-md border flex items-center justify-center shrink-0 bg-muted">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.colorName} {p.fabricLabel}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-medium ${isLow ? "text-amber-600" : isOut ? "text-red-600" : ""}`}>
                            {stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {isOut ? (
                            <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Out</Badge>
                          ) : isLow ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 gap-1"><AlertTriangle className="h-3 w-3" />Low</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1"><CheckCircle className="h-3 w-3" />OK</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Update Stock</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={editingProduct !== null} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock</DialogTitle>
              <DialogDescription>
                {editingProduct?.name} ({editingProduct?.slug})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  min={0}
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingProduct(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
