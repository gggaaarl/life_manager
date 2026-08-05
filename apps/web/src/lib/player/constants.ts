export const PLAYER_COLORS = ["blanca", "canela", "negra"] as const;
export const PLAYER_TALLAS = ["caballo", "mediana", "chata"] as const;
export const PLAYER_FIGURAS = ["bbw", "chubby", "vedette", "fitness", "delgada"] as const;
export const COMENTARIO_TIPOS = ["dicho", "pensamiento"] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];
export type PlayerTalla = (typeof PLAYER_TALLAS)[number];
export type PlayerFigura = (typeof PLAYER_FIGURAS)[number];
export type ComentarioTipo = (typeof COMENTARIO_TIPOS)[number];

export const COLOR_LABELS: Record<PlayerColor, string> = {
  blanca: "Blanca",
  canela: "Canela",
  negra: "Negra",
};

export const TALLA_LABELS: Record<PlayerTalla, string> = {
  caballo: "Caballo",
  mediana: "Mediana",
  chata: "Chata",
};

export const FIGURA_LABELS: Record<PlayerFigura, string> = {
  bbw: "BBW",
  chubby: "Chubby",
  vedette: "Vedette",
  fitness: "Fitness",
  delgada: "Delgada",
};

export const COMENTARIO_TIPO_LABELS: Record<ComentarioTipo, string> = {
  dicho: "Dicho",
  pensamiento: "Personal",
};
