import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ApiResponse, ImageUploadResponse, ErrorResponse } from '../types';

const router = Router();

// Configure multer for memory storage (since we're not persisting files)
const storage = multer.memoryStorage();

// File filter to only allow specific image types and PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPEG, and PDF files are allowed.'));
  }
};

// Configure multer with file size limit and filter
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Error handler for multer errors
const handleMulterError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    let message: string;
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large. Maximum size is 10MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Only one file is allowed.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field.';
        break;
      default:
        message = 'File upload error occurred.';
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: message,
    };

    return res.status(400).json(errorResponse);
  }

  if (error && error.message) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error.message,
    };

    return res.status(400).json(errorResponse);
  }

  next(error);
};

// Image upload endpoint
router.post('/upload-image', upload.single('image'), handleMulterError, (req: Request, res: Response): void => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'No file uploaded. Please select an image file.',
      };

      res.status(400).json(errorResponse);
      return;
    }

    const file = req.file;
    const uploadedAt = new Date().toISOString();

    // Log file metadata (as requested)
    console.log('📸 Image Upload Metadata:', {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2),
      uploadedAt,
      bufferLength: file.buffer.length,
    });

    // Create successful response
    const response: ApiResponse<ImageUploadResponse> = {
      success: true,
      data: {
        message: 'Image uploaded successfully',
        file: {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          uploadedAt,
        },
        timestamp: new Date().toISOString(),
        service: 'web-server',
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Image upload error:', error);

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'An unexpected error occurred while processing the image.',
    };

    res.status(500).json(errorResponse);
  }
});

export { router as imageUploadRoutes }; 