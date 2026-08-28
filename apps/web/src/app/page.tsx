import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ code?: string; next?: string }>;
};

export default async function RootPage({ searchParams }: Props) {
  const params = await searchParams;

  // Si Supabase devuelve el code en "/" (Site URL), reenvía al callback
  if (params.code) {
    const q = new URLSearchParams();
    q.set("code", params.code);
    if (params.next) q.set("next", params.next);
    redirect(`/auth/callback?${q.toString()}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/finance" : "/login");
}
