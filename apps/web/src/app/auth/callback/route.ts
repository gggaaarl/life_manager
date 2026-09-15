import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/trainer";
  const type = searchParams.get("type");
  const fromMobile = searchParams.get("app") === "mobile";

  if (fromMobile) {
    return new NextResponse(
      "<!doctype html><title>Listo</title><p>Ya puedes volver a la app.</p>",
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (type === "signup" || type === "email") {
        return NextResponse.redirect(`${origin}/login?message=confirmed`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
