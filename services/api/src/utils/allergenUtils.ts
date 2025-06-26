import { Allergen, BIG_NINE_ALLERGENS } from '../types/safeDishes';

/**
 * Retrieve an Allergen object by its ID.
 */
export function getAllergenById(id: string): Allergen | undefined {
  return BIG_NINE_ALLERGENS.find((a) => a.id === id);
}

/**
 * Parse incoming allergen identifiers into strongly-typed Allergen objects.
 *
 * The caller may provide the identifiers in several shapes:
 *   1. JSON stringified array — "[\"id1\", \"id2\"]"
 *   2. Comma-separated string — "id1,id2"
 *   3. Native string[]
 *
 * Any identifiers that cannot be resolved against the Big-9 allergen list
 * are ignored. The function therefore never returns undefined gaps.
 */
export function parseAllergens(raw: unknown): Allergen[] {
  if (!raw) return [];

  try {
    // Case 1 – JSON array string
    if (typeof raw === 'string' && raw.trim().startsWith('[')) {
      const arr = JSON.parse(raw);
      return Array.isArray(arr)
        ? arr
            .map((id) => getAllergenById(String(id)))
            .filter((a): a is Allergen => a !== undefined)
        : [];
    }

    // Case 2 – comma-separated string
    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map((id) => getAllergenById(id.trim()))
        .filter((a): a is Allergen => a !== undefined);
    }

    // Case 3 – native array
    if (Array.isArray(raw)) {
      return raw
        .map((id) => getAllergenById(String(id)))
        .filter((a): a is Allergen => a !== undefined);
    }
  } catch {
    // fall through – handled by returning an empty array
  }

  return [];
}
