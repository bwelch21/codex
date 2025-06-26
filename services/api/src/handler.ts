import { pingHandler } from './lambda-handlers/pingHandler';
import { safeDishesHandler } from './lambda-handlers/safeDishesHandler';

export interface InternalEvent {
  action?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handler = async (event: InternalEvent) => {
  switch (event.action) {
    case 'ping': {
      return pingHandler();
    }
    case 'safe-dishes': {
      return safeDishesHandler(event);
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
