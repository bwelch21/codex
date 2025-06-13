import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { MenuSection } from '../types';
import { readMenuWithLLMBoxes } from './llmTextBoxExtraction';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  timeout: 60000, // 60 second timeout
  maxRetries: 3
});

export interface ExtractedTextSections {
  textBoxes: string[];
  confidence: number;
}

export interface ProcessedMenuData {
  menuSections: MenuSection[];
  confidence: {
    overall: number;
    textQuality: number;
    structureDetection: number;
  };
}

export class TextExtractionService {
  /**
   * Extract text from uploaded file based on file type
   */
  async extractTextSections(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<ExtractedTextSections> {
    console.log(`Starting text extraction for file type: ${mimeType}`);
    if (mimeType === 'application/pdf') {
      return this.extractFromPDF(fileBuffer);
    } else if (mimeType.startsWith('image/')) {
      return this.extractFromImage(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  private async extractFromPDF(fileBuffer: Buffer): Promise<ExtractedTextSections> {
    try {
      console.log('Starting PDF text extraction');
      const data = await pdfParse(fileBuffer);
      console.log('PDF text extraction completed');
      return {
        textBoxes: [data.text],
        confidence: 0.95, // PDFs generally have high text extraction confidence
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Extract text from image files using OCR
   */
  private async extractFromImage(fileBuffer: Buffer): Promise<ExtractedTextSections> {
    try {
      console.log('Starting image OCR extraction');
      console.log('Image buffer size:', fileBuffer.length, 'bytes');
      
      const result = await readMenuWithLLMBoxes(
        fileBuffer,
        { 
          model: 'gpt-4o-mini',
          maxDimension: 1024,
          jpegQuality: 60,
          compressCrops: false,
          confidenceThreshold: 0.5,
          detectionUrl: 'https://serverless.roboflow.com/menu-text-box/13?api_key=***REMOVED***',
        }
      );

      console.log('Image OCR extraction completed');
      console.log('Extracted text length:', result.textBoxes.length);
      
      return {
        textBoxes: result.textBoxes,
        confidence: 0.95,
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Process raw text into structured menu data
   */
  async processMenuText(textSections: string[], textConfidence: number): Promise<ProcessedMenuData> {
    console.log('Starting menu text processing');
    console.log(`Processing ${textSections.length} text sections`);
    
    const menuSections = await this.parseMenuSections(textSections);
    console.log('Menu sections parsed:', menuSections.length);

    // Calculate confidence scores
    const structureDetection = this.calculateStructureConfidence(menuSections);
    const overall = (textConfidence + structureDetection) / 2;

    console.log('Menu text processing completed');
    return {
      menuSections,
      confidence: {
        overall,
        textQuality: textConfidence,
        structureDetection,
      },
    };
  }

  /**
   * Parse text lines into menu sections and items using LLM
   */
  private async parseMenuSections(textSections: string[]): Promise<MenuSection[]> {
    console.log('Starting LLM menu parsing from raw text sections');


    const menuSections = await Promise.all(textSections.map(async (section) => {

      try {
      
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [{
          role: 'user',
          content: `Parse this menu text into structured sections. For each menu item, identify the name, description, price, and any dietary information or allergen warnings. Your response should follow the JSON schema below exactly.
            Raw Menu Text:
            ${section}
  
            Expected JSON format:
            {
              "sections": [
                {
                  "title": "section name",
                  "items": [
                    {
                      "name": "item name",
                      "description": "item description",
                      "price": {
                        "value": number,
                        "currency": "item price currency",
                        "rawText": "original price text"
                      },
                    }
                  ]
                }
              ]
            }`
        }];
  
        console.log('Sending request to OpenAI');
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        });
        console.log('Received response for section from OpenAI');
  
        const parsedResponse = JSON.parse(response.choices[0]?.message?.content || '{"sections": []}');
        console.log('Parsed JSON response for section', JSON.stringify(parsedResponse, null, 2));
        
        // Validate and transform the response
        return parsedResponse.sections.map((section: any) => ({
          id: uuidv4(),
          title: section.title,
          items: section.items?.map((item: any) => ({
            id: uuidv4(),
            name: item.name,
            description: item.description,
            price: item.price ? {
              value: Number(item.price.value),
              currency: item.price.currency || 'USD',
              rawText: item.price.rawText
            } : undefined,
            confidence: 0.8, // TODO
            position: { x: 0, y: 0, width: 0, height: 0 }
          })),
          confidence: 0.8
        }));
      } catch (error) {
        console.error('Menu parsing error:', error);
        console.error('Unable to parse section:', section);
        return [];
      }
    }));

    return menuSections.flat();
  }

  /**
   * Calculate confidence score for menu structure detection
   */
  private calculateStructureConfidence(menuSections: MenuSection[]): number {
    if (menuSections.length === 0) return 0;

    let totalScore = 0;
    let factors = 0;

    // Factor 1: Number of sections found
    if (menuSections.length > 1) {
      totalScore += 0.3;
    }
    factors++;

    // Factor 2: Items with prices
    const itemsWithPrices = menuSections
      .flatMap(section => section.items)
      .filter(item => item.price).length;

    const totalItems = menuSections.flatMap(section => section.items).length;

    if (totalItems > 0) {
      totalScore += (itemsWithPrices / totalItems) * 0.4;
      factors++;
    }

    // Factor 3: Items with descriptions
    const itemsWithDescriptions = menuSections
      .flatMap(section => section.items)
      .filter(item => item.description).length;

    if (totalItems > 0) {
      totalScore += (itemsWithDescriptions / totalItems) * 0.3;
      factors++;
    }

    return factors > 0 ? totalScore / factors : 0;
  }
}
