import aquaMist from "@/assets/products/aqua-mist.jpg";
import blushPink from "@/assets/products/blush-pink.jpg";
import midnightBlack from "@/assets/products/midnight-black.jpg";
import softTurquoise from "@/assets/products/soft-turquoise.jpg";
import vanillaCream from "@/assets/products/vanilla-cream.jpg";
import classicWhite from "@/assets/products/classic-white.jpg";
import petalPink from "@/assets/products/petal-pink.jpg";
import powderBlue from "@/assets/products/powder-blue.jpg";
import softCream from "@/assets/products/soft-cream.jpg";

import lookOffice from "@/assets/look-office.jpg";
import lookSmartCasual from "@/assets/look-smart-casual.jpg";
import lookWeekend from "@/assets/look-weekend.jpg";
import lookTravel from "@/assets/look-travel.jpg";
import lookEvening from "@/assets/look-evening.jpg";
import collectionPure from "@/assets/collection-pure-linen.jpg";
import collectionBlend from "@/assets/collection-linen-blend.jpg";
import detailCollar from "@/assets/detail-collar.jpg";
import detailCuff from "@/assets/detail-cuff.jpg";

import { SIZES, type Size } from "./site";

export type Fabric = "pure-linen" | "linen-blend";

export interface Product {
  id: string;
  slug: string;
  name: string;
  fabric: Fabric;
  fabricLabel: string;
  colorName: string;
  colorSlug: string;
  swatch: string;
  mrp: number;
  price: number;
  images: string[];
  sizes: Size[];
  /** PROTOTYPE DATA — replace with confirmed catalogue copy */
  summary: string;
  details: string[];
  care: string[];
  fit: string;
  /** PROTOTYPE DATA — model reference, editable */
  modelNote: string;
  newArrival: boolean;
  bestSeller: boolean;
  popularity: number;
  addedOn: string;
}

const pureCare = [
  "Machine wash cold on a gentle cycle with like colours",
  "Do not bleach; wash dark shades separately for the first few washes",
  "Line dry in shade to preserve the fibre",
  "Warm iron while slightly damp for a crisp finish",
];

const blendCare = [
  "Machine wash cold on a gentle cycle",
  "Do not bleach or tumble dry on high heat",
  "Line dry in shade",
  "Warm iron on the reverse side",
];

const pureDetails = [
  "Woven from pure linen with a naturally textured, open weave",
  "Full-length button placket with a single chest pocket",
  "Two-button adjustable cuff and a soft-fused classic collar",
  "Curved hem, wearable tucked or untucked",
];

const blendDetails = [
  "Linen-blend weave with the cool hand of linen and the softness of cotton",
  "Full-length button placket with a single chest pocket",
  "Two-button adjustable cuff and a lightly structured collar",
  "Curved hem, wearable tucked or untucked",
];

function pure(
  slug: string,
  colorName: string,
  colorSlug: string,
  swatch: string,
  images: string[],
  summary: string,
  extra: Partial<Product> = {},
): Product {
  return {
    id: slug,
    slug,
    name: `Tuskel ${colorName} Pure Linen Shirt`,
    fabric: "pure-linen",
    fabricLabel: "Pure Linen",
    colorName,
    colorSlug,
    swatch,
    mrp: 3999,
    price: 2999,
    images,
    sizes: [...SIZES],
    summary,
    details: pureDetails,
    care: pureCare,
    fit: "Regular fit — clean through the chest with a relaxed sleeve.",
    modelNote:
      "Prototype reference: model is 6'0\" / 183 cm and wears size M. Replace with confirmed measurements.",
    newArrival: false,
    bestSeller: false,
    popularity: 60,
    addedOn: "2026-03-01",
    ...extra,
  };
}

function blend(
  slug: string,
  colorName: string,
  colorSlug: string,
  swatch: string,
  images: string[],
  summary: string,
  extra: Partial<Product> = {},
): Product {
  return {
    id: slug,
    slug,
    name: `Tuskel ${colorName} Linen Blend Shirt`,
    fabric: "linen-blend",
    fabricLabel: "Linen Blend",
    colorName,
    colorSlug,
    swatch,
    mrp: 2499,
    price: 1749,
    images,
    sizes: [...SIZES],
    summary,
    details: blendDetails,
    care: blendCare,
    fit: "Regular fit — everyday ease with a lightly tapered body.",
    modelNote:
      "Prototype reference: model is 6'0\" / 183 cm and wears size M. Replace with confirmed measurements.",
    newArrival: false,
    bestSeller: false,
    popularity: 60,
    addedOn: "2026-03-01",
    ...extra,
  };
}

export const products: Product[] = [
  pure(
    "aqua-mist-pure-linen-shirt",
    "Aqua Mist",
    "aqua-mist",
    "#B7DCD9",
    [aquaMist, lookWeekend, detailCollar, detailCuff],
    "A cool, water-clear green-blue that reads calm in strong daylight.",
    { bestSeller: true, popularity: 96, addedOn: "2026-04-12", newArrival: true },
  ),
  pure(
    "blush-pink-pure-linen-shirt",
    "Blush Pink",
    "blush-pink",
    "#EDC3C3",
    [blushPink, collectionPure, detailCollar, detailCuff],
    "A soft, warm pink that sits easily against Indian skin tones.",
    { popularity: 78, addedOn: "2026-03-20" },
  ),
  pure(
    "midnight-black-pure-linen-shirt",
    "Midnight Black",
    "midnight-black",
    "#1C1C1C",
    [midnightBlack, lookEvening, detailCollar, detailCuff],
    "Linen in its sharpest register — matte, deep and evening-ready.",
    { bestSeller: true, popularity: 92, addedOn: "2026-03-28" },
  ),
  pure(
    "soft-turquoise-pure-linen-shirt",
    "Soft Turquoise",
    "soft-turquoise",
    "#9FD5D0",
    [softTurquoise, lookWeekend, detailCollar, detailCuff],
    "A quiet turquoise with enough colour to carry a plain summer wardrobe.",
    { popularity: 84, addedOn: "2026-04-02", newArrival: true },
  ),
  pure(
    "vanilla-cream-pure-linen-shirt",
    "Vanilla Cream",
    "vanilla-cream",
    "#F2E7CF",
    [vanillaCream, lookTravel, detailCollar, detailCuff],
    "The warm neutral that works from an early flight to a late dinner.",
    { bestSeller: true, popularity: 94, addedOn: "2026-03-15" },
  ),
  blend(
    "classic-white-linen-blend-shirt",
    "Classic White",
    "classic-white",
    "#F7F5F0",
    [classicWhite, lookSmartCasual, detailCollar, detailCuff],
    "The shirt every wardrobe returns to, in a cooler, lighter weave.",
    { bestSeller: true, popularity: 98, addedOn: "2026-03-10" },
  ),
  blend(
    "petal-pink-linen-blend-shirt",
    "Petal Pink",
    "petal-pink",
    "#F4CBD1",
    [petalPink, collectionPure, detailCollar, detailCuff],
    "A pale pink with a soft hand — easy under a jacket, easy on its own.",
    { popularity: 70, addedOn: "2026-04-08", newArrival: true },
  ),
  blend(
    "powder-blue-linen-blend-shirt",
    "Powder Blue",
    "powder-blue",
    "#C6D8E8",
    [powderBlue, lookOffice, detailCollar, detailCuff],
    "A boardroom blue that stays composed through a long, warm day.",
    { bestSeller: true, popularity: 90, addedOn: "2026-03-22" },
  ),
  blend(
    "soft-cream-linen-blend-shirt",
    "Soft Cream",
    "soft-cream",
    "#F0E6D6",
    [softCream, collectionBlend, detailCollar, detailCuff],
    "Cream with a gentle warmth — the smart-casual alternative to white.",
    { popularity: 82, addedOn: "2026-04-05", newArrival: true },
  ),
];

export const colours = [
  { name: "Classic White", slug: "classic-white", hex: "#F7F5F0" },
  { name: "Soft Cream", slug: "soft-cream", hex: "#F0E6D6" },
  { name: "Powder Blue", slug: "powder-blue", hex: "#C6D8E8" },
  { name: "Aqua Mist", slug: "aqua-mist", hex: "#B7DCD9" },
  { name: "Blush Pink", slug: "blush-pink", hex: "#EDC3C3" },
  { name: "Petal Pink", slug: "petal-pink", hex: "#F4CBD1" },
  { name: "Soft Turquoise", slug: "soft-turquoise", hex: "#9FD5D0" },
  { name: "Vanilla Cream", slug: "vanilla-cream", hex: "#F2E7CF" },
  { name: "Midnight Black", slug: "midnight-black", hex: "#1C1C1C" },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const byFabric = (fabric: Fabric) => products.filter((p) => p.fabric === fabric);
export const bestSellers = () => products.filter((p) => p.bestSeller);
export const newArrivals = () => products.filter((p) => p.newArrival);

export function relatedTo(product: Product, count = 4) {
  return products
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => {
      const sameFabric = Number(b.fabric === product.fabric) - Number(a.fabric === product.fabric);
      return sameFabric || b.popularity - a.popularity;
    })
    .slice(0, count);
}

/** PROTOTYPE DATA — replace with confirmed garment measurements (inches, garment laid flat). */
export const sizeChart = [
  { size: "S", chest: 40, length: 28, shoulder: 17, sleeve: 24 },
  { size: "M", chest: 42, length: 29, shoulder: 17.5, sleeve: 24.5 },
  { size: "L", chest: 44, length: 30, shoulder: 18, sleeve: 25 },
  { size: "XL", chest: 46, length: 30.5, shoulder: 18.5, sleeve: 25.5 },
  { size: "2XL", chest: 48, length: 31, shoulder: 19, sleeve: 26 },
  { size: "3XL", chest: 50, length: 31.5, shoulder: 19.5, sleeve: 26.5 },
];
