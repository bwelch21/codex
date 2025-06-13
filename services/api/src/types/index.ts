// Error response with details
export interface DetailedErrorResponse {
  message: string;
  code: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | DetailedErrorResponse;
}

export interface PingResponse {
  message: string;
  timestamp: string;
  uptime: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// Menu extraction types
export interface MenuExtractionResponse {
  extractionId: string;
  processedAt: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    processingTimeMs: number;
  };
  extractedContent: {
    rawText: string;
    menuSections: MenuSection[];
    confidence: {
      overall: number;
      textQuality: number;
      structureDetection: number;
    };
  };
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
  confidence: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: {
    value: number;
    currency: string;
    rawText: string;
  };
  ingredients?: string[];
  dietaryInfo?: string[];
  allergenWarnings?: string[];
  confidence: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
