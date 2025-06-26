// Common reusable types across API endpoints

// Error response with optional details
export interface DetailedErrorResponse {
  message: string;
  code: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// Standardised API envelope for all responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | DetailedErrorResponse;
}

// Generic error payload (legacy)
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface LambdaResponse {
  statusCode: number;
  body: string;
}
