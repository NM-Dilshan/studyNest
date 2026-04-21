export type AppButtonVariant = "primary" | "secondary" | "danger";
export type AppButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<AppButtonVariant, string> = {
  primary:
    "border-[var(--button-primary-border)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)]",
  secondary:
    "border-[var(--header-border)] bg-[var(--header-button-bg)] text-[var(--header-text)] hover:bg-[var(--header-button-hover)]",
  danger:
    "border-[var(--panel-danger-border)] bg-[var(--panel-danger-bg)] text-[var(--panel-danger-text)] hover:brightness-95",
};

const sizeClasses: Record<AppButtonSize, string> = {
  sm: "min-h-11 px-3 py-2 text-xs font-semibold",
  md: "min-h-11 px-4 py-2.5 text-sm font-semibold",
  lg: "min-h-12 px-6 py-3 text-sm font-semibold sm:min-h-14 sm:px-7 sm:text-base",
};

export function getAppButtonClasses(options?: {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
  } = options || {};

  return `inline-flex items-center justify-center gap-2 rounded-xl border shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--surface-shadow)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`;
}
