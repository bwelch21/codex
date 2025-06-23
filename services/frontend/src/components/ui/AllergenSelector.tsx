import React from 'react';
import { BIG_NINE_ALLERGENS, type Allergen } from '../../types/allergens';
import { theme } from '../../constants/theme';

interface AllergenSelectorProps {
  selectedAllergens: Allergen[];
  onAllergenToggle: (allergen: Allergen) => void;
  disabled?: boolean;
}

export const AllergenSelector: React.FC<AllergenSelectorProps> = ({
  selectedAllergens,
  onAllergenToggle,
  disabled = false,
}) => {
  const isSelected = (allergen: Allergen): boolean => {
    return selectedAllergens.some(selected => selected.id === allergen.id);
  };

  return (
    <div>
      <h3
        style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.neutral[900],
          marginBottom: theme.spacing[4],
        }}
      >
        Select Your Allergens
      </h3>
      <p
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.neutral[600],
          marginBottom: theme.spacing[6],
        }}
      >
        Choose which of the Big 9 allergens you need to avoid. We'll analyze the menu and identify dishes that are safe for you.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: theme.spacing[3],
        }}
      >
        {BIG_NINE_ALLERGENS.map((allergen) => {
          const selected = isSelected(allergen);
          return (
            <button
              key={allergen.id}
              type="button"
              disabled={disabled}
              onClick={() => onAllergenToggle(allergen)}
              style={{
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                borderRadius: theme.borderRadius.lg,
                border: `2px solid ${selected ? theme.colors.primary[500] : theme.colors.neutral[300]}`,
                backgroundColor: selected ? theme.colors.primary[50] : theme.colors.white,
                color: selected ? theme.colors.primary[700] : theme.colors.neutral[700],
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '48px',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                if (!disabled && !selected) {
                  e.currentTarget.style.borderColor = theme.colors.primary[300];
                  e.currentTarget.style.backgroundColor = theme.colors.primary[50];
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !selected) {
                  e.currentTarget.style.borderColor = theme.colors.neutral[300];
                  e.currentTarget.style.backgroundColor = theme.colors.white;
                }
              }}
            >
              <span
                style={{
                  marginRight: theme.spacing[2],
                  fontSize: theme.typography.fontSize.lg,
                }}
              >
                {selected ? '✓' : '○'}
              </span>
              {allergen.displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}; 