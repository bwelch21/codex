import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ApiResponse, DetailedErrorResponse } from '../types/common';
import {
  Allergen,
  BIG_NINE_ALLERGENS,
  SafeDishesResponse,
} from '../types/safeDishes';
import { generateSafeDishes } from '../services/safeDishesProcessor';
import { parseAllergens } from '../utils/allergenUtils';

const router = Router();

// Multer configuration (reuse settings from menuRoutes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  },
});

/**
 * POST /api/menu/safe-dishes
 *
 * Form-data payload:
 *  - file (required): JPEG, PNG, or PDF menu
 *  - allergens (required): JSON array or comma-separated list of allergens
 */
router.post(
  '/menu/safe-dishes',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate file
      if (!req.file) {
        const errRes: ApiResponse<DetailedErrorResponse> = {
          success: false,
          error: {
            message: 'No file uploaded. Please provide a menu image or PDF.',
            code: 'NO_FILE_UPLOADED',
            timestamp: new Date().toISOString(),
          },
        };
        res.status(400).json(errRes);
        return;
      }

      // Parse allergens from body
      const parsedAllergens: Allergen[] = parseAllergens(req.body.allergenIds);
      if (parsedAllergens.length === 0) {
        const errRes: ApiResponse<DetailedErrorResponse> = {
          success: false,
          error: {
            message: 'At least one allergen ID must be provided.',
            code: 'NO_ALLERGENS_PROVIDED',
            timestamp: new Date().toISOString(),
          },
        };
        res.status(400).json(errRes);
        return;
      }

      // Validate allergens are within Big 9
      const invalid = parsedAllergens.filter(
        (a) => !BIG_NINE_ALLERGENS.some(b => b.id === a.id),
      );
      if (invalid.length > 0) {
        const errRes: ApiResponse<DetailedErrorResponse> = {
          success: false,
          error: {
            message: `Invalid allergens provided: ${invalid.join(', ')}`,
            code: 'INVALID_ALLERGENS',
            timestamp: new Date().toISOString(),
            details: {
              allowed: BIG_NINE_ALLERGENS,
              received: parsedAllergens,
            },
          },
        };
        res.status(400).json(errRes);
        return;
      }

      // Execute core business logic
      const response: SafeDishesResponse = await generateSafeDishes(
        req.file.buffer,
        parsedAllergens,
      );

      const apiRes: ApiResponse<SafeDishesResponse> = {
        success: true,
        data: response,
      };
      res.status(200).json(apiRes);
    } catch (error) {
      console.error('Safe dishes endpoint error', error);
      const errRes: ApiResponse<DetailedErrorResponse> = {
        success: false,
        error: {
          message: 'Failed to analyse menu for safe dishes.',
          code: 'SAFE_DISHES_FAILURE',
          timestamp: new Date().toISOString(),
          details: {
            reason: error instanceof Error ? error.message : 'unknown_error',
          },
        },
      };
      res.status(500).json(errRes);
    }
  },
);

export { router as safeDishesRoutes };
