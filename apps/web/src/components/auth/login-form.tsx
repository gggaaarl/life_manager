"use client";

import { createClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";

type Props = {
  errorMessage?: string;
};

export function LoginForm({ errorMessage }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLocalError(null);
    setLoading("google");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLocalError(error.message);
      setLoading(null);
    }
  }

  async function signInWithEmail(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setLoading("email");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLocalError(error.message);
      setLoading(null);
      return;
    }
    window.location.href = "/home";
  }

  const error = localError ?? errorMessage;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Inicio de sesión
      </h2>

      <form onSubmit={signInWithEmail} className="mt-6 flex flex-col gap-3">
        <label className="sr-only" htmlFor="email">
          Dirección de email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Dirección de email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-xl border border-line bg-panel px-4 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-teal focus:ring-1 focus:ring-teal/30"
        />

        <label className="sr-only" htmlFor="password">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-line bg-panel px-4 pr-11 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-teal focus:ring-1 focus:ring-teal/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--lm-danger)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading !== null}
          className="mt-1 h-12 w-full rounded-xl bg-teal text-[15px] font-semibold text-white transition hover:bg-teal/90 disabled:opacity-60"
        >
          {loading === "email" ? "Entrando…" : "Inicia sesión"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-wide text-muted">o</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading !== null}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-panel text-[15px] font-medium text-ink transition hover:border-teal/40 hover:bg-panel-hover disabled:opacity-60"
      >
        <GoogleIcon />
        {loading === "google" ? "Redirigiendo…" : "Continuar con Google"}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-6.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="m1 1 22 22" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}
