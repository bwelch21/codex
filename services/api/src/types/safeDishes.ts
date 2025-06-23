// The Big 9 food allergens as defined by the FDA
export const BIG_NINE_ALLERGENS = [
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'milk' },
  { id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012', name: 'eggs' },
  { id: 'c3d4e5f6-g7h8-9012-cdef-345678901234', name: 'fish' },
  { id: 'd4e5f6g7-h8i9-0123-defg-456789012345', name: 'shellfish' },
  { id: 'e5f6g7h8-i9j0-1234-efgh-567890123456', name: 'tree_nuts' },
  { id: 'f6g7h8i9-j0k1-2345-fghi-678901234567', name: 'peanuts' },
  { id: 'g7h8i9j0-k1l2-3456-ghij-789012345678', name: 'wheat' },
  { id: 'h8i9j0k1-l2m3-4567-hijk-890123456789', name: 'soybeans' },
  { id: 'i9j0k1l2-m3n4-5678-ijkl-901234567890', name: 'sesame' },
] as const;

export type AllergenName = typeof BIG_NINE_ALLERGENS[number]['name'];

export interface Allergen {
  id: string;
  name: AllergenName;
}

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
  processedAllergenIds: string[]; // IDs of allergens that were analyzed
  recommendations: DishSafetyRecommendation[];
}
