import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

// حواف كل variant محسومة هنا (لا في sizeClasses) لتفادي تعارض بين صنفَي rounded-*
// من مصدرين مختلفين على نفس العنصر — كل زر يملك مصدرًا واحدًا فقط لشكل حوافه
const variantClasses: Record<Variant, string> = {
  primary:
    "rounded-full bg-gradient-primary text-white hover:brightness-110 active:brightness-95 shadow-lg shadow-primary-500/30",
  secondary:
    "rounded-xl bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm shadow-accent-500/20",
  outline:
    "rounded-full border-2 border-primary-300 text-primary-700 hover:bg-primary-50 active:bg-primary-100",
  ghost: "rounded-xl text-foreground hover:bg-primary-50",
  danger: "rounded-xl bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-[44px] text-sm px-4 py-1.5 gap-1.5",
  md: "min-h-[44px] text-sm px-5 py-3 gap-2",
  lg: "min-h-[44px] text-base px-7 py-3.5 gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
