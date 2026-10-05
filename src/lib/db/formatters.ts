export function formatProduct(p: any) {
  if (!p) return null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    fabric: p.fabric,
    fabricLabel: p.fabricLabel,
    colorName: p.colorName,
    colorSlug: p.colorSlug,
    swatch: p.swatch,
    mrp: Number(p.mrp),
    price: Number(p.price),
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    sizes: Array.isArray(p.sizes) ? (p.sizes as string[]) : [],
    summary: p.summary ?? "",
    details: Array.isArray(p.details) ? (p.details as string[]) : [],
    care: Array.isArray(p.care) ? (p.care as string[]) : [],
    fit: p.fit ?? "",
    modelNote: p.modelNote ?? "",
    newArrival: Boolean(p.newArrival),
    bestSeller: Boolean(p.bestSeller),
    popularity: Number(p.popularity ?? 0),
    addedOn: p.addedOn ?? "",
    _stock: Number(p.stock ?? 0),
    stock: Number(p.stock ?? 0),
    _status: (p.status ?? "draft") as "active" | "draft" | "archived",
    status: (p.status ?? "draft") as "active" | "draft" | "archived",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function formatOrder(o: any) {
  if (!o) return null;
  return {
    id: o.id,
    orderNo: o.orderNo,
    customer: o.customer,
    email: o.email,
    phone: o.phone,
    shippingAddress: o.shippingAddress,
    subtotal: Number(o.subtotal),
    discount: Number(o.discount ?? 0),
    shipping: Number(o.shipping ?? 0),
    total: Number(o.total),
    paymentMethod: o.paymentMethod ?? "Cash on Delivery",
    paymentStatus: o.paymentStatus ?? "pending",
    status: o.status ?? "pending",
    placedOn: o.placedOn,
    updatedOn: o.updatedOn,
    notes: o.notes ?? "",
    razorpayOrderId: o.razorpayOrderId ?? null,
    razorpayPaymentId: o.razorpayPaymentId ?? null,
    paymentProvider: o.paymentProvider ?? null,
    paidAt: o.paidAt ? (o.paidAt instanceof Date ? o.paidAt.toISOString() : String(o.paidAt)) : null,
    paymentFailureReason: o.paymentFailureReason ?? null,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    items: Array.isArray(o.items)
      ? o.items.map((it: any) => ({
          slug: it.slug,
          name: it.name,
          size: it.size,
          qty: Number(it.qty),
          price: Number(it.price),
        }))
      : [],
  };
}

export function formatCustomer(c: any) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    orders: Number(c.orders ?? 0),
    spent: Number(c.spent ?? 0),
    firstOrder: c.firstOrder ?? "",
    lastOrder: c.lastOrder ?? "",
    status: c.status ?? "active",
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export function formatCategory(c: any) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    parent: c.parent ?? null,
    image: c.image ?? "",
    active: Boolean(c.active),
    productCount: Number(c.productCount ?? 0),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export function formatInquiry(i: any) {
  if (!i) return null;
  return {
    id: i.id,
    name: i.name,
    email: i.email,
    phone: i.phone ?? "",
    subject: i.subject,
    message: i.message,
    status: i.status ?? "new",
    repliedAt: i.repliedAt ?? null,
    createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt),
  };
}
