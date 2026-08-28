"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className="rounded-lg border border-line bg-panel px-4 py-2 text-sm font-medium text-ink transition hover:bg-panel/80 disabled:opacity-60"
    >
      {loading ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
