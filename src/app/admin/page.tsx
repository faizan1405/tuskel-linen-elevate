"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/lib/admin/hooks";
import {
  useAdminMonthlyRevenue,
  useAdminTopProducts,
  useAdminRecentOrders,
  useAdminProducts,
} from "@/lib/admin/hooks";
import { ORDER_STATUSES } from "@/lib/admin/types";
import { formatDateShort } from "@/lib/admin/format";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, ArrowRight, Plus, Package, UserPlus } from "lucide-react";
import Link from "next/link";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function KpiCard({ title, value, change, currency, icon: Icon, accent }: {
  title: string; value: number; change: number; currency?: boolean; icon: any; accent?: string;
}) {
  const up = change >= 0;
  return (
    <Card className="border-border/60 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${accent || "bg-primary/10"}`}>
            <Icon className={`h-4 w-4 ${accent?.includes("text-") ? "" : "text-primary"}`} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"} px-2 py-1 rounded-full`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}{change}%
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground font-medium">{title}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {currency ? "₹" : ""}{value.toLocaleString("en-IN")}
        </p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">vs last period</p>
      </CardContent>
    </Card>
  );
}

function RevenueChart({ data }: { data: any[] }) {
  if (data.every(d => d.revenue === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
          <DollarSign className="h-5 w-5 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No revenue data yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Revenue will appear once orders are placed</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(28 45% 52%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(28 45% 52%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 88%)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} dy={8} />
        <YAxis tick={{ fontSize: 12, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} dx={-8} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
          contentStyle={{ borderRadius: 10, border: "1px solid hsl(0 0% 90%)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13 }}
          labelStyle={{ fontWeight: 600, marginBottom: 4 }}
        />
        <Area type="monotone" dataKey="revenue" stroke="hsl(28 45% 52%)" fill="url(#revGrad)" strokeWidth={2.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function TopProductRow({ p, i }: { p: any; i: number }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="h-10 w-10 rounded-lg border border-border/60 overflow-hidden shrink-0 bg-muted/40">
        {p.image || p.images?.[0] ? (
          <img src={p.image || p.images![0]} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
            <Package className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{p.name}</p>
        <p className="text-xs text-muted-foreground">{p.units || 0} sold</p>
      </div>
      <span className="text-sm font-semibold tabular-nums">₹{p.revenue?.toLocaleString?.("en-IN") || p.revenue || 0}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useAdminStats();
  const { data: revenueDataRaw = {} } = useAdminMonthlyRevenue();
  const { data: topProducts = [] } = useAdminTopProducts(5);
  const { data: products = [] } = useAdminProducts();
  const { data: recentOrders = [] } = useAdminRecentOrders(5);

  const revenueData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      return { month: MONTHS[d.getMonth()], revenue: revenueDataRaw[key] || 0 };
    });
  }, [revenueDataRaw]);

  const s = stats ?? { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, avgOrderValue: 0, revenueChange: 0, ordersChange: 0, customersChange: 0, aovChange: 0 };

  const activeProducts = useMemo(() => {
    return products.filter((p: any) => p._status === "active").sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 5);
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-light tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back — here&apos;s your store overview</p>
        </div>
        <Button asChild>
          <Link href="/admin/products">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Revenue" value={s.totalRevenue} change={s.revenueChange} currency icon={DollarSign} />
        <KpiCard title="Total Orders" value={s.totalOrders} change={s.ordersChange} icon={ShoppingCart} accent="bg-blue-50 text-blue-600" />
        <KpiCard title="Customers" value={s.totalCustomers} change={s.customersChange} icon={Users} accent="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Avg Order Value" value={s.avgOrderValue} change={s.aovChange} currency icon={TrendingUp} accent="bg-violet-50 text-violet-600" />
      </div>

      {/* Chart + Top Products */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px] font-semibold">Revenue Overview</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary/70" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px] font-semibold">Top Products</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">By popularity</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                <Link href="/admin/products">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5">
            {topProducts.length === 0 && activeProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                  <Package className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No products yet</p>
                <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-xs">
                  <Link href="/admin/products">Add your first product</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {(topProducts.length > 0 ? topProducts : activeProducts.map((p: any) => ({ ...p, revenue: 0, units: p._stock || 0 }))).map((p: any, i: number) => (
                  <TopProductRow key={p.slug || p.name || i} p={p} i={i} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/products" className="group">
          <Card className="border-border/60 hover:shadow-md transition-all duration-200 hover:border-primary/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Add Product</p>
                <p className="text-xs text-muted-foreground">{products.length} in catalogue</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders" className="group">
          <Card className="border-border/60 hover:shadow-md transition-all duration-200 hover:border-primary/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ShoppingCart className="h-4 w-4 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">View Orders</p>
                <p className="text-xs text-muted-foreground">{s.totalOrders} total orders</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/customers" className="group">
          <Card className="border-border/60 hover:shadow-md transition-all duration-200 hover:border-primary/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <UserPlus className="h-4 w-4 text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Customers</p>
                <p className="text-xs text-muted-foreground">{s.totalCustomers} registered</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[15px] font-semibold">Recent Orders</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Latest transactions</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
              <Link href="/admin/orders">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Order</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Customer</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Date</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Status</TableHead>
                <TableHead className="text-right pr-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((o: any) => {
                const statusColor = ORDER_STATUSES.find((s) => s.value === o.status)?.color || "";
                return (
                  <TableRow key={o.id || o._id} className="group hover:bg-muted/30">
                    <TableCell className="pl-5">
                      <span className="font-mono text-xs font-medium">{o.orderNo}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{o.customer}</p>
                        <p className="text-xs text-muted-foreground">{o.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateShort(o.placedOn)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusColor} text-[11px] font-medium px-2.5 py-0.5`}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5 text-sm font-semibold tabular-nums">₹{o.total?.toLocaleString?.("en-IN") || o.total}</TableCell>
                  </TableRow>
                );
              })}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">No orders yet</p>
                      <p className="text-xs text-muted-foreground/70">Orders will appear here once customers purchase</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
