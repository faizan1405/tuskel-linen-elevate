/**
 * TUSKEL — configurable business information.
 * PROTOTYPE DATA: replace the values marked `editable` with confirmed details.
 */
export const site = {
  name: "TUSKEL",
  tagline: "Made for warmer days. Designed for sharper ones.",
  description:
    "Premium linen shirts crafted for effortless comfort, refined style and modern living.",
  phone: "8859538859",
  phoneDisplay: "+91 88595 38859",
  whatsapp: "918859538859",
  /** editable — awaiting confirmed official address */
  email: "care@tuskel.com",
  emailIsPlaceholder: true,
  address: {
    line1: "B-5/108, Yamuna Vihar",
    line2: "Delhi – 110053, India",
  },
  /** editable */
  hours: "Monday to Saturday, 10:00 – 18:00 IST",
  freeShippingThreshold: 0,
  shippingFlat: 0,
  returnsWindowDays: 7,
  announcements: [
    "Summer Sale — Up to 25% Off",
    "Free Shipping Across India",
    "Easy 7-Day Returns",
  ],
} as const;

export const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"] as const;
export type Size = (typeof SIZES)[number];
