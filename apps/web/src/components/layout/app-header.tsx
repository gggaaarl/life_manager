"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NavLink = {
  href: string;
  label: string;
  exact?: boolean;
};

type Props = {
  showPlayerMenu?: boolean;
  showNutritionMenu?: boolean;
  showFinanceMenu?: boolean;
  showDriverMenu?: boolean;
};

export function AppHeader({
  showPlayerMenu = false,
  showNutritionMenu = false,
  showFinanceMenu = false,
  showDriverMenu = false,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const links: NavLink[] = [
    { href: "/home", label: "Hub" },
    ...(showNutritionMenu ? [{ href: "/nutrition", label: "Nutrición" }] : []),
    ...(showFinanceMenu
      ? [
          { href: "/finance", label: "Finanzas", exact: true },
          { href: "/finance/configuracion", label: "Configuración de finanzas" },
        ]
      : []),
    ...(showDriverMenu ? [{ href: "/driver", label: "Chofer" }] : []),
    ...(showPlayerMenu ? [{ href: "/player/citas", label: "Salidas" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/home"
          className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[0.08em] text-mint sm:text-sm"
        >
          NATURALEZA<span className="text-teal">CRUEL</span>
        </Link>

        <nav className="hidden flex-wrap items-center justify-end gap-1 md:flex lg:flex-nowrap">
          {links.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-2.5 py-2 text-xs font-medium transition lg:px-3 lg:text-sm ${
                  active
                    ? "bg-teal/15 text-teal"
                    : "text-muted hover:bg-panel-hover hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="ml-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-panel-hover hover:text-ink disabled:opacity-60"
          >
            {signingOut ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <HamburgerIcon open={open} />
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-panel md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-3 text-sm font-medium ${
                    active ? "bg-teal/15 text-teal" : "text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="mt-1 rounded-lg px-3 py-3 text-left text-sm text-muted disabled:opacity-60"
            >
              {signingOut ? "Saliendo…" : "Cerrar sesión"}
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-5" aria-hidden="true">
      <span
        className={`absolute left-0 block h-0.5 w-5 bg-ink transition ${
          open ? "top-1.5 rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-ink transition ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 block h-0.5 w-5 bg-ink transition ${
          open ? "top-1.5 -rotate-45" : "top-3"
        }`}
      />
    </span>
  );
}
