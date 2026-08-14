"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

let baseUrl = "";
function getBase() {
  if (typeof window !== "undefined") return baseUrl;
  return baseUrl;
}

async function api<T = any>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json() as Promise<T>;
}

// ─── Products ────────────────────────────────────────────────────────────────

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => api("/api/admin/products").then((r) => r.products ?? []),
  });
}

export function useAdminCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Record<string, unknown> }) =>
      api(`/api/admin/products/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      qc.invalidateQueries({ queryKey: ["admin", "recent-orders"] });
      toast.success("Product updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) =>
      api(`/api/admin/products/${encodeURIComponent(slug)}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminUploadImage() {
  return useMutation({
    mutationFn: ({ image, folder }: { image: string; folder?: string }) =>
      api("/api/admin/upload", {
        method: "POST",
        body: JSON.stringify({ image, folder: folder || "tuskel/products" }),
      }),
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api("/api/admin/categories").then((r) => r.categories ?? []),
  });
}

export function useAdminCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api(`/api/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => api("/api/admin/orders").then((r) => r.orders ?? []),
  });
}

export function useAdminUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      qc.invalidateQueries({ queryKey: ["admin", "recent-orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "monthly-revenue"] });
      toast.success("Order updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Customers ────────────────────────────────────────────────────────────────

export function useAdminCustomers() {
  return useQuery({
    queryKey: ["admin", "customers"],
    queryFn: () => api("/api/admin/customers").then((r) => r.customers ?? []),
  });
}

// ─── Inquiries ────────────────────────────────────────────────────────────────

export function useAdminInquiries() {
  return useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: () => api("/api/admin/inquiries").then((r) => r.inquiries ?? []),
  });
}

export function useAdminUpdateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      toast.success("Inquiry updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminDeleteInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/admin/inquiries/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      toast.success("Inquiry deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api("/api/admin/stats"),
  });
}

export function useAdminMonthlyRevenue() {
  return useQuery({
    queryKey: ["admin", "monthly-revenue"],
    queryFn: () => api("/api/admin/monthly-revenue").then((r) => r.data ?? []),
  });
}

export function useAdminRecentOrders(limit = 5) {
  return useQuery({
    queryKey: ["admin", "recent-orders", limit],
    queryFn: async () => {
      const r = await api("/api/admin/orders");
      const orders = r.orders ?? [];
      return orders.slice(0, limit);
    },
  });
}

export function useAdminTopProducts(limit = 5) {
  return useQuery({
    queryKey: ["admin", "top-products", limit],
    queryFn: () => api("/api/admin/products").then((r) => {
      const products = r.products ?? [];
      return [...products]
        .filter((p: any) => p._status === "active")
        .sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0))
        .slice(0, limit)
        .map((p: any) => ({ name: p.name, revenue: 0, units: 0, image: p.images?.[0], slug: p.slug }));
    }),
  });
}

// ─── Site config ──────────────────────────────────────────────────────────────

export function useAdminSiteConfig() {
  return useQuery({
    queryKey: ["admin", "site-config"],
    queryFn: () => api("/api/admin/site-config").then((r) => r.config ?? {}),
  });
}

export function useAdminSaveSiteConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (value: Record<string, unknown>) =>
      api("/api/admin/site-config", {
        method: "POST",
        body: JSON.stringify({ value }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "site-config"] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}