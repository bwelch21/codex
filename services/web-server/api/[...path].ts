import { createApp } from '../src/app';

// Initialize Express app once per serverless lambda instance
const app = createApp();

// Catch-all handler — every request under /api/* reaches this file.
// Using `any` keeps us independent of @vercel/node types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function handler(req: any, res: any) {
  app(req, res);
} 