import React, { useState, useEffect } from 'react';
import { colors, typography, spacing, boxShadow, borderRadius } from '../../constants/theme';
import Button from '../ui/Button';

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

const LandingPage: React.FC = () => {
  const [data, setData] = useState<HelloWorldData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHelloWorld = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/hello-world');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelloWorld();
  }, []);

  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    backgroundColor: colors.neutral[50],
    fontFamily: typography.fontFamily.primary,
  };

  const cardStyle = {
    backgroundColor: colors.white,
    padding: spacing[8],
    borderRadius: borderRadius.xl,
    boxShadow: boxShadow.lg,
    textAlign: 'center' as const,
    maxWidth: '600px',
    width: '100%',
  };

  const titleStyle = {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    marginBottom: spacing[4],
    lineHeight: typography.lineHeight.tight,
  };

  const subtitleStyle = {
    fontSize: typography.fontSize.lg,
    color: colors.neutral[600],
    marginBottom: spacing[8],
    lineHeight: typography.lineHeight.relaxed,
  };

  const messageStyle = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.success[600],
    backgroundColor: colors.success[50],
    padding: spacing[4],
    borderRadius: borderRadius.md,
    marginBottom: spacing[6],
    border: `1px solid ${colors.success[200]}`,
  };

  const metaInfoStyle = {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
    marginBottom: spacing[6],
    fontFamily: typography.fontFamily.mono,
  };

  const errorStyle = {
    fontSize: typography.fontSize.base,
    color: colors.error[600],
    backgroundColor: colors.error[50],
    padding: spacing[4],
    borderRadius: borderRadius.md,
    marginBottom: spacing[6],
    border: `1px solid ${colors.error[200]}`,
  };

  const loadingStyle = {
    fontSize: typography.fontSize.base,
    color: colors.neutral[600],
    marginBottom: spacing[6],
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Food Allergy Assistant</h1>
        <p style={subtitleStyle}>
          Your comprehensive companion for safe dining and travel with food allergies
        </p>

        {loading && (
          <div style={loadingStyle}>
            <div style={{ marginBottom: spacing[4] }}>
              Loading message from server...
            </div>
            <Button loading={true} disabled={true}>
              Fetching Data
            </Button>
          </div>
        )}

        {error && (
          <div style={errorStyle}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {data && !loading && !error && (
          <>
            <div style={messageStyle}>
              {data.message}
            </div>
            <div style={metaInfoStyle}>
              <div>Service: {data.service}</div>
              <div>Timestamp: {new Date(data.timestamp).toLocaleString()}</div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: spacing[4], justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <Button onClick={fetchHelloWorld} disabled={loading}>
            Refresh Message
          </Button>
          <Button variant="outline" disabled={true}>
            Coming Soon: Restaurant Search
          </Button>
        </div>

        <div style={{ 
          marginTop: spacing[8], 
          padding: spacing[6], 
          backgroundColor: colors.neutral[100], 
          borderRadius: borderRadius.md 
        }}>
          <h3 style={{ 
            fontSize: typography.fontSize.lg, 
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[700],
            marginBottom: spacing[4]
          }}>
            Coming Soon Features:
          </h3>
          <ul style={{ 
            textAlign: 'left' as const, 
            color: colors.neutral[600],
            lineHeight: typography.lineHeight.relaxed 
          }}>
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
};

export default LandingPage; 