import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

/**
 * Send a single image + textual prompt to OpenAI and get back the assistant response text.
 *
 * @param imageBase64 Base64-encoded image bytes
 * @param mimeType    Image MIME (e.g. 'image/jpeg')
 * @param prompt      User prompt describing the task
 * @param model       OpenAI model (default `gpt-4o-mini`)
 * @param maxTokens   Response token cap
 */
export async function sendImagePromptToOpenAI({
  imageBase64,
  mimeType,
  prompt,
  model = 'gpt-4o-mini',
  maxTokens = 1500,
}: {
  imageBase64: string;
  mimeType: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: maxTokens,
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  return response.choices[0]?.message?.content || '';
} 