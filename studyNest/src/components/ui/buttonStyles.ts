export type AppButtonVariant = "primary" | "secondary" | "danger";
export type AppButtonSize = "sm" | "md";

const variantClasses: Record<AppButtonVariant, string> = {
  primary:
    "border-[var(--header-accent-border)] bg-[var(--header-accent-bg)] text-[var(--header-accent-text)] hover:brightness-110",
  secondary:
    "border-[var(--header-border)] bg-[var(--header-button-bg)] text-[var(--header-text)] hover:bg-[var(--header-button-hover)]",
  danger:
    "border-rose-400/35 bg-rose-500/12 text-rose-300 hover:bg-rose-500/20",
};

const sizeClasses: Record<AppButtonSize, string> = {
  sm: "min-h-11 px-3 py-2 text-xs font-semibold",
  md: "min-h-11 px-4 py-2.5 text-sm font-semibold",
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

  return `inline-flex items-center justify-center gap-2 rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--focus-offset)] disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`;
}
