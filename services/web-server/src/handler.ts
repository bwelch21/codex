import serverlessExpress from '@codegenie/serverless-express';
import express from 'express';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import multer from 'multer';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { ApiResponse } from './types';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const app = express();

// Global security & utility middleware
app.use(helmet());

app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Configure multer for in-memory uploads (required for /internal/safe-dishes)
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

// Custom internal route 
const lambdaClient = new LambdaClient({});
app.get('/api/ping', async (_req, res) => {
  const out = await lambdaClient.send(
    new InvokeCommand({
      FunctionName: process.env.INTERNAL_API_SERVICE_FN,
      Payload: Buffer.from(JSON.stringify({ action: 'ping' })),
    })
  );
  res.json(JSON.parse(Buffer.from(out.Payload!).toString()));
});

// Added internal route to invoke the API Lambda safe-dishes action
app.post(
  '/api/safe-dishes',
  upload.single('file'),
  async (req, res) => {
    try {
      console.info('[web-server] /internal/safe-dishes request', {
        hasFile: Boolean(req.file),
        allergenIds: req.body?.allergenIds,
      });

      // Validate file
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded. Please provide a menu image or PDF.',
        });
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

      // Upload image to S3 and pass the key to the internal Lambda
      const s3 = new S3Client({});
      const objectKey = `safe-dishes/uploads/${uuidv4()}_${req.file.originalname}`;

      console.info('[web-server] Uploading file to S3', {
        bucket: process.env.UPLOAD_BUCKET,
        key: objectKey,
        sizeInBytes: req.file.size,
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.UPLOAD_BUCKET as string,
          Key: objectKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );

      console.info('[web-server] File uploaded – invoking apiService Lambda');

      // Invoke the API Lambda safe-dishes action with S3 key
      const payload = {
        action: 'safe-dishes',
        s3Key: objectKey,
        allergenIds: req.body?.allergenIds,
      };

      console.info('[web-server] Lambda payload', {
        ...payload,
      });

      const out = await lambdaClient.send(
        new InvokeCommand({
          FunctionName: process.env.INTERNAL_API_SERVICE_FN,
          Payload: Buffer.from(JSON.stringify(payload)),
        })
      );

      // The Lambda payload comes back JSON-encoded. Parse and forward the body.
      const lambdaResult = JSON.parse(Buffer.from(out.Payload!).toString());
      const body =
        typeof lambdaResult.body === 'string'
          ? JSON.parse(lambdaResult.body)
          : lambdaResult.body;

      console.info('[web-server] Lambda invocation succeeded', {
        statusCode: lambdaResult.statusCode,
      });

      res.status(lambdaResult.statusCode ?? 200).json(body);
    } catch (error) {
      console.error('[web-server] Invoke safe-dishes error', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to invoke safe-dishes action',
          code: 'SAFE_DISHES_INVOKE_ERROR',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export const handler = serverlessExpress({ app });
