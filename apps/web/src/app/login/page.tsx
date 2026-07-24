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
    <main className="grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
      {/* Brand panel — hero composition */}
      <section className="relative hidden overflow-hidden lg:flex">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(145deg, #0b1f1c 0%, #0f3d36 42%, #1f8a7a 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(125,222,203,0.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.12), transparent 35%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
          <p className="text-sm font-medium tracking-[0.2em] text-white/70">
            LIFE OS
          </p>

          <div className="max-w-lg">
            <p className="font-[family-name:var(--font-display)] text-6xl font-bold leading-none tracking-tight">
              life
              <span className="text-[var(--lm-mint)]">manager</span>
            </p>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
              Maneja toda tu vida desde un solo lugar
            </p>
          </div>

          <div className="grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 text-sm text-white/75 sm:grid-cols-3">
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                Nutrición
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                Rutinas
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                Rehabilitación
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                Psicología
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
                Finanzas Personales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form panel — desktop + mobile welcome feel */}
      <section className="flex flex-col bg-white px-6 py-10 sm:px-10 lg:px-16 lg:py-0">
        <div className="mb-10 lg:hidden">
          <p className="text-sm text-muted">Te damos la bienvenida a</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-teal">
            lifemanager
          </p>
          <div className="relative mt-6 overflow-hidden rounded-2xl">
            <div
              className="aspect-[4/3] w-full"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, rgba(11,31,28,0.55), rgba(31,138,122,0.35)), url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute bottom-4 left-4 rounded-xl bg-ink/75 px-3 py-3 text-white backdrop-blur-sm">
              <div className="flex gap-4 text-center text-xs">
                <MacroRing label="Prot" value="32" color="#f59e0b" />
                <MacroRing label="Fat" value="20" color="#a78bfa" />
                <MacroRing label="Carb" value="57" color="#2dd4bf" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-base font-semibold leading-snug text-ink">
            Haz que el progreso consciente sea un hábito para la vida.
          </p>
        </div>

        <div className="flex flex-1 items-center">
          <LoginForm errorMessage={errorMessage} />
        </div>
      </section>
    </main>
  );
}

function MacroRing({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
        style={{
          background: `conic-gradient(${color} 70%, rgba(255,255,255,0.2) 0)`,
        }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/90">
          {value}
        </span>
      </div>
      <span className="opacity-80">{label}</span>
    </div>
  );
}
