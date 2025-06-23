import { useState, useCallback } from "react";

export interface PhotoUploadHookState {
  file: File | null;
  preview: string | null;
  isUploaded: boolean;
  error: string | null;
}

export interface PhotoUploadHookReturn {
  state: PhotoUploadHookState;
  handleFileSelect: (file: File | null) => void;
  clearFile: () => void;
  hasFile: boolean;
  shouldClearComponent: boolean;
}

/**
 * Custom hook for managing photo upload state
 * Provides an easy interface for parent components to track uploaded files
 */
export function usePhotoUpload(): PhotoUploadHookReturn {
  const [state, setState] = useState<PhotoUploadHookState>({
    file: null,
    preview: null,
    isUploaded: false,
    error: null,
  });
  const [shouldClearComponent, setShouldClearComponent] = useState(false);

  const handleFileSelect = useCallback((file: File | null) => {
    if (file) {
      // Create preview for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setState({
            file,
            preview: (e.target?.result as string) || null,
            isUploaded: true,
            error: null,
          });
        };
        reader.readAsDataURL(file);
      } else {
        // No preview for PDF files
        setState({
          file,
          preview: null,
          isUploaded: true,
          error: null,
        });
      }
    } else {
      setState({
        file: null,
        preview: null,
        isUploaded: false,
        error: null,
      });
    }
  }, []);

  const clearFile = useCallback(() => {
    setState({
      file: null,
      preview: null,
      isUploaded: false,
      error: null,
    });
    setShouldClearComponent(true);
    // Reset the flag after a brief moment
    setTimeout(() => setShouldClearComponent(false), 100);
  }, []);

  return {
    state,
    handleFileSelect,
    clearFile,
    hasFile: !!state.file,
    shouldClearComponent,
  };
}
