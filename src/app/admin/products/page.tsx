"use client";
import React, { useRef } from "react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { AdminProduct } from "@/lib/admin/types";
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminUploadImage } from "@/lib/admin/server";
import { inr } from "@/lib/format";
import { Search, Plus, Pencil, Trash2, Package, ImagePlus, X } from "lucide-react";
import type { Fabric } from "@/lib/products";
import { toast } from "sonner";

const FABRIC_LABELS: Record<Fabric, string> = { "pure-linen": "Pure Linen", "linen-blend": "Linen Blend" };
const STATUS_OPTS = ["active", "draft", "archived"] as const;
type StatusOpt = typeof STATUS_OPTS[number];
const ALL_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"] as const;

function ImageUploader({ images, onChange }: { images: string[]; onChange: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const result = await adminUploadImage({ image: dataUrl, folder: "tuskel/products" });
      onChange([...images, result.url]);
      toast.success("Image uploaded");
    } catch { toast.error("Upload failed"); }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <Label>Product Images</Label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); inputRef.current && (inputRef.current.value = ""); }} />
        {uploading ? (
          <p className="text-sm text-muted-foreground">Uploading…</p>
        ) : (
          <div>
            <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm text-muted-foreground">Click or drag an image to upload</p>
          </div>
        )}
      </div>
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <img src={url} alt="" className="h-16 w-16 object-cover rounded-md border" />
              <button type="button" onClick={() => onChange(images.filter((_, i) => i !== idx))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DynamicList({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} />
        <Button type="button" variant="outline" size="sm" onClick={add}>Add</Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-1.5">
              <span>{item}</span>
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
  const blank: Partial<AdminProduct> = {
    fabric: "pure-linen", _status: "draft", price: 2999, mrp: 3999, _stock: 0,
    summary: "", images: [], sizes: ["S", "M", "L", "XL"], details: [], care: [],
    fabricLabel: "", colorName: "", colorSlug: "", swatch: "",
    fit: "", modelNote: "", newArrival: false, bestSeller: false, popularity: 0,
    addedOn: "",
  };
  const [form, setForm] = useState<Partial<AdminProduct>>(product ? { ...product } : { ...blank });
  const update = <K extends keyof AdminProduct>(key: K, val: AdminProduct[K]) => setForm({ ...form, [key]: val });

  const save = () => {
    if (!form.name?.trim()) { toast.error("Product name is required"); return; }
    if (!form.price || !form.mrp) { toast.error("Price and MRP are required"); return; }
    onSave({
      id: product?.id || `prod-${Date.now()}`,
      slug: product?.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: form.name,
      fabric: form.fabric || "pure-linen",
      fabricLabel: form.fabricLabel || FABRIC_LABELS[form.fabric || "pure-linen"],
      colorName: form.colorName || "",
      colorSlug: form.colorSlug || "",
      swatch: form.swatch || "",
      mrp: Number(form.mrp),
      price: Number(form.price),
      images: form.images || [],
      sizes: form.sizes || [],
      summary: form.summary || "",
      details: form.details || [],
      care: form.care || [],
      fit: form.fit || "",
      modelNote: form.modelNote || "",
      newArrival: form.newArrival ?? false,
      bestSeller: form.bestSeller ?? false,
      popularity: Number(form.popularity ?? 0),
      addedOn: form.addedOn || "",
      _stock: Number(form._stock ?? 0),
      _status: form._status || "draft",
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Tuskel Aqua Mist Pure Linen Shirt" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fabric *</Label>
                <Select value={form.fabric as Fabric} onValueChange={(v: Fabric) => { update("fabric", v); update("fabricLabel", FABRIC_LABELS[v]); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pure-linen">Pure Linen</SelectItem>
                    <SelectItem value="linen-blend">Linen Blend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form._status as StatusOpt} onValueChange={(v: StatusOpt) => update("_status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>MRP (₹) *</Label>
              <Input type="number" value={form.mrp ?? 0} onChange={(e) => update("mrp", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Sale Price (₹) *</Label>
              <Input type="number" value={form.price ?? 0} onChange={(e) => update("price", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Stock Qty</Label>
              <Input type="number" value={form._stock ?? 0} onChange={(e) => update("_stock", Number(e.target.value))} />
            </div>
          </div>

          {/* Color */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Color Name</Label>
              <Input value={form.colorName ?? ""} onChange={(e) => update("colorName", e.target.value)} placeholder="e.g. Aqua Mist" />
            </div>
            <div className="space-y-2">
              <Label>Color Slug</Label>
              <Input value={form.colorSlug ?? ""} onChange={(e) => update("colorSlug", e.target.value)} placeholder="e.g. aqua-mist" />
            </div>
            <div className="space-y-2">
              <Label>Swatch / Hex</Label>
              <Input value={form.swatch ?? ""} onChange={(e) => update("swatch", e.target.value)} placeholder="e.g. #7EC8C8" />
            </div>
          </div>

          {/* Images */}
          <ImageUploader images={form.images || []} onChange={(imgs) => update("images", imgs)} />

          {/* Sizes */}
          <div className="space-y-2">
            <Label>Sizes Available</Label>
            <div className="flex flex-wrap gap-3">
              {ALL_SIZES.map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Checkbox checked={(form.sizes || []).includes(s)} onCheckedChange={(checked) => {
                    const sizes = checked ? [...(form.sizes || []), s] : (form.sizes || []).filter((x) => x !== s);
                    update("sizes", sizes);
                  }} />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label>Summary</Label>
            <Textarea value={form.summary ?? ""} onChange={(e) => update("summary", e.target.value)} rows={3} placeholder="Short product description…" />
          </div>

          {/* Dynamic lists */}
          <DynamicList label="Key Details" items={form.details || []} onChange={(details) => update("details", details)} placeholder="e.g. Breathable pure linen fabric" />
          <DynamicList label="Care Instructions" items={form.care || []} onChange={(care) => update("care", care)} placeholder="e.g. Machine wash cold" />

          {/* Fit, Model Note, Popularity, Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fit</Label>
              <Input value={form.fit ?? ""} onChange={(e) => update("fit", e.target.value)} placeholder="e.g. Regular / Slim" />
            </div>
            <div className="space-y-2">
              <Label>Popularity Score</Label>
              <Input type="number" value={form.popularity ?? 0} onChange={(e) => update("popularity", Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Model Note</Label>
            <Textarea value={form.modelNote ?? ""} onChange={(e) => update("modelNote", e.target.value)} rows={2} placeholder="Model is 6'1, wearing size L" />
          </div>

          <div className="space-y-2">
            <Label>Added On Date</Label>
            <Input type="date" value={form.addedOn ?? ""} onChange={(e) => update("addedOn", e.target.value)} />
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch id="newArrival" checked={form.newArrival ?? false} onCheckedChange={(c) => update("newArrival", c)} />
              <Label htmlFor="newArrival" className="cursor-pointer">New Arrival</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="bestSeller" checked={form.bestSeller ?? false} onCheckedChange={(c) => update("bestSeller", c)} />
              <Label htmlFor="bestSeller" className="cursor-pointer">Best Seller</Label>
            </div>
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

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterFabric, setFilterFabric] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: adminGetProducts,
  });

  const createMutation = useMutation({
    mutationFn: adminCreateProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "products"] }); toast.success("Product created"); setIsAdding(false); },
    onError: (e) => toast.error(`Create failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { slug: string; data: Partial<AdminProduct> }) =>
      adminUpdateProduct({ slug: vars.slug, data: vars.data }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "products"] }); toast.success("Product updated"); setEditingProduct(null); },
    onError: (e) => toast.error(`Update failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { slug: string }) => adminDeleteProduct({ slug: vars.slug }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "products"] }); toast.success("Product deleted"); setDeleteConfirm(null); },
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
      createMutation.mutate({
        name: p.name, fabric: p.fabric, fabricLabel: p.fabricLabel,
        colorName: p.colorName, colorSlug: p.colorSlug, swatch: p.swatch,
        mrp: p.mrp, price: p.price, summary: p.summary, images: p.images,
        sizes: p.sizes, details: p.details, care: p.care, fit: p.fit,
        modelNote: p.modelNote, newArrival: p.newArrival, bestSeller: p.bestSeller,
        popularity: p.popularity, addedOn: p.addedOn, _stock: p._stock ?? 0,
        _status: p._status || "draft",
      });
    } else {
      if (!p.slug) return;
      updateMutation.mutate({ slug: p.slug, data: p });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-light">Products</h1>
            <p className="text-sm text-muted-foreground">Manage your catalogue ({products.length} products)</p>
          </div>
          <Button onClick={() => { setIsAdding(true); setEditingProduct(null); }}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
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
                  <TableHead>Stock</TableHead>
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
                          <div className="h-10 w-10 rounded-md border flex items-center justify-center shrink-0 bg-muted overflow-hidden">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="h-10 w-10 object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.colorName || p.fabricLabel} · {p.sizes?.slice(0, 4).join(", ")}{p.sizes?.length > 4 ? "…" : ""}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{FABRIC_LABELS[p.fabric as Fabric]}</Badge></TableCell>
                      <TableCell><div className="text-sm">{inr(p.price)}<span className="text-muted-foreground line-through ml-1.5">{inr(p.mrp)}</span></div></TableCell>
                      <TableCell><span className={`text-sm ${p._stock <= 5 ? "text-red-600 font-medium" : ""}`}>{p._stock}</span></TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          p._status === "active" ? "bg-green-100 text-green-700" :
                          p._status === "draft" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }>{p._status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditingProduct(p)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(p.slug)} title="Delete"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Product</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This will permanently delete the product and its Cloudinary images. Are you sure?</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteConfirm && deleteMutation.mutate({ slug: deleteConfirm })}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isAdding && <ProductModal product={null} onClose={() => setIsAdding(false)} onSave={handleSave} />}
        {editingProduct && <ProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={handleSave} />}
      </div>
    </AdminLayout>
  );
}
