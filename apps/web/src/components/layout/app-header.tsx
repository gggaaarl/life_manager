"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AppHeader() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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
          onClick={signOut}
          disabled={signingOut}
          className="rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-panel-hover hover:text-ink disabled:opacity-60"
        >
          {signingOut ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </div>
    </header>
  );
}
