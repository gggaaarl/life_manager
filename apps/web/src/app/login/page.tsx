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
    <main className="relative min-h-dvh overflow-hidden bg-sand text-ink">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 0%, rgba(163,177,138,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 100%, rgba(125,145,104,0.08), transparent 50%)",
        }}
      />

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
      <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,8vw,3.75rem)] font-bold leading-[0.95] tracking-tight text-ink">
        NATURALEZA
        <span className="block text-teal">CRUEL</span>
      </h1>
    </div>
  );
}
