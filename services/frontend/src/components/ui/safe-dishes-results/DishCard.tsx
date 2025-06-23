import React from 'react';
import { type DishSafetyRecommendation } from '../../../types/allergens';
import { theme } from '../../../constants/theme';

interface DishCardProps {
  dish: DishSafetyRecommendation;
}

const getSafetyColor = (rank: number) => {
  if (rank === 1) return theme.colors.success;
  if (rank <= 3) return theme.colors.warning;
  return theme.colors.error;
};

const getSafetyLabel = (rank: number) => {
  if (rank === 1) return 'Very Safe';
  if (rank <= 3) return 'Caution';
  return 'Avoid';
};

const getSafetyIcon = (rank: number) => {
  if (rank === 1) return '✅';
  if (rank <= 3) return '⚠️';
  return '🚫';
};

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const safetyColor = getSafetyColor(dish.safetyRank);

  return (
    <div
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing[6],
        border: `2px solid ${safetyColor[200]}`,
        boxShadow: theme.boxShadow.sm,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing[4],
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.neutral[900],
              marginBottom: theme.spacing[2],
            }}
          >
            {dish.dishName}
          </h3>
          {dish.dishDescription && (
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.neutral[600],
                marginBottom: theme.spacing[3],
              }}
            >
              {dish.dishDescription}
            </p>
          )}
        </div>
        {/* Status pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: safetyColor[50],
            padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
            borderRadius: theme.borderRadius.full,
            border: `1px solid ${safetyColor[200]}`,
            marginLeft: theme.spacing[4],
          }}
        >
          <span style={{ marginRight: theme.spacing[2] }}>{getSafetyIcon(dish.safetyRank)}</span>
          <span
            style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: safetyColor[700],
            }}
          >
            {getSafetyLabel(dish.safetyRank)}
          </span>
        </div>
      </div>

      {/* Warnings */}
      {dish.warnings.length > 0 && (
        <div
          style={{
            backgroundColor: theme.colors.error[50],
            padding: theme.spacing[3],
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.error[200]}`,
            marginBottom: theme.spacing[4],
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
            {dish.warnings.map((w, i) => (
              <li
                key={i}
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.error[700],
                  marginBottom: theme.spacing[1],
                }}
              >
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Required modifications */}
      {dish.requiredModifications.length > 0 && (
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
            {dish.requiredModifications.map((mod, i) => (
              <li
                key={i}
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.warning[700],
                  marginBottom: theme.spacing[1],
                }}
              >
                {mod}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 