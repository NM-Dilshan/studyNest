interface LoadingSkeletonProps {
  className?: string;
}

export default function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return <div className={`animate-pulse rounded-xl themed-inset ${className}`} aria-hidden="true" />;
}
