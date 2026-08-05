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

export interface OrderStatusEntry {
  value: OrderStatus;
  label: string;
  color: string;
}

export const ORDER_STATUSES: OrderStatusEntry[] = [
  { value: "pending",    label: "Pending",    color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed",  label: "Confirmed",  color: "bg-blue-100 text-blue-800" },
  { value: "processing", label: "Processing", color: "bg-purple-100 text-purple-800" },
  { value: "shipped",    label: "Shipped",    color: "bg-indigo-100 text-indigo-800" },
  { value: "delivered",  label: "Delivered",  color: "bg-green-100 text-green-800" },
  { value: "cancelled",  label: "Cancelled",  color: "bg-red-100 text-red-800" },
  { value: "returned",   label: "Returned",   color: "bg-orange-100 text-orange-800" },
];

export const ORDER_STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

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
