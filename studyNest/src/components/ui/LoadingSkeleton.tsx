interface LoadingSkeletonProps {
  className?: string;
}

export default function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-[var(--surface-card-muted)] ${className}`} aria-hidden="true" />;
}
