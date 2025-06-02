import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import { MenuSection, MenuItem, AllergenAlert } from '../types';

export interface ExtractedText {
  rawText: string;
  confidence: number;
}

export interface ProcessedMenuData {
  menuSections: MenuSection[];
  confidence: {
    overall: number;
    textQuality: number;
    structureDetection: number;
  };
  allergenAlerts: AllergenAlert[];
}

// Common allergens to detect
const COMMON_ALLERGENS = [
  'peanuts', 'tree nuts', 'nuts', 'dairy', 'milk', 'cheese', 'butter', 'cream',
  'eggs', 'soy', 'wheat', 'gluten', 'fish', 'shellfish', 'crustaceans',
  'sesame', 'mustard', 'celery', 'lupin', 'mollusks', 'sulfites'
];

// Price patterns to match currency formats
const PRICE_PATTERNS = [
  /\$(\d+(?:\.\d{2})?)/g,        // $12.99, $12
  /(\d+(?:\.\d{2})?)\s*\$/g,     // 12.99$, 12$
  /£(\d+(?:\.\d{2})?)/g,         // £12.99
  /€(\d+(?:\.\d{2})?)/g,         // €12.99
  /(\d+(?:\.\d{2})?)\s*USD/gi,   // 12.99 USD
];

export class TextExtractionService {
  /**
   * Extract text from uploaded file based on file type
   */
  async extractText(fileBuffer: Buffer, mimeType: string): Promise<ExtractedText> {
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
  private async extractFromPDF(fileBuffer: Buffer): Promise<ExtractedText> {
    try {
      const data = await pdfParse(fileBuffer);
      return {
        rawText: data.text,
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
  private async extractFromImage(fileBuffer: Buffer): Promise<ExtractedText> {
    try {
      const result = await Tesseract.recognize(fileBuffer, 'eng', {
        logger: m => console.log(m) // Optional: log OCR progress
      });

      return {
        rawText: result.data.text,
        confidence: result.data.confidence / 100, // Convert percentage to decimal
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Process raw text into structured menu data
   */
  processMenuText(rawText: string, textConfidence: number): ProcessedMenuData {
    const lines = rawText.split('\n').filter(line => line.trim().length > 0);
    
    const menuSections = this.parseMenuSections(lines);
    const allergenAlerts = this.detectAllergens(rawText, menuSections);
    
    // Calculate confidence scores
    const structureDetection = this.calculateStructureConfidence(menuSections);
    const overall = (textConfidence + structureDetection) / 2;

    return {
      menuSections,
      confidence: {
        overall,
        textQuality: textConfidence,
        structureDetection,
      },
      allergenAlerts,
    };
  }

  /**
   * Parse text lines into menu sections and items
   */
  private parseMenuSections(lines: string[]): MenuSection[] {
    const sections: MenuSection[] = [];
    let currentSection: MenuSection | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      
      // Skip empty lines
      if (!line) continue;

      // Check if this line looks like a section header
      if (this.isSectionHeader(line, i, lines)) {
        // Save previous section if it exists
        if (currentSection && currentSection.items.length > 0) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          id: uuidv4(),
          title: this.cleanSectionTitle(line),
          items: [],
          confidence: 0.8,
        };
      } else if (currentSection && this.isMenuItem(line)) {
        // Parse menu item
        const menuItem = this.parseMenuItem(line, i);
        if (menuItem) {
          currentSection.items.push(menuItem);
        }
      }
    }

    // Add the last section
    if (currentSection && currentSection.items.length > 0) {
      sections.push(currentSection);
    }

    // If no sections were found, create a default section
    if (sections.length === 0) {
      const items = lines
        .filter(line => this.isMenuItem(line))
        .map((line, index) => this.parseMenuItem(line, index))
        .filter((item): item is MenuItem => item !== null);

      if (items.length > 0) {
        sections.push({
          id: uuidv4(),
          title: 'Menu Items',
          items,
          confidence: 0.6,
        });
      }
    }

    return sections;
  }

  /**
   * Determine if a line is likely a section header
   */
  private isSectionHeader(line: string, _index: number, _lines: string[]): boolean {
    // Common section headers
    const sectionKeywords = [
      'appetizers', 'starters', 'salads', 'soups', 'mains', 'entrees', 'entrées',
      'desserts', 'beverages', 'drinks', 'wine', 'beer', 'cocktails', 'sides',
      'breakfast', 'lunch', 'dinner', 'brunch', 'specials', 'pasta', 'pizza',
      'seafood', 'meat', 'vegetarian', 'vegan'
    ];

    const lowerLine = line.toLowerCase();
    
    // Check if line contains section keywords
    const hasKeyword = sectionKeywords.some(keyword => lowerLine.includes(keyword));
    
    // Check if line is short (typical for headers)
    const isShort = line.length < 50;
    
    // Check if line doesn't contain price indicators
    const hasNoPrice = !this.containsPrice(line);
    
    // Check if line is in ALL CAPS or Title Case
    const isAllCaps = line === line.toUpperCase() && line.length > 2;
    const isTitleCase = line.split(' ').every(word => 
      word.length === 0 || (word[0] && word[0] === word[0].toUpperCase())
    );

    return (hasKeyword || isAllCaps || isTitleCase) && isShort && hasNoPrice;
  }

  /**
   * Clean section title text
   */
  private cleanSectionTitle(title: string): string {
    return title
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  /**
   * Determine if a line is likely a menu item
   */
  private isMenuItem(line: string): boolean {
    // Menu items typically have:
    // 1. Some length (not just a word)
    // 2. May contain prices
    // 3. Are not obviously section headers
    
    if (line.length < 10) return false;
    
    // Check for price indicators
    const hasPrice = this.containsPrice(line);
    
    // Check for descriptive text (common in menu items)
    const hasDescription = line.includes(',') || line.includes('with') || line.includes('served');
    
    return hasPrice || hasDescription || line.length > 20;
  }

  /**
   * Check if line contains price information
   */
  private containsPrice(line: string): boolean {
    return PRICE_PATTERNS.some(pattern => pattern.test(line));
  }

  /**
   * Parse a menu item from a text line
   */
  private parseMenuItem(line: string, lineIndex: number): MenuItem | null {
    try {
      const price = this.extractPrice(line);
      const { name, description } = this.parseNameAndDescription(line, price);
      const ingredients = this.extractIngredients(description || '');
      const allergenWarnings = this.detectLineAllergens(line);

      const menuItem: MenuItem = {
        id: uuidv4(),
        name: name.trim(),
        ingredients,
        allergenWarnings,
        confidence: 0.8,
        position: {
          x: 0,
          y: lineIndex * 20, // Approximate line height
          width: 400,
          height: 20,
        },
      };

      // Only add description if it exists and is not empty
      if (description && description.trim()) {
        menuItem.description = description.trim();
      }

      // Only add price if it exists
      if (price) {
        menuItem.price = price;
      }

      return menuItem;
    } catch (error) {
      console.error('Error parsing menu item:', line, error);
      return null;
    }
  }

  /**
   * Extract price information from text
   */
  private extractPrice(text: string): { value: number; currency: string; rawText: string } | undefined {
    for (const pattern of PRICE_PATTERNS) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const rawText = match[0];
        const valueStr = match[1];
        const value = parseFloat(valueStr);
        
        let currency = 'USD'; // Default
        if (rawText.includes('£')) currency = 'GBP';
        else if (rawText.includes('€')) currency = 'EUR';
        
        return {
          value,
          currency,
          rawText,
        };
      }
    }
    return undefined;
  }

  /**
   * Parse item name and description from line
   */
  private parseNameAndDescription(line: string, price?: { rawText: string }): { name: string; description?: string } {
    // Remove price from line
    let cleanLine = line;
    if (price?.rawText) {
      cleanLine = line.replace(price.rawText, '').trim();
    }

    // Split on common separators
    const separators = [' - ', ' – ', ' — ', '  ', '\t'];
    
    for (const sep of separators) {
      if (cleanLine.includes(sep)) {
        const parts = cleanLine.split(sep);
        const name = parts[0]?.trim();
        const description = parts.slice(1).join(sep).trim();
        
        if (!name) {
          break; // Continue to next separator or default case
        }
        
        return {
          name,
          ...(description && { description }),
        };
      }
    }

    // If no separator found, look for descriptive patterns
    const descriptionMatch = cleanLine.match(/^([^,]+),(.+)$/);
    if (descriptionMatch?.[1] && descriptionMatch?.[2]) {
      return {
        name: descriptionMatch[1].trim(),
        description: descriptionMatch[2].trim(),
      };
    }

    // Default: entire line is the name
    return { name: cleanLine };
  }

  /**
   * Extract potential ingredients from description text
   */
  private extractIngredients(description: string): string[] {
    if (!description) return [];

    // Look for common ingredient patterns
    const ingredients: string[] = [];
    
    // Split on commas and common separators
    const parts = description.toLowerCase()
      .split(/[,&+]/)
      .map(part => part.trim())
      .filter(part => part.length > 2);

    // Filter out obvious non-ingredients
    const nonIngredients = ['served', 'with', 'and', 'or', 'choice', 'side', 'includes'];
    
    for (const part of parts) {
      if (!nonIngredients.some(ni => part.includes(ni))) {
        ingredients.push(part);
      }
    }

    return ingredients.slice(0, 10); // Limit to reasonable number
  }

  /**
   * Detect allergens in a specific line
   */
  private detectLineAllergens(line: string): string[] {
    const lowerLine = line.toLowerCase();
    const foundAllergens: string[] = [];

    for (const allergen of COMMON_ALLERGENS) {
      if (lowerLine.includes(allergen.toLowerCase())) {
        foundAllergens.push(allergen);
      }
    }

    return [...new Set(foundAllergens)]; // Remove duplicates
  }

  /**
   * Detect allergens across all menu content
   */
  private detectAllergens(rawText: string, menuSections: MenuSection[]): AllergenAlert[] {
    const alerts: AllergenAlert[] = [];
    const lowerText = rawText.toLowerCase();

    for (const allergen of COMMON_ALLERGENS) {
      const allergenLower = allergen.toLowerCase();
      
      if (lowerText.includes(allergenLower)) {
        // Find context around the allergen mention
        const index = lowerText.indexOf(allergenLower);
        const start = Math.max(0, index - 30);
        const end = Math.min(rawText.length, index + allergen.length + 30);
        const context = rawText.substring(start, end).trim();

        // Try to find associated menu item
        let menuItemId: string | undefined;
        for (const section of menuSections) {
          for (const item of section.items) {
            if (item.allergenWarnings?.includes(allergen)) {
              menuItemId = item.id;
              break;
            }
          }
          if (menuItemId) break;
        }

        // Determine severity based on allergen type
        let severity: 'high' | 'medium' | 'low' = 'medium';
        if (['peanuts', 'tree nuts', 'nuts', 'shellfish'].includes(allergenLower)) {
          severity = 'high';
        } else if (['gluten', 'dairy', 'eggs'].includes(allergenLower)) {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        const alert: AllergenAlert = {
          allergen,
          confidence: 0.8,
          context,
          severity,
        };

        if (menuItemId) {
          alert.menuItemId = menuItemId;
        }

        alerts.push(alert);
      }
    }

    return alerts;
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
    
    const totalItems = menuSections
      .flatMap(section => section.items).length;

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