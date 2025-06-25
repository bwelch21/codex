export interface InternalEvent {
  action?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handler = async (event: InternalEvent) => {
  switch (event.action) {
    case 'ping': {
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
    case 'textExtraction': {
      const response = {
        success: true,
        data: {
          message: 'pong',
        },
      };
      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    }

    default: {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: `Unknown action: ${event.action ?? 'undefined'}`,
        }),
      };
    }
  }
};

