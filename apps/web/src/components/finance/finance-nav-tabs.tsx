"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/finance", label: "Movimientos", exact: true },
  { href: "/finance/configuracion", label: "Configuración" },
] as const;

export function FinanceNavTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 border-b border-line"
      aria-label="Secciones de finanzas"
    >
      {TABS.map((tab) => {
        const active =
          "exact" in tab && tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              active
                ? "border-teal text-teal"
                : "border-transparent text-muted hover:border-line hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
