import { useState } from 'react';
import { type Allergen, type SafeDishesResponse, type ApiResponse } from '../types/allergens';

interface SafeDishesState {
  isAnalyzing: boolean;
  error: string | null;
  results: SafeDishesResponse | null;
  progress: number;
}

interface UseSafeDishesReturn {
  state: SafeDishesState;
  analyzeDishes: (file: File, allergens: Allergen[]) => Promise<void>;
  reset: () => void;
}

export function useSafeDishes(): UseSafeDishesReturn {
  const [state, setState] = useState<SafeDishesState>({
    isAnalyzing: false,
    error: null,
    results: null,
    progress: 0,
  });

  const analyzeDishes = async (file: File, allergens: Allergen[]): Promise<void> => {
    if (allergens.length === 0) {
      setState(prev => ({
        ...prev,
        error: 'Please select at least one allergen to analyze for.',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      results: null,
      progress: 0,
    }));

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('allergenIds', JSON.stringify(allergens.map(a => a.id)));

      // Simulate progress updates during the analysis
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 20, 90),
        }));
      }, 1000);

      // In production we rely on Vercel's rewrite rule so a relative path is
      // sufficient. During local development we still need to hit the Express
      // dev server running on port 3001 (or a custom override via
      // VITE_WEB_SERVER_URL).
      const baseUrl =
        import.meta.env.DEV
          ? ((import.meta.env.VITE_WEB_SERVER_URL as string | undefined) ??
              'http://localhost:3001')
          : '';

      const response = await fetch(`${baseUrl}/api/safe-dishes`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData: ApiResponse<null> = await response.json();
          // Ensure errorData.error is a string
          if (errorData.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error) {
            errorMessage = `Server error: ${JSON.stringify(errorData.error)}`;
          }
        } catch (jsonError) {
          console.log("Failed to parse error response as JSON:", jsonError);
          // Keep the default errorMessage
        }
        
        throw new Error(errorMessage);
      }

      let data: ApiResponse<SafeDishesResponse>;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.log("Failed to parse success response as JSON:", jsonError);
        throw new Error('Server returned invalid response format');
      }

      if (!data.success || !data.data) {
        let errorMessage = 'Invalid response from server';
        
        if (data.error && typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error) {
          errorMessage = `Server error: ${JSON.stringify(data.error)}`;
        }
        
        throw new Error(errorMessage);
      }

      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        results: data.data!,
        progress: 100,
      }));
    } catch (error) {
      console.log("=== ERROR ANALYSIS ===");
      console.log("1. Raw error:", error);
      console.log("2. Error type:", typeof error);
      console.log("3. Is Error instance:", error instanceof Error);
      console.log("4. Error constructor:", error?.constructor?.name);
      console.log("5. JSON stringify:", JSON.stringify(error));
      console.log("6. Object keys:", error && typeof error === 'object' ? Object.keys(error) : 'N/A');
      
      // More robust error message extraction
      let errorMessage: string;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        // Handle different object structures
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if ('statusText' in error && typeof error.statusText === 'string') {
          errorMessage = error.statusText;
        } else {
          // Fallback for empty objects or complex objects
          const keys = Object.keys(error);
          if (keys.length === 0) {
            errorMessage = 'Unknown error occurred (empty error object)';
          } else {
            errorMessage = `Error occurred: ${JSON.stringify(error)}`;
          }
        }
      } else {
        errorMessage = String(error) || 'An unexpected error occurred';
      }
      
      console.log("7. Final error message:", errorMessage);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
        progress: 0,
      }));
    }
  };

  const reset = (): void => {
    setState({
      isAnalyzing: false,
      error: null,
      results: null,
      progress: 0,
    });
  };

  return {
    state,
    analyzeDishes,
    reset,
  };
} 