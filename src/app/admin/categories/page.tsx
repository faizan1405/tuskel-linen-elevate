"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useAdminCategories,
  useAdminCreateCategory,
  useAdminUpdateCategory,
  useAdminDeleteCategory,
} from "@/lib/admin/hooks";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, FolderTree, ImagePlus, X, Loader2, Package } from "lucide-react";
import { useRef } from "react";

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent: string | null;
  image: string;
  active: boolean;
  productCount: number;
}

function CategoryModal({
  category,
  onClose,
  onSave,
}: {
  category: AdminCategory | null;
  onClose: () => void;
  onSave: (c: AdminCategory) => void;
}) {
  const editing = !!category;
  const [form, setForm] = useState<Partial<AdminCategory>>(
    category ? { ...category } : { name: "", slug: "", description: "", parent: null, image: "", active: true }
  );
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Only image files allowed"); return; }
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, folder: "tuskel/categories" }),
        cache: "no-store",
      });
      const result = await res.json();
      if (!res.ok) {
        const errMsg = result.error || `Upload failed (HTTP ${res.status})`;
        toast.error(errMsg);
        return;
      }
      if (!result.url) {
        toast.error("Upload succeeded but no image URL returned");
        return;
      }
      setForm({ ...form, image: result.url });
      toast.success("Image uploaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed — check your connection";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    if (!form.name?.trim()) { toast.error("Category name is required"); return; }
    onSave({
      id: category?.id || "",
      name: form.name.trim(),
      slug: form.slug?.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: form.description || "",
      parent: form.parent || null,
      image: form.image || "",
      active: form.active ?? true,
      productCount: category?.productCount ?? 0,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          <p className="text-xs text-muted-foreground">{editing ? "Update category details" : "Create a new product category"}</p>
        </DialogHeader>
        <div className="space-y-5 py-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category Name <span className="text-destructive">*</span></Label>
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pure Linen" className="h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Slug</Label>
            <Input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. pure-linen" className="h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Short description for this category…" className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category Image</Label>
            <div
              className={`relative rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-all hover:border-primary/40 hover:bg-muted/20 ${form.image ? "border-solid" : ""}`}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); if (inputRef.current) inputRef.current.value = ""; }} />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading…</p>
                </div>
              ) : form.image ? (
                <div className="relative inline-block">
                  <img src={form.image} alt="" className="h-24 w-24 object-cover rounded-lg" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setForm({ ...form, image: "" }); }} className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-1 hover:scale-110 transition-transform shadow-sm">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Click to upload an image</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-sm font-medium cursor-pointer" htmlFor="cat-active">Active</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Visible to customers</p>
            </div>
            <Switch id="cat-active" checked={form.active ?? true} onCheckedChange={(c) => setForm({ ...form, active: c })} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="h-9">Cancel</Button>
          <Button onClick={save} className="h-9">{editing ? "Save Changes" : "Create Category"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CategoryCard({ c, onEdit, onDelete }: { c: AdminCategory; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="group border-border/60 hover:shadow-md transition-all duration-200 hover:border-primary/10">
      <CardContent className="p-0">
        <div className="relative">
          <div className="h-36 w-full bg-muted/30 overflow-hidden rounded-t-lg">
            {c.image ? (
              <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FolderTree className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="secondary" size="icon" onClick={onEdit} className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="destructive" size="icon" onClick={onDelete} className="h-8 w-8 bg-white/90 hover:bg-white text-destructive shadow-sm">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3">
            <Badge variant={c.active ? "default" : "secondary"} className={`text-[11px] font-medium px-2 py-0.5 ${
              c.active ? "bg-white/90 text-foreground" : "bg-muted/80 text-muted-foreground"
            }`}>
              {c.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm truncate">{c.name}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.slug}</p>
          {c.description && (
            <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2 leading-relaxed">{c.description}</p>
          )}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t">
            <Package className="h-3 w-3 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground font-medium">{c.productCount} products</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data: categories = [], isLoading } = useAdminCategories();
  const typedCats = categories as AdminCategory[];

  const createMutation = useAdminCreateCategory();
  const updateMutation = useAdminUpdateCategory();
  const deleteMutation = useAdminDeleteCategory();

  const filtered = useMemo(() => {
    if (!search) return typedCats;
    return typedCats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search));
  }, [typedCats, search]);

  const handleSave = (c: AdminCategory) => {
    if (isAdding) {
      createMutation.mutate({
        name: c.name, slug: c.slug, description: c.description,
        parent: c.parent, image: c.image, active: c.active,
      });
    } else {
      if (!c.id) return;
      updateMutation.mutate({ id: c.id, data: { name: c.name, slug: c.slug, description: c.description, parent: c.parent, image: c.image, active: c.active } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-light tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{typedCats.length} categories in your catalogue</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${
                viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-all ${
                viewMode === "table" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Table
            </button>
          </div>
          <Button onClick={() => { setIsAdding(true); setEditing(null); }} className="h-9">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search categories by name or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-0 bg-muted/30 focus-visible:ring-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories content */}
      {isLoading ? (
        <Card className="border-border/60">
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">Loading categories…</p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid view */
        filtered.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center">
                  <FolderTree className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">No categories found</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {typedCats.length === 0 ? "Create your first category to organise products" : "Try adjusting your search"}
                  </p>
                </div>
                {typedCats.length === 0 && (
                  <Button onClick={() => { setIsAdding(true); setEditing(null); }} variant="outline" size="sm" className="mt-2">
                    <Plus className="mr-2 h-3.5 w-3.5" /> Add Category
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => (
              <CategoryCard
                key={c.id}
                c={c}
                onEdit={() => setEditing(c)}
                onDelete={() => setDeleteConfirm(c.id)}
              />
            ))}
          </div>
        )
      ) : (
        /* Table view */
        <Card className="border-border/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Image</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Name</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Slug</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Status</TableHead>
                  <TableHead className="text-right pr-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <p className="text-sm text-muted-foreground">No categories found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id} className="group hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-5">
                        <div className="h-10 w-10 rounded-lg border border-border/60 flex items-center justify-center shrink-0 bg-muted/30 overflow-hidden">
                          {c.image ? <img src={c.image} alt="" className="h-10 w-10 object-cover" /> : <FolderTree className="h-4 w-4 text-muted-foreground/40" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          {c.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">{c.slug}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={c.active ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-muted text-muted-foreground border-border/60"}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-5">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => setEditing(c)} title="Edit" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(c.id)} title="Delete" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
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
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">This will permanently delete this category. Are you sure?</p>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} className="h-9">Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null); } }} className="h-9">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category modal */}
      {isAdding && <CategoryModal category={null} onClose={() => setIsAdding(false)} onSave={handleSave} />}
      {editing && <CategoryModal category={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </div>
  );
}
