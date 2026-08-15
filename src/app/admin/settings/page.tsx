"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSiteConfig, useAdminSaveSiteConfig } from "@/lib/admin/hooks";
import { Save, Plus, Trash2, Truck, Tag, Megaphone, Mail, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function SectionHeader({ title, description, icon: Icon, iconColor }: { title: string; description: string; icon: any; iconColor: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function AnnouncementsSection() {
  const { data: config = {} } = useAdminSiteConfig();
  const [anns, setAnns] = useState<string[]>((config.announcements as string[]) ?? []);
  const [newAnn, setNewAnn] = useState("");

  const saveConfig = useAdminSaveSiteConfig();

  const save = () => saveConfig.mutate({ ...config, announcements: anns });

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-0 pt-5 px-5">
        <SectionHeader title="Announcements" description="Manage the rotating announcement bar shown on the storefront." icon={Megaphone} iconColor="bg-violet-50 text-violet-600" />
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {anns.map((ann, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={ann} onChange={(e) => { const next = [...anns]; next[i] = e.target.value; setAnns(next); }} className="h-9 flex-1" />
            <Button variant="ghost" size="icon" onClick={() => setAnns(anns.filter((_, idx) => idx !== i))} className="h-9 w-9 shrink-0 hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="New announcement..."
            value={newAnn}
            onChange={(e) => setNewAnn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (() => { if (newAnn.trim()) { setAnns([...anns, newAnn.trim()]); setNewAnn(""); } })()}
            className="h-9 flex-1"
          />
          <Button variant="outline" onClick={() => { if (newAnn.trim()) { setAnns([...anns, newAnn.trim()]); setNewAnn(""); } }} className="h-9">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="pt-2">
          <Button onClick={save} className="h-9"><Save className="mr-2 h-4 w-4" /> Save Announcements</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CouponsSection() {
  const { data: config = {} } = useAdminSiteConfig();
  const [coupons, setCoupons] = useState<Record<string, { off: number; label: string }>>({ ...((config.coupons as Record<string, { off: number; label: string }>) ?? {}) });
  const [newCode, setNewCode] = useState("");
  const [newOff, setNewOff] = useState("10");
  const [newLabel, setNewLabel] = useState("");

  const saveConfig = useAdminSaveSiteConfig();

  const save = () => saveConfig.mutate({ ...config, coupons });

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-0 pt-5 px-5">
        <SectionHeader title="Coupon Codes" description="Manage discount codes available at checkout." icon={Tag} iconColor="bg-amber-50 text-amber-600" />
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {Object.entries(coupons).map(([code, val]) => (
          <div key={code} className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-2.5 bg-muted/20">
            <span className="font-mono text-sm font-semibold tracking-wide">{code}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">— {val.label}</span>
            <span className="ml-auto text-sm font-medium text-primary">{Math.round(val.off * 100)}% off</span>
            <Button variant="ghost" size="icon" onClick={() => { const next = { ...coupons }; delete next[code]; setCoupons(next); }} className="h-7 w-7 shrink-0 hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2 pt-1">
          <Input placeholder="Code" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="w-32 h-9 font-mono" />
          <Input type="number" placeholder="%" value={newOff} onChange={(e) => setNewOff(e.target.value)} className="w-16 h-9" />
          <Input placeholder="Label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="flex-1 min-w-[120px] h-9" />
          <Button variant="outline" onClick={() => {
            if (!newCode.trim()) return;
            setCoupons({ ...coupons, [newCode.trim().toUpperCase()]: { off: Number(newOff) / 100, label: newLabel || `${newOff}% discount` } });
            setNewCode(""); setNewLabel("");
          }} className="h-9"><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="pt-2">
          <Button onClick={save} className="h-9"><Save className="mr-2 h-4 w-4" /> Save Coupons</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ShippingSection() {
  const { data: config = {} } = useAdminSiteConfig();
  const [freeThreshold, setFreeThreshold] = useState(String(config.freeShippingThreshold ?? 0));
  const [flatRate, setFlatRate] = useState(String(config.shippingFlat ?? 0));
  const [returnsWindow, setReturnsWindow] = useState(String(config.returnsWindowDays ?? 7));

  const saveConfig = useAdminSaveSiteConfig();

  const save = () => saveConfig.mutate({ ...config, freeShippingThreshold: Number(freeThreshold), shippingFlat: Number(flatRate), returnsWindowDays: Number(returnsWindow) });

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-0 pt-5 px-5">
        <SectionHeader title="Shipping & Returns" description="Configure shipping rates and return policies." icon={Truck} iconColor="bg-blue-50 text-blue-600" />
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Free Shipping Threshold (₹)</Label>
            <Input type="number" value={freeThreshold} onChange={(e) => setFreeThreshold(e.target.value)} className="h-9" />
            <p className="text-[11px] text-muted-foreground">0 = free for all orders</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Flat Shipping Rate (₹)</Label>
            <Input type="number" value={flatRate} onChange={(e) => setFlatRate(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Returns Window (days)</Label>
            <Input type="number" value={returnsWindow} onChange={(e) => setReturnsWindow(e.target.value)} className="h-9" />
          </div>
        </div>
        <Button onClick={save} className="h-9"><Save className="mr-2 h-4 w-4" /> Save Settings</Button>
      </CardContent>
    </Card>
  );
}

function ContactSection() {
  const { data: config = {} } = useAdminSiteConfig();
  const [phone, setPhone] = useState(String(config.phone ?? ""));
  const [whatsapp, setWhatsapp] = useState(String(config.whatsapp ?? ""));
  const [email, setEmail] = useState(String(config.email ?? ""));

  const saveConfig = useAdminSaveSiteConfig();

  const save = () => saveConfig.mutate({ ...config, phone, whatsapp, email });

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-0 pt-5 px-5">
        <SectionHeader title="Contact Information" description="Customer-facing contact details." icon={Mail} iconColor="bg-emerald-50 text-emerald-600" />
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
            </Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9" placeholder="+91 88595 38859" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">WhatsApp</Label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="h-9" placeholder="918859538859" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
            </Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" placeholder="care@tuskel.com" />
          </div>
        </div>
        <Button onClick={save} className="h-9"><Save className="mr-2 h-4 w-4" /> Save Contact Info</Button>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-light tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your store configuration</p>
      </div>

      <Tabs defaultValue="announcements" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 h-auto">
          <TabsTrigger value="announcements" className="h-9 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Announcements
          </TabsTrigger>
          <TabsTrigger value="coupons" className="h-9 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Coupons
          </TabsTrigger>
          <TabsTrigger value="shipping" className="h-9 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Shipping
          </TabsTrigger>
          <TabsTrigger value="contact" className="h-9 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Contact
          </TabsTrigger>
        </TabsList>
        <TabsContent value="announcements" className="mt-0">
          <AnnouncementsSection />
        </TabsContent>
        <TabsContent value="coupons" className="mt-0">
          <CouponsSection />
        </TabsContent>
        <TabsContent value="shipping" className="mt-0">
          <ShippingSection />
        </TabsContent>
        <TabsContent value="contact" className="mt-0">
          <ContactSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
