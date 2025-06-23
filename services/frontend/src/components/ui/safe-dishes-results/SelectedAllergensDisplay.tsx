import React from 'react';
import { type Allergen } from '../../../types/allergens';
import { theme } from '../../../constants/theme';

interface SelectedAllergensDisplayProps {
  selectedAllergens: Allergen[];
}

export const SelectedAllergensDisplay: React.FC<SelectedAllergensDisplayProps> = ({ selectedAllergens }) => {
  if (selectedAllergens.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: theme.colors.error[50],
        padding: theme.spacing[4],
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.error[200]}`,
        marginBottom: theme.spacing[2],
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: theme.spacing[2],
        }}
      >
        <h3
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.error[800],
            display: 'flex',
          }}
        >
          <span style={{ marginRight: theme.spacing[2] }}>🚫</span>
          Avoiding These Allergens:
        </h3>
        {selectedAllergens.map(a => (
          <span
            key={a.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: theme.colors.error[800],
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium
            }}
          >
            {a.displayName}
          </span>
        ))}
      </div>
    </div>
  );
}; 