export function kcalForServing(kcalPer100g: number, servingG: number): number {
  return Math.round((kcalPer100g / 100) * servingG * 10) / 10;
}

export type FoodItemRow = {
  id: string;
  tpca_code: string | null;
  name: string;
  food_group: string;
  kcal_per_100g: number;
  default_serving_g: number;
  serving_label: string;
  default_price_soles: number;
  brand: string | null;
};

export function computeFoodLogValues(
  item: Pick<FoodItemRow, "kcal_per_100g" | "default_serving_g" | "default_price_soles">,
  servingG?: number,
  priceOverride?: number,
) {
  const grams = servingG ?? item.default_serving_g;
  return {
    servingG: grams,
    kcal: kcalForServing(Number(item.kcal_per_100g), grams),
    price: priceOverride ?? Number(item.default_price_soles),
  };
}
