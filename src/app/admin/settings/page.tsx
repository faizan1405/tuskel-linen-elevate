"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminGetSiteConfig, adminSaveSiteConfig } from "@/lib/admin/server";
import { Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg font-medium">{children}</h3>;
}

function AnnouncementsSection() {
  const queryClient = useQueryClient();
  const { data: config = {} } = useQuery({
    queryKey: ["admin", "site-config"],
    queryFn: () => adminGetSiteConfig(),
  });
  const [anns, setAnns] = useState<string[]>((config.announcements as string[]) ?? []);
  const [newAnn, setNewAnn] = useState("");
  const [saved, setSaved] = useState(false);

  const { mutate } = useMutation({
    mutationFn: adminSaveSiteConfig,
    onSuccess: () => { setSaved(true); toast.success("Announcements saved"); queryClient.invalidateQueries({ queryKey: ["admin", "site-config"] }); setTimeout(() => setSaved(false), 2000); },
    onError: (e) => toast.error(`Save failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const save = () => mutate({ value: { ...config, announcements: anns } });

  return (
    <Card>
      <CardHeader><SectionTitle>Announcements</SectionTitle><p className="text-sm text-muted-foreground">Manage the rotating announcement bar shown on the store.</p></CardHeader>
      <CardContent className="space-y-4">
        {anns.map((ann, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={ann} onChange={(e) => { const next = [...anns]; next[i] = e.target.value; setAnns(next); }} />
            <Button variant="ghost" size="icon" onClick={() => setAnns(anns.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input placeholder="New announcement..." value={newAnn} onChange={(e) => setNewAnn(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (() => { if (newAnn.trim()) { setAnns([...anns, newAnn.trim()]); setNewAnn(""); } })()} />
          <Button variant="outline" onClick={() => { if (newAnn.trim()) { setAnns([...anns, newAnn.trim()]); setNewAnn(""); } }}><Plus className="h-4 w-4" /></Button>
        </div>
        <Button onClick={save}><Save className="mr-2 h-4 w-4" /> {saved ? "Saved" : "Save Announcements"}</Button>
      </CardContent>
    </Card>
  );
}

function CouponsSection() {
  const queryClient = useQueryClient();
  const { data: config = {} } = useQuery({
    queryKey: ["admin", "site-config"],
    queryFn: () => adminGetSiteConfig(),
  });
  const [coupons, setCoupons] = useState<Record<string, { off: number; label: string }>>({ ...((config.coupons as Record<string, { off: number; label: string }>) ?? {}) });
  const [newCode, setNewCode] = useState("");
  const [newOff, setNewOff] = useState("10");
  const [newLabel, setNewLabel] = useState("");
  const [saved, setSaved] = useState(false);

  const { mutate } = useMutation({
    mutationFn: adminSaveSiteConfig,
    onSuccess: () => { setSaved(true); toast.success("Coupons saved"); queryClient.invalidateQueries({ queryKey: ["admin", "site-config"] }); setTimeout(() => setSaved(false), 2000); },
    onError: (e) => toast.error(`Save failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const save = () => mutate({ value: { ...config, coupons } });

  return (
    <Card>
      <CardHeader><SectionTitle>Coupon Codes</SectionTitle><p className="text-sm text-muted-foreground">Manage discount codes available at checkout.</p></CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(coupons).map(([code, val]) => (
          <div key={code} className="flex items-center gap-3 rounded-md border px-3 py-2">
            <span className="font-mono text-sm font-medium">{code}</span>
            <span className="text-xs text-muted-foreground">— {val.label}</span>
            <span className="ml-auto text-sm">{Math.round(val.off * 100)}% off</span>
            <Button variant="ghost" size="icon" onClick={() => { const next = { ...coupons }; delete next[code]; setCoupons(next); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Code (e.g. SUMMER25)" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="w-40" />
          <Input type="number" placeholder="%" value={newOff} onChange={(e) => setNewOff(e.target.value)} className="w-16" />
          <Input placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="flex-1 min-w-[120px]" />
          <Button variant="outline" onClick={() => {
            if (!newCode.trim()) return;
            setCoupons({ ...coupons, [newCode.trim().toUpperCase()]: { off: Number(newOff) / 100, label: newLabel || `${newOff}% discount` } });
            setNewCode(""); setNewLabel("");
          }}><Plus className="h-4 w-4" /></Button>
        </div>
        <Button onClick={save}><Save className="mr-2 h-4 w-4" /> {saved ? "Saved" : "Save Coupons"}</Button>
      </CardContent>
    </Card>
  );
}

function ShippingSection() {
  const queryClient = useQueryClient();
  const { data: config = {} } = useQuery({
    queryKey: ["admin", "site-config"],
    queryFn: () => adminGetSiteConfig(),
  });
  const [freeThreshold, setFreeThreshold] = useState(String(config.freeShippingThreshold ?? 0));
  const [flatRate, setFlatRate] = useState(String(config.shippingFlat ?? 0));
  const [returnsWindow, setReturnsWindow] = useState(String(config.returnsWindowDays ?? 7));
  const [saved, setSaved] = useState(false);

  const { mutate } = useMutation({
    mutationFn: adminSaveSiteConfig,
    onSuccess: () => { setSaved(true); toast.success("Settings saved"); queryClient.invalidateQueries({ queryKey: ["admin", "site-config"] }); setTimeout(() => setSaved(false), 2000); },
    onError: (e) => toast.error(`Save failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const save = () => mutate({ value: { ...config, freeShippingThreshold: Number(freeThreshold), shippingFlat: Number(flatRate), returnsWindowDays: Number(returnsWindow) } });

  return (
    <Card>
      <CardHeader><SectionTitle>Shipping & Returns</SectionTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Free Shipping Threshold (₹)</Label>
            <Input type="number" value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} />
            <p className="text-xs text-muted-foreground">0 = free for all orders</p>
          </div>
          <div className="space-y-2">
            <Label>Flat Shipping Rate (₹)</Label>
            <Input type="number" value={flatRate} onChange={(e) => setFlatRate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Returns Window (days)</Label>
            <Input type="number" value={returnsWindow} onChange={(e) => setReturnsWindow(e.target.value)} />
          </div>
        </div>
        <Button onClick={save}><Save className="mr-2 h-4 w-4" /> {saved ? "Saved" : "Save Settings"}</Button>
      </CardContent>
    </Card>
  );
}

function ContactSection() {
  const queryClient = useQueryClient();
  const { data: config = {} } = useQuery({
    queryKey: ["admin", "site-config"],
    queryFn: () => adminGetSiteConfig(),
  });
  const [phone, setPhone] = useState(String(config.phone ?? ""));
  const [whatsapp, setWhatsapp] = useState(String(config.whatsapp ?? ""));
  const [email, setEmail] = useState(String(config.email ?? ""));
  const [saved, setSaved] = useState(false);

  const { mutate } = useMutation({
    mutationFn: adminSaveSiteConfig,
    onSuccess: () => { setSaved(true); toast.success("Contact info saved"); queryClient.invalidateQueries({ queryKey: ["admin", "site-config"] }); setTimeout(() => setSaved(false), 2000); },
    onError: (e) => toast.error(`Save failed: ${e instanceof Error ? e.message : "unknown"}`),
  });

  const save = () => mutate({ value: { ...config, phone, whatsapp, email } });

  return (
    <Card>
      <CardHeader><SectionTitle>Contact Information</SectionTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <Button onClick={save}><Save className="mr-2 h-4 w-4" /> {saved ? "Saved" : "Save Contact Info"}</Button>
      </CardContent>
    </Card>
  );
}



export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-light">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage store configuration</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <AnnouncementsSection />
          <CouponsSection />
          <ShippingSection />
          <ContactSection />
        </div>
      </div>
    </AdminLayout>
  );
}
