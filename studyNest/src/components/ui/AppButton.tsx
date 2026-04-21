import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { AppButtonSize, AppButtonVariant } from "@/components/ui/buttonStyles";
import { getAppButtonClasses } from "@/components/ui/buttonStyles";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
}

export default function AppButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: AppButtonProps) {
  return (
    <button
      type={type}
      className={getAppButtonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  );
}
