import React, { useState, useEffect } from 'react';
import { type SafeDishesResponse, type Allergen } from '../../../types/allergens';
import { theme } from '../../../constants/theme';
import { DishSwipeDeck } from '../DishSwipeDeck';
import { StickyScrollContentHeader } from './StickyScrollContentHeader';
import { useDeviceDetection } from '../../../hooks/useDeviceDetection';
import { DishCard } from './DishCard';

interface SafeDishesResultsProps {
  results: SafeDishesResponse;
  selectedAllergens: Allergen[];
  onStartOver?: () => void;
}

export const SafeDishesResults: React.FC<SafeDishesResultsProps> = ({
  results,
  onStartOver,
}) => {
  const { isMobile } = useDeviceDetection();
  const [viewMode, setViewMode] = useState<'deck' | 'list'>(() => (isMobile ? 'deck' : 'list'));

  // Ensure deck view is not shown on desktop
  useEffect(() => {
    if (!isMobile && viewMode === 'deck') {
      setViewMode('list');
    }
  }, [isMobile, viewMode]);

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing[2],
        }}
      >
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing[3],
            }}
          >
            Menu Analysis Results
          </h2>
          {!isMobile && <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.neutral[600],
              marginBottom: theme.spacing[4],
            }}
          >
            Analyzed {results.recommendations.length} dishes • {new Date(results.analyzedAt).toLocaleString()}
          </p>}
        </div>

        {onStartOver && (
          <button
            onClick={onStartOver}
            style={{
              padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
              backgroundColor: theme.colors.primary[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              marginLeft: theme.spacing[4],
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = theme.colors.primary[600])}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = theme.colors.primary[500])}
          >
            Analyze Another Menu
          </button>
        )}
      </div>

      {/* Safety summary (desktop) */}
      {!isMobile && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: theme.spacing[4],
            marginBottom: theme.spacing[8],
          }}
        >
          {[
            { label: 'Very Safe', count: results.recommendations.filter(r => r.safetyRank === 1).length, color: theme.colors.success },
            { label: 'Caution', count: results.recommendations.filter(r => r.safetyRank > 1 && r.safetyRank <= 3).length, color: theme.colors.warning },
            { label: 'Avoid', count: results.recommendations.filter(r => r.safetyRank > 3).length, color: theme.colors.error },
          ].map(item => (
            <div
              key={item.label}
              style={{
                backgroundColor: item.color[50],
                padding: theme.spacing[4],
                borderRadius: theme.borderRadius.lg,
                border: `1px solid ${item.color[200]}`,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: item.color[600],
                  marginBottom: theme.spacing[1],
                }}
              >
                {item.count}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: item.color[700],
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky toggle (mobile only) */}
      {isMobile && (
        <StickyScrollContentHeader
          viewMode={viewMode}
          onToggle={() => setViewMode(viewMode === 'deck' ? 'list' : 'deck')}
          summary={[
            {
              label: 'Very Safe',
              count: results.recommendations.filter(r => r.safetyRank === 1).length,
              color: theme.colors.success,
            },
            {
              label: 'Caution',
              count: results.recommendations.filter(r => r.safetyRank > 1 && r.safetyRank <= 3).length,
              color: theme.colors.warning,
            },
            {
              label: 'Avoid',
              count: results.recommendations.filter(r => r.safetyRank > 3).length,
              color: theme.colors.error,
            },
          ]}
        />
      )}

      {/* Dishes list / deck */}
      {isMobile && viewMode === 'deck' ? (
        <DishSwipeDeck
          dishes={results.recommendations.slice().sort((a, b) => a.safetyRank - b.safetyRank)}
          onViewList={() => setViewMode('list')}
        />
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gap: theme.spacing[4],
            }}
          >
            {results.recommendations
              .slice()
              .sort((a, b) => a.safetyRank - b.safetyRank)
              .map((dish, idx) => (
                <DishCard key={idx} dish={dish} />
              ))}
          </div>

          {results.recommendations.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: theme.spacing[12],
                backgroundColor: theme.colors.neutral[50],
                borderRadius: theme.borderRadius.lg,
              }}
            >
              <p
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  color: theme.colors.neutral[600],
                }}
              >
                No dishes were identified in this menu. Please try uploading a clearer image.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 