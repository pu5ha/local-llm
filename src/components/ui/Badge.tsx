type BadgeVariant = "default" | "success" | "warning" | "primary";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-background-alt text-muted",
  success: "tag-green",
  warning: "tag-amber",
  primary: "tag-green",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`tag ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
