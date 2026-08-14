import mongoose from "mongoose";
import { ProductModel } from "../src/lib/db/models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://faizankhan1405_db_user:yRZ9pMjdRFrMJzqT@cluster0.2tokikk.mongodb.net/tuskel?retryWrites=true&w=majority";

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const count = await ProductModel.countDocuments({});
    console.log(`Existing products: ${count}`);

    if (count > 0) {
      console.log("Products already exist, skipping seed.");
      await mongoose.disconnect();
      return;
    }

    const products = [
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
        status: "active"
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
        status: "active"
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
        status: "active"
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
        status: "active"
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
        status: "active"
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
        status: "active"
      }
    ];

    await ProductModel.insertMany(products);
    console.log(`Seeded ${products.length} products successfully!`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error: any) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
}

seed();
