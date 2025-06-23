import { type ReactNode } from 'react';
import { theme } from '../../constants/theme';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function ErrorModal({ isOpen, onClose, title = 'Something went wrong', children }: ErrorModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: theme.spacing[4],
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius['2xl'],
          padding: theme.spacing[8],
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: theme.boxShadow.xl,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: theme.spacing[4],
            right: theme.spacing[4],
            background: 'none',
            border: 'none',
            fontSize: theme.typography.fontSize.xl,
            cursor: 'pointer',
            color: theme.colors.neutral[500],
            width: theme.spacing[8],
            height: theme.spacing[8],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.borderRadius.full,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
            e.currentTarget.style.color = theme.colors.neutral[700];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.colors.neutral[500];
          }}
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Error icon and title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing[6],
            paddingRight: theme.spacing[8], // Make room for close button
          }}
        >
          <div
            style={{
              width: theme.spacing[12],
              height: theme.spacing[12],
              backgroundColor: theme.colors.error[100],
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: theme.spacing[4],
            }}
          >
            <span
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                color: theme.colors.error[600],
              }}
            >
              ⚠️
            </span>
          </div>
          <h2
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.error[700],
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>

        {/* Error content */}
        <div
          style={{
            marginBottom: theme.spacing[8],
            color: theme.colors.neutral[700],
            lineHeight: theme.typography.lineHeight.relaxed,
          }}
        >
          {children}
        </div>

        {/* Action button */}
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
              backgroundColor: theme.colors.primary[500],
              color: theme.colors.white,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[600];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[500];
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
} 