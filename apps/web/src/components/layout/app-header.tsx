"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  accountInitial,
  type AccountProfile,
} from "@life-manager/shared/auth/account";

type Props = {
  account: AccountProfile;
};

export function AppHeader({ account }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/trainer" className="text-[13px] font-semibold tracking-tight text-ink sm:text-sm">
          NATURALEZA<span className="text-teal">CRUEL</span>
        </Link>
        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg text-ink hover:bg-panel-hover md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span className="block h-0.5 w-5 bg-ink" />
          <span className="block h-0.5 w-5 bg-ink" />
          <span className="block h-0.5 w-5 bg-ink" />
        </button>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-panel-hover md:flex"
          onClick={() => setOpen(true)}
        >
          {account.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={account.avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-[12px] font-semibold">
              {accountInitial(account)}
            </span>
          )}
          <span className="max-w-[10rem] truncate text-[13px] text-ink">{account.email ?? account.name}</span>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="text-[13px] font-semibold tracking-tight">
                NATURALEZA<span className="text-teal">CRUEL</span>
              </p>
              <button type="button" className="text-[15px] text-muted" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              {account.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={account.avatarUrl}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand text-[15px] font-semibold text-ink">
                  {accountInitial(account)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink">{account.name ?? "Cuenta"}</p>
                {account.email ? <p className="truncate text-[13px] text-muted">{account.email}</p> : null}
              </div>
            </div>

            <nav className="flex-1 px-3 py-3">
              <Link
                href="/trainer"
                onClick={() => setOpen(false)}
                className="block rounded-xl bg-sand px-3 py-3 text-[15px] font-medium text-ink"
              >
                Registrar ejercicio
              </Link>
            </nav>

            <div className="border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="text-[15px] text-muted hover:text-ink disabled:opacity-60"
              >
                {signingOut ? "Saliendo…" : "Cerrar sesión"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
