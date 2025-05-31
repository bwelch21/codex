import { Router, Request, Response } from 'express';
import { ApiResponse, HelloWorldResponse } from '../types';

const router = Router();

router.get('/hello-world', (_req: Request, res: Response): void => {
  const response: ApiResponse<HelloWorldResponse> = {
    success: true,
    data: {
      message: 'Hello, World!',
      timestamp: new Date().toISOString(),
      service: 'web-server',
    },
  };

  res.status(200).json(response);
});

export default router; 