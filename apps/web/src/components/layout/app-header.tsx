"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NavJob } from "@life-manager/shared/game/job-nav";

type Props = {
  userJobs?: NavJob[];
};

const FINANCE_LINKS = [
  { href: "/finance", label: "Movimientos", exact: true },
  { href: "/finance/configuracion", label: "Configuración de finanzas", exact: false },
] as const;

export function AppHeader({ userJobs = [] }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const financeRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setFinanceOpen(false);
    setJobsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (financeRef.current && !financeRef.current.contains(target)) {
        setFinanceOpen(false);
      }
      if (jobsRef.current && !jobsRef.current.contains(target)) {
        setJobsOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const financeActive =
    pathname === "/finance" || pathname.startsWith("/finance/");

  const jobsActive = userJobs.some(
    (job) => pathname === job.href || pathname.startsWith(`${job.href}/`),
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/finance"
          className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[0.08em] text-mint sm:text-sm"
        >
          NATURALEZA<span className="text-teal">CRUEL</span>
        </Link>

        <nav className="hidden items-center justify-end gap-1 md:flex">
          <div ref={financeRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setFinanceOpen((value) => !value);
                setJobsOpen(false);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                financeActive || financeOpen
                  ? "bg-teal/15 text-teal"
                  : "text-muted hover:bg-panel-hover hover:text-ink"
              }`}
              aria-expanded={financeOpen}
            >
              Finanzas ▾
            </button>
            {financeOpen ? (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-[14rem] rounded-lg border border-line bg-panel py-1 shadow-lg">
                {FINANCE_LINKS.map((link) => {
                  const active = link.exact
                    ? pathname === link.href
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2 text-sm ${
                        active
                          ? "bg-teal/10 font-medium text-teal"
                          : "text-ink hover:bg-sand/80"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          {userJobs.length > 0 ? (
            <div ref={jobsRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setJobsOpen((value) => !value);
                  setFinanceOpen(false);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  jobsActive || jobsOpen
                    ? "bg-teal/15 text-teal"
                    : "text-muted hover:bg-panel-hover hover:text-ink"
                }`}
                aria-expanded={jobsOpen}
              >
                Mis trabajos ▾
              </button>
              {jobsOpen ? (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] rounded-lg border border-line bg-panel py-1 shadow-lg">
                  {userJobs.map((job) => {
                    const active =
                      pathname === job.href || pathname.startsWith(`${job.href}/`);
                    return (
                      <Link
                        key={job.code}
                        href={job.href}
                        className={`block px-4 py-2 text-sm capitalize ${
                          active
                            ? "bg-teal/10 font-medium text-teal"
                            : "text-ink hover:bg-sand/80"
                        }`}
                      >
                        {job.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

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
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Finanzas
            </p>
            {FINANCE_LINKS.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-5 py-2.5 text-sm ${
                    active ? "bg-teal/15 font-medium text-teal" : "text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {userJobs.length > 0 ? (
              <>
                <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  Mis trabajos
                </p>
                {userJobs.map((job) => {
                  const active =
                    pathname === job.href || pathname.startsWith(`${job.href}/`);
                  return (
                    <Link
                      key={job.code}
                      href={job.href}
                      className={`rounded-lg px-5 py-2.5 text-sm capitalize ${
                        active ? "bg-teal/15 text-teal" : "text-ink"
                      }`}
                    >
                      {job.label}
                    </Link>
                  );
                })}
              </>
            ) : null}
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
