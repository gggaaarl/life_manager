"use client";

import { useEffect } from "react";

type SessionDebugLogProps = {
  page: string;
  userId: string;
  email?: string | null;
  role?: string | null;
  experimentalProfiles?: string[] | null;
};

export function SessionDebugLog({
  page,
  userId,
  email,
  role,
  experimentalProfiles,
}: SessionDebugLogProps) {
  useEffect(() => {
    console.group(`[Life Manager] ${page}`);
    console.log("Código de usuario:", userId);
    console.log("Email:", email ?? "(sin email)");
    console.log("Rol:", role ?? "(sin rol)");
    console.log("Perfiles experimentales:", experimentalProfiles ?? []);
    console.groupEnd();
  }, [page, userId, email, role, experimentalProfiles]);

  return null;
}

type CitasDebugLogProps = {
  userId: string;
  citasCount: number;
  queryError: string | null;
};

export function CitasDebugLog({ userId, citasCount, queryError }: CitasDebugLogProps) {
  useEffect(() => {
    console.group("[Life Manager] PLAYER / citas");
    console.log("Código de usuario:", userId);
    console.log("Citas encontradas:", citasCount);

    if (queryError) {
      console.error("Error al leer citas desde Supabase:", queryError);
    } else if (citasCount === 0) {
      console.warn("Sin citas todavía — la lectura funcionó, pero no hay filas.");
    } else {
      console.log("Lectura OK — citas cargadas.");
    }

    console.groupEnd();
  }, [userId, citasCount, queryError]);

  return null;
}
