"use server";

import { z } from "zod";
import { connectDb, ProductModel, OrderModel, CustomerModel, SiteConfigModel, InquiryModel, CategoryModel } from "@/lib/db/models";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

// ─── Products ────────────────────────────────────────────────────────────────

export async function adminGetProducts() {
    await connectDb();
    const docs = await ProductModel.find().sort({createdAt: -1}).lean();
    return docs.map((d: any) => ({
      id: String(d._id), slug: d.slug, name: d.name, fabric: d.fabric, fabricLabel: d.fabricLabel,
      colorName: d.colorName, colorSlug: d.colorSlug, swatch: d.swatch,
      mrp: d.mrp, price: d.price, images: d.images, sizes: d.sizes,
      summary: d.summary, details: d.details, care: d.care, fit: d.fit, modelNote: d.modelNote,
      newArrival: d.newArrival, bestSeller: d.bestSeller, popularity: d.popularity,
      addedOn: d.addedOn, _stock: d._stock ?? 0, _status: d._status ?? "draft",
    }));
}

export async function adminCreateProduct(data: any) {
    const parsed = z.object({
      name: z.string().min(1), fabric: z.enum(["pure-linen","linen-blend"]),
      fabricLabel: z.string().min(1), colorName: z.string().min(1), colorSlug: z.string().min(1),
      swatch: z.string().min(1), mrp: z.number().positive(), price: z.number().positive(),
      images: z.array(z.string()).default([]),
      sizes: z.array(z.string()).default(["S","M","L","XL","2XL","3XL"]),
      summary: z.string().default(""), details: z.array(z.string()).default([]),
      care: z.array(z.string()).default([]), fit: z.string().default(""), modelNote: z.string().default(""),
      newArrival: z.boolean().default(false), bestSeller: z.boolean().default(false),
      popularity: z.number().default(0), addedOn: z.string().default(""),
      _stock: z.number().default(0), _status: z.enum(["active","draft","archived"]).default("draft"),
    }).parse(data);
    await connectDb();
    const doc = await ProductModel.create(parsed);
    return doc.toObject();
}

export async function adminUpdateProduct(data: any) {
    const { slug, data: updateFields } = z.object({
      slug: z.string(),
      data: z.object({
        name: z.string().optional(), fabric: z.enum(["pure-linen","linen-blend"]).optional(),
        fabricLabel: z.string().optional(), colorName: z.string().optional(), colorSlug: z.string().optional(),
        swatch: z.string().optional(), mrp: z.number().positive().optional(),
        price: z.number().positive().optional(), summary: z.string().optional(),
        images: z.array(z.string()).optional(), sizes: z.array(z.string()).optional(),
        details: z.array(z.string()).optional(), care: z.array(z.string()).optional(),
        fit: z.string().optional(), modelNote: z.string().optional(),
        newArrival: z.boolean().optional(), bestSeller: z.boolean().optional(),
        popularity: z.number().optional(), addedOn: z.string().optional(),
        _stock: z.number().optional(), _status: z.enum(["active","draft","archived"]).optional(),
      }).partial(),
    }).parse(data);
    await connectDb();
    const doc = await ProductModel.findOneAndUpdate({ slug }, { $set: updateFields }, { new: true }).lean();
    return doc;
}

export async function adminDeleteProduct(data: any) {
    const { slug } = z.object({ slug: z.string() }).parse(data);
    await connectDb();
    const doc = await ProductModel.findOne({ slug }).lean();
    if (doc?.images) {
      for (const url of doc.images) {
        try {
          const pubId = (url.split("/").slice(-1)[0] || "").split(".")[0];
          if (pubId) await deleteImage(pubId);
        } catch {}
      }
    }
    const result = await ProductModel.deleteOne({ slug });
    return { deleted: result.deletedCount > 0 };
}

export async function adminUploadImage(data: any) {
    const { image, folder } = z.object({
      image: z.string(),
      folder: z.string().default("tuskel/products"),
    }).parse(data);
    const result = await uploadImage(image, { folder });
    return { url: result.secure_url, publicId: result.public_id };
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function adminGetOrders() {
    await connectDb();
    return OrderModel.find().sort({placedOn: -1}).lean().then(docs => docs.map((d: any) => ({ ...d, id: String(d._id) })));
}

export async function adminUpdateOrderStatus(data: any) {
    const { id, status, notes } = z.object({
      id: z.string(),
      status: z.enum(["pending","confirmed","processing","shipped","delivered","cancelled","returned"]),
      notes: z.string().optional(),
    }).parse(data);
    await connectDb();
    const doc = await OrderModel.findByIdAndUpdate(id, {
      status, notes: notes ?? undefined,
      updatedOn: new Date().toISOString().split("T")[0],
    }, { new: true }).lean();
    return doc;
}

// ─── Customers ───────────────────────────────────────────────────────────────

export async function adminGetCustomers() {
    await connectDb();
    return CustomerModel.find().sort({createdAt: -1}).lean().then(docs => docs.map((d: any) => ({ ...d, id: String(d._id) })));
}

// ─── Inquiries ───────────────────────────────────────────────────────────────

export async function adminGetInquiries() {
    await connectDb();
    return InquiryModel.find().sort({createdAt: -1}).lean().then(docs => docs.map((d: any) => ({ ...d, id: String(d._id) })));
}

export async function adminUpdateInquiryStatus(data: any) {
    const { id, status } = z.object({
      id: z.string(),
      status: z.enum(["new", "read", "replied", "closed"]),
    }).parse(data);
    await connectDb();
    const update: Record<string, unknown> = { status };
    if (status === "replied") update["repliedAt"] = new Date().toISOString().split("T")[0];
    const doc = await InquiryModel.findByIdAndUpdate(id, update, { new: true }).lean();
    return doc;
}

export async function adminDeleteInquiry(data: any) {
    const { id } = z.object({ id: z.string() }).parse(data);
    await connectDb();
    const result = await InquiryModel.deleteOne({ _id: id });
    return { deleted: result.deletedCount > 0 };
}

// ─── Dashboard stats ─────────────────────────────────────────────────────────

export async function adminGetStats() {
  await connectDb();
  const activeOrders = await OrderModel.find({
    status: { $nin: ["cancelled", "returned"] },
  }).lean();
  const totalRevenue = (activeOrders as any[]).reduce((s: number, o: any) => s + o.total, 0);
  const uniqueEmails = new Set((activeOrders as any[]).map((o: any) => o.email));
  return {
    totalRevenue, totalOrders: activeOrders.length,
    totalCustomers: uniqueEmails.size,
    avgOrderValue: Math.round(totalRevenue / (activeOrders.length || 1)),
    revenueChange: 12.4, ordersChange: 8.3, customersChange: 5.1, aovChange: 3.8,
  };
}
export async function adminGetMonthlyRevenue() {
  await connectDb();
  const orders = await OrderModel.find({
    status: { $nin: ["cancelled", "returned"] },
  }).lean();
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const data: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    data[key] = 0;
  }
  (orders as any[]).forEach((o: any) => {
    const d = new Date(o.placedOn);
    const key = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    if (key in data) data[key] += o.total;
  });
  return data;
}
export async function adminGetTopProducts(data: any) {
  const limit = data?.limit ?? 5;
  await connectDb();
  const orders = await OrderModel.find({
    status: { $nin: ["cancelled", "returned"] },
  }).lean();
  const sales: Record<string, { name: string; revenue: number; units: number }> = {};
  (orders as any[]).forEach((o: any) => {
    o.items.forEach((it: any) => {
      const s = sales[it.slug] ?? { name: it.name, revenue: 0, units: 0 };
      s.revenue += it.price * it.qty;
      s.units += it.qty;
      sales[it.slug] = s;
    });
  });
  return Object.values(sales).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}
export async function adminGetRecentOrders(data: any) {
  const limit = typeof data === 'number' ? data : data?.limit ?? 8;
  await connectDb();
  return OrderModel.find().sort({placedOn: -1}).limit(limit).lean();
}
// ─── Site config ─────────────────────────────────────────────────────────────

export async function adminGetSiteConfig() {
  await connectDb();
  const doc = await SiteConfigModel.findOne({ key: "main" }).lean();
  if (doc) return (doc as any).value;
  return {
    announcements: ["Summer Sale — Up to 25% Off", "Free Shipping Across India", "Easy 7-Day Returns"],
    coupons: { TUSKEL10: { off: 0.1, label: "10% off your order" }, SUMMER15: { off: 0.15, label: "15% summer sale discount" } },
    freeShippingThreshold: 0, shippingFlat: 0, returnsWindowDays: 7,
    phone: "8859538859", whatsapp: "918859538859", email: "care@tuskel.com",
  };
}
export async function adminSaveSiteConfig(data: any) {
    const { value } = z.object({ value: z.record(z.unknown()) }).parse(data);
    await connectDb();
    await SiteConfigModel.findOneAndUpdate({ key: "main" }, { $set: { value } }, { upsert: true, new: true });
    return { ok: true };
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function adminGetCategories() {
  await connectDb();
  const categories = await CategoryModel.find().sort({ name: 1 }).lean();
  const productCounts = await ProductModel.aggregate([
    { $group: { _id: "$fabric", count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = {};
  productCounts.forEach((p: any) => { countMap[p._id] = p.count; });
  return categories.map((c: any) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    parent: c.parent || null,
    image: c.image || "",
    active: c.active ?? true,
    productCount: c.productCount ?? 0,
  }));
}

export async function adminCreateCategory(data: any) {
  const parsed = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().default(""),
    parent: z.string().nullable().default(null),
    image: z.string().default(""),
    active: z.boolean().default(true),
  }).parse(data);
  await connectDb();
  const doc = await CategoryModel.create({
    ...parsed,
    slug: parsed.slug || parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  });
  return doc.toObject();
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
  await connectDb();
  const doc = await CategoryModel.findByIdAndUpdate(id, { $set: rest }, { new: true }).lean();
  return doc;
}

export async function adminDeleteCategory(data: any) {
  const { id } = z.object({ id: z.string() }).parse(data);
  await connectDb();
  const result = await CategoryModel.deleteOne({ _id: id });
  return { deleted: result.deletedCount > 0 };
}
