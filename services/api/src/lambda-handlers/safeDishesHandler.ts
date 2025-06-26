import { parseAllergens } from '../utils/allergenUtils';
import { generateSafeDishes } from '../services/safeDishesProcessor';
import { LambdaResponse } from '../types/common';

interface SafeDishesEvent {
  fileBase64?: string;
  allergenIds?: unknown;
  // allow any other fields
  [key: string]: unknown;
}

/**
 * Lambda action handler: safe-dishes
 */
export async function safeDishesHandler(event: SafeDishesEvent): Promise<LambdaResponse> {
  try {
    const { fileBase64, allergenIds } = event;

    // Input validation
    if (!fileBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            message: 'fileBase64 is required for safe-dishes action',
            code: 'NO_FILE_PROVIDED',
            timestamp: new Date().toISOString(),
          },
        }),
      };
    }

    const imageBuffer = Buffer.from(fileBase64, 'base64');

    const allergens = parseAllergens(allergenIds);
    if (allergens.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            message: 'At least one allergen ID must be provided.',
            code: 'NO_ALLERGENS_PROVIDED',
            timestamp: new Date().toISOString(),
          },
        }),
      };
    }

    const safeDishesResponse = await generateSafeDishes(imageBuffer, allergens);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: safeDishesResponse }),
    };
  } catch (error) {
    console.error('Lambda safe-dishes error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: {
          message: 'Failed to analyse menu for safe dishes.',
          code: 'SAFE_DISHES_FAILURE',
          timestamp: new Date().toISOString(),
          details: {
            reason: error instanceof Error ? error.message : 'unknown_error',
          },
        },
      }),
    };
  }
} 