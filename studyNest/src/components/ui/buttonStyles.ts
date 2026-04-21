export type AppButtonVariant = "primary" | "secondary" | "danger";
export type AppButtonSize = "sm" | "md";

const variantClasses: Record<AppButtonVariant, string> = {
  primary:
    "border-cyan-300/35 bg-cyan-400/20 text-cyan-50 hover:bg-cyan-400/30",
  secondary:
    "border-white/20 bg-white/5 text-slate-100 hover:bg-white/10",
  danger:
    "border-rose-300/35 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20",
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

  return `inline-flex items-center justify-center gap-2 rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`;
}
