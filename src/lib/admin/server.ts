import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDb, ProductModel, OrderModel, CustomerModel, SiteConfigModel } from "@/lib/db/models";

// `strict: false` relaxes the handler parameter typing so we can accept `any`
// and run our own Zod validation inside. The runtime behavior (including the
// compiled fetcher) is the same either way.

// ─── Products ────────────────────────────────────────────────────────────────

export const adminGetProducts = createServerFn({ method: "GET", strict: false }).handler(
  async () => {
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
  },
);

export const adminCreateProduct = createServerFn({ method: "POST", strict: false }).handler(
  async (data: any) => {
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
  },
);

export const adminUpdateProduct = createServerFn({ method: "POST", strict: false }).handler(
  async (data: any) => {
    const { slug, ...rest } = z.object({
      slug: z.string(),
      data: z.object({
        name: z.string().optional(), fabric: z.enum(["pure-linen","linen-blend"]).optional(),
        fabricLabel: z.string().optional(), mrp: z.number().positive().optional(),
        price: z.number().positive().optional(), summary: z.string().optional(),
        _status: z.enum(["active","draft","archived"]).optional(),
      }).partial(),
    }).parse(data);
    await connectDb();
    const doc = await ProductModel.findOneAndUpdate({ slug }, { $set: rest }, { new: true }).lean();
    return doc;
  },
);

export const adminDeleteProduct = createServerFn({ method: "POST", strict: false }).handler(
  async (data: any) => {
    const { slug } = z.object({ slug: z.string() }).parse(data);
    await connectDb();
    const result = await ProductModel.deleteOne({ slug });
    return { deleted: result.deletedCount > 0 };
  },
);

// ─── Orders ──────────────────────────────────────────────────────────────────

export const adminGetOrders = createServerFn({ method: "GET", strict: false }).handler(
  async () => {
    await connectDb();
    return OrderModel.find().sort({placedOn: -1}).lean();
  },
);

export const adminUpdateOrderStatus = createServerFn({ method: "POST", strict: false }).handler(
  async (data: any) => {
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
  },
);

// ─── Customers ───────────────────────────────────────────────────────────────

export const adminGetCustomers = createServerFn({ method: "GET", strict: false }).handler(
  async () => {
    await connectDb();
    return CustomerModel.find().sort({createdAt: -1}).lean();
  },
);

// ─── Dashboard stats ─────────────────────────────────────────────────────────

export const adminGetStats = createServerFn({ method: "GET", strict: false }).handler(async () => {
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
});

export const adminGetMonthlyRevenue = createServerFn({ method: "GET", strict: false }).handler(async () => {
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
});

export const adminGetTopProducts = createServerFn({ method: "GET", strict: false }).handler(async (data: any) => {
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
});

export const adminGetRecentOrders = createServerFn({ method: "GET", strict: false }).handler(async (data: any) => {
  const limit = data?.limit ?? 8;
  await connectDb();
  return OrderModel.find().sort({placedOn: -1}).limit(limit).lean();
});

// ─── Site config ─────────────────────────────────────────────────────────────

export const adminGetSiteConfig = createServerFn({ method: "GET", strict: false }).handler(async () => {
  await connectDb();
  const doc = await SiteConfigModel.findOne({ key: "main" }).lean();
  if (doc) return (doc as any).value;
  return {
    announcements: ["Summer Sale — Up to 25% Off", "Free Shipping Across India", "Easy 7-Day Returns"],
    coupons: { TUSKEL10: { off: 0.1, label: "10% off your order" }, SUMMER15: { off: 0.15, label: "15% summer sale discount" } },
    freeShippingThreshold: 0, shippingFlat: 0, returnsWindowDays: 7,
    phone: "8859538859", whatsapp: "918859538859", email: "care@tuskel.com",
  };
});

export const adminSaveSiteConfig = createServerFn({ method: "POST", strict: false }).handler(
  async (data: any) => {
    const { value } = z.object({ value: z.record(z.unknown()) }).parse(data);
    await connectDb();
    await SiteConfigModel.findOneAndUpdate({ key: "main" }, { $set: { value } }, { upsert: true, new: true });
    return { ok: true };
  },
);
