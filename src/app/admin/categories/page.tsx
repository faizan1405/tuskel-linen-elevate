"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import { Search, Plus, Pencil, Trash2, FolderTree, ImagePlus, X } from "lucide-react";
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
      if (!res.ok) throw new Error(result.error || "Upload failed");
      setForm({ ...form, image: result.url });
      toast.success("Image uploaded");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Upload failed"); }
    setUploading(false);
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
        <DialogHeader><DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Category Name *</Label>
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pure Linen" />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. pure-linen" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Short description for this category…" />
          </div>
          <div className="space-y-2">
            <Label>Category Image</Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); if (inputRef.current) inputRef.current.value = ""; }} />
              {uploading ? (
                <p className="text-sm text-muted-foreground">Uploading…</p>
              ) : form.image ? (
                <div className="relative inline-block">
                  <img src={form.image} alt="" className="h-24 w-24 object-cover rounded-md" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setForm({ ...form, image: "" }); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <div>
                  <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="active" checked={form.active ?? true} onCheckedChange={(c) => setForm({ ...form, active: c })} />
            <Label htmlFor="active" className="cursor-pointer">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>{editing ? "Save Changes" : "Create Category"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-light">Categories</h1>
            <p className="text-sm text-muted-foreground">Organize your catalogue into collections ({typedCats.length} categories)</p>
          </div>
          <Button onClick={() => { setIsAdding(true); setEditing(null); }}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No categories found.</TableCell></TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md border flex items-center justify-center shrink-0 bg-muted overflow-hidden">
                          {c.image ? <img src={c.image} alt="" className="h-10 w-10 object-cover" /> : <FolderTree className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{c.name}</p>
                        {c.description && <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">{c.slug}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {c.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditing(c)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(c.id)} title="Delete"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Category</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This will permanently delete this category. Are you sure?</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (deleteConfirm) { deleteMutation.mutate(deleteConfirm); setDeleteConfirm(null); } }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isAdding && <CategoryModal category={null} onClose={() => setIsAdding(false)} onSave={handleSave} />}
        {editing && <CategoryModal category={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
      </div>
    </AdminLayout>
  );
}
