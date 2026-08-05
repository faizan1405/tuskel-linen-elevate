"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { inr } from "@/lib/format";
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
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  adminGetStats,
  adminGetMonthlyRevenue,
  adminGetTopProducts,
  adminGetRecentOrders,
} from "@/lib/admin/server";
import { ORDER_STATUSES } from "@/lib/admin/types";
import { formatDateShort } from "@/lib/admin/format";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, ArrowRight } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function KpiCard({ title, value, change, prefix }: { title: string; value: number; change: number; prefix?: string }) {
  const up = change >= 0;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-medium tracking-tight">
          {prefix}{value.toLocaleString("en-IN")}
        </p>
        <div className={`mt-2 flex items-center gap-1 text-sm ${up ? "text-green-600" : "text-red-600"}`}>
          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{up ? "+" : ""}{change}%</span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      </CardContent>
    </Card>
  );
}



export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminGetStats(),
  });

  const { data: monthlyRevenue = {} } = useQuery({
    queryKey: ["admin", "monthly-revenue"],
    queryFn: () => adminGetMonthlyRevenue(),
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: ["admin", "top-products"],
    queryFn: () => adminGetTopProducts({ data: { limit: 5 } }),
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["admin", "recent-orders"],
    queryFn: () => adminGetRecentOrders({ data: { limit: 5 } }),
  });

  const revenueData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
      return { month: MONTHS[d.getMonth()], revenue: (monthlyRevenue as Record<string, number>)[key] || 0 };
    });
  }, [monthlyRevenue]);

  const s = stats ?? { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, avgOrderValue: 0, revenueChange: 0, ordersChange: 0, customersChange: 0, aovChange: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-light">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Revenue" value={s.totalRevenue} change={s.revenueChange} prefix="₹" />
        <KpiCard title="Total Orders" value={s.totalOrders} change={s.ordersChange} />
        <KpiCard title="Customers" value={s.totalCustomers} change={s.customersChange} />
        <KpiCard title="Avg Order Value" value={s.avgOrderValue} change={s.aovChange} prefix="₹" />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(28 45% 52%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(28 45% 52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 85%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0 0% 80%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(0 0% 80%)" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(0 0% 90%)" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(28 45% 52%)" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-medium">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.units} sold</p>
                    </div>
                    <span className="text-sm font-medium shrink-0">{inr(p.revenue)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Recent Orders</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/orders">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((o) => {
                const statusColor = ORDER_STATUSES.find((s) => s.value === o.status)?.color || "";
                return (
                  <TableRow key={String((o as any)._id || (o as any).id)}>
                    <TableCell className="font-mono text-xs">{o.orderNo}</TableCell>
                    <TableCell className="text-sm">{o.customer}</TableCell>
                    <TableCell className="text-sm">{formatDateShort(o.placedOn)}</TableCell>
                    <TableCell><Badge variant="secondary" className={statusColor}>{o.status}</Badge></TableCell>
                    <TableCell className="text-right text-sm font-medium">{inr(o.total)}</TableCell>
                  </TableRow>
                );
              })}
              {recentOrders.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No orders yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
