// The Big 9 food allergens as defined by the FDA
export const BIG_NINE_ALLERGENS = [
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'tree_nuts',
  'peanuts',
  'wheat',
  'soybeans',
  'sesame',
] as const;

export type Allergen = typeof BIG_NINE_ALLERGENS[number];

export interface UserAllergyProfile {
  allergens: Allergen[];
}

export interface DishSafetyRecommendation {
  dishName: string;
  safetyRank: number; // 1 = safest, larger means less safe
  warnings: string[];
  requiredModifications: string[];
}

export interface SafeDishesResponse {
  analyzedAt: string;
  recommendations: DishSafetyRecommendation[];
}

export interface SafeDishesRequest {
  allergens: Allergen[];
}
