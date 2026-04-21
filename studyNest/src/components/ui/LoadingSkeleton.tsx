interface LoadingSkeletonProps {
  className?: string;
}

export default function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-slate-700/50 ${className}`} aria-hidden="true" />;
}
