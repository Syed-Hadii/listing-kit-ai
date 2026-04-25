import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const variants = {
    primary: "btn-primary",
    gold: "btn-gold",
    outline: "btn-outline",
    ghost: "btn-ghost",
    danger: "btn-danger",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button
      className={cn("btn", variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
