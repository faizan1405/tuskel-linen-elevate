"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_STATUSES, ORDER_STATUS_FLOW, type AdminOrder, type OrderStatus } from "@/lib/admin/types";
import { adminGetOrders, adminUpdateOrderStatus } from "@/lib/admin/server";
import { formatDateShort } from "@/lib/admin/format";
import { Search, Eye } from "lucide-react";
import { toast } from "sonner";

const STATUS_ALL = "all";

function OrderDetailModal({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes || "");
  const [saved, setSaved] = useState(false);

  const advanceStatus = () => {
    const idx = ORDER_STATUS_FLOW.indexOf(status);
    if (idx !== -1 && idx < ORDER_STATUS_FLOW.length - 1) setStatus(ORDER_STATUS_FLOW[idx + 1] as OrderStatus);
  };

  const { mutate } = useMutation({
    mutationFn: adminUpdateOrderStatus,
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 600);
    },
    onError: (e) => toast.error(`Update failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const handleSave = () => {
    mutate({ id: order.id, status, notes });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Order {order.orderNo}</DialogTitle>
          <DialogDescription>Placed on {formatDateShort(order.placedOn)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge variant="secondary" className={ORDER_STATUSES.find((s) => s.value === status)?.color}>
              {ORDER_STATUSES.find((s) => s.value === status)?.label}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>Update Status</Label>
            <div className="flex gap-2">
              <Select value={status} onValueChange={(v: OrderStatus) => setStatus(v)}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={advanceStatus} disabled={status === "delivered"}>Next</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Items</Label>
            <div className="space-y-2">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>{it.name} <span className="text-muted-foreground">x {it.qty}</span></span>
                  <span className="font-medium">{"₹"}{(it.price * it.qty).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Shipping Address</Label>
            <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
          </div>

          <div className="space-y-2">
            <Label>Payment</Label>
            <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
          </div>

          <div className="space-y-2">
            <Label>Order Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{saved ? "Saved!" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_ALL);
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminGetOrders(),
  });

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search) {
        const q = search.toLowerCase();
        return o.orderNo.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
      }
      if (statusFilter !== STATUS_ALL && o.status !== statusFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-light">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage and track all orders ({orders.length} total)</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={statusFilter === STATUS_ALL ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(STATUS_ALL)}>
            All <span className="ml-1 text-xs opacity-70">{orders.length}</span>
          </Button>
          {ORDER_STATUSES.map((s) => (
            <Button key={s.value} variant={statusFilter === s.value ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s.value)}>
              {s.label} <span className="ml-1 text-xs opacity-70">{counts[s.value] || 0}</span>
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders match.</TableCell></TableRow>
                ) : (
                  filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-xs font-medium">{o.orderNo}</p>
                          <p className="text-xs text-muted-foreground">{o.paymentMethod}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{o.customer}</p>
                          <p className="text-xs text-muted-foreground">{o.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatDateShort(o.placedOn)}</TableCell>
                      <TableCell className="text-sm">{o.items.reduce((s: number, it: any) => s + it.qty, 0)} items</TableCell>
                      <TableCell><Badge variant="secondary" className={ORDER_STATUSES.find((s) => s.value === o.status)?.color}>{o.status}</Badge></TableCell>
                      <TableCell className="text-right text-sm font-medium">{"₹"}{o.total.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setViewOrder(o)}>
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

        {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
      </div>
    </AdminLayout>
  );
}
