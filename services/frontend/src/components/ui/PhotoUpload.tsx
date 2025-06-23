import { useState, useRef, useCallback, useEffect } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useDeviceDetection } from "../../hooks/useDeviceDetection";

export interface PhotoUploadProps {
  onFileSelect?: (file: File | null) => void;
  maxSizeInMB?: number;
  disabled?: boolean;
  className?: string;
  shouldClear?: boolean; // New prop to trigger clearing
}

export interface UploadState {
  file: File | null;
  preview: string | null;
  status: "idle" | "uploading" | "success" | "error";
  error: string | null;
}

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
] as const;
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.pdf";
const DEFAULT_MAX_SIZE_MB = 10;

export function PhotoUpload({
  onFileSelect,
  maxSizeInMB = DEFAULT_MAX_SIZE_MB,
  disabled = false,
  className = "",
  shouldClear = false,
}: PhotoUploadProps) {
  const [state, setState] = useState<UploadState>({
    file: null,
    preview: null,
    status: "idle",
    error: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isMobile, hasCamera } = useDeviceDetection();

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  // Handle external clear requests
  useEffect(() => {
    if (shouldClear) {
      setState({
        file: null,
        preview: null,
        status: "idle",
        error: null,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [shouldClear]);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (
        !ACCEPTED_FILE_TYPES.includes(
          file.type as (typeof ACCEPTED_FILE_TYPES)[number],
        )
      ) {
        return "Please upload a PNG, JPEG, or PDF file.";
      }

      // Check file size
      if (file.size > maxSizeInBytes) {
        return `File size must be less than ${maxSizeInMB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
      }

      return null;
    },
    [maxSizeInBytes, maxSizeInMB],
  );

  const createPreview = useCallback((file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type === "application/pdf") {
        resolve(null); // No preview for PDF
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelection = useCallback(
    async (file: File) => {
      setState((prev) => ({ ...prev, status: "uploading", error: null }));

      const validationError = validateFile(file);
      if (validationError) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: validationError,
          file: null,
          preview: null,
        }));
        onFileSelect?.(null);
        return;
      }

      try {
        const preview = await createPreview(file);
        setState({
          file,
          preview,
          status: "success",
          error: null,
        });
        onFileSelect?.(file);
      } catch {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Failed to process the file. Please try again.",
          file: null,
          preview: null,
        }));
        onFileSelect?.(null);
      }
    },
    [validateFile, createPreview, onFileSelect],
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelection(file);
      }
    },
    [handleFileSelection],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileSelection(file);
      }
    },
    [disabled, handleFileSelection],
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const openCameraDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  }, [disabled]);

  const clearFile = useCallback(() => {
    setState({
      file: null,
      preview: null,
      status: "idle",
      error: null,
    });
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onFileSelect]);

  const getStatusColor = () => {
    switch (state.status) {
      case "success":
        return "border-success-500 bg-success-50";
      case "error":
        return "border-error-500 bg-error-50";
      case "uploading":
        return "border-primary-500 bg-primary-50";
      default:
        return isDragOver
          ? "border-primary-500 bg-primary-50"
          : "border-neutral-300 bg-white";
    }
  };

  const getStatusIcon = () => {
    switch (state.status) {
      case "uploading":
        return (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        );
      case "success":
        return (
          <svg
            className="h-8 w-8 text-success-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="h-8 w-8 text-error-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-12 w-12 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  const baseClassNames = [
    "relative w-full rounded-xl border-2 border-dashed transition-all duration-200",
    getStatusColor(),
    disabled
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer hover:border-primary-400 hover:bg-primary-50",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        className={baseClassNames}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center">
          {state.file && state.preview ? (
            <div className="w-full">
              <div className="relative mb-4">
                <img
                  src={state.preview}
                  alt="Preview"
                  className="mx-auto max-h-48 max-w-full rounded-lg object-contain shadow-md"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-error-500 text-white shadow-lg hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
                  disabled={disabled}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm font-medium text-neutral-900">
                {state.file.name}
              </p>
              <p className="text-xs text-neutral-600">
                {(state.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : state.file && !state.preview ? (
            <div className="w-full">
              <div className="relative mb-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-neutral-100 mx-auto">
                  <svg
                    className="h-8 w-8 text-neutral-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-error-500 text-white shadow-lg hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
                  disabled={disabled}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm font-medium text-neutral-900">
                {state.file.name}
              </p>
              <p className="text-xs text-neutral-600">
                {(state.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-4">{getStatusIcon()}</div>

              {state.status === "uploading" ? (
                <div>
                  <p className="text-base font-medium text-neutral-900 mb-2">
                    Processing your file...
                  </p>
                  <p className="text-sm text-neutral-600">
                    Please wait while we prepare your image
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-base font-medium text-neutral-900 mb-2">
                    Drop your menu image here, or click to browse
                  </p>
                  <p className="text-sm text-neutral-600 mb-4">
                    Supports PNG, JPEG, and PDF files up to {maxSizeInMB}MB
                  </p>

                  {/* Mobile camera detection and button */}
                  {isMobile && hasCamera && (
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openFileDialog();
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-500 bg-white border border-primary-500 rounded-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={disabled}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4"
                          />
                        </svg>
                        Choose File
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCameraDialog();
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={disabled}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Take Photo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {state.error && (
        <div className="mt-3 rounded-lg bg-error-50 border border-error-200 p-3">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-error-500 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-error-800">
                Upload Error
              </h3>
              <p className="text-sm text-error-700 mt-1">{state.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {state.status === "success" && state.file && (
        <div className="mt-3 rounded-lg bg-success-50 border border-success-200 p-3">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-success-500 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-success-800">
                File Ready
              </h3>
              <p className="text-sm text-success-700 mt-1">
                Your menu image is ready to be analyzed for allergen
                information.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
