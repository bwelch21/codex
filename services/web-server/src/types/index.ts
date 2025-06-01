export interface HelloWorldResponse {
  message: string;
  timestamp: string;
  service: string;
}

export interface ImageUploadResponse {
  message: string;
  file: {
    originalName: string;
    size: number;
    mimetype: string;
    uploadedAt: string;
  };
  timestamp: string;
  service: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
