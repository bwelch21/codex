import { useState, useEffect, useCallback } from 'react';
import { type DishSafetyRecommendation } from '../../types/allergens';
import { theme } from '../../constants/theme';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

interface DishSwipeDeckProps {
  dishes: DishSafetyRecommendation[];
}

export function DishSwipeDeck({ dishes }: DishSwipeDeckProps) {
  const { isMobile } = useDeviceDetection();
  const [currentIdx, setCurrentIdx] = useState(0);
  const total = dishes.length;

  /* ------------------------------------------------------------------ */
  /* Navigation helpers                                                 */
  /* ------------------------------------------------------------------ */
  const goNext = useCallback(() => {
    setCurrentIdx((prev) => (prev < total - 1 ? prev + 1 : prev));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  /* ------------------------------------------------------------------ */
  /* Keyboard navigation                                                */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  /* ------------------------------------------------------------------ */
  /* Touch swipe handling                                               */
  /* ------------------------------------------------------------------ */
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50; // pixels
    if (diff > threshold) {
      // swipe right
      goPrev();
    } else if (diff < -threshold) {
      // swipe left
      goNext();
    }
    setTouchStartX(null);
  };

  /* ------------------------------------------------------------------ */
  /* Safety helpers                                                     */
  /* ------------------------------------------------------------------ */
  const getSafety = (rank: number) => {
    if (rank === 1) return { label: '✅ Safe', color: theme.colors.success };
    if (rank <= 3) return { label: '⚠️ May Contain', color: theme.colors.warning };
    return { label: '❌ Unsafe', color: theme.colors.error };
  };

  if (dishes.length === 0) return null;

  const currentDish = dishes[currentIdx];
  const nextDish = currentIdx + 1 < total ? dishes[currentIdx + 1] : null;
  const nextNextDish = currentIdx + 2 < total ? dishes[currentIdx + 2] : null;

  // Determine safety styling for the currently focused dish
  const currentSafety = getSafety(currentDish.safetyRank);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        minHeight: '420px',
        marginTop: isMobile ? theme.spacing[4] : 0,
        paddingBottom: theme.spacing[12],
      }}
    >
      {/* Card stack */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          height: 'auto',
          userSelect: 'none',
        }}
      >
        {/* Next card and next next card (peeking) */}
        {nextNextDish && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: 'scale(0.94) translateY(30px) translateX(30px)',
              transition: 'transform 0.3s ease',
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.colors.neutral[100],
              boxShadow: theme.boxShadow.base, 
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
        
        {nextDish && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: 'scale(0.94) translateY(20px) translateX(20px)',
              transition: 'transform 0.3s ease',
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.colors.neutral[100],
              boxShadow: theme.boxShadow.base,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}

        {/* Current card */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.boxShadow.lg,
            // Safety border to visually communicate risk level
            border: `2px solid ${currentSafety.color[300]}`,
            padding: theme.spacing[6],
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.3s ease',
          }}
        >
          {/* Dish content */}
          <div>
            <h3
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.neutral[900],
                marginBottom: theme.spacing[2],
              }}
            >
              {currentDish.dishName}
            </h3>
            {currentDish.dishDescription && (
              <p
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.neutral[600],
                  marginBottom: theme.spacing[4],
                }}
              >
                {currentDish.dishDescription}
              </p>
            )}
          </div>

          {/* Safety + meta */}
          <div style={{ marginTop: theme.spacing[4] }}>
            {/* Safety Status */}
            {(() => {
              const safety = getSafety(currentDish.safetyRank);
              return (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: safety.color[50],
                    color: safety.color[700],
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    borderRadius: theme.borderRadius.full,
                    border: `1px solid ${safety.color[200]}`,
                    fontWeight: theme.typography.fontWeight.medium,
                    fontSize: theme.typography.fontSize.sm,
                    marginBottom: currentDish.warnings.length > 0 || currentDish.requiredModifications.length > 0 ? theme.spacing[4] : 0,
                  }}
                >
                  {safety.label}
                </div>
              );
            })()}

            {/* Warnings */}
            {currentDish.warnings.length > 0 && (
              <div
                style={{
                  backgroundColor: theme.colors.error[50],
                  padding: theme.spacing[3],
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.error[200]}`,
                  marginBottom: currentDish.requiredModifications.length > 0 ? theme.spacing[4] : 0,
                }}
              >
                <h4
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.error[800],
                    marginBottom: theme.spacing[2],
                  }}
                >
                  ⚠️ Allergen Warnings:
                </h4>
                <ul style={{ margin: 0, paddingLeft: theme.spacing[4] }}>
                  {currentDish.warnings.map((warning, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.error[700],
                        marginBottom: theme.spacing[1],
                      }}
                    >
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Modifications */}
            {currentDish.requiredModifications.length > 0 && (
              <div
                style={{
                  backgroundColor: theme.colors.warning[50],
                  padding: theme.spacing[3],
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.warning[200]}`,
                }}
              >
                <h4
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.warning[800],
                    marginBottom: theme.spacing[2],
                  }}
                >
                  💡 Suggested Modifications:
                </h4>
                <ul style={{ margin: 0, paddingLeft: theme.spacing[4] }}>
                  {currentDish.requiredModifications.map((modification, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.warning[700],
                        marginBottom: theme.spacing[1],
                      }}
                    >
                      {modification}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div
        style={{
          textAlign: 'center',
          marginTop: nextNextDish ? theme.spacing[8] : theme.spacing[4],
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.neutral[600],
        }}
      >
        {currentIdx + 1} of {total}
      </div>
    </div>
  );
} 