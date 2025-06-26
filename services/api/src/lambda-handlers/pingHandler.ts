import { LambdaResponse } from '../types/common';

/**
 * Lambda action handler: ping
 */
export async function pingHandler(): Promise<LambdaResponse> {
  const response = {
    success: true,
    data: {
      message: 'pong',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
} 