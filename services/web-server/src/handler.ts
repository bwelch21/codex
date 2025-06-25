import serverlessExpress from '@codegenie/serverless-express';
import express from 'express';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { createApp } from './app';

const app = express();

// Custom internal route – must be added before createApp so it executes before
// the notFound handler that createApp appends.
const lambdaClient = new LambdaClient({});
app.get('/internal/ping', async (_req, res) => {
  const out = await lambdaClient.send(
    new InvokeCommand({
      FunctionName: process.env.INTERNAL_API_PING_FN,
      Payload: Buffer.from(JSON.stringify({})),
    })
  );
  res.json(JSON.parse(Buffer.from(out.Payload!).toString()));
});

// Add the shared routes, security middleware, and 404/error handlers.
createApp(app);

export const handler = serverlessExpress({ app });
