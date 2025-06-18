import fs from 'fs/promises';
import OpenAI from 'openai';
import sharp from 'sharp';

// Type definitions
interface DetectionPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface DetectionResponse {
  predictions: DetectionPrediction[];
}

interface LLMBoxOptions {
  model?: string;
  detectionUrl?: string;
  confidenceThreshold?: number;
  maxDimension?: number;
  jpegQuality?: number;
  compressCrops?: boolean;
}

interface LLMResult {
  textBoxes: string[];
  detectionTime: number;
  cropTime: number;
  llmTime: number;
}

interface IndexedResult {
  idx: number;
  text: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Helper function to send a single image to OpenAI for text extraction
 * @private
 */
async function _sendToOpenAI(
  imageBase64: string,
  options: { model: string; mimeType: string }
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: options.model,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all text from this image. Return only the raw text, no explanations or formatting.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${options.mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * FAST path – aggressively compresses image before sending to LLM.
 * Reduces payload size 5-10× and speeds up request/latency.
 * @param {string | Buffer} imageInput - File path or Buffer containing the image data
 * @param {object} [options]
 * @param {string} [options.model]
 * @param {number} [options.maxDimension]
 * @param {number} [options.jpegQuality]
 */
export async function readMenuWithLLMCompressed(
  imageInput: string | Buffer,
  { model = 'gpt-4o-mini', maxDimension = 1024, jpegQuality = 60 } = {}
): Promise<LLMResult> {
  try {
    const compStart = performance.now();
    const compressed = await sharp(imageInput)
      .rotate()
      .resize({
        width: maxDimension,
        height: maxDimension,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: jpegQuality, mozjpeg: true })
      .toBuffer();
    const compressionTime = performance.now() - compStart;

    const base64 = compressed.toString('base64');

    const llmStart = performance.now();
    const text = await _sendToOpenAI(base64, { model, mimeType: 'image/jpeg' });
    const llmTime = performance.now() - llmStart;

    return { textBoxes: [text], detectionTime: 0, cropTime: compressionTime, llmTime };
  } catch (err) {
    console.error('LLM OCR (compressed) error:', err);
    throw err;
  }
}

/**
 * PATTERN A – Use bounding boxes (from an external CV model) to crop the text regions, then
 * send all crops in a single chat completion.  Good for large, busy images.
 *
 * Requires the detection endpoint URL (with API key) – defaults to env var MENU_BOX_MODEL_URL.
 * @param {string | Buffer} imageInput - File path or Buffer containing the image data
 * @param {object} [options]
 * @param {string} [options.model]
 * @param {string} [options.detectionUrl]
 * @param {number} [options.confidenceThreshold]
 * @param {number} [options.maxDimension]
 * @param {number} [options.jpegQuality]
 */
export async function readMenuWithLLMBoxes(
  imageInput: string | Buffer,
  {
    model = 'gpt-4o-mini',
    detectionUrl = process.env.MENU_BOX_MODEL_URL,
    confidenceThreshold = 0.5,
    maxDimension = 1024,
    jpegQuality = 60,
    compressCrops = true,
  }: LLMBoxOptions = {}
): Promise<LLMResult> {
  if (!detectionUrl) {
    throw new Error(
      'readMenuWithLLMBoxes: detectionUrl is required (set MENU_BOX_MODEL_URL env variable)'
    );
  }

  try {
    // 1️⃣ Read image bytes - handle both file path and Buffer input
    let imgBytes: Buffer;
    if (typeof imageInput === 'string') {
      imgBytes = await fs.readFile(imageInput);
    } else {
      imgBytes = imageInput;
    }
    const imgBase64 = imgBytes.toString('base64');

    // 2️⃣ Call detection API – returns bounding boxes
    const detStart = performance.now();
    const res = await fetch(detectionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: imgBase64,
    });
    if (!res.ok) {
      console.log(res);
      throw new Error(`Detection API error ${res.status}`);
    }
    const json = (await res.json()) as DetectionResponse;
    const detectionTime = performance.now() - detStart;

    const { predictions } = json;

    if (!Array.isArray(predictions) || predictions.length === 0) {
      console.warn(
        'No boxes detected; falling back to compressed full-image path.'
      );
      return readMenuWithLLMCompressed(imageInput, {
        model,
        maxDimension,
        jpegQuality,
      });
    }

    // 3️⃣ Filter & sort boxes
    const filtered = predictions
      .filter(p => p.confidence >= confidenceThreshold)
      .sort((a, b) => a.y - b.y); // top to bottom

    // For crop calculations we need original dimensions
    const meta = await sharp(imgBytes).metadata();
    const imgW = meta.width;
    const imgH = meta.height;

    if (!imgW || !imgH) {
      throw new Error('Could not determine image dimensions');
    }

    const pad = 5;

    // 4️⃣ Crop + compress each box in parallel
    const cropStart = performance.now();
    const cropsB64 = await Promise.all(
      filtered.map(async box => {
        const left = Math.max(0, Math.floor(box.x - box.width / 2 - pad));
        const top = Math.max(0, Math.floor(box.y - box.height / 2 - pad));
        const width = Math.min(imgW - left, Math.ceil(box.width + pad * 2));
        const height = Math.min(imgH - top, Math.ceil(box.height + pad * 2));

        let pipeline = sharp(imgBytes).extract({ left, top, width, height });

        if (compressCrops) {
          pipeline = pipeline
            .resize({
              width: maxDimension,
              height: maxDimension,
              fit: 'inside',
            })
            .jpeg({ quality: jpegQuality, mozjpeg: true });
        }

        const cropBuf = await pipeline.toBuffer();

        return cropBuf.toString('base64');
      })
    );

    const cropTime = performance.now() - cropStart;

    let llmTime = 0;
  

    // 5️⃣ Fire all per-crop LLM requests in parallel and preserve order via Promise.all
    const llmStartParallel = performance.now();

    const indexed = cropsB64.map((b64, idx) => ({ idx, b64 }));

    const results = await Promise.all(
      indexed.map(({ idx, b64 }) =>
        _sendToOpenAI(b64, { model, mimeType: 'image/jpeg' }).then(
          (text: string) => ({ idx, text: text.trim() })
        )
      )
    );

    llmTime = performance.now() - llmStartParallel; // wall-clock

    // Preserve original detection order via the idx key
    const finalTextSections = results
      .sort((a: IndexedResult, b: IndexedResult) => a.idx - b.idx)
      .map((r: IndexedResult) => r.text)
  

    return { textBoxes: finalTextSections, detectionTime, cropTime, llmTime };
  } catch (err) {
    console.error('LLM OCR (boxes) error:', err);
    throw err;
  }
}
