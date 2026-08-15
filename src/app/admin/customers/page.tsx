"use client";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AdminCustomer } from "@/lib/admin/types";
import { useAdminCustomers, useAdminOrders } from "@/lib/admin/hooks";
import { formatINR, formatDate } from "@/lib/admin/format";
import { Search, Eye, User, Mail, Phone, ShoppingBag, IndianRupee } from "lucide-react";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewCustomer, setViewCustomer] = useState<AdminCustomer | null>(null);

  const { data: customers = [], isLoading } = useAdminCustomers();

  const { data: orders = [] } = useAdminOrders();

  const typedCustomers = customers as AdminCustomer[];

  const filtered = useMemo(() => {
    return typedCustomers.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      }
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      return true;
    });
  }, [typedCustomers, search, filterStatus]);

  const active = typedCustomers.filter((c) => c.status === "active").length;
  const totalSpend = typedCustomers.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-light tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{typedCustomers.length} customers &middot; {active} active</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-muted-foreground font-medium">Total Customers</p>
                <p className="text-2xl font-semibold mt-1.5 tabular-nums">{typedCustomers.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-muted-foreground font-medium">Active</p>
                <p className="text-2xl font-semibold mt-1.5 tabular-nums text-emerald-600">{active}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-muted-foreground font-medium">Total Spend</p>
                <p className="text-2xl font-semibold mt-1.5 tabular-nums">{formatINR(totalSpend)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-0 bg-muted/30 focus-visible:ring-1"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Customer</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Orders</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Total Spent</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 hidden md:table-cell">First Order</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 hidden lg:table-cell">Last Order</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground font-medium">Loading customers…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No customers match</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={String((c as any)._id || c.id)} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{c.orders}</TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">{formatINR(c.spent)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{formatDate(c.firstOrder)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{formatDate(c.lastOrder)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={c.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 text-[11px] font-medium" : "bg-muted text-muted-foreground border-border/60 text-[11px] font-medium"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setViewCustomer(c)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer detail modal */}
      {viewCustomer && (
        <Dialog open onOpenChange={() => setViewCustomer(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{viewCustomer.name}</DialogTitle>
                  <DialogDescription>Customer details and order history</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6 py-5">
              {/* Contact info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{viewCustomer.email}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="text-sm flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{viewCustomer.phone}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
                  <p className="text-sm flex items-center gap-1.5"><ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />{viewCustomer.orders}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Spent</p>
                  <p className="text-sm font-semibold flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />{formatINR(viewCustomer.spent)}</p>
                </div>
              </div>

              {/* Order history */}
              <div className="space-y-2.5">
                <Label className="text-sm font-medium">Order History</Label>
                <div className="space-y-2">
                  {(orders as any[])
                    .filter((o) => o.customer === viewCustomer.name)
                    .slice(0, 5)
                    .map((o) => (
                      <div key={String(o.id)} className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-2.5 text-sm bg-muted/20">
                        <div>
                          <p className="font-mono text-xs font-medium">{o.orderNo}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(o.placedOn)}</p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">{formatINR(o.total)}</span>
                      </div>
                    ))}
                  {(orders as any[]).filter((o) => o.customer === viewCustomer.name).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No orders found for this customer.</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setViewCustomer(null)} className="h-9">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
