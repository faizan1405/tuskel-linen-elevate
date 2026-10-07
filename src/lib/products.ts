import { SIZES, type Size } from "./site";

export type Fabric = "pure-linen" | "linen-blend";

export interface Product {
  id: string;
  slug: string;
  sku?: string | null;
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
  summary: string;
  details: string[];
  care: string[];
  fit: string;
  modelNote: string;
  newArrival: boolean;
  bestSeller: boolean;
  popularity: number;
  addedOn: string;
}

export const products: Product[] = [];
export const colours: { name: string; slug: string; hex: string }[] = [];

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

export const sizeChart = [
  { size: "S", chest: 40, length: 28, shoulder: 17, sleeve: 24 },
  { size: "M", chest: 42, length: 29, shoulder: 17.5, sleeve: 24.5 },
  { size: "L", chest: 44, length: 30, shoulder: 18, sleeve: 25 },
  { size: "XL", chest: 46, length: 30.5, shoulder: 18.5, sleeve: 25.5 },
  { size: "2XL", chest: 48, length: 31, shoulder: 19, sleeve: 26 },
  { size: "3XL", chest: 50, length: 31.5, shoulder: 19.5, sleeve: 26.5 },
];
