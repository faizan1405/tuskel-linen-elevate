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
import { Search, Trash2, MailOpen, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const STATUS_ALL = "all" as const;

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
    // Only close if status was saved (or user confirms leaving unsaved changes)
    if (saving) return; // don't close while saving
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Inquiry from {inquiry.name}</DialogTitle>
          <DialogDescription>
            {inquiry.subject} &mdash; {formatDateShort(inquiry.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>{inquiry.email}</span>
            {inquiry.phone && <span>{inquiry.phone}</span>}
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <div className="rounded-md border px-4 py-3 text-sm whitespace-pre-wrap">{inquiry.message}</div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {INQUIRY_STATUSES.map((s) => (
                <Button
                  key={s.value}
                  variant={status === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(s.value)}
                  disabled={saving}
                >
                  {s.value === "new" && <MailOpen className="h-3.5 w-3.5 mr-1" />}
                  {s.value === "closed" && <XCircle className="h-3.5 w-3.5 mr-1" />}
                  {s.value === "replied" && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
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

  return (
    <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-light">Inquiries</h1>
          <p className="text-sm text-muted-foreground">Customer contact messages ({typedInquiries.length} total)</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={statusFilter === STATUS_ALL ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(STATUS_ALL)}>
            All <span className="ml-1 text-xs opacity-70">{typedInquiries.length}</span>
          </Button>
          {INQUIRY_STATUSES.map((s) => (
            <Button
              key={s.value}
              variant={statusFilter === s.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label} <span className="ml-1 text-xs opacity-70">{counts[s.value] || 0}</span>
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, subject..."
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
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No inquiries found.</TableCell></TableRow>
                ) : (
                  filtered.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{inq.name}</p>
                          <p className="text-xs text-muted-foreground">{inq.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[300px] truncate">{inq.subject}</TableCell>
                      <TableCell className="text-sm">{formatDate(inq.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={INQUIRY_STATUSES.find((s) => s.value === inq.status)?.color}>
                          {inq.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setViewInquiry(inq)}>
                            <MailOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(inq.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

        {viewInquiry && <InquiryDetailModal inquiry={viewInquiry} onClose={() => setViewInquiry(null)} />}

        <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete inquiry?</DialogTitle>
              <DialogDescription>This action is permanent and cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
