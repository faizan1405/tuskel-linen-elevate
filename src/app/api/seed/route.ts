import { NextResponse } from "next/server";
import { connectDb, ProductModel } from "@/lib/db/models";

export const dynamic = "force-dynamic";

const seedProducts = [
  {
    name: "Linen Saree - Pure White",
    slug: "linen-saree-01",
    fabric: "pure-linen",
    fabricLabel: "Pure Linen",
    colorName: "White",
    colorSlug: "white",
    swatch: "#f8f6f2",
    mrp: 4999,
    price: 3499,
    images: [
      "https://images.unsplash.com/photo-1610030229983-ef3b4cd46ae8?w=800",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=800",
      "https://images.unsplash.com/photo-1594444202273-076b0e2f5d54?w=800"
    ],
    sizes: ["S", "M", "L", "XL"],
    summary: "Elegant pure linen saree crafted from 100% premium linen. Lightweight, breathable, and perfect for every occasion.",
    details: [
      "100% pure linen fabric",
      "Handwoven craftsmanship",
      "Lightweight and breathable",
      "Perfect for summer wear",
      "Dry clean recommended"
    ],
    care: ["Hand wash in cold water", "Do not bleach", "Iron on low heat", "Dry clean recommended"],
    fit: "Regular fit",
    modelNote: "Model is 5'7\" and wears size M",
    newArrival: true,
    bestSeller: false,
    popularity: 100,
    _status: "active",
    stock: 100
  },
  {
    name: "Linen Saree - Sage Green",
    slug: "linen-saree-02",
    fabric: "pure-linen",
    fabricLabel: "Pure Linen",
    colorName: "Sage Green",
    colorSlug: "sage-green",
    swatch: "#9CAF88",
    mrp: 5299,
    price: 3799,
    images: [
      "https://images.unsplash.com/photo-1610030229983-ef3b4cd46ae8?w=800",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=800"
    ],
    sizes: ["S", "M", "L", "XL"],
    summary: "Beautiful sage green linen saree with subtle texture. A must-have for your wardrobe.",
    details: [
      "100% pure linen",
      "Sage green color",
      "Subtle texture finish",
      "Handcrafted border"
    ],
    care: ["Hand wash recommended", "Do not bleach", "Iron on medium heat"],
    fit: "Regular fit",
    modelNote: "Model is 5'7\" and wears size M",
    newArrival: true,
    bestSeller: false,
    popularity: 90,
    _status: "active",
    stock: 100
  },
  {
    name: "Linen Blend Saree - Blush Pink",
    slug: "linen-blend-saree-01",
    fabric: "linen-blend",
    fabricLabel: "Linen Blend",
    colorName: "Blush Pink",
    colorSlug: "blush-pink",
    swatch: "#F4C2C2",
    mrp: 4499,
    price: 2999,
    images: [
      "https://images.unsplash.com/photo-1594444202273-076b0e2f5d54?w=800",
      "https://images.unsplash.com/photo-1610030229983-ef3b4cd46ae8?w=800"
    ],
    sizes: ["S", "M", "L", "XL"],
    summary: "Soft blush pink linen blend saree with a beautiful drape. Comfort meets elegance.",
    details: [
      "Linen-cotton blend",
      "Blush pink shade",
      "Beautiful drape",
      "Easy care fabric"
    ],
    care: ["Machine wash cold", "Do not bleach", "Tumble dry low"],
    fit: "Regular fit",
    modelNote: "Model is 5'7\" and wears size M",
    newArrival: false,
    bestSeller: true,
    popularity: 95,
    _status: "active",
    stock: 100
  },
  {
    name: "Linen Saree - Navy Blue",
    slug: "linen-saree-03",
    fabric: "pure-linen",
    fabricLabel: "Pure Linen",
    colorName: "Navy Blue",
    colorSlug: "navy-blue",
    swatch: "#1B2A4A",
    mrp: 5499,
    price: 3999,
    images: [
      "https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=800",
      "https://images.unsplash.com/photo-1610030229983-ef3b4cd46ae8?w=800"
    ],
    sizes: ["S", "M", "L", "XL"],
    summary: "Sophisticated navy blue linen saree for formal occasions. Timeless elegance.",
    details: [
      "100% pure linen",
      "Deep navy blue",
      "Elegant gold border",
      "Perfect for formal events"
    ],
    care: ["Hand wash in cold water", "Do not bleach", "Iron on low heat"],
    fit: "Regular fit",
    modelNote: "Model is 5'7\" and wears size M",
    newArrival: false,
    bestSeller: true,
    popularity: 85,
    _status: "active",
    stock: 100
  },
  {
    name: "Linen Blend Saree - Mustard Yellow",
    slug: "linen-blend-saree-02",
    fabric: "linen-blend",
    fabricLabel: "Linen Blend",
    colorName: "Mustard Yellow",
    colorSlug: "mustard-yellow",
    swatch: "#F4A460",
    mrp: 4699,
    price: 3299,
    images: [
      "https://images.unsplash.com/photo-1610030229983-ef3b4cd46ae8?w=800",
      "https://images.unsplash.com/photo-1594444202273-076b0e2f5d54?w=800"
    ],
    sizes: ["S", "M", "L", "XL"],
    summary: "Vibrant mustard yellow linen blend saree. Stand out with this beautiful piece.",
    details: [
      "Linen-cotton blend",
      "Mustard yellow",
      "Comfortable drape",
      "Versatile styling"
    ],
    care: ["Machine wash cold", "Do not bleach"],
    fit: "Regular fit",
    modelNote: "Model is 5'7\" and wears size M",
    newArrival: true,
    bestSeller: false,
    popularity: 75,
    _status: "active",
    stock: 100
  },
  {
    name: "Linen Saree - Terracotta",
    slug: "linen-saree-04",
    fabric: "pure-linen",
    fabricLabel: "Pure Linen",
    colorName: "Terracotta",
    colorSlug: "terracotta",
    swatch: "#E2725B",
    mrp: 5199,
    price: 3699,
    images: [
      "https://images.unsplash.com/photo-1594444202273-076b0e2f5d54?w=800",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=800"
    ],
    sizes: ["S", "M", "L", "XL"],
    summary: "Warm terracotta linen saree with earthy tones. Perfect for festive occasions.",
    details: [
      "100% pure linen",
      "Terracotta color",
      "Earthy texture",
      "Festive collection"
    ],
    care: ["Hand wash recommended", "Do not bleach"],
    fit: "Regular fit",
    modelNote: "Model is 5'7\" and wears size M",
    newArrival: true,
    bestSeller: false,
    popularity: 80,
    _status: "active",
    stock: 100
  }
];

export async function POST(req: Request) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const reset = searchParams.get("reset") === "true";
    if (reset) {
      await ProductModel.deleteMany({});
    }
    const existing = await ProductModel.countDocuments({});
    if (existing > 0) {
      const all = await ProductModel.find({}).lean();
      return NextResponse.json({
        message: "Products already exist",
        count: existing,
        products: all
      });
    }
    const inserted = await ProductModel.insertMany(seedProducts);
    return NextResponse.json({
      message: "Products seeded successfully",
      count: inserted.length,
      products: inserted
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDb();
    const existing = await ProductModel.countDocuments({});
    return NextResponse.json({ count: existing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
