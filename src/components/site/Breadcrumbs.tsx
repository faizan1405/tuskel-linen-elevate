import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
        <li className="flex items-center gap-1.5">
          <Link to="/" className="link-underline hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </li>
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {item.to && i < items.length - 1 ? (
              <Link to={item.to} className="link-underline hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground" aria-current="page">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
