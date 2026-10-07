import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCustomerSession } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getCustomerSession(req);
    if (!session || !session.email) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const email = session.email.toLowerCase().trim();

    const dbOrders = await prisma.order.findMany({
      where: {
        email,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                fabricLabel: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const orders = dbOrders.map((order) => {
      const items = order.items.map((item) => {
        let image = "";

        // 1. Try images from attached DB product
        if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
          image = String(item.product.images[0]);
        }

        return {
          id: item.id,
          slug: item.slug,
          name: item.name,
          size: item.size,
          qty: item.qty,
          price: item.price,
          image: image || "/placeholder.jpg",
        };
      });

      return {
        id: order.id,
        orderNo: order.orderNo,
        customer: order.customer,
        email: order.email,
        phone: order.phone,
        shippingAddress: order.shippingAddress,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        placedOn: order.placedOn,
        updatedOn: order.updatedOn,
        notes: order.notes,
        createdAt: order.createdAt.toISOString(),
        items,
      };
    });

    return NextResponse.json({ ok: true, orders });
  } catch (error: any) {
    console.error("[/api/account/orders] Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to load order history." },
      { status: 500 }
    );
  }
}
