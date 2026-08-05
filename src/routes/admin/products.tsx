import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AdminProduct } from "@/lib/admin/types";
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from "@/lib/admin/server";
import { inr } from "@/lib/format";
import { Search, Plus, Pencil, Trash2, Package } from "lucide-react";
import type { Fabric } from "@/lib/products";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Tuskel Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProductsPage,
});

const FABRIC_LABELS: Record<Fabric, string> = { "pure-linen": "Pure Linen", "linen-blend": "Linen Blend" };
const STATUS_OPTS = ["active", "draft", "archived"] as const;
type StatusOpt = typeof STATUS_OPTS[number];

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: AdminProduct | null;
  onClose: () => void;
  onSave: (p: AdminProduct) => void;
}) {
  const editing = !!product;
  const [form, setForm] = useState<Partial<AdminProduct>>(
    product
      ? { ...product, price: product.price, mrp: product.mrp, fabric: product.fabric, status: product._status || "active", summary: product.summary }
      : { fabric: "pure-linen", status: "active", price: 2999, mrp: 3999 }
  );

  const save = () => {
    if (!form.name || !form.price || !form.mrp) return;
    onSave({
      ...(product || { id: `prod-${Date.now()}`, slug: `prod-${Date.now()}`, images: [], sizes: ["S","M","L","XL","2XL","3XL"], fabricLabel: FABRIC_LABELS[form.fabric || "pure-linen"], colorName: "", colorSlug: "", swatch: "", details: [], care: [], fit: "", modelNote: "", newArrival: false, bestSeller: false, popularity: 0, addedOn: new Date().toISOString().split("T")[0] }),
      ...form,
      fabricLabel: FABRIC_LABELS[form.fabric || "pure-linen"],
      price: Number(form.price),
      mrp: Number(form.mrp),
      fabric: form.fabric || "pure-linen",
      _status: form._status as StatusOpt,
    } as AdminProduct);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tuskel Aqua Mist Pure Linen Shirt" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fabric</Label>
              <Select value={form.fabric} onValueChange={(v: Fabric) => setForm({ ...form, fabric: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pure-linen">Pure Linen</SelectItem>
                  <SelectItem value="linen-blend">Linen Blend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form._status} onValueChange={(v: StatusOpt) => setForm({ ...form, _status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTS.map((s) => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>MRP (₹)</Label>
              <Input type="number" value={form.mrp ?? 0} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Summary</Label>
            <Textarea value={form.summary ?? ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>{editing ? "Save Changes" : "Create Product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterFabric, setFilterFabric] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminGetProducts(),
  });

  const createMutation = useMutation({
    mutationFn: (vars: { data: Omit<AdminProduct, "id"> }) => adminCreateProduct({ data: vars.data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product created");
    },
    onError: (e) => toast.error(`Create failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { slug: string; data: Partial<AdminProduct> }) =>
      adminUpdateProduct({ slug: vars.slug, data: vars.data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product updated");
    },
    onError: (e) => toast.error(`Update failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { slug: string }) => adminDeleteProduct({ slug: vars.slug }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deleted");
    },
    onError: (e) => toast.error(`Delete failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.slug.includes(search)) return false;
      if (filterFabric !== "all" && p.fabric !== filterFabric) return false;
      if (filterStatus !== "all" && p._status !== filterStatus) return false;
      return true;
    });
  }, [products, search, filterFabric, filterStatus]);

  const handleSave = (p: AdminProduct) => {
    if (isAdding) {
      createMutation.mutate({ name: p.name, fabric: p.fabric, price: p.price, mrp: p.mrp, fabricLabel: p.fabricLabel, _status: p._status || "draft", summary: p.summary } as Omit<AdminProduct, "id">);
      setIsAdding(false);
    } else {
      if (!p.slug) return;
      updateMutation.mutate({ slug: p.slug, data: { name: p.name, fabric: p.fabric, price: p.price, mrp: p.mrp, fabricLabel: p.fabricLabel, _status: p._status, summary: p.summary } });
    }
    setEditingProduct(null);
  };
  const handleDelete = (slug: string) => {
    if (confirm("Delete this product?")) deleteMutation.mutate({ slug });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-light">Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage your catalogue ({products.length} products)
            </p>
          </div>
          <Button onClick={() => setIsAdding(true)}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterFabric} onValueChange={setFilterFabric}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Fabric" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fabrics</SelectItem>
                  <SelectItem value="pure-linen">Pure Linen</SelectItem>
                  <SelectItem value="linen-blend">Linen Blend</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Fabric</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>MRP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products found.</TableCell></TableRow>
                ) : (
                  filtered.map((p) => (
                    <TableRow key={p.id ?? p.slug}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md border flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{FABRIC_LABELS[p.fabric]}</Badge></TableCell>
                      <TableCell className="text-sm">{inr(p.price)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground line-through">{inr(p.mrp)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          p._status === "active" ? "bg-green-100 text-green-700" :
                          p._status === "draft" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }>{p._status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditingProduct(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.slug)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {isAdding && <ProductModal product={null} onClose={() => setIsAdding(false)} onSave={handleSave} />}
        {editingProduct && <ProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={handleSave} />}
      </div>
    </AdminLayout>
  );
}
