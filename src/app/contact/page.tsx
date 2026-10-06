"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    const emailTrimmed = form.email.trim();
    if (!emailTrimmed) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    const phoneTrimmed = form.phone.trim();
    if (phoneTrimmed) {
      const digits = phoneTrimmed.replace(/\D/g, "");
      const validChars = /^[+]?[\d\s\-()]+$/.test(phoneTrimmed);
      if (!validChars || digits.length < 10 || digits.length > 15) {
        nextErrors.phone = "Please enter a valid phone number (at least 10 digits).";
      }
    }

    if (!form.message.trim()) {
      nextErrors.message = "Please enter your message.";
    }

    return nextErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorMessage = Object.values(validationErrors)[0];
      if (firstErrorMessage) {
        toast.error(firstErrorMessage);
      }
      return;
    }

    setErrors({});

    const phoneValue = form.phone.trim() || "-";
    const subjectValue = form.subject.trim() || "-";

    const messageLines = [
      "Hello Tuskel,",
      "",
      "I have an enquiry from your website.",
      "",
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Phone: ${phoneValue}`,
      `Subject: ${subjectValue}`,
      "",
      "Message:",
      form.message.trim(),
    ];

    const messageText = messageLines.join("\n");
    // Normalize WhatsApp number to digits only (e.g. 918859538859)
    const normalizedWhatsApp = (site.whatsapp || site.phoneDisplay).replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${normalizedWhatsApp}?text=${encodeURIComponent(messageText)}`;

    const newWindow = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!newWindow) {
      window.location.href = whatsappUrl;
    }
  };

  // Ensure single country code display (+91 88595 38859)
  const phoneDisplay = site.phoneDisplay.replace(/^\+91\s*\+91/, "+91");

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
                <a href={`tel:+91${site.phone}`} className="link-underline">{phoneDisplay}</a>
              </div>
              <div>
                <p className="font-medium text-foreground">Address</p>
                <p>{site.address.line1}<br />{site.address.line2}<br />Delhi, India</p>
              </div>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-sm font-medium">Name *</label>
                <Input
                  id="contact-name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  aria-invalid={!!errors.name}
                  className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  placeholder="Your full name"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-sm font-medium">Email *</label>
                <Input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-phone" className="text-sm font-medium">Phone</label>
                <Input
                  id="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  aria-invalid={!!errors.phone}
                  className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                  placeholder="e.g. 9876543210 (optional)"
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-subject" className="text-sm font-medium">Subject</label>
                <Input
                  id="contact-subject"
                  value={form.subject}
                  onChange={(e) => handleFieldChange("subject", e.target.value)}
                  placeholder="What can we help you with?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-message" className="text-sm font-medium">Message *</label>
                <Textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => handleFieldChange("message", e.target.value)}
                  aria-invalid={!!errors.message}
                  className={errors.message ? "border-destructive focus-visible:ring-destructive" : ""}
                  placeholder="Tell us about your enquiry..."
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>
              <Button type="submit">Send on WhatsApp</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
