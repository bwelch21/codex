import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiResponse,
  MenuExtractionResponse,
  DetailedErrorResponse,
} from '../types';
import { TextExtractionService } from '../services/textExtraction';

const router = Router();
const textExtractionService = new TextExtractionService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only JPEG, PNG, and PDF files are allowed.'
        )
      );
    }
  },
});

router.post(
  '/menu/extract-text',
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    // Set a timeout for the entire request
    const timeout = setTimeout(() => {
      const errorResponse: ApiResponse<DetailedErrorResponse> = {
        success: false,
        error: {
          message: 'Request timed out after 120 seconds',
          code: 'REQUEST_TIMEOUT',
          timestamp: new Date().toISOString(),
          details: {
            timeoutMs: 120000,
            suggestions: [
              'Try with a smaller file',
              'Check your network connection',
              'Try again later'
            ]
          }
        }
      };
      res.status(504).json(errorResponse);
    }, 120000); // 120 second timeout

    try {
      // Check if file was uploaded
      if (!req.file) {
        clearTimeout(timeout);
        const errorResponse: ApiResponse<DetailedErrorResponse> = {
          success: false,
          error: {
            message:
              'No file uploaded. Please provide a JPEG, PNG, or PDF file.',
            code: 'NO_FILE_UPLOADED',
            timestamp: new Date().toISOString(),
          },
        };
        res.status(400).json(errorResponse);
        return;
      }

      const { file } = req;

      try {
        // Extract relevant text sections from the uploaded file
        const extractedSections = await textExtractionService.extractTextSections(
          file.buffer,
          file.mimetype
        );

        // Process the extracted text into structured menu data
        const processedData = await textExtractionService.processMenuText(
          extractedSections.textBoxes,
          extractedSections.confidence
        );

        const processingTimeMs = Date.now() - startTime;
        const extractionId = uuidv4();

        const response: MenuExtractionResponse = {
          extractionId,
          processedAt: new Date().toISOString(),
          metadata: {
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            processingTimeMs,
          },
          extractedContent: {
            rawText: extractedSections.textBoxes.join('\n\n'),
            menuSections: processedData.menuSections,
            confidence: processedData.confidence
          },
        };

        const apiResponse: ApiResponse<MenuExtractionResponse> = {
          success: true,
          data: response,
        };

        clearTimeout(timeout);
        res.status(200).json(apiResponse);
      } catch (extractionError) {
        clearTimeout(timeout);
        console.error('Text extraction failed:', extractionError);

        const errorResponse: ApiResponse<DetailedErrorResponse> = {
          success: false,
          error: {
            message: 'Unable to extract text from the provided file.',
            code: 'TEXT_EXTRACTION_FAILED',
            timestamp: new Date().toISOString(),
            details: {
              reason:
                extractionError instanceof Error
                  ? extractionError.message
                  : 'unknown_error',
              suggestions: [
                'Ensure the file is not corrupted',
                'Try a higher quality image',
                'Check that the file contains readable text',
              ],
            },
          },
        };

        res.status(422).json(errorResponse);
        return;
      }
    } catch (error) {
      clearTimeout(timeout);
      console.error('Menu extraction error:', error);

      const errorResponse: ApiResponse<DetailedErrorResponse> = {
        success: false,
        error: {
          message: 'An unexpected error occurred during file processing.',
          code: 'PROCESSING_ERROR',
          timestamp: new Date().toISOString(),
          details: {
            reason: 'server_error',
            suggestions: [
              'Try uploading the file again',
              'Contact support if the issue persists',
            ],
          },
        },
      };

      res.status(500).json(errorResponse);
    }
  }
);

// Error handling for multer file upload errors
router.use((error: any, req: Request, res: Response, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const errorResponse: ApiResponse<DetailedErrorResponse> = {
        success: false,
        error: {
          message: 'File size exceeds maximum limit of 10MB.',
          code: 'FILE_TOO_LARGE',
          timestamp: new Date().toISOString(),
          details: {
            maxSize: 10 * 1024 * 1024,
            receivedSize: req.file?.size || 0,
          },
        },
      };
      return res.status(413).json(errorResponse);
    }
  }

  if (error.message.includes('Invalid file type')) {
    const errorResponse: ApiResponse<DetailedErrorResponse> = {
      success: false,
      error: {
        message: error.message,
        code: 'INVALID_FILE_TYPE',
        timestamp: new Date().toISOString(),
        details: {
          allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          receivedType: req.file?.mimetype || 'unknown',
        },
      },
    };
    return res.status(400).json(errorResponse);
  }

  return next(error);
});

export { router as menuRoutes };
