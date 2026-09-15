import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

function getAppRedirectUri(): string {
  return "lifemanager://auth/callback";
}

function paramsFromUrl(url: string): URLSearchParams {
  const hash = url.includes("#") ? url.slice(url.indexOf("#") + 1) : "";
  const query = url.includes("?") ? url.slice(url.indexOf("?") + 1).split("#")[0] : "";
  return new URLSearchParams(hash || query);
}

async function createSessionFromUrl(url: string) {
  const params = paramsFromUrl(url);
  const errorDescription = params.get("error_description");
  if (errorDescription) {
    throw new Error(errorDescription);
  }

  const code = params.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return supabase.auth.getSession();
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return supabase.auth.getSession();
  }

  throw new Error("Google no devolvió una sesión. Recarga Expo Go e inténtalo de nuevo.");
}

function authRedirectUrl(): string {
  const site = process.env.EXPO_PUBLIC_SITE_URL ?? "https://life-manager-tau.vercel.app";
  return `${site.replace(/\/$/, "")}/auth/callback?app=mobile`;
}

export function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) {
    return "Confirma tu correo antes de iniciar sesión (revisa tu bandeja).";
  }
  if (lower.includes("invalid login credentials")) {
    return "Email o contraseña incorrectos.";
  }
  if (lower.includes("user already registered")) {
    return "Ese correo ya está registrado. Inicia sesión.";
  }
  return message;
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(mapAuthError(error.message));
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<"session" | "confirm"> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authRedirectUrl(),
    },
  });
  if (error) {
    throw new Error(mapAuthError(error.message));
  }
  return data.session ? "session" : "confirm";
}

export async function signInWithGoogle() {
  const redirectTo = getAppRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("No se recibió URL de autenticación.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success" || !result.url) {
    return null;
  }

  return createSessionFromUrl(result.url);
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
