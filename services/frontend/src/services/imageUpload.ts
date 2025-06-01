import { API_CONFIG } from "../constants/api";

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
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "ImageUploadError";
  }
}

/**
 * Upload an image file to the web-server
 * @param file - The file to upload
 * @param onProgress - Optional progress callback
 * @returns Promise with upload response
 */
export async function uploadImage(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<ImageUploadResponse> {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append("image", file);

    // Create XMLHttpRequest for progress tracking
    return new Promise<ImageUploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            onProgress(progress);
          }
        });
      }

      // Handle response
      xhr.addEventListener("load", () => {
        try {
          const response: ApiResponse<ImageUploadResponse> = JSON.parse(
            xhr.responseText,
          );

          if (xhr.status >= 200 && xhr.status < 300 && response.success) {
            resolve(response.data!);
          } else {
            const errorMessage = response.error || "Upload failed";
            reject(new ImageUploadError(errorMessage, xhr.status, response));
          }
        } catch (parseError) {
          reject(
            new ImageUploadError(
              "Invalid response from server",
              xhr.status,
              parseError,
            ),
          );
        }
      });

      // Handle network errors
      xhr.addEventListener("error", () => {
        reject(
          new ImageUploadError(
            "Network error occurred during upload",
            xhr.status,
          ),
        );
      });

      // Handle timeout
      xhr.addEventListener("timeout", () => {
        reject(new ImageUploadError("Upload request timed out", xhr.status));
      });

      // Handle abort
      xhr.addEventListener("abort", () => {
        reject(new ImageUploadError("Upload was cancelled", xhr.status));
      });

      // Configure and send request
      xhr.open("POST", `${API_CONFIG.WEB_SERVER.BASE_URL}/api/upload-image`);
      xhr.timeout = 30000; // 30 second timeout
      xhr.send(formData);
    });
  } catch (error) {
    throw new ImageUploadError(
      "Failed to prepare upload request",
      undefined,
      error,
    );
  }
}
