"use client";
import React, { useRef } from "react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminProduct } from "@/lib/admin/types";
import {
  useAdminProducts,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminDeleteProduct,
  useAdminUploadImage,
} from "@/lib/admin/hooks";
import { inr } from "@/lib/format";
import { Search, Plus, Pencil, Trash2, Package, ImagePlus, X, Loader2, ExternalLink, Info } from "lucide-react";
import type { Fabric } from "@/lib/products";
import { toast } from "sonner";
import { normalizeImageUrl, isGoogleDriveFolderUrl, extractGoogleDriveFileId } from "@/lib/images";
import { ProductImage } from "@/components/ui/product-image";

const FABRIC_LABELS: Record<Fabric, string> = { "pure-linen": "Pure Linen", "linen-blend": "Linen Blend" };
const STATUS_OPTS = ["active", "draft", "archived"] as const;
type StatusOpt = typeof STATUS_OPTS[number];
const ALL_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"] as const;

function ImageUploader({ images, onChange }: { images: string[]; onChange: (urls: string[]) => void; onUpload?: (data: { image: string; folder?: string }) => Promise<{ url: string }> }) {
  const [urlInput, setUrlInput] = useState("");

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = urlInput.trim();
    if (!raw) {
      toast.error("Please enter an image URL or Google Drive link");
      return;
    }

    if (isGoogleDriveFolderUrl(raw)) {
      toast.error("This is a Google Drive folder link. Please open the individual photo inside Google Drive, click Share → Copy link, and paste it here.");
      return;
    }

    if (raw.includes("drive.google.com") || raw.includes("docs.google.com")) {
      const fileId = extractGoogleDriveFileId(raw);
      if (!fileId) {
        toast.error("Could not find a valid file ID in the Google Drive link. Please use a file sharing link.");
        return;
      }
    }

    const normalized = normalizeImageUrl(raw);
    onChange([...images, normalized]);
    setUrlInput("");
    toast.success("Image added to gallery");
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Product Images</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Paste image URL or Google Drive share link"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddUrl(e);
            }
          }}
          className="h-9 text-sm"
        />
        <Button type="button" variant="secondary" onClick={handleAddUrl} className="h-9 text-xs font-medium shrink-0">
          Add URL
        </Button>
      </div>

      <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-muted-foreground flex gap-2 items-start">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-medium text-foreground text-[11px]">How to use Google Drive images:</p>
          <p className="text-[11px]">
            1. Open the photo in Google Drive &rarr; Click <strong>Share</strong> &rarr; Set General Access to <strong>&ldquo;Anyone with the link&rdquo; (Viewer)</strong> &rarr; Click <strong>Copy link</strong>.
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            Direct HTTPS image URLs (e.g. Unsplash, Cloudinary, Imgur) are also supported.
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="flex gap-3 flex-wrap pt-1">
          {images.map((url, idx) => (
            <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border shadow-xs bg-muted/20">
              <ProductImage
                src={url}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-black/75 text-[9px] uppercase tracking-wider text-white px-1.5 py-0.5 rounded font-medium z-10">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open image in new tab"
                  className="p-1.5 bg-background/90 text-foreground rounded-full hover:scale-110 transition-transform shadow-xs"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  title="Remove image"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(images.filter((_, i) => i !== idx));
                  }}
                  className="p-1.5 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform shadow-xs"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
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
    <div className="space-y-2.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="h-9"
        />
        <Button type="button" variant="outline" size="sm" onClick={add} className="h-9 px-3">Add</Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-3.5 py-2 group">
              <span>{item}</span>
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FormSection({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ProductModal({
  product,
  onClose,
  onSave,
  onUpload,
}: {
  product: AdminProduct | null;
  onClose: () => void;
  onSave: (p: AdminProduct) => void;
  onUpload: (data: { image: string; folder?: string }) => Promise<{ url: string }>;
}) {
  const editing = !!product;
  const blank: Partial<AdminProduct> = {
    sku: "",
    fabric: "pure-linen", _status: "draft", price: 2999, mrp: 3999, _stock: 0,
    summary: "", images: [], sizes: ["S", "M", "L", "XL", "2XL", "3XL"], details: [], care: [],
    fabricLabel: "", colorName: "", colorSlug: "", swatch: "",
    fit: "", modelNote: "", newArrival: false, bestSeller: false, popularity: 0,
    addedOn: "",
  };
  const [form, setForm] = useState<Partial<AdminProduct>>(product ? { ...product } : { ...blank });
  const update = <K extends keyof AdminProduct>(key: K, val: AdminProduct[K]) => setForm({ ...form, [key]: val });

  const save = () => {
    if (!form.name?.trim()) { toast.error("Product name is required"); return; }
    if (!form.price || !form.mrp) { toast.error("Price and MRP are required"); return; }
    const rawSku = form.sku !== undefined && form.sku !== null ? String(form.sku).trim() : null;
    const sku = rawSku && rawSku.length > 0 ? rawSku : null;

    onSave({
      id: product?.id || `prod-${Date.now()}`,
      slug: product?.slug || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      sku,
      name: form.name.trim(),
      fabric: form.fabric || "pure-linen",
      fabricLabel: form.fabricLabel || FABRIC_LABELS[form.fabric || "pure-linen"],
      colorName: form.colorName || "",
      colorSlug: form.colorSlug || "",
      swatch: form.swatch || "",
      mrp: Number(form.mrp),
      price: Number(form.price),
      images: (form.images || []).map(normalizeImageUrl),
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
          <DialogTitle className="text-lg">{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          <p className="text-xs text-muted-foreground">{editing ? "Update product details and pricing" : "Fill in the details to add a new product"}</p>
        </DialogHeader>
        <div className="space-y-6 py-5">
          <FormSection title="Basic Information" description="Name, SKU, fabric, status and pricing">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm">Product Name <span className="text-destructive">*</span></Label>
                <Input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Tuskel Aqua Mist Pure Linen Shirt" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">SKU <span className="text-xs text-muted-foreground font-normal">(Optional)</span></Label>
                <Input value={form.sku ?? ""} onChange={(e) => update("sku", e.target.value)} placeholder="e.g. TSK-LIN-001" className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Fabric <span className="text-destructive">*</span></Label>
                <Select value={form.fabric as Fabric} onValueChange={(v: Fabric) => { update("fabric", v); update("fabricLabel", FABRIC_LABELS[v]); }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pure-linen">Pure Linen</SelectItem>
                    <SelectItem value="linen-blend">Linen Blend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Select value={form._status as StatusOpt} onValueChange={(v: StatusOpt) => update("_status", v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">MRP (₹) <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.mrp ?? 0} onChange={(e) => update("mrp", Number(e.target.value))} className="h-9" placeholder="3999" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Sale Price (₹) <span className="text-destructive">*</span></Label>
                <Input type="number" value={form.price ?? 0} onChange={(e) => update("price", Number(e.target.value))} className="h-9" placeholder="2999" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Stock Qty</Label>
                <Input type="number" value={form._stock ?? 0} onChange={(e) => update("_stock", Number(e.target.value))} className="h-9" placeholder="0" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Appearance" description="Color, images and available sizes">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Color Name</Label>
                <Input value={form.colorName ?? ""} onChange={(e) => update("colorName", e.target.value)} placeholder="e.g. Aqua Mist" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Color Slug</Label>
                <Input value={form.colorSlug ?? ""} onChange={(e) => update("colorSlug", e.target.value)} placeholder="e.g. aqua-mist" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Swatch / Hex</Label>
                <Input value={form.swatch ?? ""} onChange={(e) => update("swatch", e.target.value)} placeholder="e.g. #7EC8C8" className="h-9" />
              </div>
            </div>
            <ImageUploader images={form.images || []} onChange={(imgs) => update("images", imgs)} onUpload={onUpload} />
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Sizes Available</Label>
              <div className="flex flex-wrap gap-4">
                {ALL_SIZES.map((s) => {
                  const isChecked = Boolean((form.sizes || []).includes(s as any));
                  const id = `size-opt-${s}`;
                  return (
                    <div key={s} className="flex items-center space-x-2">
                      <Checkbox
                        id={id}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentSizes = Array.isArray(form.sizes) ? [...form.sizes] : [];
                          if (checked) {
                            if (!currentSizes.includes(s as any)) {
                              update("sizes", [...currentSizes, s as any]);
                            }
                          } else {
                            update("sizes", currentSizes.filter((x) => x !== s));
                          }
                        }}
                      />
                      <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
                        {s}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </FormSection>

          <FormSection title="Description" description="Summary and product details">
            <div className="space-y-2">
              <Label className="text-sm">Summary</Label>
              <Textarea value={form.summary ?? ""} onChange={(e) => update("summary", e.target.value)} rows={3} placeholder="Short product description…" className="resize-none" />
            </div>
            <DynamicList label="Key Details" items={form.details || []} onChange={(details) => update("details", details)} placeholder="e.g. Breathable pure linen fabric" />
            <DynamicList label="Care Instructions" items={form.care || []} onChange={(care) => update("care", care)} placeholder="e.g. Machine wash cold" />
          </FormSection>

          <FormSection title="Additional Details" description="Fit, model info and badges">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Fit</Label>
                <Input value={form.fit ?? ""} onChange={(e) => update("fit", e.target.value)} placeholder="e.g. Regular / Slim" className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Popularity Score</Label>
                <Input type="number" value={form.popularity ?? 0} onChange={(e) => update("popularity", Number(e.target.value))} className="h-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Model Note</Label>
              <Textarea value={form.modelNote ?? ""} onChange={(e) => update("modelNote", e.target.value)} rows={2} placeholder="Model is 6'1, wearing size L" className="resize-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Added On Date</Label>
              <Input type="date" value={form.addedOn ?? ""} onChange={(e) => update("addedOn", e.target.value)} className="h-9" />
            </div>
            <div className="flex flex-wrap gap-6 pt-1">
              <div className="flex items-center gap-2.5">
                <Switch id="newArrival" checked={form.newArrival ?? false} onCheckedChange={(c) => update("newArrival", c)} />
                <Label htmlFor="newArrival" className="text-sm cursor-pointer font-medium">New Arrival</Label>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch id="bestSeller" checked={form.bestSeller ?? false} onCheckedChange={(c) => update("bestSeller", c)} />
                <Label htmlFor="bestSeller" className="text-sm cursor-pointer font-medium">Best Seller</Label>
              </div>
            </div>
          </FormSection>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="h-9">Cancel</Button>
          <Button onClick={save} className="h-9">{editing ? "Save Changes" : "Create Product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [filterFabric, setFilterFabric] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useAdminProducts() as { data: any[]; isLoading: boolean };

  const createMutation = useAdminCreateProduct();
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();
  const uploadMutation = useAdminUploadImage();

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
        name: p.name, sku: p.sku ?? null, fabric: p.fabric, fabricLabel: p.fabricLabel,
        colorName: p.colorName, colorSlug: p.colorSlug, swatch: p.swatch,
        mrp: p.mrp, price: p.price, summary: p.summary, images: p.images,
        sizes: p.sizes, details: p.details, care: p.care, fit: p.fit,
        modelNote: p.modelNote, newArrival: p.newArrival, bestSeller: p.bestSeller,
        popularity: p.popularity, addedOn: p.addedOn, _stock: p._stock ?? 0,
        _status: p._status || "draft",
      }, {
        onSuccess: () => setIsAdding(false),
      });
    } else {
      if (!p.slug) return;
      const { id, ...rest } = p;
      updateMutation.mutate({ slug: p.slug, data: rest }, {
        onSuccess: () => setEditingProduct(null),
      });
    }
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-light tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{products.length} products in catalogue</p>
        </div>
        <Button onClick={() => { setIsAdding(true); setEditingProduct(null); }} className="h-9">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Search products by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-0 bg-muted/30 focus-visible:ring-1"
              />
            </div>
            <Select value={filterFabric} onValueChange={setFilterFabric}>
              <SelectTrigger className="w-full sm:w-[160px] h-9"><SelectValue placeholder="Fabric" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fabrics</SelectItem>
                <SelectItem value="pure-linen">Pure Linen</SelectItem>
                <SelectItem value="linen-blend">Linen Blend</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Active filter pills */}
          {(filterFabric !== "all" || filterStatus !== "all" || search) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground">Filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 text-xs bg-muted/60 text-foreground px-2.5 py-1 rounded-full">
                  &ldquo;{search}&rdquo;
                  <button onClick={() => setSearch("")} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterFabric !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-muted/60 text-foreground px-2.5 py-1 rounded-full">
                  {FABRIC_LABELS[filterFabric as Fabric]}
                  <button onClick={() => setFilterFabric("all")} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterStatus !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-muted/60 text-foreground px-2.5 py-1 rounded-full capitalize">
                  {filterStatus}
                  <button onClick={() => setFilterStatus("all")} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 w-[320px]">Product</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Fabric</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Price</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 text-center">Stock</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Status</TableHead>
                <TableHead className="text-right pr-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground font-medium">Loading products…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">No products found</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {products.length === 0 ? "Get started by adding your first product" : "Try adjusting your search or filters"}
                        </p>
                      </div>
                      {products.length === 0 && (
                        <Button onClick={() => { setIsAdding(true); setEditingProduct(null); }} variant="outline" size="sm" className="mt-2">
                          <Plus className="mr-2 h-3.5 w-3.5" /> Add Product
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id ?? p.slug} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3.5">
                        <div className="h-11 w-11 rounded-lg border border-border/60 flex items-center justify-center shrink-0 bg-muted/30 overflow-hidden">
                          {p.images?.[0] ? (
                            <ProductImage src={p.images[0]} alt="" className="h-11 w-11 object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.sku ? <span className="font-mono text-muted-foreground/90 font-medium">[{p.sku}] </span> : null}
                            {p.colorName || p.fabricLabel} &middot; {p.sizes?.slice(0, 3).join(", ")}{p.sizes?.length > 3 ? "…" : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs font-medium">{FABRIC_LABELS[p.fabric as Fabric]}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{inr(p.price)}</span>
                        <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-sm font-medium inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md ${
                        p._stock <= 5 ? "text-red-600 bg-red-50" : ""
                      }`}>{p._stock}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`
                        text-[11px] font-medium px-2.5 py-0.5
                        ${p._status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" :
                          p._status === "draft" ? "bg-amber-50 text-amber-700 border-amber-200/60" :
                          "bg-muted text-muted-foreground border-border/60"}
                      `}>{p._status}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setEditingProduct(p)} title="Edit" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(p.slug)} title="Delete" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              This will permanently delete the product. This action cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="h-9">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="h-9">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product modal */}
      {isAdding && <ProductModal product={null} onClose={() => setIsAdding(false)} onSave={handleSave} onUpload={async (data) => {
        const result = await uploadMutation.mutateAsync(data);
        return { url: result.url };
      }} />}
      {editingProduct && <ProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={handleSave} onUpload={async (data) => {
        const result = await uploadMutation.mutateAsync(data);
        return { url: result.url };
      }} />}
    </div>
  );
}
