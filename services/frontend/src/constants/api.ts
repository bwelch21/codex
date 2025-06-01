// API Configuration
export const API_CONFIG = {
  // Web server endpoints (public-facing API)
  WEB_SERVER: {
    BASE_URL: import.meta.env.VITE_WEB_SERVER_URL || "http://localhost:3001",
    ENDPOINTS: {
      HELLO_WORLD: "/api/hello-world",
      HEALTH: "/health",
    },
  },

  // Internal API endpoints (for future use)
  INTERNAL_API: {
    BASE_URL: import.meta.env.VITE_INTERNAL_API_URL || "http://localhost:4000",
    ENDPOINTS: {
      PING: "/api/ping",
      HEALTH: "/health",
    },
  },

  // Request configuration
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HelloWorldResponse {
  message: string;
  timestamp: string;
  service: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  service: string;
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Error Types
export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}
