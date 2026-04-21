import Link from "next/link";
import type { LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { AppButtonSize, AppButtonVariant } from "@/components/ui/buttonStyles";
import { getAppButtonClasses } from "@/components/ui/buttonStyles";

interface AppLinkButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    LinkProps {
  children: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
}

export default function AppLinkButton({
  children,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: AppLinkButtonProps) {
  return (
    <Link
      className={getAppButtonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {children}
    </Link>
  );
}
