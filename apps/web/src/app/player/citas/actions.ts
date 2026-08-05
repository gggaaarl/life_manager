"use server";

import { createClient } from "@/lib/supabase/server";
import { canAccessPlayerMenu, getProfileAccess } from "@/lib/player/access";
import {
  COMENTARIO_TIPOS,
  PLAYER_COLORS,
  PLAYER_FIGURAS,
  PLAYER_PRESIONES,
  PLAYER_TALLAS,
  type ComentarioTipo,
  type PlayerColor,
  type PlayerFigura,
  type PlayerPresion,
  type PlayerTalla,
} from "@/lib/player/constants";
import { slugifyPersona } from "@/lib/player/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ComentarioInput = {
  id?: string;
  contenido: string;
  tipo: ComentarioTipo;
};

async function requirePlayerAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileAccess(supabase, user.id);
  if (!canAccessPlayerMenu(profile, user.id)) {
    redirect("/home");
  }

  return { supabase, user };
}

function parseScore(value: FormDataEntryValue | null, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new Error(`${label} debe ser un entero entre 1 y 100.`);
  }
  return parsed;
}

function parseEnum<T extends string>(
  value: FormDataEntryValue | null,
  allowed: readonly T[],
  label: string,
): T {
  const text = String(value ?? "");
  if (!allowed.includes(text as T)) {
    throw new Error(`${label} inválido.`);
  }
  return text as T;
}

function parseComentarios(formData: FormData): ComentarioInput[] {
  const comentarios: ComentarioInput[] = [];
  const count = Number(formData.get("comentario_count") ?? 0);

  for (let i = 0; i < count; i += 1) {
    const contenido = String(formData.get(`comentario_contenido_${i}`) ?? "").trim();
    if (!contenido) {
      continue;
    }
    const idRaw = String(formData.get(`comentario_id_${i}`) ?? "").trim();
    const tipo = parseEnum(
      formData.get(`comentario_tipo_${i}`),
      COMENTARIO_TIPOS,
      "Tipo de comentario",
    );
    comentarios.push({
      id: idRaw || undefined,
      contenido,
      tipo,
    });
  }

  return comentarios;
}

function parseCitaFields(formData: FormData) {
  const persona = String(formData.get("persona") ?? "").trim();
  const caracteristica = String(formData.get("caracteristica") ?? "").trim();
  const lugar = String(formData.get("lugar") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "").trim();

  if (!persona || !lugar || !fecha) {
    throw new Error("Persona, lugar y fecha son obligatorios.");
  }

  const codigo = slugifyPersona(persona);
  if (!codigo) {
    throw new Error("La persona necesita un nombre válido.");
  }

  return {
    fecha: `${fecha}T12:00:00.000Z`,
    persona,
    codigo,
    caracteristica,
    color: parseEnum(formData.get("color"), PLAYER_COLORS, "Color") as PlayerColor,
    talla: parseEnum(formData.get("talla"), PLAYER_TALLAS, "Talla") as PlayerTalla,
    figura: parseEnum(formData.get("figura"), PLAYER_FIGURAS, "Figura") as PlayerFigura,
    presion: parseEnum(
      formData.get("presion"),
      PLAYER_PRESIONES,
      "Presión",
    ) as PlayerPresion,
    lugar,
    puntaje_tightening: parseScore(formData.get("puntaje_tightening"), "Tightening"),
    puntaje_bottom: parseScore(formData.get("puntaje_bottom"), "Bottom"),
    puntaje_top: parseScore(formData.get("puntaje_top"), "Top"),
    puntaje_belleza: parseScore(formData.get("puntaje_belleza"), "Belleza"),
    puntaje_paciencia: parseScore(formData.get("puntaje_paciencia"), "Paciencia"),
    comentarios: parseComentarios(formData),
  };
}

export async function createCita(formData: FormData) {
  const { supabase, user } = await requirePlayerAccess();
  const input = parseCitaFields(formData);

  const { data: cita, error: citaError } = await supabase
    .from("player_citas")
    .insert({
      user_id: user.id,
      fecha: input.fecha,
      lugar: input.lugar,
      codigo_identificador: input.codigo,
      persona: input.persona,
      caracteristica: input.caracteristica || null,
      color: input.color,
      figura: input.figura,
      talla: input.talla,
      presion: input.presion,
      puntaje_tightening: input.puntaje_tightening,
      puntaje_bottom: input.puntaje_bottom,
      puntaje_top: input.puntaje_top,
      puntaje_belleza: input.puntaje_belleza,
      puntaje_paciencia: input.puntaje_paciencia,
    })
    .select("id")
    .single();

  if (citaError || !cita) {
    throw new Error(citaError?.message ?? "No se pudo crear la salida.");
  }

  if (input.comentarios.length > 0) {
    const { error: comentariosError } = await supabase.from("player_citas_comentarios").insert(
      input.comentarios.map((comentario, index) => ({
        user_id: user.id,
        cita_id: cita.id,
        codigo_identificador: input.codigo,
        fecha: input.fecha,
        contenido: comentario.contenido,
        tipo: comentario.tipo,
        orden: index + 1,
      })),
    );

    if (comentariosError) {
      throw new Error(comentariosError.message);
    }
  }

  revalidatePath("/player/citas");
}

export async function updateCita(formData: FormData) {
  const { supabase, user } = await requirePlayerAccess();
  const citaId = String(formData.get("cita_id") ?? "").trim();
  if (!citaId) {
    throw new Error("Falta el id de la salida.");
  }

  const input = parseCitaFields(formData);

  const { error: citaError } = await supabase
    .from("player_citas")
    .update({
      fecha: input.fecha,
      lugar: input.lugar,
      codigo_identificador: input.codigo,
      persona: input.persona,
      caracteristica: input.caracteristica || null,
      color: input.color,
      figura: input.figura,
      talla: input.talla,
      presion: input.presion,
      puntaje_tightening: input.puntaje_tightening,
      puntaje_bottom: input.puntaje_bottom,
      puntaje_top: input.puntaje_top,
      puntaje_belleza: input.puntaje_belleza,
      puntaje_paciencia: input.puntaje_paciencia,
    })
    .eq("id", citaId)
    .eq("user_id", user.id);

  if (citaError) {
    throw new Error(citaError.message);
  }

  const { error: deleteError } = await supabase
    .from("player_citas_comentarios")
    .delete()
    .eq("cita_id", citaId)
    .eq("user_id", user.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (input.comentarios.length > 0) {
    const { error: comentariosError } = await supabase.from("player_citas_comentarios").insert(
      input.comentarios.map((comentario, index) => ({
        user_id: user.id,
        cita_id: citaId,
        codigo_identificador: input.codigo,
        fecha: input.fecha,
        contenido: comentario.contenido,
        tipo: comentario.tipo,
        orden: index + 1,
      })),
    );

    if (comentariosError) {
      throw new Error(comentariosError.message);
    }
  }

  revalidatePath("/player/citas");
}
