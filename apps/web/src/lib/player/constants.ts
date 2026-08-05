export const PLAYER_COLORS = ["blanca", "canela", "negra"] as const;
export const PLAYER_TALLAS = ["caballo", "mediana", "chata"] as const;
export const PLAYER_FIGURAS = ["bbw", "chubby", "vedette", "fitness", "delgada"] as const;
export const PLAYER_BELLEZAS = ["regular", "modelo"] as const;
export const PLAYER_TOPS = ["regular", "mega"] as const;
export const PLAYER_BOTTOMS = ["regular", "mega"] as const;
export const PLAYER_PRESIONES = ["cocomordan", "regular"] as const;
export const COMENTARIO_TIPOS = ["dicho", "pensamiento"] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];
export type PlayerTalla = (typeof PLAYER_TALLAS)[number];
export type PlayerFigura = (typeof PLAYER_FIGURAS)[number];
export type PlayerBelleza = (typeof PLAYER_BELLEZAS)[number];
export type PlayerTop = (typeof PLAYER_TOPS)[number];
export type PlayerBottom = (typeof PLAYER_BOTTOMS)[number];
export type PlayerPresion = (typeof PLAYER_PRESIONES)[number];
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

export const BELLEZA_LABELS: Record<PlayerBelleza, string> = {
  regular: "Regular",
  modelo: "Modelo",
};

export const TOP_LABELS: Record<PlayerTop, string> = {
  regular: "Regular",
  mega: "Mega",
};

export const BOTTOM_LABELS: Record<PlayerBottom, string> = {
  regular: "Regular",
  mega: "Mega",
};

export const PRESION_LABELS: Record<PlayerPresion, string> = {
  cocomordan: "Cocomordan",
  regular: "Regular",
};

export const COMENTARIO_TIPO_LABELS: Record<ComentarioTipo, string> = {
  dicho: "Dicho",
  pensamiento: "Personal",
};
