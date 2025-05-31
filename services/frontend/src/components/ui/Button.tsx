import React from 'react';
import { colors, typography, spacing, borderRadius, boxShadow } from '../../constants/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.medium,
    textDecoration: 'none',
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.6 : 1,
  };

  const sizeStyles = {
    sm: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
    },
    md: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
    },
    lg: {
      padding: `${spacing[4]} ${spacing[6]}`,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.normal,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary[500],
      color: colors.white,
      boxShadow: boxShadow.sm,
    },
    secondary: {
      backgroundColor: colors.secondary[500],
      color: colors.white,
      boxShadow: boxShadow.sm,
    },
    success: {
      backgroundColor: colors.success[500],
      color: colors.white,
      boxShadow: boxShadow.sm,
    },
    warning: {
      backgroundColor: colors.warning[500],
      color: colors.white,
      boxShadow: boxShadow.sm,
    },
    error: {
      backgroundColor: colors.error[500],
      color: colors.white,
      boxShadow: boxShadow.sm,
    },
    outline: {
      backgroundColor: colors.transparent,
      color: colors.primary[500],
      border: `1px solid ${colors.primary[500]}`,
      boxShadow: 'none',
    },
  };

  const hoverStyles = {
    primary: { backgroundColor: colors.primary[600] },
    secondary: { backgroundColor: colors.secondary[600] },
    success: { backgroundColor: colors.success[600] },
    warning: { backgroundColor: colors.warning[600] },
    error: { backgroundColor: colors.error[600] },
    outline: { 
      backgroundColor: colors.primary[50],
      borderColor: colors.primary[600],
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  return (
    <button
      style={combinedStyles}
      disabled={disabled || loading}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, hoverStyles[variant]);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
        }
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            marginRight: spacing[2],
            display: 'inline-block',
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
};

export default Button; 