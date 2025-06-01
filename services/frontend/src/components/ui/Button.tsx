import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

const variantClassNames = {
  primary:
    "bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md active:bg-primary-700",
  secondary:
    "bg-secondary-500 hover:bg-secondary-600 text-white shadow-sm hover:shadow-md active:bg-secondary-700",
  success:
    "bg-success-500 hover:bg-success-600 text-white shadow-sm hover:shadow-md active:bg-success-700",
  warning:
    "bg-warning-500 hover:bg-warning-600 text-white shadow-sm hover:shadow-md active:bg-warning-700",
  error:
    "bg-error-500 hover:bg-error-600 text-white shadow-sm hover:shadow-md active:bg-error-700",
  outline:
    "bg-transparent hover:bg-primary-50 text-primary-500 border border-primary-500 hover:border-primary-600 hover:text-primary-600 active:bg-primary-100",
};

const sizeClassNames = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-6 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabledOrLoading = disabled || loading;

  const baseClassNames =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const buttonClassNames = [
    baseClassNames,
    variantClassNames[variant],
    sizeClassNames[size],
    fullWidth && "w-full",
    isDisabledOrLoading && "cursor-not-allowed",
    !isDisabledOrLoading && "hover:-translate-y-0.5 active:translate-y-0",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={buttonClassNames}
      disabled={isDisabledOrLoading}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
