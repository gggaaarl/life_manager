"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import {
  accountInitial,
  type AccountProfile,
} from "@life-manager/shared/auth/account";

type Props = {
  account: AccountProfile;
};

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5 5 15"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function AppMenu({
  account,
  open,
  signingOut,
  onClose,
  onSignOut,
}: {
  account: AccountProfile;
  open: boolean;
  signingOut: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/50"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-[min(100%,20rem)] flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de cuenta"
      >
        <div className="flex items-center justify-between border-b border-line px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <p className="text-[13px] font-semibold tracking-tight text-ink">
            NATURALEZA<span className="text-teal">CRUEL</span>
          </p>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-panel-hover"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="border-b border-line px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl bg-sand px-3 py-3">
            {account.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={account.avatarUrl}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[14px] font-semibold text-ink">
                {accountInitial(account)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold leading-snug text-ink">
                {account.name ?? "Cuenta"}
              </p>
              {account.email ? (
                <p className="truncate text-[13px] leading-snug text-muted">{account.email}</p>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/trainer"
                onClick={onClose}
                className="flex min-h-11 items-center rounded-xl bg-teal/10 px-3 text-[15px] font-medium text-ink"
              >
                Registrar ejercicio
              </Link>
            </li>
          </ul>
        </nav>

        <div className="border-t border-line px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            className="flex min-h-11 w-full items-center justify-center rounded-xl border border-line px-3 text-[15px] font-medium text-ink hover:bg-panel-hover disabled:opacity-60"
          >
            {signingOut ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </div>
      </aside>
    </div>
  );
}

export function AppHeader({ account }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/trainer" className="text-[13px] font-semibold tracking-tight text-ink sm:text-sm">
            NATURALEZA<span className="text-teal">CRUEL</span>
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-panel-hover md:hidden"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
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
      </header>

      {mounted
        ? createPortal(
            <AppMenu
              account={account}
              open={open}
              signingOut={signingOut}
              onClose={() => setOpen(false)}
              onSignOut={signOut}
            />,
            document.body,
          )
        : null}
    </>
  );
}
