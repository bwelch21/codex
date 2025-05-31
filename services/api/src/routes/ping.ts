import { Router, Request, Response } from 'express';
import { ApiResponse, PingResponse } from '../types';

const router = Router();

router.get('/ping', (_req: Request, res: Response): void => {
  const response: ApiResponse<PingResponse> = {
    success: true,
    data: {
      message: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };

  res.status(200).json(response);
});

export { router as pingRoutes };
