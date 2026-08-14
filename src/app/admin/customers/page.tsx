"use client";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminCustomer } from "@/lib/admin/types";
import { useAdminCustomers, useAdminOrders } from "@/lib/admin/hooks";
import { formatINR, formatDate } from "@/lib/admin/format";
import { Search, Eye, User } from "lucide-react";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewCustomer, setViewCustomer] = useState<AdminCustomer | null>(null);

  const { data: customers = [], isLoading } = useAdminCustomers();

  const { data: orders = [] } = useAdminOrders();

  const typedCustomers = customers as AdminCustomer[];
  const typedOrders = orders as AdminCustomer[];

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

  return (
    <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-light">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage customer accounts ({typedCustomers.length} customers)</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="mt-2 text-2xl font-medium">{typedCustomers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <p className="mt-2 text-2xl font-medium text-green-600">{active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Customer Spend</p>
              <p className="mt-2 text-2xl font-medium">{formatINR(typedCustomers.reduce((s, c) => s + c.spent, 0))}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>First Order</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No customers match.</TableCell></TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={String((c as any)._id || c.id)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.orders}</TableCell>
                      <TableCell className="text-sm font-medium">{formatINR(c.spent)}</TableCell>
                      <TableCell className="text-sm">{formatDate(c.firstOrder)}</TableCell>
                      <TableCell className="text-sm">{formatDate(c.lastOrder)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setViewCustomer(c)}>
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

        {viewCustomer && (
          <Dialog open onOpenChange={() => setViewCustomer(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{viewCustomer.name}</DialogTitle>
                <DialogDescription>Customer details and order history</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm mt-0.5">{viewCustomer.email}</p></div>
                  <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm mt-0.5">{viewCustomer.phone}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-sm mt-0.5">{viewCustomer.orders}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total Spent</p><p className="text-sm mt-0.5 font-medium">{formatINR(viewCustomer.spent)}</p></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Order History</p>
                  <div className="space-y-2">
                    {(orders as any[])
                      .filter((o) => o.customer === viewCustomer.name)
                      .slice(0, 5)
                      .map((o) => (
                        <div key={String(o.id)} className="flex items-center justify-between rounded-md border px-3 py-2">
                          <div>
                            <p className="text-sm font-mono">{o.orderNo}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(o.placedOn)}</p>
                          </div>
                          <span className="text-sm font-medium">{formatINR(o.total)}</span>
                        </div>
                      ))}
                    {(orders as any[]).filter((o) => o.customer === viewCustomer.name).length === 0 && (
                      <p className="text-sm text-muted-foreground">No orders found.</p>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
  );
}
