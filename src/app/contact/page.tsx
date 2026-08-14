"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SectionHeading } from "@/components/site/PageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject || "Contact form inquiry",
          message: form.message,
        }),
      });
      if (res.ok) {
        setSent(true);
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        toast.success("Message sent! We&apos;ll get back to you within 24 hours.");
      } else {
        toast.error("Failed to send. Please try again or email us directly.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="py-12 md:py-20">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Get in Touch</p>
            <h1 className="font-display text-4xl font-light md:text-5xl">Contact Us</h1>
            <div className="mt-10 space-y-6 text-[15px] text-muted-foreground">
              <p>Have a question about sizing, fabric, or shipping? We&apos;d love to hear from you.</p>
              <div>
                <p className="font-medium text-foreground">Email</p>
                <a href={`mailto:${site.email}`} className="link-underline">{site.email}</a>
              </div>
              <div>
                <p className="font-medium text-foreground">Phone / WhatsApp</p>
                <a href={`tel:+91${site.phone}`} className="link-underline">+91 {site.phoneDisplay}</a>
              </div>
              <div>
                <p className="font-medium text-foreground">Address</p>
                <p>{site.address.line1}<br />{site.address.line2}<br />Delhi, India</p>
              </div>
            </div>
          </div>
          <div>
            {sent ? (
              <div className="rounded-lg border border-border p-8 text-center">
                <p className="font-display text-2xl font-light">Thank you</p>
                <p className="mt-3 text-muted-foreground">We&apos;ve received your message and will respond within 24 hours.</p>
                <Button onClick={() => setSent(false)} className="mt-6">Send another message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                </div>
                <Button type="submit" disabled={sending}>{sending ? "Sending…" : "Send Message"}</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
