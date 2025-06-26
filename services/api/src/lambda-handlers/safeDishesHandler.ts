import { parseAllergens } from '../utils/allergenUtils';
import { generateSafeDishes } from '../services/safeDishesProcessor';
import { LambdaResponse } from '../types/common';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

interface SafeDishesEvent {
  s3Key?: string;
  allergenIds?: unknown;
  // allow any other fields
  [key: string]: unknown;
}

/**
 * Lambda action handler: safe-dishes
 */
export async function safeDishesHandler(event: SafeDishesEvent): Promise<LambdaResponse> {
  try {
    // Log the raw incoming event to help with debugging (omit large fields)
    console.info('[safe-dishes] Incoming event', {
      // Log only primitives to avoid massive CloudWatch entries
      keys: Object.keys(event ?? {}),
      s3Key: (event as SafeDishesEvent).s3Key,
      allergenIds: (event as SafeDishesEvent).allergenIds,
    });

    const { s3Key, allergenIds } = event;

    // Input validation – require s3Key
    if (!s3Key) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: {
            message: 's3Key is required for safe-dishes action',
            code: 'NO_FILE_PROVIDED',
            timestamp: new Date().toISOString(),
          },
        }),
      };
    }

    const s3 = new S3Client({});

    console.info('[safe-dishes] Fetching object from S3', {
      bucket: process.env.UPLOAD_BUCKET,
      key: s3Key,
    });

    const obj = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.UPLOAD_BUCKET as string,
        Key: s3Key,
      })
    );

    const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      return Buffer.concat(chunks);
    };

    const imageBuffer = await streamToBuffer(obj.Body as Readable);

    // Clean up the uploaded object to save space (best effort)
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.UPLOAD_BUCKET as string,
          Key: s3Key,
        })
      );
    } catch (cleanupErr) {
      console.error('Failed to delete S3 object', cleanupErr);
    }

    console.info('[safe-dishes] Retrieved image from S3', {
      sizeInBytes: imageBuffer.byteLength,
    });

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

    console.info('[safe-dishes] Generating dish recommendations');
    
    const startTime = Date.now();
    const safeDishesResponse = await generateSafeDishes(imageBuffer, allergens);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.info('[safe-dishes] Successfully generated recommendations', {
      durationMs: duration,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, durationMs: duration, data: safeDishesResponse }),
    };
  } catch (error) {
    console.error('[safe-dishes] Unhandled error', error);
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