import { Router, Request, Response } from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { ApiResponse } from '../types';

const router = Router();

// Configure multer for memory storage (consistent with imageUpload.ts)
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

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

/**
 * POST /api/safe-dishes
 * 
 * Forwards safe-dishes analysis requests to the internal API service
 * Form-data payload:
 *  - file (required): Menu image or PDF
 *  - allergenIds (required): JSON array or comma-separated list of allergen IDs
 */
router.post(
  '/safe-dishes',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate file
      if (!req.file) {
        const errorResponse: ApiResponse<null> = {
          success: false,
          error: 'No file uploaded. Please provide a menu image or PDF.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Validate allergenIds
      if (!req.body.allergenIds) {
        const errorResponse: ApiResponse<null> = {
          success: false,
          error: 'No allergen IDs provided. Please specify which allergens to check for.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Forward request to API service
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      formData.append('allergenIds', req.body.allergenIds);

      const apiResponse = await axios.post(
        `${API_BASE_URL}/api/menu/safe-dishes`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 60000, // 60 second timeout for LLM processing
        }
      );

      // Forward the API response directly
      res.status(apiResponse.status).json(apiResponse.data);
    } catch (error: unknown) {
      console.error('Safe dishes proxy error:', error);

      if (axios.isAxiosError(error)) {
        // Forward API errors directly if available
        if (error.response) {
          res.status(error.response.status).json(error.response.data);
          return;
        }
      }

      // Generic error response
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'Failed to analyze menu for safe dishes. Please try again.',
      };
      res.status(500).json(errorResponse);
    }
  }
);

export { router as safeDishesRoutes }; 