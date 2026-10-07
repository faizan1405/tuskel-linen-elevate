"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  formatProduct,
  formatOrder,
  formatCustomer,
  formatCategory,
  formatInquiry,
} from "@/lib/db/formatters";
import { normalizeImageUrl } from "@/lib/images";
import { ensureProductSchema } from "@/lib/db/ensure-schema";

// ─── Products ────────────────────────────────────────────────────────────────

export async function adminGetProducts() {
  await ensureProductSchema();
  const docs = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return docs.map(formatProduct);
}

export async function adminCreateProduct(data: any) {
  await ensureProductSchema();
  const parsed = z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    sku: z.string().optional().nullable(),
    fabric: z.string().min(1),
    fabricLabel: z.string().min(1),
    colorName: z.string().min(1),
    colorSlug: z.string().min(1),
    swatch: z.string().min(1),
    mrp: z.number().positive(),
    price: z.number().positive(),
    images: z.array(z.string()).default([]),
    sizes: z.array(z.string()).default(["S", "M", "L", "XL", "2XL", "3XL"]),
    summary: z.string().default(""),
    details: z.array(z.string()).default([]),
    care: z.array(z.string()).default([]),
    fit: z.string().default(""),
    modelNote: z.string().default(""),
    newArrival: z.boolean().default(false),
    bestSeller: z.boolean().default(false),
    popularity: z.number().default(0),
    addedOn: z.string().default(""),
    _stock: z.number().optional(),
    stock: z.number().optional(),
    _status: z.enum(["active", "draft", "archived"]).optional(),
    status: z.enum(["active", "draft", "archived"]).optional(),
  }).parse(data);

  const slug =
    parsed.slug?.trim() ||
    parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const rawSku = parsed.sku !== undefined && parsed.sku !== null ? parsed.sku.trim() : null;
  const sku = rawSku && rawSku.length > 0 ? rawSku : null;

  const productPayload = {
    slug,
    sku,
    name: parsed.name,
    fabric: parsed.fabric,
    fabricLabel: parsed.fabricLabel,
    colorName: parsed.colorName,
    colorSlug: parsed.colorSlug,
    swatch: parsed.swatch,
    mrp: parsed.mrp,
    price: parsed.price,
    images: parsed.images.map(normalizeImageUrl),
    sizes: parsed.sizes,
    summary: parsed.summary,
    details: parsed.details,
    care: parsed.care,
    fit: parsed.fit,
    modelNote: parsed.modelNote,
    newArrival: parsed.newArrival,
    bestSeller: parsed.bestSeller,
    popularity: parsed.popularity,
    addedOn: parsed.addedOn,
    stock: parsed._stock ?? parsed.stock ?? 0,
    status: parsed._status ?? parsed.status ?? "draft",
  };

  let doc;
  try {
    doc = await prisma.product.create({
      data: productPayload,
    });
  } catch (createErr: any) {
    const errMsg = String(createErr?.message || "");
    if (errMsg.includes("sku") && (errMsg.includes("does not exist") || errMsg.includes("Unknown column"))) {
      console.warn("[adminCreateProduct] Missing 'sku' column caught on create. Re-ensuring schema...");
      await ensureProductSchema();
      try {
        doc = await prisma.product.create({
          data: productPayload,
        });
      } catch (retryErr) {
        const { sku: _omitted, ...payloadWithoutSku } = productPayload;
        doc = await (prisma.product as any).create({
          data: payloadWithoutSku,
        });
      }
    } else {
      throw createErr;
    }
  }

  return formatProduct(doc);
}

export async function adminUpdateProduct(data: any) {
  await ensureProductSchema();
  const { slug, data: updateFields } = z.object({
    slug: z.string(),
    data: z.object({
      name: z.string().optional(),
      sku: z.string().optional().nullable(),
      fabric: z.string().optional(),
      fabricLabel: z.string().optional(),
      colorName: z.string().optional(),
      colorSlug: z.string().optional(),
      swatch: z.string().optional(),
      mrp: z.number().positive().optional(),
      price: z.number().positive().optional(),
      summary: z.string().optional(),
      images: z.array(z.string()).optional(),
      sizes: z.array(z.string()).optional(),
      details: z.array(z.string()).optional(),
      care: z.array(z.string()).optional(),
      fit: z.string().optional(),
      modelNote: z.string().optional(),
      newArrival: z.boolean().optional(),
      bestSeller: z.boolean().optional(),
      popularity: z.number().optional(),
      addedOn: z.string().optional(),
      _stock: z.number().optional(),
      stock: z.number().optional(),
      _status: z.enum(["active", "draft", "archived"]).optional(),
      status: z.enum(["active", "draft", "archived"]).optional(),
    }).partial(),
  }).parse(data);

  const prismaData: Record<string, any> = {};
  for (const [k, v] of Object.entries(updateFields)) {
    if (v === undefined) continue;
    if (k === "_stock" || k === "stock") {
      prismaData["stock"] = v;
    } else if (k === "_status" || k === "status") {
      prismaData["status"] = v;
    } else if (k === "sku") {
      const rawSku = v !== null && typeof v === "string" ? v.trim() : null;
      prismaData["sku"] = rawSku && rawSku.length > 0 ? rawSku : null;
    } else if (k === "images") {
      prismaData["images"] = Array.isArray(v) ? v.map(normalizeImageUrl) : [];
    } else {
      prismaData[k] = v;
    }
  }

  let doc;
  try {
    doc = await prisma.product.update({
      where: { slug },
      data: prismaData,
    });
  } catch (updateErr: any) {
    const errMsg = String(updateErr?.message || "");
    if (errMsg.includes("sku") && (errMsg.includes("does not exist") || errMsg.includes("Unknown column"))) {
      console.warn("[adminUpdateProduct] Missing 'sku' column caught on update. Re-ensuring schema...");
      await ensureProductSchema();
      try {
        doc = await prisma.product.update({
          where: { slug },
          data: prismaData,
        });
      } catch (retryErr) {
        const { sku: _omitted, ...cleanWithoutSku } = prismaData;
        doc = await prisma.product.update({
          where: { slug },
          data: cleanWithoutSku,
        });
      }
    } else {
      throw updateErr;
    }
  }

  return formatProduct(doc);
}

export async function adminDeleteProduct(data: any) {
  const { slug } = z.object({ slug: z.string() }).parse(data);
  try {
    await prisma.product.delete({
      where: { slug },
    });
    return { deleted: true };
  } catch (err: any) {
    if (err?.code === "P2025") {
      return { deleted: false };
    }
    throw err;
  }
}

export async function adminUploadImage(data: any) {
  // Cloudinary has been removed. Direct file upload is disabled for MVP pending Hostinger persistent storage.
  const { image } = z.object({
    image: z.string(),
    folder: z.string().optional(),
  }).parse(data);

  // If the admin passed an existing URL or asset path, normalize and return it directly
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/") || image.includes("drive.google.com")) {
    return { url: normalizeImageUrl(image) };
  }

  throw new Error("Direct image file uploads are disabled for MVP until Hostinger persistent storage is configured. Please provide an image URL or static asset path.");
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function adminGetOrders() {
  const docs = await prisma.order.findMany({
    orderBy: { placedOn: "desc" },
    include: { items: true },
  });
  return docs.map(formatOrder);
}

export async function adminUpdateOrderStatus(data: any) {
  const { id, status, notes } = z.object({
    id: z.string(),
    status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"]),
    notes: z.string().optional(),
  }).parse(data);

  const updateData: { status: any; updatedOn: string; notes?: string } = {
    status,
    updatedOn: new Date().toISOString().split("T")[0]!,
  };
  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const doc = await prisma.order.update({
    where: { id },
    data: updateData,
    include: { items: true },
  });

  return formatOrder(doc);
}

// ─── Customers ───────────────────────────────────────────────────────────────

export async function adminGetCustomers() {
  const docs = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
  return docs.map(formatCustomer);
}

// ─── Inquiries ───────────────────────────────────────────────────────────────

export async function adminGetInquiries() {
  const docs = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return docs.map(formatInquiry);
}

export async function adminUpdateInquiryStatus(data: any) {
  const { id, status } = z.object({
    id: z.string(),
    status: z.enum(["new", "read", "replied", "closed"]),
  }).parse(data);

  const update: Record<string, unknown> = { status };
  if (status === "replied") {
    update["repliedAt"] = new Date().toISOString().split("T")[0];
  }

  const doc = await prisma.inquiry.update({
    where: { id },
    data: update,
  });

  return formatInquiry(doc);
}

export async function adminDeleteInquiry(data: any) {
  const { id } = z.object({ id: z.string() }).parse(data);
  try {
    await prisma.inquiry.delete({ where: { id } });
    return { deleted: true };
  } catch (err: any) {
    if (err?.code === "P2025") {
      return { deleted: false };
    }
    throw err;
  }
}

// ─── Dashboard stats ─────────────────────────────────────────────────────────

export async function adminGetStats() {
  const activeOrders = await prisma.order.findMany({
    where: {
      status: { notIn: ["cancelled", "returned"] },
    },
  });

  const totalRevenue = activeOrders.reduce((s, o) => s + Number(o.total), 0);
  const uniqueEmails = new Set(activeOrders.map((o) => o.email));

  return {
    totalRevenue,
    totalOrders: activeOrders.length,
    totalCustomers: uniqueEmails.size,
    avgOrderValue: Math.round(totalRevenue / (activeOrders.length || 1)),
    revenueChange: 12.4,
    ordersChange: 8.3,
    customersChange: 5.1,
    aovChange: 3.8,
  };
}

export async function adminGetMonthlyRevenue() {
  const orders = await prisma.order.findMany({
    where: {
      status: { notIn: ["cancelled", "returned"] },
    },
  });

  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data: Record<string, number> = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    data[key] = 0;
  }

  orders.forEach((o) => {
    const d = new Date(o.placedOn);
    const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    if (key in data) {
      data[key] = (data[key] ?? 0) + Number(o.total);
    }
  });

  return data;
}

export async function adminGetTopProducts(data: any) {
  const limit = data?.limit ?? 5;
  const orders = await prisma.order.findMany({
    where: {
      status: { notIn: ["cancelled", "returned"] },
    },
    include: { items: true },
  });

  const sales: Record<string, { name: string; revenue: number; units: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      const s = sales[it.slug] ?? { name: it.name, revenue: 0, units: 0 };
      s.revenue += Number(it.price) * Number(it.qty);
      s.units += Number(it.qty);
      sales[it.slug] = s;
    });
  });

  return Object.values(sales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function adminGetRecentOrders(data: any) {
  const limit = typeof data === "number" ? data : data?.limit ?? 8;
  const docs = await prisma.order.findMany({
    orderBy: { placedOn: "desc" },
    take: limit,
    include: { items: true },
  });
  return docs.map(formatOrder);
}

// ─── Site config ─────────────────────────────────────────────────────────────

export async function adminGetSiteConfig() {
  const doc = await prisma.siteConfig.findUnique({
    where: { key: "main" },
  });

  if (doc && doc.value && typeof doc.value === "object") {
    return doc.value as Record<string, unknown>;
  }

  return {
    announcements: ["Summer Sale — Up to 25% Off", "Free Shipping Across India", "Easy 7-Day Returns"],
    coupons: {
      TUSKEL10: { off: 0.1, label: "10% off your order" },
      SUMMER15: { off: 0.15, label: "15% summer sale discount" },
    },
    freeShippingThreshold: 0,
    shippingFlat: 0,
    returnsWindowDays: 7,
    phone: "8859538859",
    whatsapp: "918859538859",
    email: "tuskelclothingco@gmail.com",
  };
}

export async function adminSaveSiteConfig(data: any) {
  const { value } = z.object({ value: z.record(z.unknown()) }).parse(data);
  await prisma.siteConfig.upsert({
    where: { key: "main" },
    update: { value: value as any },
    create: { key: "main", value: value as any },
  });
  return { ok: true };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function adminGetCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const productCounts = await prisma.product.groupBy({
    by: ["fabric"],
    _count: { id: true },
  });

  const countMap: Record<string, number> = {};
  productCounts.forEach((p) => {
    countMap[p.fabric] = p._count.id;
  });

  return categories.map((c) => {
    let count = c.productCount;
    if (count === 0 && countMap[c.slug]) {
      count = countMap[c.slug] ?? 0;
    }
    return {
      ...formatCategory(c),
      productCount: count,
    };
  });
}

export async function adminCreateCategory(data: any) {
  const parsed = z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    description: z.string().default(""),
    parent: z.string().nullable().default(null),
    image: z.string().default(""),
    active: z.boolean().default(true),
  }).parse(data);

  const slug =
    parsed.slug?.trim() ||
    parsed.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const doc = await prisma.category.create({
    data: {
      name: parsed.name,
      slug,
      description: parsed.description,
      parent: parsed.parent,
      image: parsed.image,
      active: parsed.active,
    },
  });

  return formatCategory(doc);
}

export async function adminUpdateCategory(data: any) {
  const { id, ...rest } = z.object({
    id: z.string(),
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    parent: z.string().nullable().optional(),
    image: z.string().optional(),
    active: z.boolean().optional(),
  }).parse(data);

  const updateData: Record<string, any> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) {
      updateData[k] = v;
    }
  }

  const doc = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  return formatCategory(doc);
}

export async function adminDeleteCategory(data: any) {
  const { id } = z.object({ id: z.string() }).parse(data);
  try {
    await prisma.category.delete({ where: { id } });
    return { deleted: true };
  } catch (err: any) {
    if (err?.code === "P2025") {
      return { deleted: false };
    }
    throw err;
  }
}
