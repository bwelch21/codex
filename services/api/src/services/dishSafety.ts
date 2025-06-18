import { Allergen, DishSafetyRecommendation } from '../types/safeDishes';
import { sendImagePromptToOpenAI } from './openaiHelper';

interface RankOptions {
  model?: string;
}

/**
 * DishSafetyService is responsible for assessing menu items against a
 * user's allergy profile and producing a ranked list of dishes that are
 * safest for the user. The heavy-lifting business logic will be implemented
 * in the future; for now we return a placeholder response so the endpoint
 * can be integrated and tested end-to-end.
 */
export class DishSafetyService {
  async rankDishes(
    imageBuffer: Buffer,
    allergens: Allergen[],
    { model = 'gpt-4o-mini' }: RankOptions = {},
  ): Promise<DishSafetyRecommendation[]> {
    // Convert image to base64 for chat vision API
    const b64 = imageBuffer.toString('base64');

    // Build prompt instructing LLM to analyse allergens
    const prompt = this.buildPrompt(allergens);

    let rawJson = '{}';
    try {
      rawJson = await sendImagePromptToOpenAI({
        imageBase64: b64,
        mimeType: 'image/jpeg', // assume jpeg; OpenAI ignores mismatch mostly
        prompt,
        model,
      });
    } catch (err) {
      console.error('OpenAI dish safety call failed', err);
      throw new Error('LLM_DISH_SAFETY_FAILED');
    }

    let parsed: { recommendations: DishSafetyRecommendation[] } = {
      recommendations: [],
    };
    try {
      parsed = JSON.parse(rawJson);
    } catch (e) {
      console.error('Unable to parse LLM JSON', rawJson);
      throw new Error('LLM_INVALID_JSON');
    }

    return parsed.recommendations ?? [];
  }

  private buildPrompt(allergens: Allergen[]): string {
    const allergenList = allergens.join(', ');
    return `You are an expert food safety assistant.
The diner is allergic to the following: ${allergenList}.

Analyze the attached restaurant menu image and produce a JSON object EXACTLY in the following format (no extra keys):
{
  "recommendations": [
    {
      "dishName": string,            // Name of the dish as written in the menu
      "safetyRank": number,          // 1 = safest, increasing numbers less safe
      "warnings": string[],          // Any potential allergen concerns or preparation notes
      "requiredModifications": string[] // Modifications required to make dish safe
    }
  ]
}

Rules:
1. Include every dish you can identify. If you are unsure, exclude.
2. Sort recommendations by safest first.
3. If a dish definitely contains an allergen, set safetyRank high and add explanation in warnings.
4. If preparation modifications can remove allergen risk (e.g., remove cheese for dairy allergy), list them.
5. Respond with valid JSON only, no markdown, no extra text.`;
  }
} 