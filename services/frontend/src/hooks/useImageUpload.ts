import { useState, useCallback } from "react";
import { uploadImage, ImageUploadError } from "../services/imageUpload";
import type {
  ImageUploadResponse,
  UploadProgress,
} from "../services/imageUpload";

export interface ImageUploadState {
  isUploading: boolean;
  progress: number;
  uploadedFile: ImageUploadResponse | null;
  error: string | null;
}

export interface ImageUploadHookReturn {
  state: ImageUploadState;
  uploadFile: (file: File) => Promise<void>;
  resetUpload: () => void;
}

/**
 * Custom hook for handling image uploads with progress tracking and error management
 */
export function useImageUpload(): ImageUploadHookReturn {
  const [state, setState] = useState<ImageUploadState>({
    isUploading: false,
    progress: 0,
    uploadedFile: null,
    error: null,
  });

  const uploadFile = useCallback(async (file: File) => {
    setState({
      isUploading: true,
      progress: 0,
      uploadedFile: null,
      error: null,
    });

    try {
      const response = await uploadImage(file, (progress: UploadProgress) => {
        setState((prev) => ({
          ...prev,
          progress: progress.percentage,
        }));
      });

      setState({
        isUploading: false,
        progress: 100,
        uploadedFile: response,
        error: null,
      });
    } catch (error) {
      let errorMessage = "An unexpected error occurred during upload.";

      if (error instanceof ImageUploadError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState({
        isUploading: false,
        progress: 0,
        uploadedFile: null,
        error: errorMessage,
      });
    }
  }, []);

  const resetUpload = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      uploadedFile: null,
      error: null,
    });
  }, []);

  return {
    state,
    uploadFile,
    resetUpload,
  };
}
