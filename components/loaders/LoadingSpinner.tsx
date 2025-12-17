import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  isFullScreen?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

const textSizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

function LoadingSpinner({
  text,
  size = "md",
  isFullScreen = false,
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3",
        isFullScreen && "min-h-screen p-8",
        className,
      )}
    >
      <Spinner className={cn(sizeStyles[size], "text-muted-foreground")} />
      {text && (
        <span
          className={cn(
            "text-muted-foreground font-medium tracking-tight",
            textSizeStyles[size],
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
}

export default LoadingSpinner;
