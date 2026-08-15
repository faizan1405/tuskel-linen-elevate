"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AdminProduct } from "@/lib/admin/types";
import { useAdminProducts, useAdminUpdateProduct } from "@/lib/admin/hooks";
import { toast } from "sonner";
import { Search, AlertTriangle, CheckCircle, XCircle, Package, ArrowUpDown } from "lucide-react";

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
    const inStock = total - low - out;
    const totalStock = typedProducts.reduce((s, p) => s + (p._stock ?? 0), 0);
    return { total, low, out, inStock, totalStock };
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
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-light tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track and manage product stock levels</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-muted-foreground font-medium">Total Products</p>
                <p className="text-2xl font-semibold mt-1.5 tabular-nums">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-muted-foreground font-medium">In Stock</p>
                <p className="text-2xl font-semibold mt-1.5 tabular-nums text-emerald-600">{stats.inStock}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Low Stock
                </p>
                <p className="text-2xl font-semibold mt-1.5 tabular-nums text-amber-600">{stats.low}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Below {STOCK_THRESHOLD} units</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-500" /> Out of Stock
                </p>
                <p className="text-2xl font-semibold mt-1.5 tabular-nums text-red-600">{stats.out}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-0 bg-muted/30 focus-visible:ring-1"
              />
            </div>
            <div className="flex gap-2">
              {[
                { key: "all", label: "All", icon: null },
                { key: "low", label: "Low Stock", icon: AlertTriangle },
                { key: "out", label: "Out of Stock", icon: XCircle },
                { key: "in", label: "In Stock", icon: CheckCircle },
              ].map((f) => (
                <Button
                  key={f.key}
                  variant={filterStock === f.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStock(f.key)}
                  className="h-9 text-xs font-medium"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Product</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 hidden sm:table-cell">SKU</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 text-center">Stock</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Status</TableHead>
                <TableHead className="text-right pr-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground font-medium">Loading inventory…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const stock = p._stock ?? 0;
                  const isLow = stock > 0 && stock < STOCK_THRESHOLD;
                  const isOut = stock <= 0;
                  return (
                    <TableRow key={p.slug} className="group hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg border border-border/60 flex items-center justify-center shrink-0 bg-muted/30 overflow-hidden">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="h-10 w-10 object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground/40" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.colorName} {p.fabricLabel}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell">{p.slug}</TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-semibold inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-md ${
                          isOut ? "text-red-600 bg-red-50" : isLow ? "text-amber-600 bg-amber-50" : "text-foreground bg-muted/40"
                        }`}>
                          {stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isOut ? (
                          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200/60 text-[11px] font-medium gap-1.5">
                            <XCircle className="h-3 w-3" />Out
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200/60 text-[11px] font-medium gap-1.5">
                            <AlertTriangle className="h-3 w-3" />Low
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[11px] font-medium gap-1.5">
                            <CheckCircle className="h-3 w-3" />OK
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-8 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Update Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit stock dialog */}
      <Dialog open={editingProduct !== null} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Update Stock</DialogTitle>
            <DialogDescription>
              {editingProduct?.name} ({editingProduct?.slug})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Stock Quantity</Label>
              <Input
                type="number"
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">Current stock: {editingProduct?._stock ?? 0} units</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditingProduct(null)} className="h-9">Cancel</Button>
            <Button onClick={handleSave} className="h-9">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
