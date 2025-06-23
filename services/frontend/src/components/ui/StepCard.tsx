import React from 'react';
import { theme } from '../../constants/theme';

interface StepCardProps {
  stepNumber?: number;
  title: string;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
  showIndicator?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}

export const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  isActive,
  isCompleted = false,
  onClick,
  showIndicator = true,
  onBack,
  children,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: theme.colors.white,
        padding: theme.spacing[8],
        borderRadius: theme.borderRadius["2xl"],
        boxShadow: theme.boxShadow.lg,
        marginBottom: theme.spacing[8],
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Back Button */}
      {onBack && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          style={{
            marginBottom: theme.spacing[4],
            color: theme.colors.primary[500],
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: theme.typography.fontSize["2xl"],
            cursor: 'pointer',
            lineHeight: 1,
          }}
          aria-label="Back"
        >
          ‹
        </button>
      )}

      {(showIndicator || title.trim().length > 0) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing[6],
          }}
        >
          {showIndicator && stepNumber !== undefined && (
            <div
              style={{
                width: theme.spacing[8],
                height: theme.spacing[8],
                backgroundColor: isCompleted
                  ? theme.colors.success[500]
                  : theme.colors.primary[500],
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.spacing[4],
                color: theme.colors.white,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
              }}
            >
              {isCompleted ? '✓' : stepNumber}
            </div>
          )}
          {title.trim().length > 0 && (
            <h2
              style={{
                fontSize: theme.typography.fontSize["2xl"],
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.neutral[900],
                margin: 0,
              }}
            >
              {title}
            </h2>
          )}
        </div>
      )}
      {isActive && children}
    </div>
  );
}; 