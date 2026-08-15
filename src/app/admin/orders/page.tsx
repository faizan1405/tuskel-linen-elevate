"use client";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useAdminOrders, useAdminUpdateOrder } from "@/lib/admin/hooks";
import { inr } from "@/lib/format";
import { formatDateShort, formatDate } from "@/lib/admin/format";
import { toast } from "sonner";
import { Search, Eye, ArrowRight, CheckCircle2, Clock, Truck, Package, XCircle, RotateCcw, CheckCheck } from "lucide-react";

const STATUS_ALL = "all";

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: CheckCheck,
  cancelled: XCircle,
  returned: RotateCcw,
};

const STATUS_COLORS_MAP: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200/60",
  processing: "bg-purple-50 text-purple-700 border-purple-200/60",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  cancelled: "bg-red-50 text-red-700 border-red-200/60",
  returned: "bg-orange-50 text-orange-700 border-orange-200/60",
};

function OrderDetailModal({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes || "");
  const [saved, setSaved] = useState(false);

  const advanceStatus = () => {
    const idx = ORDER_STATUS_FLOW.indexOf(status);
    if (idx !== -1 && idx < ORDER_STATUS_FLOW.length - 1) setStatus(ORDER_STATUS_FLOW[idx + 1] as OrderStatus);
  };

  const { mutate, isPending } = useAdminUpdateOrder();

  const handleSave = () => {
    mutate({
      id: order.id,
      data: { status, notes },
    }, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => { setSaved(false); onClose(); }, 600);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const currentStatusIdx = ORDER_STATUS_FLOW.indexOf(status);
  const StatusIcon = STATUS_ICONS[status] || Package;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${STATUS_COLORS_MAP[status] || "bg-muted"}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Order {order.orderNo}</DialogTitle>
              <DialogDescription>Placed on {formatDate(order.placedOn)}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* Status update */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Order Status</Label>
            <div className="flex gap-2">
              <Select value={status} onValueChange={(v: OrderStatus) => setStatus(v)}>
                <SelectTrigger className="flex-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={advanceStatus} disabled={status === "delivered"} className="h-9">
                Advance
              </Button>
            </div>
            {/* Progress steps */}
            <div className="flex items-center gap-1 pt-2">
              {ORDER_STATUS_FLOW.map((step, i) => {
                const active = ORDER_STATUS_FLOW.indexOf(status) >= i;
                const StepIcon = STATUS_ICONS[step] || Package;
                return (
                  <div key={step} className="flex items-center gap-1 flex-1">
                    <div className={`h-2 w-full rounded-full transition-colors ${active ? "bg-primary" : "bg-muted"}`} />
                    {i < ORDER_STATUS_FLOW.length - 1 && <div className="w-0" />}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between">
              {ORDER_STATUS_FLOW.map((step) => {
                const active = ORDER_STATUS_FLOW.indexOf(status) >= ORDER_STATUS_FLOW.indexOf(step);
                return (
                  <span key={step} className={`text-[10px] ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {step}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Customer</p>
              <p className="text-sm">{order.customer}</p>
              <p className="text-xs text-muted-foreground">{order.email}</p>
              <p className="text-xs text-muted-foreground">{order.phone}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Payment</p>
              <p className="text-sm">{order.paymentMethod}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Items</Label>
            <div className="space-y-2">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-2.5 text-sm bg-muted/20">
                  <div>
                    <span className="font-medium">{it.name}</span>
                    <span className="text-muted-foreground ml-2">x {it.qty} &middot; {it.size}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{inr(it.price * it.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{inr(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-600 tabular-nums">-{inr(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="tabular-nums">{inr(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Shipping Address</Label>
            <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">{order.shippingAddress}</p>
          </div>

          {/* Order notes */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Order Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              rows={2}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="h-9">Cancel</Button>
          <Button onClick={handleSave} disabled={isPending} className="h-9">
            {saved ? "Saved!" : isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_ALL);
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null);

  const { data: orders = [], isLoading } = useAdminOrders();
  const typedOrders = orders as AdminOrder[];

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    typedOrders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [typedOrders]);

  const totalValue = useMemo(() => {
    return typedOrders.reduce((sum, o) => sum + o.total, 0);
  }, [typedOrders]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-light tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{orders.length} orders &middot; ₹{totalValue.toLocaleString("en-IN")} total value</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === STATUS_ALL ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter(STATUS_ALL)}
          className="h-8 text-xs font-medium"
        >
          All <span className="ml-1.5 text-[10px] opacity-70 font-mono">{orders.length}</span>
        </Button>
        {ORDER_STATUSES.map((s) => (
          <Button
            key={s.value}
            variant={statusFilter === s.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s.value)}
            className="h-8 text-xs font-medium"
          >
            {s.label} <span className="ml-1.5 text-[10px] opacity-70 font-mono">{counts[s.value] || 0}</span>
          </Button>
        ))}
      </div>

      {/* Orders table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Order</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Customer</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Date</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 text-center">Items</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Status</TableHead>
                <TableHead className="text-right pr-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Total</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground font-medium">Loading orders…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (() => {
                const q = search.toLowerCase();
                const visible = typedOrders.filter((o: AdminOrder) => {
                  if (statusFilter !== STATUS_ALL && o.status !== statusFilter) return false;
                  if (q) return o.orderNo.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
                  return true;
                });
                if (visible.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
                            <Eye className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">No orders match</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }
                return visible.map((o: AdminOrder) => {
                  const statusColor = STATUS_COLORS_MAP[o.status] || "";
                  const StatusIcon = STATUS_ICONS[o.status] || Package;
                  return (
                    <TableRow key={o.id} className="group hover:bg-muted/20 transition-colors">
                      <TableCell className="pl-5">
                        <span className="font-mono text-xs font-semibold">{o.orderNo}</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{o.paymentMethod}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{o.customer}</p>
                          <p className="text-xs text-muted-foreground">{o.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateShort(o.placedOn)}</TableCell>
                      <TableCell className="text-center text-sm tabular-nums">{o.items.reduce((s: number, it: any) => s + it.qty, 0)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${statusColor} text-[11px] font-medium px-2.5 py-0.5 gap-1.5`}>
                          <StatusIcon className="h-3 w-3" />
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-5 text-sm font-semibold tabular-nums">₹{o.total?.toLocaleString?.("en-IN") || o.total}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setViewOrder(o)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                });
              })()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order detail modal */}
      {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </div>
  );
}
