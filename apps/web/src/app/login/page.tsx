import { LoginForm } from "@/components/auth/login-form";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorMessage =
    params.error === "auth"
      ? "No se pudo completar el inicio de sesión. Intenta de nuevo."
      : params.error === "config"
        ? "Faltan variables de Supabase en Vercel. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
        : undefined;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-void text-ink">
      <BioBackground />

      <div className="relative z-10 mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-2 lg:gap-8">
        <section className="flex flex-col justify-center px-6 pb-4 pt-10 sm:px-10 lg:px-12 lg:py-12">
          <BrandMark />
        </section>

        <section className="flex flex-col justify-center px-6 pb-10 sm:px-10 lg:px-12 lg:py-12">
          <LoginForm errorMessage={errorMessage} />
        </section>
      </div>
    </main>
  );
}

function BrandMark() {
  return (
    <div className="max-w-md">
      <div
        className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-teal/30 bg-teal/10"
        aria-hidden
      >
        <svg viewBox="0 0 40 40" className="h-8 w-8 text-mint" fill="currentColor">
          <path d="M20 4c-2 6-8 10-8 16a8 8 0 1 0 16 0c0-6-6-10-8-16z" opacity="0.9" />
          <circle cx="20" cy="22" r="3" className="text-teal" fill="currentColor" />
        </svg>
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,8vw,3.75rem)] font-bold leading-[0.95] tracking-tight">
        naturaleza
        <span className="block text-mint">CRUEL</span>
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
        Sistema vivo. Datos, cuerpo y capital en un solo organismo.
      </p>
    </div>
  );
}

function BioBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(42,157,138,0.18), transparent 50%), radial-gradient(ellipse 60% 50% at 85% 80%, rgba(94,234,212,0.08), transparent 45%), linear-gradient(180deg, #040807 0%, #080f0e 40%, #050a09 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 Q70 30 50 50 Q30 70 50 90 Q70 70 50 50 Q30 30 50 10' fill='none' stroke='%235eead4' stroke-width='0.5'/%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
        }}
      />
    </>
  );
}
