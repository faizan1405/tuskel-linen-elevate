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
import { INQUIRY_STATUSES, type AdminInquiry } from "@/lib/admin/types";
import {
  useAdminInquiries,
  useAdminUpdateInquiry,
  useAdminDeleteInquiry,
} from "@/lib/admin/hooks";
import { formatDate, formatDateShort } from "@/lib/admin/format";
import { Search, Trash2, MailOpen, CheckCircle2, XCircle, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const STATUS_ALL = "all" as const;

const INQUIRY_ICONS: Record<string, any> = {
  new: MessageSquare,
  read: Clock,
  replied: CheckCircle2,
  closed: XCircle,
};

function InquiryDetailModal({ inquiry, onClose }: { inquiry: AdminInquiry; onClose: () => void }) {
  const [status, setStatus] = useState<AdminInquiry["status"]>(inquiry.status);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { mutate: updateStatus } = useAdminUpdateInquiry();

  const handleStatusChange = (newStatus: AdminInquiry["status"]) => {
    setStatus(newStatus);
    setSaving(true);
    updateStatus({ id: inquiry.id, data: { status: newStatus } }, {
      onSuccess: () => {
        setSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      },
      onError: (e: Error) => {
        toast.error(e.message);
        setSaving(false);
      },
    });
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const StatusIcon = INQUIRY_ICONS[inquiry.status] || MessageSquare;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <MailOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold">Inquiry from {inquiry.name}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {inquiry.subject} &mdash; {formatDateShort(inquiry.createdAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-5 py-5 max-h-[60vh] overflow-y-auto">
          {/* Contact info */}
          <div className="flex flex-wrap gap-4 text-sm bg-muted/30 rounded-lg px-4 py-3">
            <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Email:</span> {inquiry.email}</span>
            {inquiry.phone && <span className="flex items-center gap-1.5"><span className="text-muted-foreground">Phone:</span> {inquiry.phone}</span>}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Message</Label>
            <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
              {inquiry.message}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Update Status</Label>
            <div className="flex flex-wrap gap-2">
              {INQUIRY_STATUSES.map((s) => {
                const Icon = INQUIRY_ICONS[s.value] || MessageSquare;
                return (
                  <Button
                    key={s.value}
                    variant={status === s.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(s.value)}
                    disabled={saving}
                    className="h-8 text-xs font-medium"
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    {s.label}
                  </Button>
                );
              })}
            </div>
            {saveSuccess && (
              <p className="text-xs text-emerald-600 font-medium">Status updated</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="h-9">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function InquiriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_ALL);
  const [viewInquiry, setViewInquiry] = useState<AdminInquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: inquiries = [], isLoading } = useAdminInquiries();

  const typedInquiries = inquiries as AdminInquiry[];

  const deleteMutation = useAdminDeleteInquiry();

  const filtered = useMemo(() => {
    return typedInquiries.filter((inq) => {
      const q = search.toLowerCase().trim();
      if (q) {
        return (
          inq.name.toLowerCase().includes(q) ||
          inq.email.toLowerCase().includes(q) ||
          inq.subject.toLowerCase().includes(q) ||
          inq.message.toLowerCase().includes(q)
        );
      }
      if (statusFilter !== STATUS_ALL && inq.status !== statusFilter) return false;
      return true;
    });
  }, [typedInquiries, search, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    typedInquiries.forEach((inq) => { c[inq.status] = (c[inq.status] || 0) + 1; });
    return c;
  }, [typedInquiries]);

  const newCountVal = counts["new"] || 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-light tracking-tight">Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {typedInquiries.length} total &middot;
            {(counts["new"] || 0) > 0 && <span className="text-amber-600 font-medium"> {(counts["new"] || 0)} new</span>}
          </p>
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
          All <span className="ml-1.5 text-[10px] opacity-70 font-mono">{typedInquiries.length}</span>
        </Button>
        {INQUIRY_STATUSES.map((s) => (
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

      {/* Inquiries table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="pl-5 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">From</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Subject</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 hidden md:table-cell">Date</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/80">Status</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground font-medium">Loading inquiries…</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
                        <MailOpen className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">No inquiries found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inq) => (
                  <TableRow key={inq.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-5">
                      <div>
                        <p className="text-sm font-medium">{inq.name}</p>
                        <p className="text-xs text-muted-foreground">{inq.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[280px]">
                        <p className="text-sm truncate">{inq.subject}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{inq.message.slice(0, 80)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{formatDate(inq.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`
                        text-[11px] font-medium px-2.5 py-0.5
                        ${inq.status === "new" ? "bg-blue-50 text-blue-700 border-blue-200/60" :
                          inq.status === "read" ? "bg-gray-100 text-gray-700 border-gray-200/60" :
                          inq.status === "replied" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" :
                          "bg-red-50 text-red-700 border-red-200/60"}
                      `}>{inq.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewInquiry(inq)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MailOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(inq.id)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inquiry detail modal */}
      {viewInquiry && <InquiryDetailModal inquiry={viewInquiry} onClose={() => setViewInquiry(null)} />}

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete inquiry?</DialogTitle>
            <DialogDescription>This action is permanent and cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="h-9">Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
              className="h-9"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
