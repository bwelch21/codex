// Types related to menu extraction & structure

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