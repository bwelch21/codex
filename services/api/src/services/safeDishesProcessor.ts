import { DishSafetyService } from './dishSafety';
import {
  Allergen,
  SafeDishesResponse,
} from '../types/safeDishes';

const dishSafetyService = new DishSafetyService();

/**
 * Core business logic: given a menu image (as Buffer) and a list of
 * allergens, produce the ranked dish recommendations.
 *
 * This function is intentionally free of any HTTP / Lambda specifics so it
 * can be reused by both the Express route and the Lambda handler.
 */
export async function generateSafeDishes(
  imageBuffer: Buffer,
  allergens: Allergen[],
): Promise<SafeDishesResponse> {
  const recommendations = await dishSafetyService.rankDishes(
    imageBuffer,
    allergens,
  );

  return {
    analyzedAt: new Date().toISOString(),
    processedAllergenIds: allergens.map((a) => a.id),
    recommendations,
  };
} 