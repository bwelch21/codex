import { API_CONFIG, NetworkError, HTTP_STATUS } from "../constants/api";
import type {
  ApiResponse,
  HelloWorldResponse,
  HealthResponse,
} from "../constants/api";

// Generic API request function
async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new NetworkError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new NetworkError(
          "Request timeout",
          HTTP_STATUS.SERVICE_UNAVAILABLE,
        );
      }
      throw error;
    }

    throw new NetworkError("Unknown error occurred");
  }
}

// Web server API calls
export const webServerApi = {
  async getHelloWorld(): Promise<ApiResponse<HelloWorldResponse>> {
    const url = `${API_CONFIG.WEB_SERVER.BASE_URL}${API_CONFIG.WEB_SERVER.ENDPOINTS.HELLO_WORLD}`;
    return apiRequest<ApiResponse<HelloWorldResponse>>(url);
  },

  async getHealth(): Promise<HealthResponse> {
    const url = `${API_CONFIG.WEB_SERVER.BASE_URL}${API_CONFIG.WEB_SERVER.ENDPOINTS.HEALTH}`;
    return apiRequest<HealthResponse>(url);
  },
};

// Internal API calls (for future use)
export const internalApi = {
  async ping(): Promise<ApiResponse<unknown>> {
    const url = `${API_CONFIG.INTERNAL_API.BASE_URL}${API_CONFIG.INTERNAL_API.ENDPOINTS.PING}`;
    return apiRequest<ApiResponse<unknown>>(url);
  },

  async getHealth(): Promise<HealthResponse> {
    const url = `${API_CONFIG.INTERNAL_API.BASE_URL}${API_CONFIG.INTERNAL_API.ENDPOINTS.HEALTH}`;
    return apiRequest<HealthResponse>(url);
  },
};

// Retry wrapper for failed requests
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt === maxAttempts) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt),
      );
    }
  }

  throw lastError!;
}
