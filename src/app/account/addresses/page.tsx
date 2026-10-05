"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Star,
  ArrowLeft,
  Loader2,
  Phone,
  Home,
  Briefcase,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GoogleSignInButton } from "@/components/site/GoogleSignInButton";

interface Address {
  id: string;
  customerId: string;
  label: "Home" | "Work" | "Other";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressFormData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  label: "Home" | "Work" | "Other";
  isDefault: boolean;
}

interface FormErrors {
  fullName?: string | undefined;
  phone?: string | undefined;
  addressLine1?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  pincode?: string | undefined;
}

const emptyForm: AddressFormData = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  label: "Home",
  isDefault: false,
};

const inputClass =
  "min-h-11 w-full border border-border bg-background px-3 py-2 text-[14px] focus:border-foreground focus:outline-none transition-colors";

export default function AccountAddressesPage() {
  const { user, hydrated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/account/addresses");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      if (Array.isArray(data?.addresses)) {
        setAddresses(data.addresses);
      }
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAddresses();
  }, [hydrated, user]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      ...emptyForm,
      fullName: user?.name || "",
      isDefault: addresses.length === 0,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingId(addr.id);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      landmark: addr.landmark || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      label: addr.label,
      isDefault: addr.isDefault,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleInputChange = (field: keyof AddressFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const errorKey = field as keyof FormErrors;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (formData.fullName.trim().length < 2) {
      errs.fullName = "Full name must be at least 2 characters.";
    }
    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (formData.addressLine1.trim().length < 5) {
      errs.addressLine1 = "Street address must be at least 5 characters.";
    }
    if (formData.city.trim().length < 2) {
      errs.city = "City is required.";
    }
    if (formData.state.trim().length < 2) {
      errs.state = "State is required.";
    }
    if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      errs.pincode = "Enter a valid 6-digit PIN code.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || saving) return;

    setSaving(true);
    try {
      const url = editingId
        ? `/api/account/addresses/${editingId}`
        : "/api/account/addresses";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim() || undefined,
          landmark: formData.landmark.trim() || undefined,
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          label: formData.label,
          isDefault: formData.isDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save address.");
      }

      toast.success(editingId ? "Address updated" : "Address saved");
      setDialogOpen(false);
      await fetchAddresses();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");

      toast.success("Default address updated");
      await fetchAddresses();
    } catch {
      toast.error("Failed to set default address.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this saved address?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");

      toast.success("Address removed");
      await fetchAddresses();
    } catch {
      toast.error("Failed to delete address.");
    } finally {
      setDeletingId(null);
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case "Home":
        return <Home className="h-3 w-3" />;
      case "Work":
        return <Briefcase className="h-3 w-3" />;
      default:
        return <Compass className="h-3 w-3" />;
    }
  };

  if (!hydrated) {
    return (
      <div className="shell pb-24">
        <Breadcrumbs items={[{ label: "Account", to: "/account" }, { label: "Saved Addresses" }]} />
        <div className="mt-8 h-12 w-64 animate-pulse bg-secondary" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-4xl">
          <div className="h-48 animate-pulse bg-secondary border border-border" />
          <div className="h-48 animate-pulse bg-secondary border border-border" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="shell pb-24">
        <Breadcrumbs items={[{ label: "Account", to: "/account" }, { label: "Saved Addresses" }]} />
        <div className="py-12 max-w-md">
          <h1 className="font-display text-3xl font-light md:text-4xl">Saved Addresses</h1>
          <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed">
            Sign in to securely store your shipping destinations for effortless one-click checkout.
          </p>
          <div className="mt-8 max-w-xs">
            <GoogleSignInButton />
          </div>
          <div className="mt-6">
            <Link href="/account">
              <Button variant="outline" className="gap-2 text-[11px] tracking-[0.16em] uppercase">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Account", to: "/account" }, { label: "Saved Addresses" }]} />

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mt-4">
        <div>
          <h1 className="font-display text-4xl font-light md:text-5xl">Saved Addresses</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Manage your delivery locations for swift, seamless checkout.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            My Account
          </Link>
          <Button
            onClick={openAddModal}
            className="gap-2 text-[11px] tracking-[0.16em] uppercase"
          >
            <Plus className="h-3.5 w-3.5" /> Add Address
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 max-w-4xl">
          <div className="h-44 animate-pulse bg-secondary border border-border" />
          <div className="h-44 animate-pulse bg-secondary border border-border" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="mt-12 max-w-2xl border border-dashed border-border px-6 py-20 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground opacity-60" />
          <p className="mt-4 font-display text-2xl font-light">No saved addresses</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Add your primary shipping address to enjoy seamless checkout.
          </p>
          <Button
            onClick={openAddModal}
            className="mt-7 gap-2 min-h-12 px-8 text-[11px] tracking-[0.18em] uppercase"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Address
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 max-w-4xl">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "relative flex flex-col justify-between border p-6 transition-all",
                addr.isDefault
                  ? "border-foreground bg-secondary/15"
                  : "border-border bg-background hover:border-foreground/50"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] uppercase font-medium border border-border px-2 py-0.5 rounded-sm">
                      {getLabelIcon(addr.label)}
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 bg-foreground text-primary-foreground px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase font-medium">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Edit address"
                      onClick={() => openEditModal(addr)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete address"
                      disabled={deletingId === addr.id}
                      onClick={() => handleDelete(addr.id)}
                      className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[15px] font-medium">{addr.fullName}</p>
                  <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 && <>, {addr.addressLine2}</>}
                    {addr.landmark && <>, Near {addr.landmark}</>}
                    <br />
                    {addr.city}, {addr.state} — {addr.pincode}
                    <br />
                    {addr.country}
                  </p>
                  <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    +91 {addr.phone}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] font-medium tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Set as default
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] tracking-[0.14em] uppercase text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Primary address
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="top-[10vh] max-w-lg p-0 overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-border px-6 py-5 shrink-0">
            <DialogTitle className="font-display text-2xl font-light">
              {editingId ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              {editingId
                ? "Update your existing delivery details below."
                : "Enter your delivery address for streamlined orders."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
            {/* Address Type Selection */}
            <div>
              <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground block mb-2">
                Address Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Home", "Work", "Other"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange("label", type)}
                    className={cn(
                      "min-h-10 border text-[12px] font-medium uppercase tracking-[0.1em] flex items-center justify-center gap-1.5 transition-colors",
                      formData.label === type
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    )}
                  >
                    {getLabelIcon(type)}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="e.g. Faizan Khan"
                  className={inputClass}
                />
                {errors.fullName && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                  10-Digit Mobile *
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={(e) =>
                    handleInputChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="9876543210"
                  className={inputClass}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                Address Line 1 (Flat, House No., Building, Street) *
              </label>
              <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                placeholder="Flat 402, Tuscan Villa, MG Road"
                className={inputClass}
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-[11px] text-destructive">{errors.addressLine1}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                  Address Line 2 (Area, Colony)
                </label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                  placeholder="Indiranagar"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => handleInputChange("landmark", e.target.value)}
                  placeholder="Near Metro Station"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Bengaluru"
                  className={inputClass}
                />
                {errors.city && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Karnataka"
                  className={inputClass}
                />
                {errors.state && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground block mb-1.5">
                  PIN Code *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.pincode}
                  onChange={(e) =>
                    handleInputChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="560038"
                  className={inputClass}
                />
                {errors.pincode && (
                  <p className="mt-1 text-[11px] text-destructive">{errors.pincode}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-[13px]">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => handleInputChange("isDefault", e.target.checked)}
                  disabled={addresses.length === 0}
                  className="h-4 w-4 rounded-none border-border accent-foreground"
                />
                <span>Set as my default delivery address</span>
              </label>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-end gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
                className="text-[11px] tracking-[0.14em] uppercase"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="min-w-32 text-[11px] tracking-[0.14em] uppercase"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving...
                  </>
                ) : (
                  "Save Address"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
