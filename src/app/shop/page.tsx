"use client";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useState, useEffect } from "react";

import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PageHeader } from "@/components/site/PageHeader";
import { ShopView, type SortKey } from "@/components/site/ShopView";

type ShopSearch = { colour?: string; sort?: SortKey };

function ShopContent() {
  const searchParams = useSearchParams();
  const colour = searchParams.get("colour") as any;
  const sort = searchParams.get("sort") as any;
  return (
    <div className="shell pb-24">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <PageHeader
        eyebrow="All Shirts"
        title="The full collection"
        intro="Pure linen and linen blend, cut to the same regular fit and available from S to 3XL."
      />
      <ShopView
        scope="all"
        initialColour={colour || undefined}
        initialSort={sort || "newest"}
        useApi={true}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="shell pb-24 py-12 text-center text-muted-foreground">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
