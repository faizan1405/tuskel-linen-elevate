import type { Product } from "@/lib/products";

// ─── Admin entities ───────────────────────────────────────────────────────────

export interface AdminOrder {
  id: string;
  orderNo: string;
  customer: string;
  email: string;
  phone: string;
  items: Array<{ slug: string; name: string; size: string; qty: number; price: number }>;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: string;
  placedOn: string;
  updatedOn: string;
  notes?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  firstOrder: string;
  lastOrder: string;
  status: "active" | "inactive";
}

// ─── Enums / constants ────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";

// ─── Dashboard stats shape ────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  aovChange: number;
}

// ─── Site config ─────────────────────────────────────────────────────────────

export interface SiteConfig {
  announcements: string[];
  coupons: Record<string, { off: number; label: string }>;
  freeShippingThreshold: number;
  shippingFlat: number;
  returnsWindowDays: number;
  phone: string;
  whatsapp: string;
  email: string;
}

// ─── AdminProduct (extends Product with editable fields) ──────────────────────

export interface AdminProduct extends Product {
  _stock?: number;
  _status?: "active" | "draft" | "archived";
}
