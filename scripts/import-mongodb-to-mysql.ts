/**
 * Safe One-Time MongoDB -> MySQL Migration Script
 *
 * Requirements:
 * - Reads from MongoDB (READ-ONLY)
 * - Writes/Upserts to MySQL via Prisma
 * - Run only when SOURCE_MONGODB_URI and DATABASE_URL are provided
 *
 * Usage:
 *   SOURCE_MONGODB_URI="mongodb+srv://..." DATABASE_URL="mysql://..." npx tsx scripts/import-mongodb-to-mysql.ts
 */

import { PrismaClient } from "@prisma/client";

async function run() {
  const mongoUri = process.env.SOURCE_MONGODB_URI;
  if (!mongoUri) {
    console.log("[Migration] No SOURCE_MONGODB_URI provided. Skipping MongoDB data import.");
    console.log("[Migration] If you have production MongoDB records to migrate, run:");
    console.log("  SOURCE_MONGODB_URI=\"...\" DATABASE_URL=\"...\" npx tsx scripts/import-mongodb-to-mysql.ts");
    return;
  }

  // Dynamic import of mongodb client if available
  let MongoClient: any;
  try {
    const mongoPkg = await import("mongodb");
    MongoClient = mongoPkg.MongoClient;
  } catch {
    console.error("[Migration] mongodb package is not installed. To run data migration, install mongodb temporarily:");
    console.error("  npm install --no-save mongodb");
    return;
  }

  const prisma = new PrismaClient();
  const mongoClient = new MongoClient(mongoUri);

  try {
    await mongoClient.connect();
    console.log("[Migration] Connected to MongoDB (READ-ONLY mode).");
    const db = mongoClient.db();

    // 1. Migrate Products
    const productsCol = db.collection("products");
    const mongoProducts = await productsCol.find({}).toArray();
    console.log(`[Migration] Found ${mongoProducts.length} products in MongoDB.`);

    for (const p of mongoProducts) {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          fabric: p.fabric || "pure-linen",
          fabricLabel: p.fabricLabel || "Pure Linen",
          colorName: p.colorName || "",
          colorSlug: p.colorSlug || "",
          swatch: p.swatch || "#000",
          mrp: Number(p.mrp || p.price || 0),
          price: Number(p.price || 0),
          images: Array.isArray(p.images) ? p.images : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : ["S", "M", "L", "XL"],
          summary: p.summary || "",
          details: Array.isArray(p.details) ? p.details : [],
          care: Array.isArray(p.care) ? p.care : [],
          fit: p.fit || "",
          modelNote: p.modelNote || "",
          newArrival: Boolean(p.newArrival),
          bestSeller: Boolean(p.bestSeller),
          popularity: Number(p.popularity || 0),
          addedOn: p.addedOn || "",
          stock: Number(p._stock ?? p.stock ?? 0),
          status: p._status ?? p.status ?? "active",
        },
        create: {
          slug: p.slug,
          name: p.name,
          fabric: p.fabric || "pure-linen",
          fabricLabel: p.fabricLabel || "Pure Linen",
          colorName: p.colorName || "",
          colorSlug: p.colorSlug || "",
          swatch: p.swatch || "#000",
          mrp: Number(p.mrp || p.price || 0),
          price: Number(p.price || 0),
          images: Array.isArray(p.images) ? p.images : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : ["S", "M", "L", "XL"],
          summary: p.summary || "",
          details: Array.isArray(p.details) ? p.details : [],
          care: Array.isArray(p.care) ? p.care : [],
          fit: p.fit || "",
          modelNote: p.modelNote || "",
          newArrival: Boolean(p.newArrival),
          bestSeller: Boolean(p.bestSeller),
          popularity: Number(p.popularity || 0),
          addedOn: p.addedOn || "",
          stock: Number(p._stock ?? p.stock ?? 0),
          status: p._status ?? p.status ?? "active",
        },
      });
    }
    console.log(`[Migration] Successfully upserted ${mongoProducts.length} products to MySQL.`);

    // 2. Migrate Categories
    const categoriesCol = db.collection("categories");
    const mongoCategories = await categoriesCol.find({}).toArray();
    console.log(`[Migration] Found ${mongoCategories.length} categories in MongoDB.`);

    for (const c of mongoCategories) {
      await prisma.category.upsert({
        where: { slug: c.slug },
        update: {
          name: c.name,
          description: c.description || "",
          parent: c.parent || null,
          image: c.image || "",
          active: c.active ?? true,
          productCount: Number(c.productCount || 0),
        },
        create: {
          name: c.name,
          slug: c.slug,
          description: c.description || "",
          parent: c.parent || null,
          image: c.image || "",
          active: c.active ?? true,
          productCount: Number(c.productCount || 0),
        },
      });
    }
    console.log(`[Migration] Successfully upserted ${mongoCategories.length} categories to MySQL.`);

    // 3. Migrate Customers
    const customersCol = db.collection("customers");
    const mongoCustomers = await customersCol.find({}).toArray();
    console.log(`[Migration] Found ${mongoCustomers.length} customers in MongoDB.`);

    for (const c of mongoCustomers) {
      if (!c.email) continue;
      await prisma.customer.upsert({
        where: { email: c.email.trim().toLowerCase() },
        update: {
          name: c.name || "",
          phone: c.phone || "",
          orders: Number(c.orders || 0),
          spent: Number(c.spent || 0),
          firstOrder: c.firstOrder || "",
          lastOrder: c.lastOrder || "",
          status: c.status || "active",
        },
        create: {
          name: c.name || "",
          email: c.email.trim().toLowerCase(),
          phone: c.phone || "",
          orders: Number(c.orders || 0),
          spent: Number(c.spent || 0),
          firstOrder: c.firstOrder || "",
          lastOrder: c.lastOrder || "",
          status: c.status || "active",
        },
      });
    }

    // 4. Migrate Orders
    const ordersCol = db.collection("orders");
    const mongoOrders = await ordersCol.find({}).toArray();
    console.log(`[Migration] Found ${mongoOrders.length} orders in MongoDB.`);

    for (const o of mongoOrders) {
      if (!o.orderNo) continue;
      const existing = await prisma.order.findUnique({ where: { orderNo: o.orderNo } });
      if (!existing) {
        await prisma.order.create({
          data: {
            orderNo: o.orderNo,
            customer: o.customer || "",
            email: o.email || "",
            phone: o.phone || "",
            shippingAddress: o.shippingAddress || "",
            subtotal: Number(o.subtotal || 0),
            discount: Number(o.discount || 0),
            shipping: Number(o.shipping || 0),
            total: Number(o.total || 0),
            paymentMethod: o.paymentMethod || "Cash on Delivery",
            paymentStatus: o.paymentStatus || "pending",
            status: o.status || "pending",
            placedOn: o.placedOn || new Date().toISOString().slice(0, 10),
            updatedOn: o.updatedOn || new Date().toISOString().slice(0, 10),
            notes: o.notes || "",
            items: {
              create: Array.isArray(o.items)
                ? o.items.map((it: any) => ({
                    slug: it.slug || "",
                    name: it.name || "",
                    size: it.size || "",
                    qty: Number(it.qty || 1),
                    price: Number(it.price || 0),
                  }))
                : [],
            },
          },
        });
      }
    }

    // 5. Migrate Site Config
    const siteConfigCol = db.collection("site_config");
    const mongoSiteConfig = await siteConfigCol.find({}).toArray();
    for (const sc of mongoSiteConfig) {
      if (sc.key && sc.value) {
        await prisma.siteConfig.upsert({
          where: { key: sc.key },
          update: { value: sc.value },
          create: { key: sc.key, value: sc.value },
        });
      }
    }

    console.log("[Migration] Migration completed successfully!");
  } catch (err) {
    console.error("[Migration] Error during migration:", err);
  } finally {
    await mongoClient.close();
    await prisma.$disconnect();
  }
}

run();
