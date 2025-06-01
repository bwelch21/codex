import { useState, useEffect } from "react";
import { Button } from "../ui/Button";

interface HelloWorldData {
  message: string;
  timestamp: string;
  service: string;
}

interface ApiResponse {
  success: boolean;
  data?: HelloWorldData;
  message?: string;
  error?: string;
}

export function LandingPage() {
  const [data, setData] = useState<HelloWorldData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<string | null>(null);

  async function fetchHelloWorld(): Promise<void> {
    setIsLoading(true);
    setHasError(null);

    try {
      const response = await fetch("http://localhost:3001/api/hello-world");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch data");
      }
    } catch (err) {
      setHasError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchHelloWorld();
  }, []);

  const hasData = data && !isLoading && !hasError;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-gray-50 font-primary">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-primary-500 mb-4 leading-tight">
          Food Allergy Assistant
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Your comprehensive companion for safe dining and travel with food
          allergies
        </p>

        {isLoading && (
          <div className="text-base text-gray-600 mb-6">
            <div className="mb-4">Loading message from server...</div>
            <Button loading={true} disabled={true}>
              Fetching Data
            </Button>
          </div>
        )}

        {hasError && (
          <div className="text-base text-error-600 bg-error-50 p-4 rounded-lg mb-6 border border-error-200">
            <strong>Error:</strong> {hasError}
          </div>
        )}

        {hasData && (
          <>
            <div className="text-xl font-medium text-success-600 bg-success-50 p-4 rounded-lg mb-6 border border-success-200">
              {data.message}
            </div>
            <div className="text-sm text-gray-500 mb-6 font-mono">
              <div>Service: {data.service}</div>
              <div>Timestamp: {new Date(data.timestamp).toLocaleString()}</div>
            </div>
          </>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={fetchHelloWorld} disabled={isLoading}>
            Refresh Message
          </Button>
          <Button variant="outline" disabled={true}>
            Coming Soon: Restaurant Search
          </Button>
        </div>

        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Coming Soon Features:
          </h3>
          <ul className="text-left text-gray-600 leading-relaxed space-y-2 pl-5">
            <li>🍽️ Allergen-safe restaurant discovery</li>
            <li>✈️ Travel-friendly food allergy guides</li>
            <li>📱 Emergency allergy information cards</li>
            <li>🔍 Ingredient analysis and alerts</li>
            <li>👥 Community reviews and recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
