import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin — Tuskel",
    template: "%s — Admin",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
